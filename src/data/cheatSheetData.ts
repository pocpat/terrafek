import { CheatSheetSection } from "../types/terraform";

export const CHEAT_SHEET_DATA: CheatSheetSection[] = [
  {
    title: "1. Core CLI Commands",
    description: "Everyday commands used in the Terraform lifecycle.",
    items: [
      {
        title: "terraform init",
        syntax: "terraform init [-upgrade]",
        explanation: "Initializes a working directory containing Terraform configuration files. Downloads provider plugins and configures the backend.",
        example: "$ terraform init\n$ terraform init -upgrade"
      },
      {
        title: "terraform plan",
        syntax: "terraform plan [-out=tfplan] [-var 'key=val']",
        explanation: "Creates an execution plan, reading current state and determining actions necessary to reach desired state.",
        example: "$ terraform plan\n$ terraform plan -out=production.tfplan"
      },
      {
        title: "terraform apply",
        syntax: "terraform apply [tfplan] [-auto-approve]",
        explanation: "Executes the actions proposed in a Terraform plan to create, update, or delete infrastructure.",
        example: "$ terraform apply\n$ terraform apply -auto-approve"
      },
      {
        title: "terraform destroy",
        syntax: "terraform destroy [-target=res.name]",
        explanation: "Destroys all managed infrastructure objects recorded in the state file.",
        example: "$ terraform destroy\n$ terraform destroy -target=aws_instance.web"
      },
      {
        title: "terraform fmt & validate",
        syntax: "terraform fmt [-recursive] && terraform validate",
        explanation: "Reformats configuration files to canonical HCL style and verifies syntactic and semantic correctness.",
        example: "$ terraform fmt -check\n$ terraform validate"
      },
      {
        title: "terraform state",
        syntax: "terraform state <list|show|mv|rm>",
        explanation: "Inspects or modifies the state file directly. Essential for troubleshooting and refactoring.",
        example: "$ terraform state list\n$ terraform state show aws_instance.web"
      }
    ]
  },
  {
    title: "2. HCL Syntax & Block Anatomy",
    description: "Structure and grammar of HashiCorp Configuration Language.",
    items: [
      {
        title: "Resource Block",
        syntax: "resource \"<TYPE>\" \"<NAME>\" {\n  <ARGUMENT> = <VALUE>\n}",
        explanation: "Declares a specific infrastructure component (e.g. AWS EC2 instance, GCP bucket, Azure VNet).",
        example: "resource \"aws_s3_bucket\" \"media\" {\n  bucket = \"my-app-assets-2026\"\n}"
      },
      {
        title: "Input Variables",
        syntax: "variable \"<NAME>\" {\n  type        = <TYPE>\n  description = \"...\"\n  default     = <VALUE>\n}",
        explanation: "Parameters that customize module or root execution without modifying code directly.",
        example: "variable \"environment\" {\n  type    = string\n  default = \"production\"\n}"
      },
      {
        title: "Local Values",
        syntax: "locals {\n  <NAME> = <EXPRESSION>\n}",
        explanation: "Temporary computed variables used to keep HCL code DRY (Don't Repeat Yourself).",
        example: "locals {\n  app_prefix = \"${var.org}-${var.env}\"\n}"
      },
      {
        title: "Outputs",
        syntax: "output \"<NAME>\" {\n  value       = <EXPRESSION>\n  sensitive   = true|false\n}",
        explanation: "Exports provisioned attributes to the terminal CLI or root module caller.",
        example: "output \"instance_ip\" {\n  value = aws_instance.web.public_ip\n}"
      }
    ]
  },
  {
    title: "3. Meta-Arguments & Control Flow",
    description: "Special arguments that modify resource behavior and lifecycle.",
    items: [
      {
        title: "depends_on",
        syntax: "depends_on = [aws_s3_bucket.main]",
        explanation: "Forces explicit resource ordering when Terraform cannot infer dependencies automatically.",
        example: "resource \"aws_instance\" \"app\" {\n  depends_on = [aws_iam_role_policy.attach]\n}"
      },
      {
        title: "count",
        syntax: "count = <NUMBER>",
        explanation: "Creates multiple resource instances indexed by count.index (0, 1, 2...).",
        example: "resource \"aws_instance\" \"server\" {\n  count = 3\n  tags  = { Name = \"server-${count.index}\" }\n}"
      },
      {
        title: "for_each",
        syntax: "for_each = <MAP_OR_SET>",
        explanation: "Creates multiple resource instances keyed by string name. Better than count when items can change.",
        example: "resource \"aws_instance\" \"service\" {\n  for_each      = var.services\n  instance_type = each.value\n}"
      },
      {
        title: "lifecycle",
        syntax: "lifecycle {\n  create_before_destroy = true\n  prevent_destroy       = true\n  ignore_changes        = [tags]\n}",
        explanation: "Controls resource creation/destruction behavior and protects production resources from accidental deletion.",
        example: "lifecycle {\n  create_before_destroy = true\n  prevent_destroy       = false\n}"
      }
    ]
  },
  {
    title: "4. Built-in Functions",
    description: "Commonly used transformation functions in HCL.",
    items: [
      {
        title: "lookup() & merge()",
        syntax: "lookup(map, key, default) / merge(map1, map2)",
        explanation: "Retrieves value from a map with fallback, or combines multiple maps into one.",
        example: "lookup(var.ami_map, var.region, \"ami-default\")\nmerge(local.tags, { Name = \"prod\" })"
      },
      {
        title: "cidrsubnet() & cidrhost()",
        syntax: "cidrsubnet(prefix, newbits, netnum)",
        explanation: "Calculates a subnet IP range within a given IP network address prefix.",
        example: "cidrsubnet(\"10.0.0.0/16\", 8, 1) # returns 10.0.1.0/24"
      },
      {
        title: "file() & templatefile()",
        syntax: "file(path) / templatefile(path, vars)",
        explanation: "Reads file content or renders an external template with variable substitutions (e.g. bash userdata script).",
        example: "user_data = file(\"install.sh\")"
      }
    ]
  }
];
