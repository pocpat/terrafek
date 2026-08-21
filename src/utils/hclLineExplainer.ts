export interface LineExplanation {
  lineNum: number;
  rawText: string;
  formal: string;
  eli5: string;
  kind: "resource" | "provider" | "variable" | "output" | "attribute" | "reference" | "meta" | "comment" | "bracket";
  metaDetail?: string;
}

export function explainHclLine(rawLine: string, lineNum: number, surroundingCode?: string[]): LineExplanation {
  const line = rawLine.trim();

  // Comments
  if (line.startsWith("#") || line.startsWith("//")) {
    return {
      lineNum,
      rawText: rawLine,
      kind: "comment",
      formal: "A human-readable code comment ignored by the Terraform HCL parser during compilation.",
      eli5: "A sticky note written for humans to read. The computer skips it completely."
    };
  }

  // Brackets
  if (line === "}" || line === "]" || line === "{") {
    return {
      lineNum,
      rawText: rawLine,
      kind: "bracket",
      formal: "Structural block delimiter defining the start or termination boundary of an HCL body.",
      eli5: "Closing or opening a box container that wraps the settings together."
    };
  }

  // Resource declaration: resource "type" "name" {
  const resourceMatch = line.match(/^resource\s+"([^"]+)"\s+"([^"]+)"\s*\{?/);
  if (resourceMatch) {
    const [, rType, rName] = resourceMatch;
    return {
      lineNum,
      rawText: rawLine,
      kind: "resource",
      metaDetail: `${rType}.${rName}`,
      formal: `Declares a managed cloud infrastructure resource of type '${rType}' assigned the logical address identifier '${rName}'.`,
      eli5: `Hey Terraform! I want a new '${rType}' in the cloud, and inside our project let's call it '${rName}'.`
    };
  }

  // Data source: data "type" "name" {
  const dataMatch = line.match(/^data\s+"([^"]+)"\s+"([^"]+)"\s*\{?/);
  if (dataMatch) {
    const [, dType, dName] = dataMatch;
    return {
      lineNum,
      rawText: rawLine,
      kind: "resource",
      metaDetail: `data.${dType}.${dName}`,
      formal: `Queries an existing read-only external cloud resource of type '${dType}' identified locally as '${dName}' without creating it.`,
      eli5: `Look up something that already exists in the cloud so we can read its info, like looking up someone's phone number in a directory.`
    };
  }

  // Provider declaration: provider "aws" {
  const providerMatch = line.match(/^provider\s+"([^"]+)"\s*\{?/);
  if (providerMatch) {
    const [, pName] = providerMatch;
    return {
      lineNum,
      rawText: rawLine,
      kind: "provider",
      metaDetail: pName,
      formal: `Configures authentication, region, and target endpoints for the '${pName}' provider plugin.`,
      eli5: `Tells Terraform which cloud provider's office to call (like Amazon AWS or Google Cloud) and which account keys to use.`
    };
  }

  // Variable declaration: variable "name" {
  const varMatch = line.match(/^variable\s+"([^"]+)"\s*\{?/);
  if (varMatch) {
    const [, vName] = varMatch;
    return {
      lineNum,
      rawText: rawLine,
      kind: "variable",
      metaDetail: vName,
      formal: `Defines an input variable named '${vName}' to allow dynamic parameterization without hardcoding values.`,
      eli5: `A fill-in-the-blank question for the user (like asking: 'What size computer do you want today?').`
    };
  }

  // Output declaration: output "name" {
  const outputMatch = line.match(/^output\s+"([^"]+)"\s*\{?/);
  if (outputMatch) {
    const [, oName] = outputMatch;
    return {
      lineNum,
      rawText: rawLine,
      kind: "output",
      metaDetail: oName,
      formal: `Exports a computed value named '${oName}' to the CLI stdout and parent calling modules upon completion.`,
      eli5: `A receipt printer: once the cloud computer is built, it prints the IP address or web link onto your screen.`
    };
  }

  // Key-value attributes
  const attrMatch = line.match(/^([a-zA-Z0-9_\-]+)\s*=\s*(.+)$/);
  if (attrMatch) {
    const [, key, val] = attrMatch;

    // References like aws_vpc.main.id
    if (val.includes(".") && !val.startsWith('"')) {
      return {
        lineNum,
        rawText: rawLine,
        kind: "reference",
        metaDetail: `${key} -> ${val}`,
        formal: `Implicit dependency assignment: sets attribute '${key}' to dynamically resolve from the runtime computed value of '${val}'.`,
        eli5: `Connecting two puzzle pieces: plug the ID from '${val}' directly into '${key}' so Terraform automatically builds them in the right order.`
      };
    }

    if (key === "ami") {
      return {
        lineNum,
        rawText: rawLine,
        kind: "attribute",
        formal: `Specifies the Amazon Machine Image (AMI) template OS image (${val}) to boot the instance with.`,
        eli5: `The operating system installation disc (like choosing Ubuntu Linux or Windows) for your new virtual computer.`
      };
    }

    if (key === "instance_type") {
      return {
        lineNum,
        rawText: rawLine,
        kind: "attribute",
        formal: `Hardware sizing profile: allocates computational vCPUs and RAM capacity (${val}).`,
        eli5: `The physical size of the computer—how many brain cores and gigabytes of memory it gets.`
      };
    }

    if (key === "cidr_block") {
      return {
        lineNum,
        rawText: rawLine,
        kind: "attribute",
        formal: `Defines the private IPv4 network IP address range allocation using CIDR notation (${val}).`,
        eli5: `The street address and mailbox range assigned to your private digital neighborhood.`
      };
    }

    if (key === "region") {
      return {
        lineNum,
        rawText: rawLine,
        kind: "attribute",
        formal: `Geographic datacenter target where the provider API calls will physically provision infrastructure (${val}).`,
        eli5: `The physical city where the datacenter buildings are located (like Virginia, Oregon, or Frankfurt).`
      };
    }

    if (key === "count" || key === "for_each") {
      return {
        lineNum,
        rawText: rawLine,
        kind: "meta",
        formal: `Meta-argument '${key}': dynamically loops and provisions multiple discrete instances of the enclosing resource block.`,
        eli5: `A copy machine button: 'Make ${val} copies of this computer server automatically.'`
      };
    }

    if (key === "depends_on") {
      return {
        lineNum,
        rawText: rawLine,
        kind: "meta",
        formal: `Explicit dependency declaration: forces Terraform's DAG scheduler to wait until '${val}' completes before attempting this resource.`,
        eli5: `A 'WAIT!' sign: telling Terraform 'Do not start building this until ${val} is 100% finished first.'`
      };
    }

    return {
      lineNum,
      rawText: rawLine,
      kind: "attribute",
      formal: `Sets the configuration property '${key}' to value ${val.replace(/;/g, '')}.`,
      eli5: `Configuring the setting '${key}' to be equal to ${val}.`
    };
  }

  // Fallback
  return {
    lineNum,
    rawText: rawLine,
    kind: "attribute",
    formal: `HCL configuration statement: ${line}`,
    eli5: `A line of instructions telling Terraform how to set up this specific part.`
  };
}
