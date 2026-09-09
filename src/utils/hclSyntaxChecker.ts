/**
 * Beginner-friendly HCL syntax checker.
 *
 * Scans code line-by-line for common beginner mistakes that the main HCL parser
 * silently ignores (e.g. using `:` instead of `=`, missing quotes, unquoted
 * strings). Returns precise line numbers plus a plain-English explanation and
 * a suggested fix so the CodeEditor can highlight the exact problematic line.
 */

export interface SyntaxIssue {
  line: number;        // 1-indexed line number
  column: number;      // 1-indexed column of the problem
  severity: "error" | "warning";
  message: string;     // short technical message
  eli5: string;        // beginner-friendly explanation
  fixHint: string;     // what to change, e.g. 'Replace ":" with "="'
}

export function checkHclSyntax(code: string): SyntaxIssue[] {
  const issues: SyntaxIssue[] = [];
  const lines = code.split("\n");

  // Canonical AWS tag keys used across the course. AWS tag keys are
  // case-sensitive: "name" creates a DIFFERENT tag than "Name".
  const CANONICAL_TAG_KEYS = ["Name", "Environment", "ManagedBy"];
  let inTagsBlock = false;
  // Track output blocks: an output block without a `value` argument is invalid
  // HCL (real Terraform: "Missing required argument: value"). The lenient
  // parser accepted it silently and labs passed — catching it here.
  let inOutputBlock = false;
  let outputHasValue = false;
  let outputBlockStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("#") || line.startsWith("//") || line.startsWith("/*")) {
      continue;
    }

    // Track whether we are inside a `tags = { ... }` block (bookkeeping must
    // happen before the generic "}" skip below, or the flag would stick).
    if (/^tags\s*=\s*\{/.test(line)) inTagsBlock = true;

    // Output block bookkeeping (before the generic "}" skip)
    if (/^output\s+"/.test(line)) {
      inOutputBlock = true;
      outputHasValue = false;
      outputBlockStartLine = i + 1;
    }
    if (line === "}" && inOutputBlock) {
      inOutputBlock = false;
      if (!outputHasValue) {
        issues.push({
          line: outputBlockStartLine,
          column: 1,
          severity: "error",
          message: `This output block is missing its "value" argument — Terraform wouldn't know what to export.`,
          eli5: `An output block without "value =" has nothing to export. Real Terraform fails with "Missing required argument: value". Add: value = <what to export>, e.g. value = aws_instance.web.public_ip`,
          fixHint: `Add "value = ..." inside the output block`,
        });
      }
    }
    if (inOutputBlock && /^value\s*=/.test(line)) outputHasValue = true;
    if (line === "}") inTagsBlock = false;

    // Skip closing braces and bare openers
    if (line === "}" || line === "]" || line === "{" || line === "[") {
      continue;
    }

    // --- Check 0b: Wrong-cased TYPE inside quotes ---
    // provider "AWS", resource "AWS_INSTANCE" — the keyword is fine but the
    // quoted type must be lowercase too. Real Terraform rejects these; the
    // lenient parser silently ignores the whole block.
    // NOTE: must run BEFORE the block-header skip below, which would otherwise
    // swallow lines like `provider "AWS" {` silently.
    const quotedTypeMatch = line.match(/^(resource|data|provider|module)\s+"([A-Za-z0-9_]+)"/);
    if (quotedTypeMatch) {
      const typeToken = quotedTypeMatch[2];
      if (/[A-Z]/.test(typeToken)) {
        issues.push({
          line: i + 1,
          column: rawLine.indexOf(`"${typeToken}"`) + 2,
          severity: "error",
          message: `Type "${typeToken}" is not valid — resource and provider types are lowercase.`,
          eli5: `You wrote "${typeToken}", but Terraform types are always lowercase (e.g. "aws_s3_bucket", "aws"). Terraform doesn't recognize "${typeToken}" and rejects the block.`,
          fixHint: `Change "${typeToken}" to "${typeToken.toLowerCase()}"`,
        });
        continue;
      }
    }

    // --- Check 0c: Unknown aws_* resource type (likely typo) ---
    // resource "aws_instence" — shaped like a real type but not one Terraform
    // knows. The parser drops the block silently and validate passes.
    const awsTypeMatch = line.match(/^resource\s+"(aws[_-][a-z0-9_-]+)"\s+"[a-zA-Z0-9_-]+"/);
    if (awsTypeMatch) {
      // normalize dash typos (aws-vpc → aws_vpc) before matching known types
      const type = awsTypeMatch[1].replace(/-/g, "_");
      const typed = awsTypeMatch[1];
      // Common canonical types taught across the course
      const KNOWN_AWS_TYPES = [
        "aws_s3_bucket", "aws_instance", "aws_vpc", "aws_subnet", "aws_security_group",
        "aws_internet_gateway", "aws_route_table", "aws_route_table_association",
        "aws_db_instance", "aws_lb", "aws_alb", "aws_autoscaling_group",
        "aws_launch_template", "aws_launch_configuration", "aws_iam_role",
        "aws_iam_policy", "aws_iam_role_policy_attachment", "aws_dynamodb_table",
        "aws_s3_bucket_versioning", "aws_s3_bucket_server_side_encryption_configuration",
        "aws_ecr_repository", "aws_lambda_function", "aws_cloudwatch_log_group",
      ];
      // raw token decides "known vs unknown": aws-vpc is invalid HCL even
      // though its underscore twin aws_vpc is a real type — dashes are not
      // legal in type names, so the dash typo must be flagged.
      if (!KNOWN_AWS_TYPES.includes(awsTypeMatch[1])) {
        // Find the closest known type by simple distance (typo detection)
        let closest: string | undefined = undefined;
        for (const k of KNOWN_AWS_TYPES) {
          if (Math.abs(k.length - type.length) > 2) continue;
          let diff = 0;
          for (let c = 0; c < Math.min(k.length, type.length); c++) if (k[c] !== type[c]) diff++;
          diff += Math.abs(k.length - type.length);
          if (diff <= 2) { closest = k; break; }
        }
        issues.push({
          line: i + 1,
          column: rawLine.indexOf(`"${typed}"`) + 2,
          severity: "error",
          message: `"${typed}" is not a known AWS resource type.${closest ? ` Did you mean "${closest}"?` : ""}`,
          eli5: `Terraform doesn't know a resource type called "${typed}".${closest ? ` The correct type is "${closest}" — check the spelling.` : " Check the Terraform docs for the exact type name."} An unknown type makes Terraform ignore the whole block.`,
          fixHint: closest ? `Replace "${typed}" with "${closest}"` : `Check the spelling of "${typed}"`,
        });
        continue;
      }
    }

    // Skip block headers (resource "type" "name" {) and closing braces
    if (/^(resource|data|provider|variable|output|module|locals|terraform)\s/.test(line)) {
      continue;
    }

    // --- Check 0: Wrong-cased block keyword ---
    // HCL keywords are lowercase. "Locals {", "Resource ...", "Variable ..." are
    // invalid blocks Terraform rejects — but they slip past every other check
    // (and the lenient parser silently ignores them), so catch them here.
    const keywordMatch = line.match(/^([A-Za-z]+)(\s*[{"])/);
    if (keywordMatch) {
      const word = keywordMatch[1];
      const canonical = ["resource", "data", "provider", "variable", "output", "module", "locals", "terraform"].find(
        (k) => k.toLowerCase() === word.toLowerCase()
      );
      if (canonical && word !== canonical) {
        issues.push({
          line: i + 1,
          column: 1,
          severity: "error",
          message: `Block keyword "${word}" is not valid — block names are lowercase.`,
          eli5: `You wrote "${word}", but Terraform block keywords must be exactly "${canonical}" (all lowercase). Terraform treats "${word}" as an unknown word and ignores or rejects the whole block.`,
          fixHint: `Rename "${word}" to "${canonical}"`,
        });
        continue;
      }
    }

    // --- Check 1: Colon instead of equals sign ---
    // Matches:  bucket : "value"   or  bucket: "value"
    // But NOT:  tags = { Name = "x" }  (nested map uses =, which is fine)
    const colonMatch = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
    if (colonMatch && !line.includes("=")) {
      const key = colonMatch[1];
      const val = colonMatch[2].trim();
      // Make sure this isn't inside a nested map block (tags = { ... })
      // by checking if the line before or the line itself has an opening brace
      issues.push({
        line: i + 1,
        column: rawLine.indexOf(":") + 1,
        severity: "error",
        message: `"${key}" uses ":" but HCL requires "=" for assignment.`,
        eli5: `You wrote "${key} : ${val}" with a colon (:). In Terraform, you must use an equals sign (=) to set a value. Change it to "${key} = ${val}".`,
        fixHint: `Replace ":" with "="`,
      });
      continue; // don't double-report this line
    }

    // --- Check 2: Missing equals sign entirely ---
    // Matches a line that looks like it's trying to set an attribute
    // but has no = sign and no colon (e.g. "bucket" on its own line, or "bucket prod-analytics")
    if (!line.includes("=") && !line.includes(":") && !line.startsWith("//")) {
      // Check if it looks like an incomplete attribute: word followed by a value
      const bareMatch = line.match(/^([a-zA-Z0-9_-]+)\s+(".*"|[a-zA-Z0-9_.-]+)$/);
      if (bareMatch) {
        const key = bareMatch[1];
        const val = bareMatch[2];
        issues.push({
          line: i + 1,
          column: rawLine.indexOf(key) + 1 + key.length,
          severity: "error",
          message: `"${key}" is missing an "=" sign to assign the value.`,
          eli5: `You wrote "${key} ${val}" but forgot the equals sign. HCL needs "${key} = ${val}" (with an = in between).`,
          fixHint: `Add "=" between "${key}" and the value`,
        });
        continue;
      }
    }

    // --- Check 3: Single quotes instead of double quotes ---
    // HCL requires double quotes for strings, not single quotes
    if (line.includes("'") && !line.includes('"')) {
      const singleQuoteMatch = line.match(/'([^']*)'/);
      if (singleQuoteMatch) {
        issues.push({
          line: i + 1,
          column: rawLine.indexOf("'") + 1,
          severity: "error",
          message: `Single quotes are not valid in HCL. Use double quotes (").`,
          eli5: `You used single quotes ('...'). Terraform only understands double quotes ("..."). Change ' to ".`,
          fixHint: `Replace single quotes ' with double quotes "`,
        });
        continue;
      }
    }

    // --- Check 4: Unquoted string value ---
    // Matches: key = sometext  (no quotes, not a boolean, not a number, not a reference)
    const attrMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
    if (attrMatch) {
      const val = attrMatch[2].trim().replace(/,$/, "").replace(/\/\/.*$/, "").trim();

      // 4a. Unquoted template interpolation: server_name = app-web-${var.environment}
      // HCL REQUIRES quotes around template strings — this is a hard error real
      // Terraform rejects, but it slipped past every check silently.
      if (val.includes("${") && !val.startsWith('"')) {
        issues.push({
          line: i + 1,
          column: rawLine.indexOf(val) + 1,
          severity: "error",
          message: `The value must be wrapped in double quotes — template strings like \${...} only work inside "..."`,
          eli5: `You wrote "${val}" without quotes. In HCL, template strings with \${...} interpolation must be wrapped in double quotes: "${val.replace(/"/g, '\\"')}".`,
          fixHint: `Wrap the value in double quotes: ${val} → "${val.replace(/"/g, '\\"')}"`,
        });
        continue;
      }

      // Skip if it's a reference (contains dots like aws_vpc.main.id), boolean, number, or function call
      const isReference = /^[a-zA-Z0-9_.]+\.[a-zA-Z0-9_.]+/.test(val);
      const isBoolean = val === "true" || val === "false";
      const isNumber = !isNaN(Number(val)) && val !== "";
      const isFunctionCall = /\w+\(.*\)/.test(val);
      const isList = val.startsWith("[") || val.startsWith("{");
      const isVarRef = val.startsWith("var.") || val.startsWith("local.") || val.startsWith("module.") || val.startsWith("data.");
      const isTypeKeyword = ["string", "number", "bool", "list", "map", "set", "object", "any", "tuple"].includes(val);

      if (!isReference && !isBoolean && !isNumber && !isFunctionCall && !isList && !isVarRef && !isTypeKeyword) {
        // It's a bare word that should probably be quoted
        // But only flag if it looks like a plain text value (no special chars except dashes/underscores)
        if (/^[a-zA-Z0-9_-]+$/.test(val) && val.length > 2) {
          // This could be an unquoted string — but it's ambiguous, so just warn
          issues.push({
            line: i + 1,
            column: rawLine.indexOf(val) + 1,
            severity: "warning",
            message: `"${val}" might need double quotes around it.`,
            eli5: `The value "${val}" has no quotes around it. If this is text (not a variable reference), wrap it in double quotes: "${val}" should be ""${val}"".`,
            fixHint: `Wrap the value in double quotes: "${val}" → ""${val}""`,
          });
        }
      }
    }

    // --- Check 4c: Quoted reference — "var.x" / "local.x" inside quotes ---
    // instance_type = "var.instance_type" — quotes turn the reference into a
    // LITERAL string. Terraform accepts it silently (the instance gets named
    // literally "var.instance_type") and nothing else flags it. The task
    // regexes correctly reject it, but the learner gets zero explanation.
    const quotedRef = line.match(/=\s*"((?:var|local|module|data)\.[a-zA-Z0-9_.-]+)"/);
    if (quotedRef) {
      issues.push({
        line: i + 1,
        column: rawLine.indexOf(quotedRef[1]) + 1,
        severity: "error",
        message: `"${quotedRef[1]}" is inside quotes — that makes it plain TEXT, not a reference.`,
        eli5: `You wrote "${quotedRef[1]}" in quotes. Quotes mean "use this exact text". To USE the value of ${quotedRef[1]}, remove the quotes: ${quotedRef[1]}.`,
        fixHint: `Remove the quotes: "${quotedRef[1]}" → ${quotedRef[1]}`,
      });
      continue;
    }

    // --- Check 4b: Trailing space INSIDE quotes ---
    // instance_type = "t3.small " — a trailing space inside the quotes makes a
    // DIFFERENT value than "t3.small" (AWS rejects it). The leading-space rule
    // exists elsewhere; this catches the trailing variant.
    const trailQuote = line.match(/=\s*"[^"]*([ \t]+)"/);
    if (trailQuote) {
      issues.push({
        line: i + 1,
        column: rawLine.indexOf(trailQuote[1]) + 1,
        severity: "error",
        message: `There is a space INSIDE the quotes, at the end of the value.`,
        eli5: `Your value ends with a space inside the quotes: "... ". Terraform compares the EXACT string — "t3.small " (with a space) is a different value from "t3.small" and the checklist will not accept it.`,
        fixHint: `Delete the space before the closing quote`,
      });
    }

    // --- Check 5: Wrong-cased canonical tag keys ---
    // Inside a tags block, "name"/"environment"/"managedby" are different tags
    // from "Name"/"Environment"/"ManagedBy" (AWS tag keys are case-sensitive).
    // Beginners hit this constantly; the parser accepts it silently, so warn
    // on the exact line.
    if (inTagsBlock && attrMatch) {
      const key = attrMatch[1];
      const canonical = CANONICAL_TAG_KEYS.find((c) => c.toLowerCase() === key.toLowerCase());
      if (canonical && key !== canonical) {
        issues.push({
          line: i + 1,
          column: rawLine.indexOf(key) + 1,
          severity: "warning",
          message: `Tag key "${key}" has the wrong case — AWS tag keys are case-sensitive.`,
          eli5: `You wrote "${key}", but the task (and AWS convention) requires exactly "${canonical}". A differently-cased key creates a DIFFERENT tag, so checklist steps that verify "${canonical}" will stay grey.`,
          fixHint: `Rename the key to "${canonical}"`,
        });
      }
    }
  }

  return issues;
}

/**
 * Map issues to a per-line lookup for the CodeEditor to use when rendering
 * line numbers. Returns a Map<lineNumber (0-indexed), SyntaxIssue>.
 */
export function buildIssueLineMap(code: string): Map<number, SyntaxIssue> {
  const issues = checkHclSyntax(code);
  const map = new Map<number, SyntaxIssue>();
  for (const issue of issues) {
    map.set(issue.line - 1, issue); // convert to 0-indexed
  }
  return map;
}