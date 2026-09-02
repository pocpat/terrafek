import { describe, it, expect, beforeEach } from "vitest";
import {
  classifySubject,
  recordMistake,
  getMistakesList,
  buildMicroLab,
  getSubjectsNeedingLabs,
  getBuiltMicroLabs,
} from "../utils/mistakeTracker";

beforeEach(() => {
  window.localStorage.clear();
});

describe("Agent #11 — classifySubject", () => {
  it("classifies tag-key case errors", () => {
    expect(classifySubject("Tag key 'name' has wrong case; expected 'Name'")).toBe("tag-key-case");
  });
  it("classifies single-quote syntax errors", () => {
    expect(classifySubject("Invalid string literal: 'us-east-1' — use double quotes")).toBe("hcl-single-quotes");
  });
  it("classifies missing-brace errors", () => {
    expect(classifySubject("Missing '}' at end of file")).toBe("hcl-missing-brace");
  });
  it("returns null for unclassified errors", () => {
    expect(classifySubject("something completely different happened")).toBe(null);
  });
});

describe("Agent #11 — 2-strike rule", () => {
  it("lists a subject on the second strike", () => {
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    const r2 = recordMistake("Tag key 'environment' has wrong case; expected 'Environment'");
    expect(r2?.justListed).toBe(true);
    expect(getMistakesList().find((m) => m.subjectId === "tag-key-case")?.strikes).toBe(2);
  });

  it("does not list on a single strike", () => {
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    expect(getMistakesList().find((m) => m.strikes >= 2)).toBeUndefined();
  });

  it("does not double-count identical mistakes within 5 minutes", () => {
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    expect(getMistakesList().find((m) => m.subjectId === "tag-key-case")?.strikes).toBe(1);
  });
});

describe("Agent #12 — micro-lab builder", () => {
  it("builds a tag-case lab matching the drill schema", () => {
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    recordMistake("Tag key 'environment' has wrong case; expected 'Environment'");
    const lab = buildMicroLab("tag-key-case");
    expect(lab).not.toBeNull();
    expect(lab!.drill.id).toBe("micro-tag-key-case");
    // Only the subject is broken; everything else is pre-filled correctly
    expect(lab!.drill.starterFiles["main.tf"]).toContain("t3.micro");
    expect(lab!.drill.starterFiles["main.tf"]).toContain("name =");
    expect(lab!.drill.starterFiles["main.tf"]).toContain('region = "us-east-1"');
  });

  it("validationCheck: broken starter fails, corrected code passes", () => {
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    recordMistake("Tag key 'environment' has wrong case; expected 'Environment'");
    const lab = buildMicroLab("tag-key-case");
    const broken = lab!.drill.starterFiles["main.tf"];
    expect(lab!.drill.validationCheck({ "main.tf": broken }, {} as never, [])).toBe(false);
    const fixed = broken
      .replace(/\bname\s*=/, "Name =")
      .replace(/\benvironment\s*=/, "Environment =");
    expect(lab!.drill.validationCheck({ "main.tf": fixed }, {} as never, [])).toBe(true);
  });

  it("getBuiltMicroLabs reconstructs labs after a reload", () => {
    recordMistake("Tag key 'name' has wrong case; expected 'Name'");
    recordMistake("Tag key 'environment' has wrong case; expected 'Environment'");
    buildMicroLab("tag-key-case");
    expect(getBuiltMicroLabs().some((d) => d.id === "micro-tag-key-case")).toBe(true);
  });

  it("getSubjectsNeedingLabs includes listed subjects even without a recipe", () => {
    recordMistake("Error: unknown command foobar");
    recordMistake("Error: unknown command foobarbaz");
    expect(getSubjectsNeedingLabs().some((m) => m.subjectId === "cli-wrong-command")).toBe(true);
  });
});