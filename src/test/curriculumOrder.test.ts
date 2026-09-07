import { describe, it, expect } from "vitest";
import { CURRICULUM_ORDER } from "../data/curriculumSequence";
import { LABS_DATA } from "../data/labsData";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";

/**
 * GOLDEN RULE — CURRICULUM ORDER INTEGRITY (the "order agent"'s contract):
 * CURRICULUM_ORDER is the single source of truth for the sequence shown on the
 * Roadmap, the Recommended-Next-Step banner, and the Next-lesson button.
 * Guard: every lab and walkthrough appears EXACTLY ONCE, indices are valid,
 * and the dashboard phase grouping covers everything with no leftovers.
 */
describe("curriculum order integrity", () => {
  it("contains every lab and every walkthrough exactly once", () => {
    const seen = new Map<string, number>();
    for (const item of CURRICULUM_ORDER) {
      const key = `${item.type}:${item.index}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    // no duplicates
    const dupes = [...seen.entries()].filter(([, n]) => n > 1);
    expect(dupes).toEqual([]);
    // full coverage: 10 labs + 7 walkthroughs = 17
    expect(CURRICULUM_ORDER.length).toBe(17);
    expect(seen.size).toBe(17);
  });

  it("every index resolves to a real lab / walkthrough (no dangling references)", () => {
    for (const item of CURRICULUM_ORDER) {
      if (item.type === "lab") {
        expect(item.index).toBeLessThan(LABS_DATA.length);
        expect(LABS_DATA[item.index]).toBeTruthy();
      } else {
        expect(item.index).toBeLessThan(WALKTHROUGHS_DATA.length);
        expect(WALKTHROUGHS_DATA[item.index]).toBeTruthy();
      }
    }
  });

  it("phases are contiguous blocks: 6 + 5 + 6 items", () => {
    const p = CURRICULUM_ORDER.map((c) => c.phase);
    expect(p.filter((x) => x === 1)).toHaveLength(6);
    expect(p.filter((x) => x === 2)).toHaveLength(5);
    expect(p.filter((x) => x === 3)).toHaveLength(6);
    // contiguous: no phase reappears after the next one starts
    let last = 0;
    for (const item of CURRICULUM_ORDER) {
      expect(item.phase).toBeGreaterThanOrEqual(last);
      last = item.phase;
    }
  });
});