import { describe, it, expect } from "vitest";
import { calculateCourseProgress } from "../utils/errorAnalyticsEngine";

/**
 * GOLDEN RULE — RECOMMENDATION ORDER INTEGRITY
 * Bug: after finishing Lab 2, users were pushed to Lab 5. Root cause: the
 * engine treated `walkthroughProgressIndex >= item.index` ("wherever the
 * reader stopped") as walkthrough COMPLETION, so the first-incomplete-lesson
 * scan skipped walkthroughs (and their labs) in CURRICULUM_ORDER.
 * Rule: a walkthrough is completed ONLY by its explicit completion flag
 * (finished last step). The reading index is display state, never completion.
 */

describe("recommendation order integrity (single source of truth)", () => {
  it("repro: labs 1-2 done, walkthroughs NOT completed -> recommends the first incomplete SEQUENCED lesson (walkthrough 0), never a skipped-ahead lab", () => {
    const r = calculateCourseProgress(
      ["lab-1-first-resource", "lab-2-core-workflow"],
      [], // no walkthrough ever formally completed
      [],
      4, // reading position is ahead — must NOT poison completion
      400,
      []
    );
    // The old bug returned lab idx 2 (Lab 3) here. Correct behavior: the first
    // not-formally-completed item in CURRICULUM_ORDER — walkthrough 0.
    expect(r.nextRecommendedLesson.type).toBe("walkthrough");
    expect(r.nextRecommendedLesson.index).toBe(0);
  });

  it("walkthroughs 0+1 completed and labs 0+1 done -> recommendation advances along the sequence to walkthrough 4 (CLI Workflow)", () => {
    const r = calculateCourseProgress(
      ["lab-1-first-resource", "lab-2-core-workflow"],
      ["concept-providers", "concept-resources", "concept-variables"],
      [],
      6,
      400,
      []
    );
    // CURRICULUM_ORDER: wt0✓ wt1✓ lab0✓ wt2✓ lab1✓ -> wt4 is first incomplete
    expect(r.nextRecommendedLesson.type).toBe("walkthrough");
    expect(r.nextRecommendedLesson.index).toBe(4);
  });

  it("reading position alone never completes walkthroughs (regression lock on the old heuristic)", () => {
    const browsedAhead = calculateCourseProgress([], [], [], 6, 0, []);
    const stayedAtStart = calculateCourseProgress([], [], [], 0, 0, []);
    // With NO completions at all, both states must recommend the FIRST lesson (walkthrough 0)
    expect(browsedAhead.nextRecommendedLesson.type).toBe("walkthrough");
    expect(browsedAhead.nextRecommendedLesson.index).toBe(0);
    expect(stayedAtStart.nextRecommendedLesson.index).toBe(0);
  });
});