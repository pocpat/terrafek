import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * GOLDEN RACE GUARD: completion setters must use functional updates.
 * The 2026-09-04 bug: setCompletedLabIds([...completedLabIds, id]) captured a
 * STALE array and clobbered the functional writer's result in the same commit —
 * confetti fired, Roadmap disagreed. This test fails if anyone reintroduces a
 * stale-spread completion write anywhere in src/.
 */
describe("completion state race guard", () => {
  const files = ["src/App.tsx", "src/hooks/useTerraformSession.ts", "src/hooks/useGamification.ts"];

  it("no stale-spread completion writes: setCompletedXIds([...dep, ...]) is forbidden", () => {
    for (const f of files) {
      const src = readFileSync(join(__dirname, "../..", f), "utf-8");
      const stale = src.match(/setCompleted(Lab|Walkthrough|Drill)Ids\(\[\s*\.\.\.\s*(completed\w+Ids)/g);
      expect({ file: f, stale }).toEqual({ file: f, stale: null });
    }
  });

  it("every completion setter call in App.tsx uses the functional (prev =>) form", () => {
    const src = readFileSync(join(__dirname, "../..", "src/App.tsx"), "utf-8");
    const calls = src.match(/setCompleted(Lab|Walkthrough|Drill)Ids\(/g) || [];
    const functional = src.match(/setCompleted(Lab|Walkthrough|Drill)Ids\(\(prev\)/g) || [];
    expect(calls.length).toBeGreaterThan(0);
    expect(functional.length).toBe(calls.length);
  });
});
