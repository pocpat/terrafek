import { describe, it, expect } from "vitest";
import { computeLabNumbers, formatLabTitle } from "../utils/labNumbering";

const LABS = [
  { id: "lab-1", title: "1. Your First Cloud Resource", lesson: undefined },
  { id: "lab-2", title: "2. The Core Terraform Workflow", lesson: "Variables & State" },
  { id: "lab-3", title: "3. Input Variables & Locals", lesson: "Variables & State" },
  { id: "lab-4", title: "4. Cloud Networking & Resource Graphs", lesson: "Variables & State" },
  { id: "lab-5", title: "5. Outputs & Sensitive Data Handling", lesson: "Variables & State" },
] as any[];

describe("lab numbering — user rule", () => {
  it("single-lab lessons get a plain number; grouped labs get N.1, N.2…", () => {
    const n = computeLabNumbers(LABS);
    expect(n.get("lab-1")!.label).toBe("1");
    expect(n.get("lab-2")!.label).toBe("2.1");
    expect(n.get("lab-3")!.label).toBe("2.2");
    expect(n.get("lab-4")!.label).toBe("2.3");
    expect(n.get("lab-5")!.label).toBe("2.4");
  });

  it("formatLabTitle strips the legacy 'N. ' prefix and applies the computed number", () => {
    expect(formatLabTitle(LABS, "lab-1")).toBe("1. Your First Cloud Resource");
    expect(formatLabTitle(LABS, "lab-3")).toBe("2.2. Input Variables & Locals");
  });

  it("labs without a lesson key are each their own lesson", () => {
    const solo = [
      { id: "a", title: "1. Alpha" },
      { id: "b", title: "2. Beta" },
    ];
    const n = computeLabNumbers(solo as any[]);
    expect(n.get("a")!.label).toBe("1");
    expect(n.get("b")!.label).toBe("2");
  });
});