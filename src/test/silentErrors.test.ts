import { describe, it, expect } from "vitest";
import { checkHclSyntax } from "../utils/hclSyntaxChecker";
import { diagnoseTask } from "../utils/hintDiagnostics";
import { runTerraformValidate } from "../utils/terraformEngine";

/**
 * Golden rule: beginner mistakes real Terraform rejects must NEVER be silent.
 * Regression: "Locals {" (wrong case) + unquoted ${...} template produced
 * zero errors anywhere — task stayed grey with no explanation.
 */
describe("hclSyntaxChecker — wrong-cased block keywords", () => {
  it("flags 'Locals {' with an error naming the correct keyword", () => {
    const issues = checkHclSyntax('Locals {\n  server_name = "x"\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes("Locals"))).toBe(true);
    expect(issues.some((i) => i.fixHint.includes('"locals"'))).toBe(true);
  });

  it("flags wrong-cased Resource/Variable/Provider keywords", () => {
    for (const code of ['Resource "aws_vpc" "m" {', "Variable \"x\" {", 'Provider "aws" {']) {
      expect(checkHclSyntax(code).some((i) => i.severity === "error")).toBe(true);
    }
  });

  it("does NOT flag correct lowercase keywords", () => {
    expect(checkHclSyntax('locals {\n  a = "b"\n}').filter((i) => i.severity === "error")).toHaveLength(0);
    expect(checkHclSyntax('resource "aws_vpc" "m" {').filter((i) => i.severity === "error")).toHaveLength(0);
  });
});

describe("hclSyntaxChecker — unquoted template interpolation", () => {
  it("flags server_name = app-web-${var.environment} (no quotes)", () => {
    const issues = checkHclSyntax('locals {\n  server_name = app-web-${var.environment}\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes("double quotes"))).toBe(true);
  });

  it("does NOT flag correctly quoted templates", () => {
    expect(checkHclSyntax('locals {\n  server_name = "app-web-${var.environment}"\n}').filter((i) => i.severity === "error")).toHaveLength(0);
  });
});

describe("hintDiagnostics — near-miss naming", () => {
  it("wrong-cased Locals gets a SPECIFIC diagnosis, not 'no locals block'", () => {
    const out = diagnoseTask({
      files: { "main.tf": 'Locals {\nserver_name = app-web-${var.environment}\n}' },
      labId: "lab-3-variables-locals",
    });
    expect(out.some((d) => d.message.includes("Locals") && d.message.includes("lowercase"))).toBe(true);
    expect(out.some((d) => d.message.startsWith("No locals block found"))).toBe(false);
  });

  it("quoted-but-wrong-case locals still names the case problem", () => {
    const out = diagnoseTask({
      files: { "main.tf": 'Locals {\n  server_name = "app-web-${var.environment}"\n}' },
      labId: "lab-3-variables-locals",
    });
    expect(out.some((d) => d.severity === "error" && d.message.includes("lowercase"))).toBe(true);
  });
});

describe("terraform validate surfaces syntax errors", () => {
  it("invalid code with wrong-cased Locals + unquoted template fails validate", () => {
    const result = runTerraformValidate({
      "main.tf": 'Locals {\nserver_name = app-web-${var.environment}\n}',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("Locals"))).toBe(true);
  });

  it("valid code still passes", () => {
    const result = runTerraformValidate({
      "main.tf": 'locals {\n  server_name = "app-web-${var.environment}"\n}',
    });
    // locals-only file: no resources to validate — must stay error-free
    expect(result.errors.filter((e) => e.includes("Locals") || e.includes("double quotes"))).toHaveLength(0);
  });
});