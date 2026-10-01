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
    // full coverage: 16 labs + 8 walkthroughs = 24 (Phase 4 added 6 multi-cloud labs)
    expect(CURRICULUM_ORDER.length).toBe(24);
    expect(seen.size).toBe(24);
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

  it("phases are contiguous blocks: 6 + 6 + 6 + 6 items", () => {
    const p = CURRICULUM_ORDER.map((c) => c.phase);
    expect(p.filter((x) => x === 1)).toHaveLength(6);
    expect(p.filter((x) => x === 2)).toHaveLength(6);
    expect(p.filter((x) => x === 3)).toHaveLength(6);
    expect(p.filter((x) => x === 4)).toHaveLength(6);
    // contiguous: no phase reappears after the next one starts
    let last = 0;
    for (const item of CURRICULUM_ORDER) {
      expect(item.phase).toBeGreaterThanOrEqual(last);
      last = item.phase;
    }
  });

  it("Phase 4 is exactly the six multi-cloud labs (3 azure, 3 google), beginner first in each cloud", () => {
    const p4 = CURRICULUM_ORDER.filter((c) => c.phase === 4);
    expect(p4.every((c) => c.type === "lab")).toBe(true);
    const labs = p4.map((c) => LABS_DATA[c.index]);
    expect(labs.map((l) => l.id)).toEqual([
      "lab-11-azure-durable-docs",
      "lab-12-azure-perimeter-hardening",
      "lab-13-azure-regional-dr-template",
      "lab-14-gcp-data-landing",
      "lab-15-gcp-network-quarantine",
      "lab-16-gcp-state-locking",
    ]);
    // difficulty ladder per cloud: 1 beginner then 2 intermediate
    expect(labs.slice(0, 3).map((l) => l.difficulty)).toEqual(["Beginner", "Intermediate", "Intermediate"]);
    expect(labs.slice(3, 6).map((l) => l.difficulty)).toEqual(["Beginner", "Intermediate", "Intermediate"]);
  });
});