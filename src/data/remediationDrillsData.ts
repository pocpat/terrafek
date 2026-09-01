import { RemediationDrill } from "../types/terraform";

export const REMEDIATION_DRILLS_DATA: RemediationDrill[] = [
  {
    id: "drill-syntax-braces",
    domain: "syntax_anatomy",
    title: "Fixing Unclosed Blocks & Invalid HCL Syntax",
    subtitle: "Master block closure, quote matching, and assignment operator rules in HCL",
    estimatedMinutes: 4,
    difficulty: "Beginner",
    diagnosticReason: "Triggered by frequent syntax parsing errors or unclosed curly braces in configuration files.",
    learningConcept: "Every block in HCL (resource, variable, provider) must have balanced opening '{' and closing '}' braces, and string literals must always use double quotes.",
    commonMistakeExplanation:
      "A missing closing brace '}' at the end of a block causes Terraform's parser to fail completely on line 1 of execution. Similarly, using single quotes (') instead of double quotes (\") is an invalid HCL syntax error.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE: Missing closing brace and single quote
resource "aws_s3_bucket" "demo" {
  bucket = 'bad-quotes-bucket'
  tags = {
    Environment = "Dev"
  # Missing '}' for tags and '}' for resource!`,
    fixedSnippet: `# ✅ FIXED CODE:
resource "aws_s3_bucket" "demo" {
  bucket = "valid-quotes-bucket"
  tags = {
    Environment = "Dev"
  }
}`,
    ruleBulletPoints: [
      "HCL only permits double quotes (\") for string literals. Single quotes (') are illegal.",
      "Ensure every nested map or block (like tags = { ... }) has its own matching closing brace '}'.",
      "Run 'terraform fmt' to automatically format and detect indentation/structure issues."
    ],
    practiceTask: "Fix the syntax errors in main.tf: replace single quotes with double quotes and add the missing closing braces.",
    commandToTest: "terraform validate",
    starterFiles: {
      "main.tf": `# Remediation Drill: Fix Syntax & Quotes
# Task: Fix the broken syntax below so 'terraform validate' passes.

provider "aws" {
  region = 'us-east-1' # Error: single quotes

resource "aws_s3_bucket" "remediation_bucket" {
  bucket = 'my-remediation-bucket'
  tags = {
    Environment = 'Staging'
  # Missing closing brace for tags and resource!
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "remediation_bucket" {
  bucket = "my-remediation-bucket"
  tags = {
    Environment = "Staging"
  }
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      // Strip comment lines before checking for single quotes,
      // because comments may legitimately contain single quotes
      // (e.g. "# Task: ... 'terraform validate' passes.")
      const codeLinesOnly = main
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return !trimmed.startsWith("#") && !trimmed.startsWith("//") && !trimmed.startsWith("/*");
        })
        .join("\n");
      // Count braces to ensure all blocks are properly closed
      const openBraces = (codeLinesOnly.match(/{/g) || []).length;
      const closeBraces = (codeLinesOnly.match(/}/g) || []).length;
      return (
        !codeLinesOnly.includes("'") &&
        openBraces === closeBraces &&
        main.includes('region = "us-east-1"') &&
        main.includes('resource "aws_s3_bucket" "remediation_bucket"') &&
        main.includes('bucket = "my-remediation-bucket"')
      );
    }
  },
  {
    id: "drill-var-interpolation",
    domain: "variables_types",
    title: "Resolving Variable Interpolation & Type Constraints",
    subtitle: "Learn modern bare variable syntax and avoid deprecated string wrapper anti-patterns",
    estimatedMinutes: 5,
    difficulty: "Beginner",
    diagnosticReason: "Triggered by using legacy \"${var.name}\" wrappers or type mismatch assignments.",
    learningConcept: "Since Terraform 0.12+, variables are referenced directly as 'var.variable_name' without interpolation quotes \"${...}\" unless embedded inside a longer string literal.",
    commonMistakeExplanation:
      "Wrapping boolean or number variables in quotes like port = \"8080\" or enabled = \"true\" turns them into strings, which can fail provider validation schemas.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE:
variable "app_port" {
  type = number
  default = 80
}

resource "aws_security_group" "web" {
  # Anti-pattern: wrapping bare variable in quotes
  from_port = "\${var.app_port}" 
}`,
    fixedSnippet: `# ✅ FIXED CODE:
variable "app_port" {
  type = number
  default = 80
}

resource "aws_security_group" "web" {
  # Direct bare reference preserves native number type
  from_port = var.app_port
}`,
    ruleBulletPoints: [
      "Use 'var.variable_name' directly for expressions, numbers, booleans, and lists.",
      "Only use \"prefix-\${var.name}\" when concatenating strings.",
      "Declare explicit types (string, number, bool, list(string), map(string)) for all input variables."
    ],
    practiceTask: "Refactor variables.tf and main.tf to use proper modern variable references and correct numeric types.",
    commandToTest: "terraform plan",
    starterFiles: {
      "variables.tf": `variable "environment" {
  type    = string
  default = "production"
}

variable "instance_count" {
  type    = number
  default = 3
}
`,
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# Task: Update to modern variable references (e.g. var.environment)
resource "aws_s3_bucket" "app_data" {
  bucket = "\${var.environment}-app-bucket-data"

  tags = {
    Env = "\${var.environment}" # Refactor to bare variable
  }
}
`
    },
    solutionFiles: {
      "variables.tf": `variable "environment" {
  type    = string
  default = "production"
}

variable "instance_count" {
  type    = number
  default = 3
}
`,
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "app_data" {
  bucket = "\${var.environment}-app-bucket-data"

  tags = {
    Env = var.environment
  }
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      return main.includes("Env = var.environment") || main.includes('Env         = var.environment');
    }
  },
  {
    id: "drill-resource-references",
    domain: "resource_dependencies",
    title: "Fixing Resource Cross-References & DAG Cycles",
    subtitle: "Reference exported attributes between VPCs, Subnets, and Security Groups correctly",
    estimatedMinutes: 6,
    difficulty: "Intermediate",
    diagnosticReason: "Triggered by 'Reference to undeclared resource' or cyclic dependency errors.",
    learningConcept: "To connect resources, reference the exported attribute of the upstream resource (e.g., vpc_id = aws_vpc.main.id). This automatically builds an implicit dependency edge in Terraform's DAG.",
    commonMistakeExplanation:
      "Writing hardcoded strings like vpc_id = 'aws_vpc.main.id' passes a literal string instead of the dynamically created cloud ID. Forgetting the resource type (e.g. main.id instead of aws_vpc.main.id) causes an undeclared resource error.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE:
resource "aws_subnet" "public" {
  # Error 1: quotes treat it as string literal
  # Error 2: missing resource type prefix
  vpc_id = "vpc.main.id" 
}`,
    fixedSnippet: `# ✅ FIXED CODE:
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  # Correct attribute reference establishes DAG dependency
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}`,
    ruleBulletPoints: [
      "Format: <RESOURCE_TYPE>.<LOCAL_NAME>.<ATTRIBUTE_NAME>",
      "Never put quotes around resource attribute references (unless concatenating in a string).",
      "Terraform automatically waits for 'aws_vpc.main' to be created before attempting to create 'aws_subnet.public'."
    ],
    practiceTask: "Link the Subnet to the VPC using 'aws_vpc.main.id' so the dependency graph correctly connects them.",
    commandToTest: "terraform plan",
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "primary-vpc"
  }
}

# TODO: Fix the vpc_id reference below
resource "aws_subnet" "public" {
  vpc_id     = "HARDCODED_MISSING_REF" # Fix this!
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "public-subnet"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "primary-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "public-subnet"
  }
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      return main.includes("aws_vpc.main.id") && !main.includes('"aws_vpc.main.id"');
    }
  },
  {
    id: "drill-state-drift",
    domain: "state_lifecycle",
    title: "Reconciling State Drift & Out-of-Band Changes",
    subtitle: "Understand how 'terraform plan' refreshes state against real cloud provider resources",
    estimatedMinutes: 5,
    difficulty: "Intermediate",
    diagnosticReason: "Triggered by state synchronization confusion or unexpected modification diffs during plan/apply.",
    learningConcept: "Terraform state (.tfstate) acts as the single source of truth mapping your code to real cloud IDs. When someone changes a cloud resource manually in the AWS Console (drift), Terraform detects the discrepancy during plan and proposes changes to bring the cloud back in sync with your HCL code.",
    commonMistakeExplanation:
      "Developers often panic when they see 'Plan: 0 to add, 1 to change, 0 to destroy' on unmodified code. This happens because Terraform refreshed state and found that live cloud properties diverged from your declarative code.",
    brokenSnippet: `# Out-of-band drift: Cloud Console changed tag to 'EmergencyPatch'
# Code declares: Environment = 'Production'
# Result: Terraform plan proposes overwriting EmergencyPatch with Production.`,
    fixedSnippet: `# Code should accurately declare the desired state:
resource "aws_s3_bucket" "media" {
  bucket = "media-storage-vault"
  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}`,
    ruleBulletPoints: [
      "Run 'terraform plan' to inspect what Terraform detected during its refresh phase.",
      "'~' symbol in plan output indicates an in-place update.",
      "Never manually edit 'terraform.tfstate' directly in a text editor; use Terraform CLI commands."
    ],
    practiceTask: "Run 'terraform apply' to reconcile the drifted state and align cloud resources with declared HCL configuration.",
    commandToTest: "terraform apply",
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "media" {
  bucket = "company-media-vault"

  tags = {
    Environment = "Production"
    Compliant   = "True"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "media" {
  bucket = "company-media-vault"

  tags = {
    Environment = "Production"
    Compliant   = "True"
  }
}
`
    },
    validationCheck: (_codeMap, state) => {
      return state.resources.some((r) => r.type === "aws_s3_bucket" && r.name === "media");
    }
  },
  {
    id: "drill-module-contract",
    domain: "modules_architecture",
    title: "Calling Modules & Accessing Module Outputs",
    subtitle: "Construct reusable child module contracts with required inputs and exported outputs",
    estimatedMinutes: 6,
    difficulty: "Advanced",
    diagnosticReason: "Triggered by module argument errors or trying to access child resource attributes directly instead of through module outputs.",
    learningConcept: "Child modules are encapsulated black boxes. You cannot reference internal resources like 'module.vpc.aws_subnet.public.id'; you must expose an 'output' block inside the child module and reference 'module.vpc.public_subnet_id' from the parent root module.",
    commonMistakeExplanation:
      "Directly accessing a resource inside a module from the root configuration results in 'Unsupported attribute' error. You must explicitly declare an output in the module's outputs.tf.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE: Root module trying to access internal module resource directly
resource "aws_instance" "app" {
  subnet_id = module.vpc.aws_subnet.public.id # ILLEGAL!
}`,
    fixedSnippet: `# ✅ FIXED CODE:
# 1. Inside modules/vpc/outputs.tf:
output "subnet_id" {
  value = aws_subnet.public.id
}

# 2. Inside root main.tf:
resource "aws_instance" "app" {
  subnet_id = module.vpc.subnet_id # Access through exposed output
}`,
    ruleBulletPoints: [
      "Inputs: Passed to module via 'module \"name\" { input_var = value }'.",
      "Outputs: Accessed via 'module.<MODULE_NAME>.<OUTPUT_NAME>'.",
      "Keep modules cohesive and parameterized so they can be reused across dev, staging, and prod."
    ],
    practiceTask: "Fix the root main.tf to reference 'module.network.vpc_id' rather than an unexposed internal resource.",
    commandToTest: "terraform plan",
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

module "network" {
  source     = "./modules/vpc"
  cidr_block = "10.0.0.0/16"
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web security group"
  # TODO: Fix reference to use module output: module.network.vpc_id
  vpc_id      = "module.network.aws_vpc.main.id"
}
`,
      "modules/vpc/main.tf": `variable "cidr_block" {
  type = string
}

resource "aws_vpc" "main" {
  cidr_block = var.cidr_block
}

output "vpc_id" {
  value = aws_vpc.main.id
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

module "network" {
  source     = "./modules/vpc"
  cidr_block = "10.0.0.0/16"
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web security group"
  vpc_id      = module.network.vpc_id
}
`,
      "modules/vpc/main.tf": `variable "cidr_block" {
  type = string
}

resource "aws_vpc" "main" {
  cidr_block = var.cidr_block
}

output "vpc_id" {
  value = aws_vpc.main.id
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      return main.includes("module.network.vpc_id") && !main.includes('"module.network.vpc_id"');
    }
  },
  {
    id: "drill-tags-blocks",
    domain: "resource_attributes",
    title: "Writing Tags Blocks for AWS Resources",
    subtitle: "Add required resource attributes by building a tags map for an EC2 instance",
    estimatedMinutes: 5,
    difficulty: "Beginner",
    diagnosticReason: "Triggered when a resource is missing a tags block, or when provider validation rejects a configuration because required metadata attributes are absent.",
    learningConcept:
      "The 'tags' argument is a map of key/value pairs that AWS attaches to a resource as metadata. It is not a string — it is an inline object written as tags = { Name = \"...\", Environment = \"...\" }. Many AWS resources support tags, and they are essential for cost allocation, access control (via tag-based IAM policies), and operational filtering across the console and APIs.",
    commonMistakeExplanation:
      "A very common mistake is to omit the tags block entirely, leaving a resource with no metadata. Another mistake is to write tags as a single string (tags = \"web-server\") instead of a map of key/value pairs. The provider rejects a bare string because 'tags' is schema-typed as a map.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE: aws_instance with NO tags block
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}`,
    fixedSnippet: `# ✅ FIXED CODE: tags block added as a map
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}`,
    ruleBulletPoints: [
      "The 'tags' argument is a MAP written as tags = { Key = \"Value\" }. Each key must be on its own line, with the value in double quotes.",
      "Omitting tags is legal for most resources but is a serious operational anti-pattern — without tags you cannot group, filter, or cost-allocate resources in AWS.",
      "Run 'terraform validate' to catch schema errors, then 'terraform plan' to confirm the tags map is accepted by the provider.",
      "Tag keys are case-sensitive: 'Name' and 'name' are different keys. The 'Name' key (capital N) is what the AWS Console displays for the instance's label."
    ],
    practiceTask:
      "Add a tags block to the aws_instance below. Set Name = \"web-server\" and Environment = \"production\". Remember: tags is a map of key/value pairs, not a string.",
    commandToTest: "terraform validate",
    starterFiles: {
      "main.tf": `# Remediation Drill: Writing Tags Blocks
# Task: This aws_instance has NO tags. Add a tags block with:
#   Name        = "web-server"
#   Environment = "production"
#
# Why it matters: Tags are metadata labels that AWS attaches to the resource.
# They enable cost allocation, access control, and console filtering.

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  # TODO: Add your tags block here
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      return (
        main.includes("tags") &&
        main.includes("Name") &&
        main.includes("Environment")
      );
    }
  },
  {
    id: "drill-security-group-ingress",
    domain: "resource_attributes",
    title: "Building Security Group Ingress Rules",
    subtitle: "Add ingress blocks with from_port, to_port, and protocol to an AWS security group",
    estimatedMinutes: 8,
    difficulty: "Intermediate",
    diagnosticReason:
      "Triggered when an aws_security_group has no ingress blocks, or when a security group rule is missing from_port / to_port / protocol arguments that the AWS provider schema requires.",
    learningConcept:
      "An ingress block defines an inbound traffic rule. It is a NESTED BLOCK inside the aws_security_group resource (not an argument with an equals sign). Each ingress block MUST specify three arguments: 'from_port' (the start port), 'to_port' (the end port), and 'protocol' (usually \"tcp\"). Without all three, the AWS provider cannot form a valid security group rule and validation fails.",
    commonMistakeExplanation:
      "The most common mistake is declaring an aws_security_group with NO ingress blocks — which means the resource exists but allows no inbound traffic at all. A second mistake is writing only part of a rule (e.g. setting port = 80 instead of the required from_port and to_port). The AWS provider schema does not accept a generic 'port' argument; it strictly requires 'from_port' and 'to_port' separately.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE: aws_security_group with NO ingress blocks
resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id
}`,
    fixedSnippet: `# ✅ FIXED CODE: two ingress blocks for HTTP (80) and HTTPS (443)
resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`,
    ruleBulletPoints: [
      "An 'ingress' block is a NESTED BLOCK (no equals sign): 'ingress { ... }'. It is not an argument like 'ingress = ...'.",
      "Every ingress block REQUIRES three arguments: from_port, to_port, and protocol. The provider schema rejects rules missing any of these.",
      "from_port and to_port are NUMBERS (80, 443), not strings — do not quote them. Use the same value for both to open a single port.",
      "'protocol = \"tcp\"' uses double quotes because protocol is a string argument.",
      "cidr_blocks is a LIST of strings written with square brackets: cidr_blocks = [\"0.0.0.0/0\"]."
    ],
    practiceTask:
      "Add two ingress blocks to the aws_security_group below. The first must allow HTTP on port 80 (from_port = 80, to_port = 80, protocol = \"tcp\"). The second must allow HTTPS on port 443. Each block needs from_port, to_port, and protocol.",
    commandToTest: "terraform validate",
    starterFiles: {
      "main.tf": `# Remediation Drill: Security Group Ingress Rules
# Task: This aws_security_group has NO ingress blocks.
# Add TWO ingress blocks:
#   1. HTTP  - from_port = 80,  to_port = 80,  protocol = "tcp"
#   2. HTTPS - from_port = 443, to_port = 443, protocol = "tcp"
#
# Why from_port/to_port: AWS requires a port RANGE. A single port uses
# the same value for both. 'protocol' tells AWS the L4 protocol (tcp/udp/...).

provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id

  # TODO: Add your two ingress blocks here (ports 80 and 443)
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      return (
        main.includes("ingress") &&
        main.includes("80") &&
        main.includes("443") &&
        main.includes("from_port") &&
        main.includes("to_port")
      );
    }
  },
  {
    id: "drill-list-syntax",
    domain: "resource_attributes",
    title: "Using List Arguments with Square Brackets",
    subtitle: "Fix a list-typed argument written as a string and rewrite it with [ ] bracket syntax",
    estimatedMinutes: 6,
    difficulty: "Beginner",
    diagnosticReason:
      "Triggered when a list-typed resource argument (such as vpc_security_group_ids) is assigned a single string instead of a list, producing a type-mismatch or 'Invalid value for argument' error from the provider.",
    learningConcept:
      "Some resource arguments are schema-typed as a LIST of items. vpc_security_group_ids, for example, accepts a list of security group IDs because an instance can belong to MULTIPLE security groups. In HCL, list literals are written with square brackets: [ item1, item2 ]. A single item still needs the brackets: [ aws_security_group.web_sg.id ].",
    commonMistakeExplanation:
      "The common mistake is to treat a list argument like a string argument and write vpc_security_group_ids = \"aws_security_group.web_sg.id\". The provider rejects this because the schema expects 'list of strings', not a single string. The fix is to wrap the value in square brackets so HCL evaluates it as a one-element list.",
    brokenSnippet: `# ❌ BROKEN EXAMPLE: list argument written as a bare string
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  vpc_security_group_ids = "aws_security_group.web_sg.id"
}`,
    fixedSnippet: `# ✅ FIXED CODE: list argument wrapped in square brackets
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.web_sg.id]
}`,
    ruleBulletPoints: [
      "When an argument's schema type is 'list of X', HCL expects square brackets: argument = [ value1, value2 ].",
      "Even a single-element list needs brackets: [ aws_security_group.web_sg.id ]. The brackets tell HCL 'this is a list', not a string.",
      "Commas separate multiple items: [ sg_a.id, sg_b.id, sg_c.id ].",
      "A bare string without brackets is a string, never a list — the provider will reject a string where a list is required.",
      "Reference attributes inside the brackets stay unquoted (they are expressions, not strings): [ aws_security_group.web_sg.id ], not [ \"aws_security_group.web_sg.id\" ]."
    ],
    practiceTask:
      "Fix the vpc_security_group_ids argument below. It is currently written as a bare string. Rewrite it as a list using square brackets: [aws_security_group.web_sg.id].",
    commandToTest: "terraform validate",
    starterFiles: {
      "main.tf": `# Remediation Drill: List Arguments with Square Brackets
# Task: The vpc_security_group_ids argument is written as a STRING.
# It must be a LIST. Rewrite it using square brackets:
#   vpc_security_group_ids = [aws_security_group.web_sg.id]
#
# Why brackets: this attribute accepts a LIST of security group IDs
# (an instance can join multiple SGs). A single item still needs [ ].
# Reference attributes inside [] stay UNQUOTED — they are expressions.

provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Web security group"
}

resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  vpc_security_group_ids = "aws_security_group.web_sg.id"  # ❌ should be a list
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Web security group"
}

resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.web_sg.id]
}
`
    },
    validationCheck: (codeMap) => {
      const main = codeMap["main.tf"] || "";
      return (
        main.includes("[") &&
        main.includes("]") &&
        main.includes("aws_security_group")
      );
    }
  }
];
