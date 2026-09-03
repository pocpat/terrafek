import { describe, it, expect } from "vitest";
import { diagnoseTask, fallbackDiagnosis } from "../utils/hintDiagnostics";

// EXACTLY the code from Elena's bug report (typos included)
const USER_MAIN = `# Write your Terraform code here.
# Task 1: Add the AWS provider block
# Task 2: Add the aws_instance resource block

provider "aws" {
region =" us-east-1"
}

resource  " aws_instance" "web_server" {
ami = "ami-0c55b159cbfafe1f0"
instance_type ="t3.micro"

tags={
Environment = "Production"
ManagedBy="Terraform"
}
}
`;

describe("hint diagnostics — replay of the real failing submission", () => {
  const dx = diagnoseTask({ files: { "main.tf": USER_MAIN }, labId: "lab-3-variables-locals" });

  it("flags the space inside the resource-type quotes", () => {
    expect(dx.some((d) => d.message.includes("Space INSIDE the quotes"))).toBe(true);
  });

  it("flags the leading space inside the region value", () => {
    expect(dx.some((d) => d.message.includes("starts with a space inside the quotes"))).toBe(true);
  });

  it("flags the wrong region for this lab", () => {
    expect(dx.some((d) => d.message.includes("eu-west-1"))).toBe(true);
  });

  it("flags the wrong resource name (web_server vs app)", () => {
    expect(dx.some((d) => d.message.includes('"web_server"'))).toBe(true);
  });

  it("returns the wrong-name diagnosis among results (errors first)", () => {
    expect(dx[0].severity).toBe("error");
    expect(dx.some((d) => d.message.includes('"web_server"'))).toBe(true);
  });

  it("empty variables.tf is flagged for lab-3", () => {
    const withVars = diagnoseTask({
      files: { "main.tf": USER_MAIN, "variables.tf": "# Lab 3: Input Variables\n# TODO\n" },
      labId: "lab-3-variables-locals",
    });
    expect(withVars.some((d) => d.message.includes("variables.tf is empty"))).toBe(true);
  });

  it("clean correct code produces no space/region/name diagnoses", () => {
    const good = `provider "aws" {
  region = "eu-west-1"
}

locals {
  server_name = "app-web-\${var.environment}"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = {
    Name = local.server_name
  }
}
`;
    const clean = diagnoseTask({
      files: { "main.tf": good, "variables.tf": 'variable "instance_type" {\n  type = string\n  default = "t3.micro"\n}\n\nvariable "environment" {\n  type = string\n  default = "staging"\n}' },
      labId: "lab-3-variables-locals",
    });
    expect(clean.some((d) => d.message.includes("Space INSIDE"))).toBe(false);
    expect(clean.some((d) => d.message.includes("eu-west-1") && d.severity === "warning")).toBe(false);
    expect(clean.some((d) => d.message.includes('"web_server"'))).toBe(false);
  });
});