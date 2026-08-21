import { ParsedResource, ParsedVariable, ParsedOutput, ParsedLocal, ParsedModule, CloudProvider } from "../types/terraform";

export function getResourceCategory(type: string): "storage" | "compute" | "network" | "database" | "security" | "iam" | "generic" {
  if (type.includes("s3") || type.includes("bucket") || type.includes("storage") || type.includes("disk") || type.includes("volume")) {
    return "storage";
  }
  if (type.includes("instance") || type.includes("ec2") || type.includes("compute") || type.includes("autoscaling") || type.includes("lambda") || type.includes("ecs")) {
    return "compute";
  }
  if (type.includes("vpc") || type.includes("subnet") || type.includes("gateway") || type.includes("route") || type.includes("lb") || type.includes("alb") || type.includes("elb") || type.includes("network") || type.includes("ip") || type.includes("nat")) {
    return "network";
  }
  if (type.includes("db") || type.includes("rds") || type.includes("dynamo") || type.includes("sql") || type.includes("aurora") || type.includes("redis")) {
    return "database";
  }
  if (type.includes("security_group") || type.includes("firewall") || type.includes("acl") || type.includes("waf") || type.includes("shield")) {
    return "security";
  }
  if (type.includes("iam") || type.includes("role") || type.includes("policy") || type.includes("user") || type.includes("access")) {
    return "iam";
  }
  return "generic";
}

export function detectProvider(type: string): CloudProvider {
  if (type.startsWith("google") || type.startsWith("gcp")) return "google";
  if (type.startsWith("azurerm") || type.startsWith("azure")) return "azurerm";
  return "aws";
}

// Clean HCL string comments and parse blocks
export function parseHclCode(codeMap: Record<string, string>): {
  resources: ParsedResource[];
  variables: ParsedVariable[];
  outputs: ParsedOutput[];
  locals: ParsedLocal[];
  modules: ParsedModule[];
  providers: Record<string, any>;
  errors: string[];
} {
  const combinedHcl = Object.entries(codeMap)
    .map(([file, content]) => `// --- File: ${file} ---\n${content}`)
    .join("\n\n");

  const resources: ParsedResource[] = [];
  const variables: ParsedVariable[] = [];
  const outputs: ParsedOutput[] = [];
  const locals: ParsedLocal[] = [];
  const modules: ParsedModule[] = [];
  const providers: Record<string, any> = {};
  const errors: string[] = [];

  try {
    // 1. Parse Resource Blocks: resource "type" "name" { ... }
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    let match: RegExpExecArray | null;

    while ((match = resourceRegex.exec(combinedHcl)) !== null) {
      const type = match[1].trim();
      const name = match[2].trim();
      const body = match[3];
      const id = `${type}.${name}`;

      const attributes: Record<string, any> = {};
      const dependsOn: string[] = [];

      // Extract simple key = value pairs
      const attrRegex = /^\s*([a-zA-Z0-9_-]+)\s*=\s*(.+)$/gm;
      let attrMatch: RegExpExecArray | null;

      while ((attrMatch = attrRegex.exec(body)) !== null) {
        const key = attrMatch[1].trim();
        let valRaw = attrMatch[2].trim().replace(/,$/, "");

        // clean inline comments
        if (valRaw.includes("//")) {
          valRaw = valRaw.split("//")[0].trim();
        } else if (valRaw.includes("#")) {
          valRaw = valRaw.split("#")[0].trim();
        }

        // Clean quotes
        if (valRaw.startsWith('"') && valRaw.endsWith('"')) {
          attributes[key] = valRaw.slice(1, -1);
        } else if (valRaw === "true") {
          attributes[key] = true;
        } else if (valRaw === "false") {
          attributes[key] = false;
        } else if (!isNaN(Number(valRaw)) && valRaw !== "") {
          attributes[key] = Number(valRaw);
        } else {
          attributes[key] = valRaw;
        }

        // Check if value references other resources
        const refMatch = valRaw.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g);
        if (refMatch) {
          refMatch.forEach((ref) => {
            const parts = ref.split(".");
            if (parts.length >= 2 && !ref.startsWith("var.") && !ref.startsWith("local.") && !ref.startsWith("module.")) {
              const targetResId = `${parts[0]}.${parts[1]}`;
              if (targetResId !== id && !dependsOn.includes(targetResId)) {
                dependsOn.push(targetResId);
              }
            }
          });
        }
      }

      // Check explicit depends_on = [ ... ]
      const dependsOnMatch = body.match(/depends_on\s*=\s*\[([\s\S]*?)\]/);
      if (dependsOnMatch) {
        const listItems = dependsOnMatch[1].split(",").map((s) => s.trim().replace(/["']/g, ""));
        listItems.forEach((item) => {
          if (item && !dependsOn.includes(item)) {
            dependsOn.push(item);
          }
        });
      }

      // Detect parent (e.g. subnet in VPC)
      let parentResource: string | undefined = undefined;
      if (attributes.vpc_id) {
        const vpcRef = String(attributes.vpc_id).match(/aws_vpc\.([a-zA-Z0-9_]+)/);
        if (vpcRef) {
          parentResource = `aws_vpc.${vpcRef[1]}`;
        }
      }

      resources.push({
        id,
        type,
        name,
        provider: detectProvider(type),
        category: getResourceCategory(type),
        attributes,
        dependsOn,
        status: "planned_add",
        parentResource,
      });
    }

    // 2. Parse Variable Blocks: variable "name" { ... }
    const variableRegex = /variable\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    while ((match = variableRegex.exec(combinedHcl)) !== null) {
      const varName = match[1].trim();
      const body = match[2];
      const parsedVar: ParsedVariable = { name: varName };

      const typeMatch = body.match(/type\s*=\s*([^\n]+)/);
      if (typeMatch) parsedVar.type = typeMatch[1].trim();

      const defaultMatch = body.match(/default\s*=\s*([^\n]+)/);
      if (defaultMatch) {
        let defVal = defaultMatch[1].trim().replace(/,$/, "");
        if (defVal.startsWith('"') && defVal.endsWith('"')) defVal = defVal.slice(1, -1);
        parsedVar.default = defVal;
        parsedVar.value = defVal;
      }

      const descMatch = body.match(/description\s*=\s*"([^"]+)"/);
      if (descMatch) parsedVar.description = descMatch[1];

      variables.push(parsedVar);
    }

    // 3. Parse Output Blocks: output "name" { ... }
    const outputRegex = /output\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    while ((match = outputRegex.exec(combinedHcl)) !== null) {
      const outName = match[1].trim();
      const body = match[2];
      const parsedOut: ParsedOutput = { name: outName, value: "" };

      const valMatch = body.match(/value\s*=\s*([^\n]+)/);
      if (valMatch) {
        let v = valMatch[1].trim().replace(/,$/, "");
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        parsedOut.value = v;
      }

      if (body.includes("sensitive = true") || body.includes("sensitive=true")) {
        parsedOut.sensitive = true;
      }

      const descMatch = body.match(/description\s*=\s*"([^"]+)"/);
      if (descMatch) parsedOut.description = descMatch[1];

      outputs.push(parsedOut);
    }

    // 4. Parse Locals Block: locals { ... }
    const localsRegex = /locals\s*\{([\s\S]*?)\n\}/g;
    while ((match = localsRegex.exec(combinedHcl)) !== null) {
      const body = match[1];
      const lines = body.split("\n");
      lines.forEach((line) => {
        const pair = line.match(/^\s*([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
        if (pair) {
          const lKey = pair[1].trim();
          let lVal = pair[2].trim().replace(/,$/, "");
          if (lVal.startsWith('"') && lVal.endsWith('"')) lVal = lVal.slice(1, -1);
          locals.push({ name: lKey, value: lVal });
        }
      });
    }

    // 5. Parse Module Blocks: module "name" { ... }
    const moduleRegex = /module\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    while ((match = moduleRegex.exec(combinedHcl)) !== null) {
      const modName = match[1].trim();
      const body = match[2];
      let source = "./modules";
      const sourceMatch = body.match(/source\s*=\s*"([^"]+)"/);
      if (sourceMatch) source = sourceMatch[1];

      const inputs: Record<string, any> = {};
      const attrRegex = /^\s*([a-zA-Z0-9_-]+)\s*=\s*(.+)$/gm;
      let mAttr: RegExpExecArray | null;
      while ((mAttr = attrRegex.exec(body)) !== null) {
        if (mAttr[1] !== "source") {
          inputs[mAttr[1].trim()] = mAttr[2].trim().replace(/["',]/g, "");
        }
      }

      modules.push({ name: modName, source, inputs });
    }

    // 6. Parse Providers: provider "aws" { ... }
    const providerRegex = /provider\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    while ((match = providerRegex.exec(combinedHcl)) !== null) {
      const provName = match[1].trim();
      const body = match[2];
      const pAttrs: Record<string, any> = {};
      const attrRegex = /^\s*([a-zA-Z0-9_-]+)\s*=\s*(.+)$/gm;
      let pAttr: RegExpExecArray | null;
      while ((pAttr = attrRegex.exec(body)) !== null) {
        pAttrs[pAttr[1].trim()] = pAttr[2].trim().replace(/["',]/g, "");
      }
      providers[provName] = pAttrs;
    }
  } catch (err: any) {
    errors.push(`Parse error: ${err.message}`);
  }

  return { resources, variables, outputs, locals, modules, providers, errors };
}
