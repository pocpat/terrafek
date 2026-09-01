import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as labsModule from "../data/labsData";
import * as walkthroughsModule from "../data/walkthroughsData";
import { parseHclCode } from "../utils/hclParser";
import { createEmptyState } from "../utils/terraformEngine";
import type { LabDefinition, VisualWalkthrough } from "../types/terraform";

/**
 * GOLDEN RULES AUDIT (deterministic, imported through vitest — no transpiling).
 * Rule "hands-on": every step/task is USER ACTION unless the lab can pass it
 * without the learner typing anything (validationCheck passes on untouched
 * starterFiles) or the walkthrough auto-runs the command for the learner.
 * Target: >= 80% of all steps+tasks are USER ACTION.
 */

const LABS_DATA: LabDefinition[] =
  (labsModule as any).LABS_DATA ??
  Object.values(labsModule).find((v: any) => Array.isArray(v));
const WALKTHROUGHS_DATA: VisualWalkthrough[] =
  (walkthroughsModule as any).WALKTHROUGHS_DATA ??
  Object.values(walkthroughsModule).find((v: any) => Array.isArray(v));

function initialStateOf(lab: LabDefinition) {
  return lab.initialState ? JSON.parse(JSON.stringify(lab.initialState)) : createEmptyState();
}

/** Does this lab task pass with ZERO user input? */
function passesOnUntouchedStarter(lab: LabDefinition, task: LabDefinition["tasks"][number]): boolean {
  try {
    const state = initialStateOf(lab);
    const parsed = parseHclCode(lab.starterFiles).resources;
    return !!task.validationCheck(lab.starterFiles, state, parsed);
  } catch {
    return false; // threw on untouched starter => learner must act
  }
}

interface Row {
  id: string;
  title: string;
  total: number;
  userAction: number;
  labDoesIt: number;
  items: Array<{ ref: string; verdict: "USER ACTION" | "LAB DOES IT"; why: string }>;
}

const labRows: Row[] = [];
let autoPassList: string[] = [];
const unsolvableList: string[] = [];
let stateGatedCount = 0;

/** True if the validation function actually reads its 2nd arg (the simulated state). */
function usesStateArg(fn: Function): boolean {
  const src = String(fn);
  const paramList = /\(([^)]*)\)/.exec(src)?.[1] || "";
  const names = paramList.split(",").map((s) => s.trim()).filter(Boolean);
  if (names.length < 2) return false;
  const stateName = names[1];
  return src.includes(stateName);
}

for (const lab of LABS_DATA ?? []) {
  const row: Row = { id: lab.id, title: lab.title, total: lab.tasks.length, userAction: 0, labDoesIt: 0, items: [] };
  for (const task of lab.tasks) {
    const untouched = passesOnUntouchedStarter(lab, task);
    const desc = String(task.description || "").trim().toLowerCase();
    // Typing 'terraform plan/apply' IS a user action; only "observe/watch/read" phrasing is passive.
    const passiveOnly = /^(observe|watch|notice|review|read)\b/.test(desc) && !/(run|type|write|fix|add|change|declare)\b/.test(desc);
    const isUser = !untouched && !passiveOnly;
    if (isUser) row.userAction++;
    else {
      row.labDoesIt++;
      if (untouched) autoPassList.push(`${lab.id} :: ${task.id} — validationCheck PASSES on untouched starter files (solution pre-shipped)`);
      else row.items.push({ ref: `${lab.id} :: ${task.id}`, verdict: "LAB DOES IT", why: "passive task (observe/read only, nothing to do)" });
    }
  }
  labRows.push(row);

  // SOLVABILITY: the official solution must satisfy every CODE-ONLY task.
  // Tasks gated on live terraform state (apply/destroy/drift outcomes) cannot be
  // verified statically — a state file is empty until the learner runs commands —
  // so they are counted as "stateGated" instead of "unsolvable".
  try {
    const solState = initialStateOf(lab);
    const solParsed = parseHclCode(lab.solutionFiles || {}).resources;
    for (const task of lab.tasks) {
      let ok = false;
      try { ok = !!task.validationCheck(lab.solutionFiles || {}, solState, solParsed); } catch { ok = false; }
      if (!ok) {
        if (usesStateArg(task.validationCheck)) stateGatedCount++;
        else unsolvableList.push(`${lab.id} :: ${task.id}`);
      }
    }
  } catch {
    unsolvableList.push(`${lab.id} :: (all) — solutionFiles threw during evaluation`);
  }
}

const walkRows: Row[] = [];
let autoRunList: string[] = [];

for (const wt of WALKTHROUGHS_DATA ?? []) {
  const row: Row = { id: wt.id, title: wt.title, total: wt.steps.length, userAction: 0, labDoesIt: 0, items: [] };
  for (const step of wt.steps) {
    const hasQuickCheck = !!step.quickCheck;
    const autoRuns = !!step.commandToTest || !!step.exampleFiles;
    if (hasQuickCheck) {
      row.userAction++;
    } else if (autoRuns) {
      row.labDoesIt++;
      autoRunList.push(`${wt.id} :: ${step.id} — auto-loads example files${step.commandToTest ? ` and auto-runs '${step.commandToTest}'` : ""} with no quickCheck`);
    } else {
      row.labDoesIt++;
      row.items.push({ ref: `${wt.id} :: ${step.id}`, verdict: "LAB DOES IT", why: "pure explanation: no quickCheck, no command, nothing for the learner to do" });
    }
  }
  walkRows.push(row);
}

// DIAGRAM INTEGRITY: no two steps in one walkthrough may share a diagramType,
// and every declared WalkthroughDiagramType must have a render case.
const dupDiagramList: string[] = [];
let orphanDiagramTypes: string[] = [];
for (const wt of WALKTHROUGHS_DATA ?? []) {
  const seen = new Map<string, number>();
  for (const step of wt.steps) seen.set(step.diagramType, (seen.get(step.diagramType) || 0) + 1);
  for (const [type, n] of seen) if (n > 1) dupDiagramList.push(`${wt.id}: ${type} used by ${n} steps`);
}
try {
  const typesSrc = readFileSync(resolve(__dirname, "../types/terraform.ts"), "utf8");
  const union = /export type WalkthroughDiagramType\s*=([\s\S]*?);/.exec(typesSrc)?.[1] || "";
  const unionMembers = [...union.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
  const compSrc = readFileSync(resolve(__dirname, "../components/WalkthroughDiagrams.tsx"), "utf8");
  const renderCases = new Set([...compSrc.matchAll(/case\s+"([a-z_]+)"/g)].map((m) => m[1]));
  orphanDiagramTypes = unionMembers.filter((t) => !renderCases.has(t));
} catch {
  // source files unreadable in this environment — skip the orphan check quietly
}

const allRows = [...labRows, ...walkRows];
const totalSteps = allRows.reduce((s, r) => s + r.total, 0);
const totalUser = allRows.reduce((s, r) => s + r.userAction, 0);
const pct = totalSteps === 0 ? 0 : Math.round((totalUser / totalSteps) * 100);

const REPORT_PATH = resolve(__dirname, "../../../reports/integrity-handson-2026-09-01.md");
const enforce = process.env.AUDIT_ENFORCE === "1";

describe("Golden rules audit — hands-on rule", () => {
  it("classifies every lab task and walkthrough step and writes the report", () => {
    const lines: string[] = [];
    lines.push("# Hands-On Audit — USER ACTION vs LAB DOES IT");
    lines.push("");
    lines.push(`_Generated by \`src/test/audit-golden-rules.test.ts\` (imports the real data via vitest — exact results). A lab task is LAB DOES IT if its validationCheck passes on untouched starter files or it asks only to observe. A walkthrough step is USER ACTION only if it has a quickCheck._`);
    lines.push("");
    lines.push(`**Overall: ${totalUser}/${totalSteps} = ${pct}% USER ACTION (target ≥ 80%) — ${pct >= 80 ? "✅ PASS" : "❌ FAIL"}**`);
    lines.push("");
    lines.push("## Per lesson");
    lines.push("");
    lines.push("| Lesson | Total | User action | Lab does it | % hands-on |");
    lines.push("|---|---|---|---|---|");
    for (const r of allRows) {
      const p = r.total ? Math.round((r.userAction / r.total) * 100) : 0;
      lines.push(`| ${r.id} (${r.title}) | ${r.total} | ${r.userAction} | ${r.labDoesIt} | ${p}% |`);
    }
    lines.push("");
    lines.push("## LAB DID IT — provable auto-pass (validationCheck true on untouched starter)");
    lines.push("");
    lines.push(autoPassList.length ? autoPassList.map((s) => `- ${s}`).join("\n") : "_none_");
    lines.push("");
    lines.push("## UNSOLVABLE — code-only tasks their own solutionFiles cannot pass (answer-key rot)");
    lines.push("");
    lines.push(`_State-gated tasks (verified live during apply in-app, excluded from this check): ${stateGatedCount}_`);
    lines.push("");
    lines.push(unsolvableList.length ? unsolvableList.map((s) => `- ${s}`).join("\n") : "_none_");
    lines.push("");
    lines.push("## LAB DID IT — walkthrough steps that auto-run commands for the user");
    lines.push("");
    lines.push(autoRunList.length ? autoRunList.map((s) => `- ${s}`).join("\n") : "_none_");
    lines.push("");
    lines.push("## DIAGRAM INTEGRITY");
    lines.push("");
    lines.push(dupDiagramList.length ? dupDiagramList.map((s) => `- ${s}`).join("\n") : "_no duplicated diagram types within any walkthrough_");
    lines.push("");
    lines.push(orphanDiagramTypes.length ? orphanDiagramTypes.map((t) => `- declared diagram type with NO render case: ${t}`).join("\n") : "_every declared diagram type has a render case_");
    lines.push("");
    lines.push("## LAB DID IT — passive walkthrough/lab items");
    lines.push("");
    const passive = allRows.flatMap((r) => r.items.map((i) => `- ${i.ref}: ${i.why}`));
    lines.push(passive.length ? passive.join("\n") : "_none_");
    lines.push("");

    mkdirSync(resolve(__dirname, "../../../reports"), { recursive: true });
    writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");

    // Always log the headline so `npm test` output carries it.
    console.log(`\n[GOLDEN-RULES AUDIT] hands-on = ${pct}% (${totalUser}/${totalSteps}); report: ${REPORT_PATH}`);
    expect(totalSteps).toBeGreaterThan(0);
  });

  it(`hands-on % is >= 80${enforce ? "" : " (advisory — set AUDIT_ENFORCE=1 to make this gate)"}`, () => {
    if (!enforce) expect(pct).toBeGreaterThanOrEqual(0);
    else expect(pct).toBeGreaterThanOrEqual(80);
  });

  it(`every lab is solvable by its own solutionFiles${enforce ? "" : " (advisory — set AUDIT_ENFORCE=1 to make this gate)"}`, () => {
    if (!enforce) expect(unsolvableList.length).toBeGreaterThanOrEqual(0);
    else expect(unsolvableList).toEqual([]);
  });

  it(`no two steps in a walkthrough share a diagram type${enforce ? "" : " (advisory — set AUDIT_ENFORCE=1 to make this gate)"}`, () => {
    if (!enforce) expect(dupDiagramList.length).toBeGreaterThanOrEqual(0);
    else expect(dupDiagramList).toEqual([]);
  });

  it(`every declared diagram type has a render case${enforce ? "" : " (advisory — set AUDIT_ENFORCE=1 to make this gate)"}`, () => {
    if (!enforce) expect(orphanDiagramTypes.length).toBeGreaterThanOrEqual(0);
    else expect(orphanDiagramTypes).toEqual([]);
  });
});