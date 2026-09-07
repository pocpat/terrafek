import { describe, it, expect, beforeEach, vi } from "vitest";
import { useState } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTerraformSession } from "../hooks/useTerraformSession";
import { useGamification } from "../hooks/useGamification";
import type { LabDefinition, VisualWalkthrough, RemediationDrill } from "../types/terraform";
import { createEmptyState } from "../utils/terraformEngine";

// canvas-confetti schedules requestAnimationFrame loops that keep the jsdom
// process alive after tests finish (vitest hangs on exit). Mock it out.
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

/**
 * Completion-healing UX: user code persists per lab id to localStorage
 * ("tf_lab_code_<labId>") and is restored on revisit — so a learner whose
 * completion was clobbered by the pre-race-fix bug can re-earn it without
 * retyping. Plus the double-write dedupe in useGamification persistence.
 */

const STARTER = `# Lab 99. Test Lab
resource "aws_s3_bucket" "b" {
  bucket = "starter-bucket"
}
`;

const PASSING = `# Lab 99. Test Lab
resource "aws_s3_bucket" "b" {
  bucket = "passing-bucket"
}
`;

function makeLab(overrides: Partial<LabDefinition> = {}): LabDefinition {
  return {
    id: "lab-99-heal-test",
    level: 9,
    title: "99. Healing Test Lab",
    subtitle: "test",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    xp: 10,
    category: "Foundations",
    iconName: "test",
    scenario: "test scenario",
    visualGoal: "test goal",
    conceptTakeaway: ["takeaway"],
    tasks: [
      {
        id: "t1",
        description: "set the bucket name",
        hint: "hint",
        validationCheck: (codeMap) => (codeMap["main.tf"] || "").includes("passing-bucket"),
      },
    ],
    starterFiles: { "main.tf": STARTER },
    solutionFiles: { "main.tf": PASSING },
    solutionExplanation: "explanation",
    architectureDiagramType: "s3_single",
    ...overrides,
  };
}

function makeWalkthrough(): VisualWalkthrough {
  return {
    id: "wt-test",
    conceptId: "c1",
    title: "Test Walkthrough",
    subtitle: "sub",
    category: "Core Foundations",
    estimatedMinutes: 5,
    icon: "i",
    summary: "s",
    mainObjectives: [],
    steps: [],
    starterFiles: { "main.tf": "# walkthrough starter\n" },
  };
}

function makeDrill(): RemediationDrill {
  return {
    id: "drill-test",
    domain: "syntax_anatomy",
    title: "Test Drill",
    subtitle: "sub",
    estimatedMinutes: 5,
    difficulty: "Beginner",
    diagnosticReason: "d",
    learningConcept: "l",
    commonMistakeExplanation: "m",
    brokenSnippet: "b",
    fixedSnippet: "f",
    ruleBulletPoints: [],
    practiceTask: "p",
    starterFiles: { "main.tf": "# drill starter\n" },
    solutionFiles: { "main.tf": "# drill solution\n" },
    validationCheck: () => false,
  };
}

function renderSession(lab: LabDefinition, completedLabIds: string[] = []) {
  return renderHook(() =>
    useTerraformSession({
      activeMode: "lab",
      currentLab: lab,
      currentWalkthrough: makeWalkthrough(),
      currentDrill: makeDrill(),
      currentLabIndex: 0,
      currentWalkthroughIndex: 0,
      currentDrillIndex: 0,
      completedLabIds,
      setCompletedLabIds: () => {},
      setTotalXp: () => {},
      setWorkspaceViewMode: () => {},
      loggedErrors: [],
      setLoggedErrors: () => {},
      logNewError: () => {},
    }),
  );
}

describe("per-lab code memory (completion-healing UX)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves user code per lab id while the lab is open", async () => {
    const lab = makeLab();
    const { result } = renderSession(lab);

    act(() => {
      result.current.handleCodeChange("main.tf", PASSING);
    });

    await waitFor(() => {
      expect(localStorage.getItem("tf_lab_code_lab-99-heal-test")).toBeTruthy();
    });
    const stored = JSON.parse(localStorage.getItem("tf_lab_code_lab-99-heal-test") || "{}");
    expect(stored["main.tf"]).toContain("passing-bucket");
  });

  it("restores saved code instead of starter when the lab is revisited", async () => {
    localStorage.setItem(
      "tf_lab_code_lab-99-heal-test",
      JSON.stringify({ "main.tf": PASSING }),
    );
    const { result } = renderSession(makeLab());

    // Load effect runs on mount — the editor shows the saved code, not starter
    expect(result.current.files["main.tf"]).toContain("passing-bucket");
    expect(result.current.files["main.tf"]).not.toContain("starter-bucket");
    await waitFor(() => {
      expect(result.current.terminalLogs.some((l) => l.command === "system")).toBe(true);
    });
  });

  it("restored passing code re-fires auto-completion for a clobbered lab", async () => {
    // Elena's situation: completion was lost, lab NOT in completedLabIds
    localStorage.setItem(
      "tf_lab_code_lab-99-heal-test",
      JSON.stringify({ "main.tf": PASSING }),
    );
    // Stateful mock: mirrors the real hook — completedLabIds must UPDATE so the
    // completion effect's guard flips and does not loop forever (a stale []
    // prop re-triggers the effect every render and crashes the worker).
    const completions: string[][] = [];
    const { result } = renderHook(() => {
      const [completedLabIds, setCompletedLabIds] = useState<string[]>([]);
      const wrappedSetter = (action: React.SetStateAction<string[]>) => {
        completions.push(typeof action === "function" ? action(completedLabIds) : action);
        setCompletedLabIds(action);
      };
      return useTerraformSession({
        activeMode: "lab",
        currentLab: makeLab(),
        currentWalkthrough: makeWalkthrough(),
        currentDrill: makeDrill(),
        currentLabIndex: 0,
        currentWalkthroughIndex: 0,
        currentDrillIndex: 0,
        completedLabIds,
        setCompletedLabIds: wrappedSetter,
        setTotalXp: () => {},
        setWorkspaceViewMode: () => {},
        loggedErrors: [],
        setLoggedErrors: () => {},
        logNewError: () => {},
      });
    });
    // the completion effect watches files — restored code passes, so it fires
    await waitFor(() => {
      expect(result.current.terminalLogs.some((l) => l.output.includes("Congratulations"))).toBe(true);
    });
    expect(completions.length).toBe(1);
  });

  it("loads starter when nothing was saved for that lab", () => {
    const { result } = renderSession(makeLab());
    expect(result.current.files["main.tf"]).toBe(STARTER);
  });

  it("does not restore another lab's saved code", () => {
    localStorage.setItem(
      "tf_lab_code_lab-88-other",
      JSON.stringify({ "main.tf": PASSING }),
    );
    const { result } = renderSession(makeLab());
    expect(result.current.files["main.tf"]).toBe(STARTER);
  });

  it("ignores corrupted or empty saved code and falls back to starter", () => {
    localStorage.setItem("tf_lab_code_lab-99-heal-test", "{not valid json");
    const { result } = renderSession(makeLab());
    expect(result.current.files["main.tf"]).toBe(STARTER);
  });

  it("walkthrough mode keeps loading its own starter (unaffected)", () => {
    localStorage.setItem("tf_lab_code_lab-99-heal-test", JSON.stringify({ "main.tf": PASSING }));
    const { result } = renderHook(() =>
      useTerraformSession({
        activeMode: "walkthrough",
        currentLab: makeLab(),
        currentWalkthrough: makeWalkthrough(),
        currentDrill: makeDrill(),
        currentLabIndex: 0,
        currentWalkthroughIndex: 0,
        currentDrillIndex: 0,
        completedLabIds: [],
        setCompletedLabIds: () => {},
        setTotalXp: () => {},
        setWorkspaceViewMode: () => {},
        loggedErrors: [],
        setLoggedErrors: () => {},
        logNewError: () => {},
      }),
    );
    expect(result.current.files["main.tf"]).toBe("# walkthrough starter\n");
  });
});

describe("useGamification persistence dedupe", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists completedLabIds deduplicated to tf_completed_labs", async () => {
    const seeded = ["lab-a", "lab-a", "lab-b"];
    // Seed via the same path the app uses: initial state reads from storage,
    // so seed storage then let the hook read it, then trigger a write.
    localStorage.setItem("tf_completed_labs", JSON.stringify(seeded));
    const { result } = renderHook(() => useGamification());
    expect(result.current.completedLabIds).toEqual(seeded); // state may hold dupes

    // Any write (e.g. a new completion) heals the stored array
    act(() => {
      result.current.setCompletedLabIds((prev) => [...prev, "lab-c"]);
    });
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("tf_completed_labs") || "[]");
      expect(stored).toEqual(["lab-a", "lab-b", "lab-c"]);
    });
  });

  it("persists walkthrough and drill completions deduplicated too", async () => {
    // Mark state as already migrated, or migrateState_v2 treats the seeded
    // walkthrough completions as pre-v2 poison and deletes them.
    localStorage.setItem("tf_state_version", "2");
    localStorage.setItem("tf_completed_walkthroughs", JSON.stringify(["wt-1", "wt-1"]));
    localStorage.setItem("tf_completed_drills", JSON.stringify(["dr-1", "dr-1", "dr-2"]));
    const { result } = renderHook(() => useGamification());
    expect(result.current.completedWalkthroughIds).toEqual(["wt-1", "wt-1"]);

    // Trigger a write on each persistence effect (state change → effect runs)
    act(() => {
      result.current.setCompletedWalkthroughIds((prev) => [...prev, "wt-2"]);
      result.current.setCompletedDrillIds((prev) => [...prev, "dr-3"]);
    });
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem("tf_completed_walkthroughs") || "[]")).toEqual(["wt-1", "wt-2"]);
      expect(JSON.parse(localStorage.getItem("tf_completed_drills") || "[]")).toEqual(["dr-1", "dr-2", "dr-3"]);
    });
  });
});