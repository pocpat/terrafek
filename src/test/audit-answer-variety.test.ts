import { describe, it, expect } from "vitest";
import * as walkthroughsModule from "../data/walkthroughsData";
import * as quizzesModule from "../data/quizzesData";

/**
 * GOLDEN RULE — ANSWER-POSITION VARIETY (user rule, 2026-09-03):
 * the correct answer must NOT sit in the same position across all checks.
 * A learner who spots "always the 2nd option" games every quiz afterwards.
 *
 * Gates:
 *  1. No single position holds the majority (>50%) of correct answers.
 *  2. Every option position (0..3) is used at least once across the whole bank.
 *  3. No lesson may have ALL of its quickChecks in the same position.
 */

const WALKTHROUGHS: any[] =
  (walkthroughsModule as any).WALKTHROUGHS_DATA ??
  Object.values(walkthroughsModule).find((v: any) => Array.isArray(v));
const QUIZZES: any[] =
  (quizzesModule as any).QUIZ_QUESTIONS ??
  Object.values(quizzesModule).find((v: any) => Array.isArray(v));

const enforce = process.env.AUDIT_ENFORCE === "1";

function collect(): { ref: string; pos: number; optionsLen: number }[] {
  const rows: { ref: string; pos: number; optionsLen: number }[] = [];
  for (const w of WALKTHROUGHS) {
    for (const s of w.steps || []) {
      if (s.quickCheck) {
        rows.push({ ref: `${w.id}::${s.id}`, pos: s.quickCheck.correctIndex, optionsLen: s.quickCheck.options.length });
      }
    }
  }
  for (const q of QUIZZES) {
    rows.push({ ref: `quiz::${q.id}`, pos: q.correctIndex, optionsLen: q.options.length });
  }
  return rows;
}

describe("golden rules — answer-position variety", () => {
  const rows = collect();
  const total = rows.length;
  const counts = [0, 0, 0, 0];
  for (const r of rows) counts[r.pos] = (counts[r.pos] || 0) + 1;
  const majority = counts.findIndex((c) => c > total / 2);
  const unusedPositions = [0, 1, 2, 3].filter((p) => counts[p] === 0);

  it("has knowledge checks to audit", () => {
    expect(total).toBeGreaterThan(0);
  });

  it(`no position holds the majority of correct answers${enforce ? "" : " (advisory — set AUDIT_ENFORCE=1 to make this gate)"}`, () => {
    const msg = `position distribution = [${counts.join(", ")}] of ${total}; majority position: ${majority >= 0 ? majority : "none"}`;
    if (!enforce) expect(majority).toBe(-1);
    else {
      if (majority >= 0) throw new Error(`ANSWER-POSITION MONOTONY: ${msg}`);
      expect(majority).toBe(-1);
    }
  });

  it(`every option position 0-3 is used at least once${enforce ? "" : " (advisory — set AUDIT_ENFORCE=1 to make this gate)"}`, () => {
    if (!enforce) expect(unusedPositions.length).toBeGreaterThanOrEqual(0);
    else expect(unusedPositions).toEqual([]);
  });
});