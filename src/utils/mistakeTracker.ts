/**
 * AGENT #11 — MISTAKE TRACKER (in-app, Phase 3)
 *
 * Watches errors logged during play (useTerraformSession.logNewError),
 * classifies each into a SUBJECT (e.g. "tag key case", "single quotes"),
 * and applies the 2-strike rule: 2+ mistakes of the same subject = the
 * subject goes on the Mistakes List — the seed for a Gap-Fill micro-lab.
 *
 * Storage: localStorage (per-browser, like progress + key). Subject ids are
 * stable slugs so the list survives reloads and merges cleanly.
 */

export interface MistakeSubject {
  subjectId: string;
  label: string;
  strikes: number;
  lastSeen: string; // ISO date
  examples: string[]; // up to 3 raw error messages
}

const MISTAKES_KEY = "terrafek_mistakes_v1";
const MICRO_LABS_KEY = "terrafek_micro_labs_v1";

/**
 * Reconstruct all already-built micro-labs (drill objects live only in
 * memory; localStorage stores which subjects were built).
 */
export function getBuiltMicroLabs(): import("../types/terraform").RemediationDrill[] {
  return Array.from(getMicroLabIds())
    .map((id) => buildMicroLab(id)?.drill)
    .filter((d): d is import("../types/terraform").RemediationDrill => !!d);
}

/** Map a raw error message (or suspicious code line) to a stable subject id. */
export function classifySubject(content: string): string | null {
  const c = content.toLowerCase();

  // Quote-stripped copy for structural matching (so "missing '}'" matches "missing }")
  const cn = c.replace(/['"]/g, "");

  // --- HCL syntax class ---
  if (c.includes("'") && (c.includes("=") || c.includes("invalid"))) return "hcl-single-quotes";
  if (cn.includes("unclosed") || cn.includes("missing }") || cn.includes("missing brace") || cn.includes("expected }"))
    return "hcl-missing-brace";
  if (c.includes("missing =") || c.includes("expected assignment")) return "hcl-missing-assignment";
  if (c.includes("argument or block definition required") || c.includes("unexpected }")) return "hcl-extra-brace";

  // --- Tag key case class (the bug Elena found twice) ---
  if (c.includes("tag key") && c.includes("case")) return "tag-key-case";

  // --- Provider / init class ---
  if (c.includes("provider") && (c.includes("not found") || c.includes("unavailable"))) return "provider-not-installed";
  if (c.includes("unknown command")) return "cli-wrong-command";
  if (c.includes("initialization")) return "init-required";

  // --- Resource / validate class ---
  if (c.includes("unsupported attribute") || c.includes("unsupported argument")) return "wrong-attribute";
  if (c.includes("missing required argument")) return "missing-required-arg";
  if (c.includes("invalid reference") || c.includes("unknown resource")) return "bad-reference";

  // --- Value class ---
  if (c.includes("invalid number") || c.includes("must be a number")) return "quoted-number";
  if (c.includes("invalid value") || c.includes("invalid string")) return "wrong-value-type";

  return null;
}

export const SUBJECT_LABELS: Record<string, string> = {
  "hcl-single-quotes": "Single quotes in HCL (must be double quotes)",
  "hcl-missing-brace": "Unclosed block — missing '}'",
  "hcl-missing-assignment": "Missing '=' between name and value",
  "hcl-extra-brace": "Extra/unexpected '}'",
  "tag-key-case": "AWS tag key case (name ≠ Name)",
  "provider-not-installed": "Provider not installed (forgot terraform init)",
  "cli-wrong-command": "Wrong CLI command typed",
  "init-required": "Ran commands before terraform init",
  "wrong-attribute": "Unsupported attribute/argument on a resource",
  "missing-required-arg": "Missing required argument",
  "bad-reference": "Referencing a resource that doesn't exist",
  "quoted-number": "Numbers wrapped in quotes",
  "wrong-value-type": "Wrong value type for an argument",
};

/** Load the full mistakes list. */
export function getMistakesList(): MistakeSubject[] {
  try {
    const raw = window.localStorage.getItem(MISTAKES_KEY);
    return raw ? (JSON.parse(raw) as MistakeSubject[]) : [];
  } catch {
    return [];
  }
}

function saveMistakesList(list: MistakeSubject[]): void {
  try {
    window.localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
  } catch {
    /* private browsing — tracking simply won't persist */
  }
}

/**
 * Record one mistake strike. Returns the updated subject if this strike
 * REACHED the 2-strike threshold (i.e. the subject just made the list),
 * so the UI can announce it. Null = recorded, no announcement.
 */
export function recordMistake(content: string): { subjectId: string; justListed: boolean } | null {
  const subjectId = classifySubject(content);
  if (!subjectId) return null;

  // Dedupe: identical mistake text within 5 minutes = one strike (keystroke spam guard)
  try {
    const last = window.localStorage.getItem("terrafek_last_strike");
    if (last) {
      const { content: prev, at } = JSON.parse(last) as { content: string; at: number };
      if (prev === content && Date.now() - at < 5 * 60 * 1000) return null;
    }
    window.localStorage.setItem("terrafek_last_strike", JSON.stringify({ content, at: Date.now() }));
  } catch {
    /* proceed without dedupe */
  }

  const list = getMistakesList();
  const today = new Date().toISOString();
  let entry = list.find((m) => m.subjectId === subjectId);

  if (!entry) {
    entry = { subjectId, label: SUBJECT_LABELS[subjectId] || subjectId, strikes: 0, lastSeen: today, examples: [] };
    list.push(entry);
  }
  entry.strikes += 1;
  entry.lastSeen = today;
  if (entry.examples.length < 3) entry.examples.push(content.slice(0, 120));

  saveMistakesList(list);
  return { subjectId, justListed: entry.strikes === 2 };
}

/** Subjects that have hit the 2-strike threshold and have no micro-lab yet. */
export function getSubjectsNeedingLabs(): MistakeSubject[] {
  const listed = getMistakesList().filter((m) => m.strikes >= 2);
  const existing = getMicroLabIds();
  return listed.filter((m) => !existing.has(m.subjectId));
}

// ---------------------------------------------------------------------
// AGENT #12 — GAP-FILL BUILDER: one mistake = one micro-lab.
// Reuses the existing RemediationDrill schema. Everything unrelated to
// the subject is pre-filled/correct so the learner practices ONLY the gap.
// ---------------------------------------------------------------------

export interface MicroLabResult {
  drill: import("../types/terraform").RemediationDrill;
  subjectId: string;
}

/** Ids of micro-labs already generated. */
export function getMicroLabIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(MICRO_LABS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markMicroLabBuilt(subjectId: string): void {
  try {
    const ids = Array.from(getMicroLabIds());
    ids.push(subjectId);
    window.localStorage.setItem(MICRO_LABS_KEY, JSON.stringify(ids));
  } catch {
    /* non-persistent is acceptable */
  }
}

const RULES: Record<string, { concept: string; rules: string[]; broken: string; fixed: string; task: string }> = {
  "tag-key-case": {
    concept: "AWS tag keys are case-sensitive: 'Name' and 'name' are two DIFFERENT tags. Terraform will happily create both, and checklist steps looking for 'Name' will never see 'name'.",
    rules: [
      "Canonical AWS tag keys are written exactly: Name, Environment, ManagedBy (capital first letter).",
      "Tag keys are case-sensitive — 'name = ...' creates a different tag than 'Name = ...'.",
      "If a checklist stays grey while your code looks right, compare key spelling AND case, not just values.",
    ],
    broken: `provider "aws" {\n  region = "us-east-1"   # ✅ already correct\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t3.micro"\n  tags = {\n    name = "Primary-Web-Server"   # ❌ wrong case: key should be Name\n    environment = "Dev"           # ❌ wrong case: key should be Environment\n  }\n}`,
    fixed: `provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t3.micro"\n  tags = {\n    Name = "Primary-Web-Server"   # ✅ exact key\n    Environment = "Dev"           # ✅ exact key\n  }\n}`,
    task: "In main.tf, fix the tag keys so they use the exact canonical case (Name, Environment). Only the tag keys need changing — everything else is already correct.",
  },
  "hcl-single-quotes": {
    concept: "HCL string literals must use double quotes (\"). Single quotes (') are invalid syntax and fail parsing.",
    rules: [
      "HCL only permits double quotes (\") for string values.",
      "A single-quoted value is reported as an invalid syntax error near that line.",
      "Run 'terraform fmt' to catch formatting problems early.",
    ],
    broken: `provider "aws" {\n  region = 'us-east-1'   # ❌ single quotes\n}`,
    fixed: `provider "aws" {\n  region = "us-east-1"   # ✅ double quotes\n}`,
    task: "In main.tf, replace every single-quoted value with double quotes. The structure is otherwise correct.",
  },
  "hcl-missing-brace": {
    concept: "Every HCL block that opens with '{' must have a matching closing '}' — nested blocks need their own.",
    rules: [
      "Each nested map/block (tags = { ... }) needs its own closing '}'.",
      "A missing brace typically errors at the END of the file, not at the mistake — count your braces.",
      "'terraform fmt' will refuse to run until braces balance.",
    ],
    broken: `resource "aws_s3_bucket" "demo" {\n  bucket = "demo-bucket"\n  tags = {\n    Environment = "Dev"\n# ❌ missing '}' for tags and for the resource block\n`,
    fixed: `resource "aws_s3_bucket" "demo" {\n  bucket = "demo-bucket"\n  tags = {\n    Environment = "Dev"\n  }\n}\n# ✅ both blocks closed`,
    task: "In main.tf, add the missing closing braces so every block is balanced. No other changes needed.",
  },
};

/**
 * Build a micro-lab for a listed subject. Returns null if we have no recipe
 * for it yet (the list grows as new mistake classes appear).
 */
export function buildMicroLab(subjectId: string): MicroLabResult | null {
  const recipe = RULES[subjectId];
  if (!recipe) return null;

  const drill: import("../types/terraform").RemediationDrill = {
    id: `micro-${subjectId}`,
    domain: "syntax_anatomy",
    title: `Gap-Fill: ${SUBJECT_LABELS[subjectId] || subjectId}`,
    subtitle: "Personal micro-lab — generated from your own mistake history",
    estimatedMinutes: 3,
    difficulty: "Beginner",
    diagnosticReason: `You made this mistake ${getMistakesList().find((m) => m.subjectId === subjectId)?.strikes ?? 2}+ times in the labs, so this drill isolates exactly that subject.`,
    learningConcept: recipe.concept,
    commonMistakeExplanation: recipe.concept,
    brokenSnippet: recipe.broken,
    fixedSnippet: recipe.fixed,
    ruleBulletPoints: recipe.rules,
    practiceTask: recipe.task,
    commandToTest: "terraform validate",
    starterFiles: {
      "main.tf": recipe.broken
        .replace(/❌[^\n]*/g, "")
        .replace(/✅/g, "")
        .trim(),
    },
    solutionFiles: {
      "main.tf": recipe.fixed
        .replace(/❌|✅/g, "")
        .replace(/[ ]+#.*wrong case.*$/gm, "")
        .trim(),
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      // Only the subject matters: assert the correct pattern per subject.
      if (subjectId === "tag-key-case") {
        return /\bName\s*=/.test(main) && /\bEnvironment\s*=/.test(main) && !/\bname\s*=/.test(main) && !/\benvironment\s*=/.test(main);
      }
      if (subjectId === "hcl-single-quotes") {
        return !/'[^']*'/.test(main) && /=\s*"/.test(main);
      }
      if (subjectId === "hcl-missing-brace") {
        const open = (main.match(/\{/g) || []).length;
        const close = (main.match(/\}/g) || []).length;
        return open > 0 && open === close;
      }
      return false;
    },
  };

  markMicroLabBuilt(subjectId);
  return { drill, subjectId };
}

/**
 * Convenience for the app: given current mistakes, build every missing
 * micro-lab and return them (already marked as built).
 */
export function buildPendingMicroLabs(): import("../types/terraform").RemediationDrill[] {
  const pending = getSubjectsNeedingLabS();
  const built: import("../types/terraform").RemediationDrill[] = [];
  for (const m of pending) {
    const lab = buildMicroLab(m.subjectId);
    if (lab) built.push(lab.drill);
  }
  return built;
}

// alias kept simple intentionally
function getSubjectsNeedingLabS() {
  return getSubjectsNeedingLabs();
}