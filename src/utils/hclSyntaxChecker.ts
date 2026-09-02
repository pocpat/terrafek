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
    if (line === "}") inTagsBlock = false;

    // Skip block headers (resource "type" "name" {) and closing braces
    if (line === "}" || line === "]" || line === "{" || line === "[") {
      continue;
    }
    if (/^(resource|data|provider|variable|output|module|locals|terraform)\s/.test(line)) {
      continue;
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