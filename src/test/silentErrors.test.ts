import { describe, it, expect } from "vitest";
import { checkHclSyntax } from "../utils/hclSyntaxChecker";
import { diagnoseTask } from "../utils/hintDiagnostics";
import { runTerraformValidate, createEmptyState } from "../utils/terraformEngine";
import { LABS_DATA } from "../data/labsData";

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

describe("audit gaps — second round", () => {
  it("flags wrong-cased type inside quotes: provider \"AWS\"", () => {
    const issues = checkHclSyntax('provider "AWS" {\n  region = "us-east-1"\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes("AWS"))).toBe(true);
  });

  it("flags typo'd resource type with suggestion: aws_instence", () => {
    const issues = checkHclSyntax('resource "aws_instence" "web_server" {\n  ami = "ami-123"\n  instance_type = "t3.micro"\n}');
    const issue = issues.find((i) => i.message.includes("not a known AWS resource type"));
    expect(issue).toBeTruthy();
    expect(issue!.fixHint).toContain("aws_instance");
  });

  it("does NOT flag known types", () => {
    const code = 'resource "aws_instance" "web" {\n  ami = "ami-123"\n  instance_type = "t3.micro"\n}';
    expect(checkHclSyntax(code).filter((i) => i.severity === "error" && i.message.includes("known AWS"))).toHaveLength(0);
  });

  it("flags trailing space inside quotes: \"t3.small \"", () => {
    const issues = checkHclSyntax('resource "aws_instance" "web" {\n  instance_type = "t3.small "\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes("space INSIDE the quotes"))).toBe(true);
  });

  it("validate fails on dangling var reference with case-suggestion", () => {
    const result = runTerraformValidate({
      "main.tf": 'variable "instance_type" {\n  type = string\n  default = "t3.micro"\n}\n\nresource "aws_instance" "web" {\n  ami = "ami-123"\n  instance_type = var.Instance_Type\n}',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("undeclared var.Instance_Type"))).toBe(true);
    expect(result.errors.some((e) => e.includes("var.instance_type"))).toBe(true);
  });

  it("validate passes when references match declarations", () => {
    const result = runTerraformValidate({
      "main.tf": 'variable "instance_type" {\n  type = string\n  default = "t3.micro"\n}\n\nresource "aws_instance" "web" {\n  ami = "ami-123"\n  instance_type = var.instance_type\n}',
    });
    expect(result.errors.filter((e) => e.includes("undeclared"))).toHaveLength(0);
  });
});
describe("round 3 — user-reported Lab 2.2 cases", () => {
  it("flags quoted reference: instance_type = \"var.instance_type\"", () => {
    const issues = checkHclSyntax('resource "aws_instance" "app" {\n  instance_type = "var.instance_type"\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes("plain TEXT"))).toBe(true);
    expect(issues.some((i) => i.fixHint.includes("var.instance_type"))).toBe(true);
  });

  it("flags quoted local reference: Name = \"local.server_name\"", () => {
    const issues = checkHclSyntax('tags = {\n  Name = "local.server_name"\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes("local.server_name"))).toBe(true);
  });

  it("does NOT flag correct unquoted references", () => {
    const code = 'resource "aws_instance" "app" {\n  instance_type = var.instance_type\n  tags = {\n    Name = local.server_name\n  }\n}';
    expect(checkHclSyntax(code).filter((i) => i.severity === "error" && i.message.includes("plain TEXT"))).toHaveLength(0);
  });

  it("does NOT flag legitimate quoted strings (ami id, region, names)", () => {
    const code = 'provider "aws" {\n  region = "eu-west-1"\n}\n\nresource "aws_instance" "app" {\n  ami = "ami-0c55b159cbfafe1f0"\n  tags = {\n    Name = "app-web"\n  }\n}';
    expect(checkHclSyntax(code).filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("hint engine names the quoted-reference mistake for lab-3", () => {
    const out = diagnoseTask({
      files: {
        "main.tf": 'locals {\n  server_name = "app-web-${var.environment}"\n}\n\nresource "aws_instance" "app" {\n  ami = "ami-0c55b159cbfafe1f0"\n  instance_type = "var.instance_type"\n  tags = {\n    Name = "local.server_name"\n  }\n}',
      },
      labId: "lab-3-variables-locals",
    });
    expect(out.some((d) => d.message.includes("plain TEXT"))).toBe(true);
  });

  it("user's exact final code produces errors for BOTH quoted refs", () => {
    const result = runTerraformValidate({
      "main.tf": 'provider "aws"{\nregion= "eu-west-1"\n}\n\nlocals {\nserver_name = "app-web-${var.environment}"\n}\n\nresource "aws_instance" "app" {\n\nami = "ami-0c55b159cbfafe1f0"\ninstance_type = "var.instance_type"\n\ntags = {\nName = "local.server_name"\n}\n}',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.filter((e) => e.includes("plain TEXT")).length).toBe(2);
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
describe("round 4 — lab 2.4 missing-value bug (user-reported)", () => {
  it("flags output block with sensitive but NO value", () => {
    const issues = checkHclSyntax('output "db_password" {\n  sensitive = true\n}');
    expect(issues.some((i) => i.severity === "error" && i.message.includes('missing its "value"'))).toBe(true);
  });

  it("validate fails on output missing value", () => {
    const result = runTerraformValidate({
      "outputs.tf": 'output "db_password" {\n  sensitive = true\n}',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('required for output "db_password"'))).toBe(true);
  });

  it("does NOT flag complete output blocks", () => {
    const code = 'output "db_password" {\n  value       = var.db_password\n  sensitive   = true\n}';
    expect(checkHclSyntax(code).filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("lab-5 task-2 rejects output without value and accepts the real solution", () => {
    const lab = LABS_DATA.find((l) => l.id === "lab-5-outputs-sensitive")!;
    const task2 = lab.tasks.find((t) => t.id === "task-2")!;
    const noValue = 'output "db_password" {\n  sensitive = true\n}';
    expect(task2.validationCheck({ "outputs.tf": noValue }, createEmptyState(), [])).toBe(false);
    expect(task2.validationCheck(lab.solutionFiles, createEmptyState(), [])).toBe(true);
  });

  it("lab-8 task-3 check is satisfiable by the lab's own solution", () => {
    const lab = LABS_DATA.find((l) => l.id === "lab-8-modular-architecture")!;
    const task3 = lab.tasks.find((t) => t.id === "task-3")!;
    expect(task3.validationCheck(lab.solutionFiles, createEmptyState(), [])).toBe(true);
  });
});

describe("round 5 — lab 4.1 task-1 services map (user-reported)", () => {
  const USER_CODE = 'variable "services" {\nkey = foreach[frontend,backend,worker]\n}';

  it("names the iteration-syntax mistake instead of the generic fallback", () => {
    const out = diagnoseTask({ files: { "variables.tf": USER_CODE }, labId: "lab-7-count-and-for-each" });
    expect(out.some((d) => d.message.includes("does not belong inside a variable declaration"))).toBe(true);
  });

  it("flags bracket-list keys as needing key = value pairs", () => {
    const out = diagnoseTask({
      files: { "variables.tf": 'variable "services" {\n  type = map(string)\n  default = [frontend, backend, worker]\n}' },
      labId: "lab-7-count-and-for-each",
    });
    expect(out.some((d) => d.message.includes("key = value pairs"))).toBe(true);
  });

  it("flags comma-joined block arguments", () => {
    const out = diagnoseTask({
      files: { "variables.tf": 'variable "services" { type = map(string), default = { frontend = "t3.small" } }' },
      labId: "lab-7-count-and-for-each",
    });
    expect(out.some((d) => d.message.includes("LINE BREAKS, not commas"))).toBe(true);
  });

  it("flags a missing tier key", () => {
    const out = diagnoseTask({
      files: { "variables.tf": 'variable "services" {\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend = "t3.medium"\n  }\n}' },
      labId: "lab-7-count-and-for-each",
    });
    expect(out.some((d) => d.message.includes('missing the key "worker"'))).toBe(true);
  });

  it("correct map produces NO diagnostics", () => {
    const out = diagnoseTask({
      files: { "variables.tf": 'variable "services" {\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend  = "t3.medium"\n    worker   = "t3.micro"\n  }\n}' },
      labId: "lab-7-count-and-for-each",
    });
    expect(out.filter((d) => d.message.includes("services") || d.message.includes("map")).length).toBe(0);
  });

  it("task-1 check accepts the correctly formatted map", () => {
    const lab = LABS_DATA.find((l) => l.id === "lab-7-count-and-for-each")!;
    const task1 = lab.tasks.find((t) => t.id === "task-1")!;
    const good = 'variable "services" {\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend = "t3.medium"\n    worker = "t3.micro"\n  }\n}';
    expect(task1.validationCheck({ "variables.tf": good }, createEmptyState(), [])).toBe(true);
  });
});

describe("round 6 — 'map (string)' with space (user-reported)", () => {
  const USER_EXACT = '# Lab 4.1: Scaling with Count & For_Each\n# TODO Task 1: Declare the "services" variable as a map of instance types\n#   with one entry per tier (three tiers total — see your instruction list).\n\nvariable "services" {\ntype = map (string)\ndefault = {\n frontend = "t3.small"\n backend = "t3.medium"\n worker = "t3.micro"\n}}';

  it("task-1 accepts 'map (string)' with a space — real Terraform does", () => {
    const lab = LABS_DATA.find((l) => l.id === "lab-7-count-and-for-each")!;
    const task1 = lab.tasks.find((t) => t.id === "task-1")!;
    expect(task1.validationCheck({ "variables.tf": USER_EXACT }, createEmptyState(), [])).toBe(true);
  });

  it("hint engine does not false-positive on the spaced form", () => {
    const out = diagnoseTask({ files: { "variables.tf": USER_EXACT }, labId: "lab-7-count-and-for-each" });
    expect(out.filter((d) => d.message.includes("needs its type") || d.message.includes("LINE BREAKS")).length).toBe(0);
  });
});
