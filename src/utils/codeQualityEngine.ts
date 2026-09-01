/**
 * Code Quality Review Engine
 *
 * Compares student code against the lab's reference solution and checks
 * for HCL best practices. Returns actionable, beginner-friendly feedback
 * so students learn the "proper way" — not just "approximately passing."
 */

export interface QualityCheck {
  id: string;
  category: "structure" | "best_practice" | "naming" | "formatting" | "completeness";
  severity: "critical" | "warning" | "info" | "passed";
  title: string;
  description: string;
  eli5: string;
  fixHint: string;
  studentLine?: number;
}

export interface QualityReviewResult {
  score: number;          // 0-100
  grade: string;          // "A+", "A", "B", "C", "D"
  passedCount: number;
  totalCount: number;
  checks: QualityCheck[];
  missingFromSolution: string[];   // things in solution but not in student code
  extraInStudent: string[];        // things in student code not in solution
}

/**
 * Compare student code against the solution and run quality checks.
 */
export function reviewCodeQuality(
  studentCode: Record<string, string>,
  solutionCode: Record<string, string>
): QualityReviewResult {
  const checks: QualityCheck[] = [];

  const studentMain = studentCode["main.tf"] || "";
  const solutionMain = solutionCode["main.tf"] || "";
  const studentVars = studentCode["variables.tf"] || "";
  const solutionVars = solutionCode["variables.tf"] || "";
  const studentOutputs = studentCode["outputs.tf"] || "";
  const solutionOutputs = solutionCode["outputs.tf"] || "";

  // --- Check 1: Tags block (best practice for AWS resources) ---
  const hasTagsBlock = /\btags\s*=\s*\{/.test(studentMain);
  const solutionHasTags = /\btags\s*=\s*\{/.test(solutionMain);
  if (solutionHasTags) {
    if (hasTagsBlock) {
      checks.push({
        id: "tags-block",
        category: "best_practice",
        severity: "passed",
        title: "Resource Tags Present",
        description: "Your resources include a tags block for metadata labeling.",
        eli5: "Great job! You added tags to your resource. Tags help organize and find resources in the AWS console.",
        fixHint: "",
      });
    } else {
      // Check if they used the wrong singular "tag" instead of "tags"
      const hasWrongTag = /\btag\s*=\s*/.test(studentMain);
      checks.push({
        id: "tags-block",
        category: "best_practice",
        severity: "critical",
        title: hasWrongTag ? "Wrong attribute name: 'tag' should be 'tags'" : "Missing tags block",
        description: hasWrongTag
          ? "You wrote 'tag = \"...\"' but the correct AWS attribute is 'tags = { ... }' (plural, with a map block)."
          : "AWS resources should include a tags block for cost allocation, environment tracking, and team ownership.",
        eli5: hasWrongTag
          ? "In AWS, the attribute is called 'tags' (plural) and it needs curly braces { } around the values, not a single string. You wrote 'tag = \"Production\"' but it should be 'tags = { Environment = \"Production\" }'."
          : "Think of tags like labels on a folder. The reference solution uses tags to mark which environment and who manages this resource. Without tags, you can't track or organize your cloud resources.",
        fixHint: hasWrongTag
          ? 'Replace tag = "Production" with tags = { Environment = "Production" ManagedBy = "Terraform" }'
          : "Add a tags block inside your resource: tags = { Environment = \"Production\" }",
      });
    }
  }

  // --- Check 2: Proper block formatting (no line break before opening brace) ---
  const hasLineBreakBeforeBrace = /resource\s+"[^"]+"\s+"[^"]+"\s*\n\s*\{/.test(studentMain);
  if (hasLineBreakBeforeBrace) {
    checks.push({
      id: "brace-formatting",
      category: "formatting",
      severity: "warning",
      title: "Opening brace on a new line",
      description: "In HCL, the opening brace { should be on the same line as the block header, not on the next line.",
      eli5: "You put the { on a new line. In Terraform, the { should be at the end of the same line as 'resource \"type\" \"name\"'. This is a style convention that all Terraform code follows.",
      fixHint: 'Move { to the end of the resource line: resource "aws_s3_bucket" "name" {',
    });
  } else {
    checks.push({
      id: "brace-formatting",
      category: "formatting",
      severity: "passed",
      title: "Block Formatting Correct",
      description: "Opening braces are on the same line as block headers.",
      eli5: "Your braces are in the right place — on the same line as the block name.",
      fixHint: "",
    });
  }

  // --- Check 3: Indentation (2-space convention) ---
  const hasBadIndentation = /\t/.test(studentMain);
  if (hasBadIndentation) {
    checks.push({
      id: "indentation",
      category: "formatting",
      severity: "warning",
      title: "Tabs instead of spaces",
      description: "HCL convention uses 2 spaces per indent level, not tabs.",
      eli5: "You used Tab characters. Terraform code should use 2 spaces for each indent level. Run 'terraform fmt' to fix this automatically.",
      fixHint: "Use 2 spaces instead of tabs, or click the Format button.",
    });
  }

  // --- Check 4: Solution comparison — find missing elements ---
  const missingFromSolution: string[] = [];

  // Check for attributes/blocks in solution but not in student code
  const solutionTagsMatch = solutionMain.match(/tags\s*=\s*\{([^}]*)\}/);
  if (solutionTagsMatch && !hasTagsBlock) {
    const tagKeys = (solutionTagsMatch[1].match(/^\s*([A-Za-z_]+)\s*=/gm) || []).map((s) => s.trim().replace(/\s*=$/, ""));
    if (tagKeys.length > 0) {
      missingFromSolution.push(`tags block with: ${tagKeys.join(", ")}`);
    }
  }

  // Check for Environment tag specifically
  const solutionHasEnvTag = /Environment\s*=/.test(solutionMain);
  const studentHasEnvTag = /Environment\s*=/.test(studentMain);
  if (solutionHasEnvTag && !studentHasEnvTag) {
    missingFromSolution.push("Environment tag");
  }

  // Check for ManagedBy tag
  const solutionHasManagedBy = /ManagedBy\s*=/.test(solutionMain);
  const studentHasManagedBy = /ManagedBy\s*=/.test(studentMain);
  if (solutionHasManagedBy && !studentHasManagedBy) {
    missingFromSolution.push("ManagedBy tag");
  }

  // Check for variables.tf completeness
  if (solutionVars) {
    const solutionVarNames = (solutionVars.match(/variable\s+"([^"]+)"/g) || []).map((m) => m.match(/"([^"]+)"/)?.[1] || "");
    solutionVarNames.forEach((varName) => {
      if (varName && !studentVars.includes(`variable "${varName}"`)) {
        missingFromSolution.push(`variable "${varName}" in variables.tf`);
      }
    });
  }

  // Check for outputs.tf completeness
  if (solutionOutputs) {
    const solutionOutputNames = (solutionOutputs.match(/output\s+"([^"]+)"/g) || []).map((m) => m.match(/"([^"]+)"/)?.[1] || "");
    solutionOutputNames.forEach((outName) => {
      if (outName && !studentOutputs.includes(`output "${outName}"`)) {
        missingFromSolution.push(`output "${outName}" in outputs.tf`);
      }
    });
  }

  // --- Check 5: Extra/wrong attributes in student code ---
  const extraInStudent: string[] = [];

  // Check for singular "tag" instead of "tags"
  if (/\btag\s*=\s*/.test(studentMain) && !/\btags\s*=\s*\{/.test(studentMain)) {
    extraInStudent.push("tag = \"...\" (should be tags = { ... })");
  }

  // Check for TODO comments left in code
  if (/TODO/i.test(studentMain) || /TODO/i.test(studentVars) || /TODO/i.test(studentOutputs)) {
    checks.push({
      id: "todo-comments",
      category: "completeness",
      severity: "warning",
      title: "Unresolved TODO comments in code",
      description: "Your code still contains TODO comments from the starter template. These should be replaced with actual implementation.",
      eli5: "You left the 'TODO' comment from the template in your code. A TODO means 'I haven't done this yet'. Remove it and replace it with the actual code.",
      fixHint: "Remove the TODO comment and write the actual code it was asking for.",
    });
  } else {
    checks.push({
      id: "todo-comments",
      category: "completeness",
      severity: "passed",
      title: "No leftover TODO comments",
      description: "All TODO comments from the starter template have been addressed.",
      eli5: "Good — you removed all the TODO comments from the template and wrote actual code.",
      fixHint: "",
    });
  }

  // --- Check 6: Missing from solution summary ---
  if (missingFromSolution.length > 0) {
    checks.push({
      id: "missing-elements",
      category: "completeness",
      severity: "critical",
      title: `Missing ${missingFromSolution.length} element${missingFromSolution.length > 1 ? "s" : ""} from the reference solution`,
      description: `Your code is missing: ${missingFromSolution.join(", ")}. Compare with the View Solution button to see what a complete solution looks like.`,
      eli5: `The reference solution includes these things that your code doesn't have: ${missingFromSolution.join(", ")}. These are best practices that make your code production-ready. You don't have to match the solution exactly, but these elements teach important patterns.`,
      fixHint: "Click 'View Solution' to see the complete reference, then add the missing elements.",
    });
  } else if (solutionHasTags && hasTagsBlock) {
    checks.push({
      id: "missing-elements",
      category: "completeness",
      severity: "passed",
      title: "All solution elements present",
      description: "Your code includes all the key elements from the reference solution.",
      eli5: "Your code has all the important parts that the reference solution has. Well done!",
      fixHint: "",
    });
  }

  // --- Calculate score ---
  const passedCount = checks.filter((c) => c.severity === "passed").length;
  const criticalCount = checks.filter((c) => c.severity === "critical").length;
  const warningCount = checks.filter((c) => c.severity === "warning").length;
  const totalCount = checks.length;

  let score = 100;
  score -= criticalCount * 25;
  score -= warningCount * 10;
  score = Math.max(0, score);

  let grade = "D";
  if (score >= 95) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 75) grade = "B";
  else if (score >= 60) grade = "C";

  return {
    score,
    grade,
    passedCount,
    totalCount,
    checks,
    missingFromSolution,
    extraInStudent,
  };
}