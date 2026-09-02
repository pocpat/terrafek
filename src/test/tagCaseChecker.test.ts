import { describe, it, expect } from "vitest";
import { checkHclSyntax } from "../utils/hclSyntaxChecker";

describe("hclSyntaxChecker — tag key case sensitivity (Check 5)", () => {
  it("warns on the exact line with a wrong-cased tag key", () => {
    const code = `resource "aws_instance" "web" {
  ami = "ami-123"
  tags = {
    name = "Primary-Web-Server"
  }
}`;
    const issues = checkHclSyntax(code);
    const tagIssue = issues.find((i) => i.message.includes("wrong case"));
    expect(tagIssue).toBeDefined();
    expect(tagIssue!.line).toBe(4); // the `name = ...` line
    expect(tagIssue!.fixHint).toContain('"Name"');
    expect(tagIssue!.message).toContain("case-sensitive");
  });

  it("does not flag correct canonical keys", () => {
    const code = `resource "aws_instance" "web" {
  tags = {
    Name        = "Primary-Web-Server"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}`;
    const issues = checkHclSyntax(code);
    expect(issues.find((i) => i.message.includes("wrong case"))).toBeUndefined();
  });

  it("covers all three canonical keys and only inside tags blocks", () => {
    const code = `resource "aws_instance" "web" {
  ami = "ami-1"
  environment = "Dev"
  tags = {
    managedby = "Terraform"
  }
}`;
    const issues = checkHclSyntax(code);
    const wrong = issues.filter((i) => i.message.includes("wrong case"));
    expect(wrong).toHaveLength(1); // managedBy only — `environment` is outside a tags block
    expect(wrong[0].line).toBe(5);
  });
});