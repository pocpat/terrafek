/**
 * INTERACTIVE HINT ENGINE
 *
 * Bug class fixed: "task stays grey, no errors, hint repeats the task text".
 * When validationCheck fails, this engine runs targeted near-miss checks
 * against the learner's ACTUAL code and names the specific mistake
 * (space inside quotes, wrong region, wrong resource name, missing file,
 * hardcoded value, tag-key case) in beginner language.
 *
 * Generic + lab-scoped rules. Returns up to 3 most relevant diagnoses.
 */

export interface HintDiagnosis {
  severity: "error" | "warning";
  message: string;
  fix: string;
}

export interface HintContext {
  files: Record<string, string>;
  labId: string;
}

function getAllCode(files: Record<string, string>): string {
  return Object.values(files).join("\n");
}

/** Diagnose common mistakes in the learner's code. Task-agnostic. */
export function diagnoseTask(ctx: HintContext): HintDiagnosis[] {
  const out: HintDiagnosis[] = [];
  const main = ctx.files["main.tf"] || "";
  const variables = ctx.files["variables.tf"] || "";
  const all = getAllCode(ctx.files);
  const labId = ctx.labId;

  // 1. Space INSIDE the quotes of a block type:  resource  " aws_instance"
  const spaceInType = all.match(/(resource|data|module|variable)\s+"(\s+)\w/);
  if (spaceInType) {
    out.push({
      severity: "error",
      message: `Space INSIDE the quotes after '${spaceInType[1]}' — HCL reads quoted strings literally, so Terraform sees a different (nonexistent) identifier and reports no error at all.`,
      fix: `Remove the space: ${spaceInType[1]} "aws_instance" — quote marks must hug the name exactly.`,
    });
  }

  // 2. Leading space INSIDE a quoted value:  region =" us-east-1"
  const spaceInValue = all.match(/(\w+)\s*=\s*"\s+([^"]*)"/);
  if (spaceInValue) {
    out.push({
      severity: "error",
      message: `The value of '${spaceInValue[1]}' starts with a space inside the quotes — Terraform compares literal characters, so " ${spaceInValue[2].slice(0, 20)}" is a DIFFERENT value than "${spaceInValue[2].replace(/^\s+/, "").slice(0, 20)}".`,
      fix: `Remove the space: ${spaceInValue[1]} = "${spaceInValue[2].replace(/^\s+/, "")}" — nothing between the quote and the first character.`,
    });
  }

  // 3. Wrong region for labs that expect eu-west-1 (lab-3)
  // (tolerates a stray space inside the quotes — that bug gets its own diagnosis)
  if (labId === "lab-3-variables-locals" && /region\s*=\s*"\s*us-east-1/.test(all)) {
    out.push({
      severity: "warning",
      message: 'This lab\'s stack lives in Europe — the provider region must be "eu-west-1" (Ireland), not "us-east-1".',
      fix: 'Change the region to "eu-west-1".',
    });
  }

  // 4. Lowercase canonical tag keys inside tags blocks
  const tagsBlock = all.match(/tags\s*=\s*\{([\s\S]*?)\}/);
  if (tagsBlock) {
    const tags = tagsBlock[1];
    const caseFixes: [RegExp, string, string][] = [
      [/\bname\s*=/, "name", "Name"],
      [/\benvironment\s*=/, "environment", "Environment"],
      [/\bmanagedby\s*=/, "managedby", "ManagedBy"],
    ];
    for (const [re, wrong, right] of caseFixes) {
      if (re.test(tags)) {
        out.push({
          severity: "warning",
          message: `Tag key '${wrong}' has the wrong case — AWS tag keys are case-sensitive, and checklist steps that verify '${right}' will stay grey.`,
          fix: `Rename the tag key to exactly "${right}" (capital first letter).`,
        });
      }
    }
  }

  // 5. Lab expects a variables.tf but it's empty/missing
  if (labId === "lab-3-variables-locals" && variables.replace(/#.*$/gm, "").replace(/\s/g, "").length === 0) {
    out.push({
      severity: "error",
      message: "variables.tf is empty — tasks 2, 3 and 6 of this lab live THERE, not in main.tf. That's why nothing turns green.",
      fix: 'Open the variables.tf tab and declare: variable "instance_type" { type = string, default = "t3.micro" } and variable "environment" { type = string, default = "staging" }.',
    });
  }

  // 6. Lab-3: hardcoded instance_type instead of the variable
  if (labId === "lab-3-variables-locals" && /instance_type\s*=\s*"t3\.micro"/.test(main)) {
    out.push({
      severity: "warning",
      message: 'instance_type is hardcoded to "t3.micro" — this lab\'s whole point is to drive it from your variable.',
      fix: "Replace the hardcoded value with instance_type = var.instance_type.",
    });
  }

  // 7. Lab-3: resource must be named "app"
  if (labId === "lab-3-variables-locals") {
    const wrongName = main.match(/resource\s+"\s*aws_instance\s*"\s+"(?!app\b)([\w]+)"/);
    if (wrongName) {
      out.push({
        severity: "warning",
        message: `Your aws_instance is named "${wrongName[1]}" — this lab's checks reference the resource as aws_instance "app".`,
        fix: 'Rename it to: resource "aws_instance" "app" { ... }',
      });
    }
  }

  // 8. Lab-3: locals block missing entirely
  if (labId === "lab-3-variables-locals" && !/\blocals\b/.test(main)) {
    out.push({
      severity: "warning",
      message: "No locals block found — task 4 needs one computing server_name.",
      fix: 'Add:\nlocals {\n  server_name = "app-web-${var.environment}"\n}',
    });
  }

  // Most blocking problems first: errors before warnings, discovery order kept
  const sorted = [...out].sort((a, b) => (a.severity === "error" ? -1 : 1) - (b.severity === "error" ? -1 : 1));
  return sorted;
}

/** Fallback when no specific rule matched: honest, still useful. */
export function fallbackDiagnosis(taskHint: string): HintDiagnosis {
  return {
    severity: "warning",
    message:
      "No common mistake detected in your code — compare it with the hint below CHARACTER BY CHARACTER: exact spelling, exact name in quotes, and the correct file (check the file tabs above the editor).",
    fix: taskHint,
  };
}