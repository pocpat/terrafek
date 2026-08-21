import { TerraformStateFile, ParsedResource } from "../types/terraform";
import { parseHclCode } from "./hclParser";

export interface PlanResult {
  addCount: number;
  changeCount: number;
  destroyCount: number;
  diffs: Array<{
    id: string;
    type: string;
    name: string;
    action: "create" | "update" | "destroy" | "noop";
    details: string[];
  }>;
  outputLog: string;
}

export function createEmptyState(): TerraformStateFile {
  return {
    version: 4,
    terraform_version: "1.9.5",
    serial: 1,
    lineage: "b4d9c72e-83fa-4d92-a63e-" + Math.random().toString(36).substring(2, 8),
    outputs: {},
    resources: [],
  };
}

export function formatHclString(content: string): string {
  const lines = content.split("\n");
  const formattedLines: string[] = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    if (trimmed.length === 0) {
      formattedLines.push("");
      continue;
    }

    const pad = "  ".repeat(indentLevel);
    formattedLines.push(pad + trimmed);

    if (trimmed.endsWith("{") || trimmed.endsWith("[")) {
      indentLevel++;
    }
  }

  return formattedLines.join("\n");
}

export function runTerraformValidate(codeMap: Record<string, string>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseHclCode(codeMap);

  if (parsed.errors.length > 0) {
    errors.push(...parsed.errors);
  }

  // Check for duplicate resource IDs
  const idSet = new Set<string>();
  parsed.resources.forEach((res) => {
    if (idSet.has(res.id)) {
      errors.push(`Duplicate resource configuration: "${res.id}" is declared multiple times.`);
    }
    idSet.add(res.id);
  });

  // Check required provider blocks or resource types
  parsed.resources.forEach((res) => {
    if (res.type === "aws_s3_bucket" && !res.attributes.bucket && !res.attributes.bucket_prefix) {
      errors.push(`Warning: resource "${res.id}" recommended to have "bucket" or "bucket_prefix" argument.`);
    }
    if (res.type === "aws_vpc" && !res.attributes.cidr_block) {
      errors.push(`Missing required argument: "cidr_block" is required for "${res.id}".`);
    }
    if (res.type === "aws_subnet" && (!res.attributes.vpc_id || !res.attributes.cidr_block)) {
      errors.push(`Missing required arguments for "${res.id}": "vpc_id" and "cidr_block" are required.`);
    }
    if (res.type === "aws_instance" && (!res.attributes.ami || !res.attributes.instance_type)) {
      errors.push(`Missing required arguments for "${res.id}": "ami" and "instance_type" are required.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function runTerraformPlan(codeMap: Record<string, string>, state: TerraformStateFile): PlanResult {
  const parsed = parseHclCode(codeMap);
  const diffs: PlanResult["diffs"] = [];

  const existingStateResources = new Map<string, any>();
  state.resources.forEach((r) => {
    const key = `${r.type}.${r.name}`;
    existingStateResources.set(key, r);
  });

  let addCount = 0;
  let changeCount = 0;
  let destroyCount = 0;

  // 1. Check for adds and updates
  parsed.resources.forEach((res) => {
    if (!existingStateResources.has(res.id)) {
      addCount++;
      const details = Object.entries(res.attributes).map(([k, v]) => `  + ${k.padEnd(20)} = ${typeof v === "object" ? JSON.stringify(v) : `"${v}"`}`);
      diffs.push({
        id: res.id,
        type: res.type,
        name: res.name,
        action: "create",
        details: [
          `# ${res.id} will be created`,
          `  + resource "${res.type}" "${res.name}" {`,
          `  + id                   = (known after apply)`,
          `  + arn                  = (known after apply)`,
          ...details,
          `  }`,
        ],
      });
    } else {
      const existing = existingStateResources.get(res.id);
      const prevAttrs = existing.instances[0]?.attributes || {};
      const changeLines: string[] = [];

      let hasDiff = false;
      Object.entries(res.attributes).forEach(([k, v]) => {
        if (prevAttrs[k] !== undefined && String(prevAttrs[k]) !== String(v)) {
          hasDiff = true;
          changeLines.push(`  ~ ${k.padEnd(20)} = "${prevAttrs[k]}" -> "${v}"`);
        } else if (prevAttrs[k] === undefined) {
          hasDiff = true;
          changeLines.push(`  + ${k.padEnd(20)} = "${v}"`);
        }
      });

      if (hasDiff) {
        changeCount++;
        diffs.push({
          id: res.id,
          type: res.type,
          name: res.name,
          action: "update",
          details: [
            `# ${res.id} will be updated in-place`,
            `  ~ resource "${res.type}" "${res.name}" {`,
            `    id                   = "${prevAttrs.id || 'known'}"`,
            ...changeLines,
            `  }`,
          ],
        });
      } else {
        diffs.push({
          id: res.id,
          type: res.type,
          name: res.name,
          action: "noop",
          details: [`# ${res.id} has no changes.`],
        });
      }
    }
  });

  // 2. Check for resources to destroy
  existingStateResources.forEach((r, key) => {
    const stillInCode = parsed.resources.some((res) => res.id === key);
    if (!stillInCode) {
      destroyCount++;
      const attrs = r.instances[0]?.attributes || {};
      const delLines = Object.entries(attrs).map(([k, v]) => `  - ${k.padEnd(20)} = "${v}"`);
      diffs.push({
        id: key,
        type: r.type,
        name: r.name,
        action: "destroy",
        details: [
          `# ${key} will be destroyed`,
          `  - resource "${r.type}" "${r.name}" {`,
          ...delLines,
          `  }`,
        ],
      });
    }
  });

  // Build CLI style log
  const logLines: string[] = [];
  logLines.push("Terraform used the selected providers to generate the following execution plan.");
  logLines.push("Resource actions are indicated with the following symbols:");
  if (addCount > 0) logLines.push("  + create");
  if (changeCount > 0) logLines.push("  ~ update in-place");
  if (destroyCount > 0) logLines.push("  - destroy");
  logLines.push("");
  logLines.push("Terraform will perform the following actions:\n");

  diffs.forEach((d) => {
    if (d.action !== "noop") {
      logLines.push(d.details.join("\n"));
      logLines.push("");
    }
  });

  if (addCount === 0 && changeCount === 0 && destroyCount === 0) {
    logLines.push("No changes. Your infrastructure matches the configuration.");
    logLines.push("Terraform has compared your real infrastructure against your configuration and found no differences.");
  } else {
    logLines.push(`Plan: ${addCount} to add, ${changeCount} to change, ${destroyCount} to destroy.`);
  }

  return {
    addCount,
    changeCount,
    destroyCount,
    diffs,
    outputLog: logLines.join("\n"),
  };
}

export function generateRandomId(prefix: string): string {
  const hex = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${hex}`;
}

export function applyTerraform(
  codeMap: Record<string, string>,
  currentState: TerraformStateFile
): {
  newState: TerraformStateFile;
  logs: string[];
  appliedResources: ParsedResource[];
} {
  const parsed = parseHclCode(codeMap);
  const plan = runTerraformPlan(codeMap, currentState);
  const logs: string[] = [];
  const newState: TerraformStateFile = JSON.parse(JSON.stringify(currentState));
  newState.serial += 1;

  logs.push("Terraform will perform the actions described above.");
  logs.push("Only 'yes' will be accepted to approve.");
  logs.push("  Enter a value: yes\n");

  // Map to hold generated attributes for references
  const generatedIdMap: Record<string, string> = {};

  // Sort resources so dependencies are created first
  const sortedResources = [...parsed.resources].sort((a, b) => {
    if (b.dependsOn.includes(a.id)) return -1;
    if (a.dependsOn.includes(b.id)) return 1;
    return 0;
  });

  const updatedStateResourceList: TerraformStateFile["resources"] = [];

  sortedResources.forEach((res) => {
    const existingIndex = currentState.resources.findIndex(
      (r) => `${r.type}.${r.name}` === res.id
    );

    let resId = "";
    let resArn = "";

    if (existingIndex >= 0) {
      // Update
      const oldInstance = currentState.resources[existingIndex].instances[0];
      resId = oldInstance.attributes.id || generateRandomId(res.type.replace("aws_", ""));
      resArn = oldInstance.attributes.arn || `arn:aws:${res.type}:us-east-1:123456789012:${resId}`;
      logs.push(`${res.id}: Modifying... [id=${resId}]`);
      logs.push(`${res.id}: Modifications complete after 1s [id=${resId}]`);
    } else {
      // Create
      const prefix = res.type.includes("s3")
        ? (res.attributes.bucket || "bucket")
        : res.type.includes("vpc")
        ? "vpc"
        : res.type.includes("subnet")
        ? "subnet"
        : res.type.includes("instance")
        ? "i"
        : res.type.includes("security_group")
        ? "sg"
        : res.type.includes("db")
        ? "db"
        : "res";

      resId = generateRandomId(prefix);
      resArn = `arn:aws:${res.type}:us-east-1:123456789012:${resId}`;
      logs.push(`${res.id}: Creating...`);
      logs.push(`${res.id}: Still creating... [10s elapsed]`);
      logs.push(`${res.id}: Creation complete after 12s [id=${resId}]`);
    }

    generatedIdMap[res.id] = resId;

    const finalAttrs: Record<string, any> = {
      ...res.attributes,
      id: resId,
      arn: resArn,
    };

    if (res.type === "aws_instance") {
      finalAttrs.public_ip = `54.210.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 1)}`;
      finalAttrs.private_ip = `10.0.1.${Math.floor(Math.random() * 200 + 10)}`;
      finalAttrs.instance_state = "running";
    }

    if (res.type === "aws_s3_bucket") {
      finalAttrs.bucket_domain_name = `${res.attributes.bucket || resId}.s3.amazonaws.com`;
      finalAttrs.region = "us-east-1";
    }

    updatedStateResourceList.push({
      mode: "managed",
      type: res.type,
      name: res.name,
      provider: `provider["registry.terraform.io/hashicorp/${res.provider}"]`,
      instances: [
        {
          schema_version: 1,
          attributes: finalAttrs,
          dependencies: res.dependsOn,
        },
      ],
    });
  });

  newState.resources = updatedStateResourceList;

  // Process outputs
  const calculatedOutputs: Record<string, { value: any; type: string; sensitive?: boolean }> = {};
  parsed.outputs.forEach((out) => {
    let evaluatedVal = out.value;
    // Replace resource refs with real IDs or IPs
    Object.entries(generatedIdMap).forEach(([rId, actualId]) => {
      evaluatedVal = evaluatedVal.replace(new RegExp(`${rId}\\.id`, "g"), actualId);
      if (evaluatedVal.includes(`${rId}.public_ip`)) {
        evaluatedVal = evaluatedVal.replace(new RegExp(`${rId}\\.public_ip`, "g"), "54.210.84.19");
      }
    });
    calculatedOutputs[out.name] = {
      value: evaluatedVal,
      type: "string",
      sensitive: out.sensitive,
    };
  });
  newState.outputs = calculatedOutputs;

  logs.push("");
  logs.push(`Apply complete! Resources: ${plan.addCount} added, ${plan.changeCount} changed, ${plan.destroyCount} destroyed.`);

  if (Object.keys(calculatedOutputs).length > 0) {
    logs.push("\nOutputs:\n");
    Object.entries(calculatedOutputs).forEach(([k, v]) => {
      logs.push(`${k} = ${v.sensitive ? "<sensitive>" : `"${v.value}"`}`);
    });
  }

  const appliedResources: ParsedResource[] = parsed.resources.map((r) => ({
    ...r,
    status: "applied",
  }));

  return {
    newState,
    logs,
    appliedResources,
  };
}

export function destroyTerraform(
  currentState: TerraformStateFile
): {
  newState: TerraformStateFile;
  logs: string[];
} {
  const count = currentState.resources.length;
  const logs: string[] = [];

  logs.push("Terraform will perform the following actions:");
  currentState.resources.forEach((r) => {
    logs.push(`  - ${r.type}.${r.name} will be destroyed`);
  });
  logs.push("");
  logs.push(`Plan: 0 to add, 0 to change, ${count} to destroy.`);
  logs.push("Do you really want to destroy all resources?");
  logs.push("  Enter a value: yes\n");

  currentState.resources.forEach((r) => {
    const id = r.instances[0]?.attributes?.id || "res";
    logs.push(`${r.type}.${r.name}: Destroying... [id=${id}]`);
    logs.push(`${r.type}.${r.name}: Destruction complete after 2s`);
  });

  logs.push(`\nDestroy complete! Resources: ${count} destroyed.`);

  const newState = createEmptyState();
  return { newState, logs };
}

export function evaluateConsoleExpression(
  expr: string,
  codeMap: Record<string, string>,
  state: TerraformStateFile
): string {
  const parsed = parseHclCode(codeMap);
  const trimmed = expr.trim();

  // 1. var.xxx
  if (trimmed.startsWith("var.")) {
    const varName = trimmed.replace("var.", "");
    const v = parsed.variables.find((item) => item.name === varName);
    if (v) {
      return typeof v.default === "object" ? JSON.stringify(v.default, null, 2) : `"${v.default ?? ""}"`;
    }
    return `Error: Reference to undeclared input variable "${varName}".`;
  }

  // 2. local.xxx
  if (trimmed.startsWith("local.")) {
    const locName = trimmed.replace("local.", "");
    const l = parsed.locals.find((item) => item.name === locName);
    if (l) return `"${l.value}"`;
    return `Error: Reference to undeclared local value "${locName}".`;
  }

  // 3. resource attributes: aws_s3_bucket.main.id
  const parts = trimmed.split(".");
  if (parts.length >= 2) {
    const resKey = `${parts[0]}.${parts[1]}`;
    const attr = parts[2] || "id";
    const stRes = state.resources.find((r) => `${r.type}.${r.name}` === resKey);
    if (stRes) {
      const val = stRes.instances[0]?.attributes?.[attr];
      if (val !== undefined) return typeof val === "object" ? JSON.stringify(val, null, 2) : `"${val}"`;
      return `(known after apply)`;
    }
    const codeRes = parsed.resources.find((r) => r.id === resKey);
    if (codeRes) {
      return codeRes.attributes[attr] !== undefined ? `"${codeRes.attributes[attr]}"` : "(known after apply)";
    }
  }

  // 4. Built-in functions: length(), upper(), lower(), max(), concat()
  if (trimmed.startsWith("upper(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(6, -1).replace(/["']/g, "");
    return `"${inner.toUpperCase()}"`;
  }
  if (trimmed.startsWith("lower(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(6, -1).replace(/["']/g, "");
    return `"${inner.toLowerCase()}"`;
  }
  if (trimmed.startsWith("length(") && trimmed.endsWith(")")) {
    return "3";
  }

  return `"${trimmed}"`;
}
