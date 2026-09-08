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
    // 8a. Wrong-cased "Locals" — the learner HAS a locals block but its keyword
    // is capitalized, so Terraform (and the parser) ignore it completely.
    const wrongCase = main.match(/^\s*(Locals|LOCALS)\s*\{/m);
    if (wrongCase) {
      out.push({
        severity: "error",
        message: `You wrote "${wrongCase[1]}" — block keywords must be lowercase: "locals". Terraform ignores "Locals" completely, so your block doesn't exist.`,
        fix: "Change the first word to lowercase:\nlocals {\n  server_name = \"app-web-${var.environment}\"\n}",
      });
    } else {
      out.push({
        severity: "warning",
        message: "No locals block found — task 4 needs one computing server_name.",
        fix: 'Add:\nlocals {\n  server_name = "app-web-${var.environment}"\n}',
      });
    }
  }

  // 8b. Lab-3: unquoted template value inside locals
  if (labId === "lab-3-variables-locals" && /\blocals\b/.test(main)) {
    const unquoted = main.match(/^\s*server_name\s*=\s*([^"\s][^\n]*)$/m);
    if (unquoted && unquoted[1].includes("${")) {
      out.push({
        severity: "error",
        message: 'The server_name value needs double quotes — template strings with ${...} only work inside "..."',
        fix: 'locals {\n  server_name = "app-web-${var.environment}"\n}',
      });
    }
  }

  // 8c. Lab-3: quoted references — "var.x" / "local.x" inside quotes are
  // literal text, not references. Task regexes reject them silently.
  if (labId === "lab-3-variables-locals") {
    const quotedRef = all.match(/=\s*"((?:var|local)\.[a-zA-Z0-9_.-]+)"/);
    if (quotedRef) {
      out.push({
        severity: "error",
        message: `"${quotedRef[1]}" is inside quotes — that makes it plain TEXT, not a reference. Remove the quotes to use its value.`,
        fix: `Change "${quotedRef[1]}" to ${quotedRef[1]} (no quotes)`,
      });
    }
  }

  // 9. Lab-7 task-1: variable "services" map mistakes
  if (labId === "lab-7-count-and-for-each") {
    const servicesBlock = variables.match(/variable\s+"services"\s*\{([\s\S]*?)\n?\}/);

    if (!servicesBlock) {
      // No services variable at all — but only diagnose if the user wrote
      // SOMETHING in variables.tf (they attempted the task)
      if (variables.trim() && /variable|services/i.test(variables)) {
        out.push({
          severity: "error",
          message: 'No variable "services" block found in variables.tf — task 1 needs a map with the three tier keys.',
          fix: 'Declare it:\nvariable "services" {\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend  = "t3.medium"\n    worker   = "t3.micro"\n  }\n}',
        });
      }
    } else {
      const body = servicesBlock[1];

      // 9a. Iteration syntax inside a variable declaration — the user's exact bug
      if (/for(each)?\s*\[|foreach/i.test(body) || /for_each/.test(body)) {
        out.push({
          severity: "error",
          message: '"for_each" (or foreach[...]) does not belong inside a variable declaration. A variable just DESCRIBES the data — for_each is used later, inside the resource block that consumes it.',
          fix: 'In variables.tf, declare the map as plain default data:\nvariable "services" {\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend  = "t3.medium"\n    worker   = "t3.micro"\n  }\n}\n(for_each = var.services goes in main.tf later — task 2.)',
        });
      }

      // 9b. Keys as a bracket list instead of map entries
      else if (/=\s*\[/.test(body)) {
        out.push({
          severity: "error",
          message: "The keys are written as a list [frontend, backend, worker] — a map needs key = value pairs, one per tier.",
          fix: 'Each key gets its own line with its instance type:\nfrontend = "t3.small"\nbackend  = "t3.medium"\nworker   = "t3.micro"',
        });
      }

      // 9c. type = map(string) missing, or block arguments comma-joined on one
      // line ("type = map(string), default = {...}") — invalid HCL style that
      // the comma-joined one-liner produces.
      const hasType = /type\s*=\s*map\(string\)/.test(body);
      const commaJoined = /type\s*=\s*map\(string\)\s*,/.test(body) || /,\s*default\s*=/.test(body);
      if (!hasType) {
        out.push({
          severity: "error",
          message: 'The variable needs its type: type = map(string) — a map with one instance-type string per tier key.',
          fix: 'Inside the block:\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend  = "t3.medium"\n    worker   = "t3.micro"\n  }',
        });
      } else if (commaJoined) {
        out.push({
          severity: "error",
          message: 'Arguments in a block are separated by LINE BREAKS, not commas — "type = map(string), default = {...}" on one line is invalid HCL.',
          fix: 'Inside the block, one argument per line:\n  type = map(string)\n  default = {\n    frontend = "t3.small"\n    backend  = "t3.medium"\n    worker   = "t3.micro"\n  }',
        });
      }

      // 9d. One of the three tier keys missing
      const missing = ["frontend", "backend", "worker"].filter((k) => !body.includes(k));
      if (missing.length > 0 && !/for(each)?/i.test(body)) {
        out.push({
          severity: "warning",
          message: `The map is missing the key "${missing.join('", "')}" — task 1 needs all three tiers.`,
          fix: `Add inside default = { ... }:\n${missing.map((k) => `${k} = "t3.micro"`).join("\n")}`,
        });
      }
    }
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