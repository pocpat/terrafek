import { describe, it, expect } from "vitest";
import { applyTerraform, createEmptyState } from "../utils/terraformEngine";
import { parseHclCode } from "../utils/hclParser";
import { LABS_DATA } from "../data/labsData";

// Reproduce the user report: lab-2, tags added (task-5 ok), Apply clicked twice,
// task-6 checklist stays grey.
const USER_MAIN_TF = `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "Primary-Web-Server"
    Environment = "Dev"
  }
}
`;
const FILES = { "main.tf": USER_MAIN_TF };

describe("lab-2 task-6 repro: apply flow must satisfy the tag check", () => {
  const lab = LABS_DATA.find((l) => l.id === "lab-2-core-workflow")!;
  const task6 = lab.tasks.find((t) => t.id === "task-6")!;

  it("task-6 passes when tags exist before the first apply", () => {
    let state = createEmptyState();
    state = applyTerraform(FILES, state).newState;
    const attrs = state.resources[0]?.instances[0]?.attributes;
    console.log("attrs after 1 apply:", JSON.stringify(attrs));
    const parsed = parseHclCode(FILES).resources;
    expect(task6.validationCheck(FILES, state, parsed)).toBe(true);
  });

  it("task-6 passes after: apply base -> add tags -> apply again (two applies)", () => {
    const withoutTags = { "main.tf": USER_MAIN_TF.replace(/  tags = \{[\s\S]*?\n  \}\n/, "") };
    let state = createEmptyState();
    state = applyTerraform(withoutTags, state).newState;
    const attrsBefore = state.resources[0]?.instances[0]?.attributes;
    console.log("attrs after base apply:", JSON.stringify(attrsBefore));
    state = applyTerraform(FILES, state).newState;
    const attrsAfter = state.resources[0]?.instances[0]?.attributes;
    console.log("attrs after 2nd apply:", JSON.stringify(attrsAfter));
    const parsed = parseHclCode(FILES).resources;
    expect(task6.validationCheck(FILES, state, parsed)).toBe(true);
  });
});