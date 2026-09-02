import { VisualWalkthrough } from "../types/terraform";

export const WALKTHROUGHS_DATA: VisualWalkthrough[] = [
  {
    id: "concept-providers",
    conceptId: "providers",
    title: "Providers & The Terraform Block",
    subtitle: "How Terraform connects to Cloud APIs (AWS, Azure, GCP, Kubernetes)",
    category: "Core Foundations",
    estimatedMinutes: 6,
    icon: "PlugZap",
    summary:
      "Providers are the plugins that give Terraform its superpower to communicate with external cloud platforms, SaaS services, and on-premise hypervisors through clean declarative APIs.",
    mainObjectives: [
      "Understand what a Provider is and how Terraform Core interacts with Provider plugins",
      "Configure required_providers with official registry sources and version constraints",
      "Set up provider credentials, default tags, and regional configuration",
      "Master Provider Aliases for multi-region or multi-account cloud architectures",
    ],
    starterFiles: {
      "versions.tf": `terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Primary Provider Configuration (Default)
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = "Production"
      ManagedBy   = "Terraform"
      Owner       = "PlatformEngineering"
    }
  }
}

# Secondary Provider Alias for Disaster Recovery
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}`,
      "main.tf": `resource "aws_s3_bucket" "primary" {
  bucket = "prod-data-lake-primary"
}

resource "aws_s3_bucket" "dr_replica" {
  provider = aws.west
  bucket   = "prod-data-lake-dr-west"
}`
    },
    steps: [
      {
        id: "providers-1",
        stepNumber: 1,
        title: "Terraform Core vs. Provider Plugins",
        subtitle: "Separation of Orchestration Engine and Cloud APIs",
        explanation:
          "Terraform uses a plugin-based architecture. Terraform Core parses HCL, builds the Directed Acyclic Graph (DAG), and manages state. It then delegates the actual API calls (such as creating EC2 instances or S3 buckets) to Provider Plugins via gRPC.",
        objectives: [
          "Understand that Terraform Core does NOT know about AWS or GCP natively",
          "Learn how plugins are automatically downloaded during 'terraform init'",
          "Observe how provider plugins translate declarative HCL into REST/gRPC API calls"
        ],
        keyRules: [
          "Always run 'terraform init' in any new workspace or when adding a new provider.",
          "Provider plugins are stored locally in the hidden '.terraform/providers/' directory.",
          "A dependency lock file '.terraform.lock.hcl' pins the exact provider checksums for security."
        ],
        codeSnippet: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}`,
        fileName: "versions.tf",
        codeHighlights: [
          { label: "source", text: "Specifies the global registry path (e.g. registry.terraform.io/hashicorp/aws)" },
          { label: "version", text: "Pessimistic version constraint (~> 5.40 allows 5.41, but blocks major breaking 6.0)" }
        ],
        diagramType: "plugin_lifecycle",
        commandToTest: "terraform init",
        quickCheck: {
          question: "When does Terraform download the required provider plugins?",
          options: [
            "Automatically during 'terraform apply'",
            "During 'terraform init'",
            "When 'terraform fmt' is executed",
            "Plugins are already embedded inside the Terraform binary"
          ],
          correctIndex: 1,
          explanation:
            "'terraform init' reads the required_providers block, queries the Terraform Registry, and downloads the appropriate platform-specific binaries into .terraform/."
        }
      },
      {
        id: "providers-2",
        stepNumber: 2,
        title: "Configuring Provider Credentials & Defaults",
        subtitle: "Authenticating without hardcoding secrets",
        explanation:
          "The 'provider' block configures global settings for that cloud provider, such as the AWS region, default tags that apply to every created resource, and role assumption.",
        objectives: [
          "Configure cloud region and default resource tags",
          "Learn why credentials should NEVER be hardcoded into .tf files",
          "Apply global governance tags across all cloud resources automatically"
        ],
        keyRules: [
          "NEVER put access_key or secret_key in HCL code.",
          "Use environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) or IAM Instance Profiles / OIDC.",
          "Utilize 'default_tags' in the AWS provider to enforce organization tagging standards effortlessly."
        ],
        codeSnippet: `provider "aws" {
  region = "us-east-1"

  # Applied automatically to all resources supporting tags!
  default_tags {
    tags = {
      Environment = "Production"
      CostCenter  = "Engineering-101"
      ManagedBy   = "Terraform"
    }
  }
}`,
        fileName: "providers.tf",
        codeHighlights: [
          { label: "default_tags", text: "Injects standard corporate metadata onto every provisioned resource automatically" }
        ],
        diagramType: "provider_config_flow",
        commandToTest: "terraform plan",
        quickCheck: {
          question: "What is the best practice for authenticating the AWS provider?",
          options: [
            "Hardcode access_key and secret_key in provider 'aws' block",
            "Use Environment Variables, AWS CLI profiles, or IAM Role / OIDC",
            "Store plaintext credentials in terraform.tfvars committed to git",
            "Pass plaintext credentials as CLI arguments on every command"
          ],
          correctIndex: 1,
          explanation:
            "Hardcoded credentials in code risk exposure in version control. Always leverage IAM roles, OIDC, AWS profiles, or injected environment variables."
        }
      },
      {
        id: "providers-3",
        stepNumber: 3,
        title: "Provider Aliases & Multi-Region Deployments",
        subtitle: "Managing multiple regions or AWS accounts in one workspace",
        explanation:
          "By default, resources use the un-aliased (default) provider. When you need to create a resource in a secondary region (like a CloudFront ACM certificate in us-east-1 while your app is in eu-west-1, or a DR replica in us-west-2), you define an 'alias'.",
        objectives: [
          "Declare multiple provider blocks for the same provider type",
          "Use the 'alias' meta-argument to distinguish configurations",
          "Explicitly bind a resource to an alias using the 'provider = <name>.<alias>' argument"
        ],
        keyRules: [
          "Exactly one provider block per type can be the default (no alias).",
          "Resources without a 'provider' argument use the default provider.",
          "Resources specify an aliased provider using: provider = aws.west"
        ],
        codeSnippet: `provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

resource "aws_s3_bucket" "dr_bucket" {
  provider = aws.west  # Directs Terraform to use the west provider configuration
  bucket   = "dr-backup-vault-us-west-2"
}`,
        fileName: "main.tf",
        codeHighlights: [
          { label: "provider = aws.west", text: "Overrides the default provider and deploys this specific resource to us-west-2" }
        ],
        diagramType: "provider_alias_routing",
        commandToTest: "terraform plan"
      }
    ]
  },
  {
    id: "concept-resources",
    conceptId: "resources",
    title: "Resource Blocks & HCL Anatomy",
    subtitle: "The fundamental building blocks of declarative Infrastructure as Code",
    category: "Configuration Language",
    estimatedMinutes: 8,
    icon: "Box",
    summary:
      "Resources are the core units in Terraform. Each resource block describes one or more real-world infrastructure objects (VMs, subnets, database clusters, security groups) and their desired parameters.",
    mainObjectives: [
      "Master the universal syntax: <block_type> \"<resource_type>\" \"<local_name>\" { ... }",
      "Understand arguments, required vs optional parameters, and computed attributes",
      "Learn cross-resource referencing and implicit dependency creation",
      "Utilize meta-arguments: depends_on, count, for_each, and lifecycle rules"
    ],
    starterFiles: {
      "main.tf": `resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "production-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id  # Implicit reference & dependency!
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "production-public-subnet-1"
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "frontend-web"
  }

  lifecycle {
    create_before_destroy = true
  }
}`
    },
    steps: [
      {
        id: "resources-1",
        stepNumber: 1,
        title: "Anatomy of a Resource Block",
        subtitle: "Deconstructing the HCL block declaration",
        explanation:
          "Every resource block follows a strict 4-part structure: (1) The block keyword 'resource', (2) The provider-defined Resource Type (e.g. 'aws_instance'), (3) The Local Resource Name (e.g. 'web'), and (4) The Body containing key-value arguments.\n\nImportant: The Local Name (e.g. \"app_storage\") is just a Terraform-internal variable name — it exists ONLY inside your Terraform code so you can reference this resource elsewhere (e.g. aws_s3_bucket.app_storage.id). It has nothing to do with AWS and AWS never sees it. The 'bucket' argument inside the body (e.g. bucket = \"my-unique-company-vault\") is the REAL name AWS uses to create the actual S3 bucket in the cloud. Two different names, two different purposes.",
        objectives: [
          "Recognize the distinction between Resource Type and Local Resource Name",
          "Identify how Terraform creates a globally unique identifier (e.g. aws_instance.web)",
          "Distinguish input arguments from read-only exported attributes"
        ],
        keyRules: [
          "The resource type always starts with the provider prefix (e.g. 'aws_', 'azurerm_', 'google_').",
          "The local name must be unique within that resource type in the same module.",
          "Together, <type>.<name> forms the resource address in the state file."
        ],
        codeSnippet: `# 1: Block Keyword   2: Resource Type      3: Local Name
resource            "aws_s3_bucket"       "app_storage" {
  # 4: Arguments (Configuration Body)
  bucket        = "my-unique-company-vault"
  force_destroy = false

  tags = {
    Environment = "Dev"
  }
}`,
        fileName: "main.tf",
        codeHighlights: [
          { label: "aws_s3_bucket", text: "The resource type recognized by the AWS provider plugin" },
          { label: "app_storage", text: "Local Name: Terraform-only label for referencing this resource in code (see explanation above)" },
          { label: "bucket", text: "The real AWS bucket name that shows up in the AWS console" }
        ],
        diagramType: "anatomy_breakdown",
        commandToTest: "terraform validate",
        quickCheck: {
          question: "Given 'resource \"aws_vpc\" \"main\" {}', how do other resources reference its ID?",
          options: [
            "aws_vpc.id",
            "aws_vpc.main.id",
            "main.vpc.id",
            "$aws_vpc.main.id"
          ],
          correctIndex: 1,
          explanation:
            "References follow the pattern <resource_type>.<local_name>.<attribute_name>, hence 'aws_vpc.main.id'."
        }
      },
      {
        id: "resources-2",
        stepNumber: 2,
        title: "Cross-Resource Referencing & Implicit Dependencies",
        subtitle: "Connecting resources and letting Terraform calculate provisioning order",
        explanation:
          "When you reference an attribute of one resource inside another (such as setting 'vpc_id = aws_vpc.main.id'), Terraform automatically creates an Implicit Dependency. Here's where the ID comes from: (1) You write code that says 'create a VPC and call it main'. (2) Terraform asks AWS to create the VPC, and AWS assigns a real cloud ID to it (e.g. vpc-abc123). (3) The reference aws_vpc.main.id tells Terraform to go fetch that assigned real ID and use it here — so the subnet gets linked to the actual VPC that was just created. Terraform knows the VPC must be created first before the subnet, all without manual wait scripts!",
        objectives: [
          "Connect resources using dot notation references",
          "Understand how references generate the Directed Acyclic Graph (DAG)",
          "Eliminate race conditions and ordering errors in cloud infrastructure"
        ],
        keyRules: [
          "Use references instead of hardcoding generated cloud IDs.",
          "Terraform provisions referenced resources first, then extracts their computed outputs.",
          "Never create circular references (Resource A referencing B while B references A)."
        ],
        codeSnippet: `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  # Terraform sees 'aws_vpc.main.id' and automatically creates the VPC first!
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}`,
        fileName: "main.tf",
        codeHighlights: [
          { label: "aws_vpc.main.id", text: "Attribute reference creating an automatic dependency edge in the graph" }
        ],
        diagramType: "dependency_graph",
        commandToTest: "terraform plan"
      },
      {
        id: "resources-3",
        stepNumber: 3,
        title: "Meta-Arguments: for_each, count & lifecycle",
        subtitle: "Special keywords built into Terraform Core for advanced control",
        explanation:
          "Meta-arguments are special keywords available inside ANY resource block regardless of provider. 'for_each' creates multiple resource instances from a map/set; 'depends_on' enforces explicit ordering; 'lifecycle' customizes replacement behavior.\n\n**Lifecycle safety locks — 'prevent_destroy':** Despite its name, this setting DESTROYS NOTHING. It is a safety LOCK: 'prevent_destroy = true' means Terraform REFUSES to destroy that resource — if any plan contains a destroy action for it (a 'terraform destroy', or a change that would force replacement), Terraform errors out BEFORE touching the cloud. 'false' (or omitted) simply means 'no lock — destruction allowed as usual'. Think of a door lock: true = locked door; false = unlocked.\n\nTwo honest limits: (1) the lock only guards Terraform's OWN actions — a colleague deleting the database in the AWS Console bypasses it entirely, because the lock lives in Terraform's config, not in AWS; (2) to legitimately delete a locked resource later, a human must first remove the lock line, then destroy — a deliberate two-step act, which is exactly the friction this setting exists to create.",
        objectives: [
          "Scale resource creation dynamically with 'for_each' vs 'count'",
          "Prevent downtime during updates using 'lifecycle { create_before_destroy = true }'",
          "Protect critical resources with 'prevent_destroy = true' — a safety LOCK that makes Terraform REFUSE to destroy them"
        ],
        keyRules: [
          "Prefer 'for_each' over 'count' for resources that might have items removed from the middle of the list.",
          "'prevent_destroy = true' does NOT delete anything — it BLOCKS Terraform from destroying the resource (destroy/replacement plans fail with an error until the lock is removed).",
          "Use 'lifecycle { prevent_destroy = true }' on stateful databases and production storage buckets — it stops Terraform's hands, not a human deleting via the AWS Console.",
          "Use 'lifecycle { ignore_changes = [tags] }' if an external auto-tagger modifies resources."
        ],
        codeSnippet: `resource "aws_s3_bucket" "departments" {
  # Creates a distinct bucket for each item in the set
  for_each = toset(["finance", "engineering", "marketing"])
  bucket   = "corp-\${each.key}-archive"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [tags["LastScanned"]]
  }
}`,
        fileName: "storage.tf",
        codeHighlights: [
          { label: "for_each", text: "Creates identifiable instances: aws_s3_bucket.departments[\"finance\"], etc." },
          { label: "each.key", text: "The current iteration value from the provided collection" }
        ],
        diagramType: "resource_stack",
        commandToTest: "terraform plan",
        quickCheck: {
          question: "You add 'prevent_destroy = true' to a production database's lifecycle block. What happens if someone runs 'terraform destroy'?",
          options: [
            "The database is destroyed, then immediately recreated",
            "Terraform refuses the destroy and errors out before touching the cloud",
            "Terraform deletes it only if you also pass '-force'",
            "The setting only affects imports, not destroys"
          ],
          correctIndex: 1,
          explanation:
            "'prevent_destroy = true' is a safety LOCK: any plan containing a destroy action for that resource fails with an error BEFORE any cloud call. To delete it later, a human must first remove the lock line — a deliberate two-step act. The lock guards Terraform's own actions only; AWS Console deletions bypass it."
        }
      },
      {
        id: "resources-4",
        stepNumber: 4,
        title: "Required Attributes, Tags & Best Practices",
        subtitle: "Required arguments, tagging conventions, security group ingress, and list syntax",
        explanation:
          "Every resource type has provider-specific REQUIRED attributes — omit them and `terraform plan` fails before any cloud API call. This step covers four habits every AWS resource block should have.\n\n**Tags:** The `tags = { ... }` map labels every resource for the AWS console, cost reports, and filtering. Adopt a convention: `Name` identifies the resource (e.g. \"web-server-prod\"), `Environment` marks the stage (\"production\", \"staging\", \"dev\"), and `ManagedBy = \"Terraform\"` flags IaC-managed resources so manually-built ones stand out.\n\n**Security group ingress:** Each `ingress` block opens one port range and needs four arguments: `from_port`, `to_port`, `protocol`, and `cidr_blocks`. Port 80 = HTTP, port 443 = HTTPS. `cidr_blocks = [\"0.0.0.0/0\"]` means \"allow from any IP\" — fine for a public web server, dangerous for a database.\n\n**List arguments with `[]`:** Some attributes take a LIST, not a single value. `vpc_security_group_ids` is plural because an instance can attach to several security groups, so you wrap values in brackets: `[aws_security_group.web_sg.id]` for one, `[aws_security_group.web_sg.id, aws_security_group.db_sg.id]` for two. The brackets are what make it a list.\n\n**map_public_ip_on_launch:** Set on `aws_subnet`, this controls whether EC2 instances launched in that subnet receive a public IP. `true` for public subnets (internet-facing), `false` for private subnets (databases, internal services).\n\n**description:** Always add a `description` to variable blocks — it documents intent for teammates and surfaces in tooling.",
        objectives: [
          "Apply a consistent tag convention (Name, Environment, ManagedBy) to every AWS resource",
          "Configure security group ingress blocks with from_port, to_port, protocol, and cidr_blocks",
          "Distinguish list arguments ([] brackets) from single-value arguments",
          "Choose map_public_ip_on_launch correctly for public vs private subnets"
        ],
        keyRules: [
          "Every AWS resource should carry tags: Name, Environment, and ManagedBy at minimum.",
          "An ingress block requires from_port, to_port, protocol, and cidr_blocks — all four.",
          "Attributes ending in _ids (plural) take a list in []: [a], [a, b], or [a, b, c].",
          "map_public_ip_on_launch = true → public subnet; false → private subnet.",
          "Always document variables with a description argument."
        ],
        codeSnippet: `variable "environment" {
  type        = string
  description = "Deployment stage: dev, staging, or production"  # Document intent
  default     = "dev"
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true  # Public subnet: instances get a public IP

  tags = {
    Name        = "web-server-\${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_security_group" "web_sg" {
  name = "web-sg"

  ingress {
    from_port   = 80             # HTTP
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow from any IP
  }

  ingress {
    from_port   = 443            # HTTPS
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]  # A LIST in []
}`,
        fileName: "main.tf",
        codeHighlights: [
          { label: "tags = { ... }", text: "Map of key-value labels for organization, cost tracking, and identification" },
          { label: "ingress { ... }", text: "Opens one port range; needs from_port, to_port, protocol, and cidr_blocks" },
          { label: "vpc_security_group_ids = [...]", text: "A LIST in brackets — an instance can attach to multiple security groups" },
          { label: "map_public_ip_on_launch", text: "true = instances get a public IP (public subnet); false = private subnet" }
        ],
        diagramType: "best_practice_matrix",
        commandToTest: "terraform validate",
        quickCheck: {
          question: "What does cidr_blocks = [\"0.0.0.0/0\"] mean in a security group ingress block?",
          options: [
            "Allow traffic only from inside the VPC",
            "Allow traffic from any IP address",
            "Allow traffic from localhost only",
            "Block all inbound traffic"
          ],
          correctIndex: 1,
          explanation:
            "\"0.0.0.0/0\" is the CIDR block covering all IPv4 addresses, so the rule permits inbound traffic from anywhere on the internet."
        }
      }
    ]
  },
  {
    id: "concept-variables",
    conceptId: "variables",
    title: "Variables, Locals & Outputs",
    subtitle: "Parameterizing and modularizing your infrastructure configurations",
    category: "Configuration Language",
    estimatedMinutes: 7,
    icon: "Sliders",
    summary:
      "Parameterize your infrastructure so the same HCL codebase can be safely deployed across dev, staging, and prod with differing instance sizes, counts, and tags without duplicating code.",
    mainObjectives: [
      "Define Input Variables with explicit types (string, number, list, map, object)",
      "Assign variable values via terraform.tfvars, CLI flags (-var), or environment variables",
      "Use 'locals' for DRY intermediate computed expressions and string transformations",
      "Expose useful endpoints and connection strings using 'output' blocks"
    ],
    starterFiles: {
      "variables.tf": `variable "environment" {
  type        = string
  description = "Deployment target environment"
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "The environment must be dev, staging, or prod."
  }
}

variable "instance_type" {
  type        = string
  description = "EC2 instance sizing"
  default     = "t3.micro"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "IP CIDRs allowed for ingress"
  default     = ["10.0.0.0/8"]
}`,
      "locals.tf": `locals {
  name_prefix = "app-\${var.environment}"
  
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "CoreInfrastructure"
  }
}`,
      "main.tf": `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = merge(local.common_tags, {
    Name = "\${local.name_prefix}-vpc"
  })
}`,
      "outputs.tf": `output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "environment_name" {
  description = "Active environment name"
  value       = var.environment
}`
    },
    steps: [
      {
        id: "variables-1",
        stepNumber: 1,
        title: "Input Variables & Type Constraints",
        subtitle: "Defining parameterized inputs with validations",
        explanation:
          "Input variables serve as function arguments for your Terraform workspace. You can enforce type constraints (string, number, bool, list, map, object) and custom validation rules to catch invalid configurations before planning.",
        objectives: [
          "Declare variables with descriptive names, types, and descriptions",
          "Provide sensible default values for local development",
          "Write custom validation blocks with helpful error messages"
        ],
        keyRules: [
          "Variables without defaults are required: Terraform prompts for them if not provided.",
          "Use 'type' constraint to guarantee safe runtime evaluation.",
          "Use 'validation' blocks to enforce naming conventions and allowed enumerations."
        ],
        codeSnippet: `variable "db_port" {
  type        = number
  description = "Listening port for PostgreSQL database"
  default     = 5432

  validation {
    condition     = var.db_port > 1024 && var.db_port < 65535
    error_message = "Database port must be between 1025 and 65534."
  }
}`,
        fileName: "variables.tf",
        codeHighlights: [
          { label: "type = number", text: "Ensures only numeric inputs are accepted" },
          { label: "validation", text: "Speculative assertion evaluated before any cloud API calls" }
        ],
        diagramType: "variable_pipeline",
        commandToTest: "terraform validate",
        quickCheck: {
          question: "How do you reference the value of a variable named 'environment' in HCL?",
          options: [
            "$environment",
            "var.environment",
            "variables.environment",
            "self.environment"
          ],
          correctIndex: 1,
          explanation:
            "Input variables are always accessed under the 'var.' namespace, e.g. var.environment."
        }
      },
      {
        id: "variables-2",
        stepNumber: 2,
        title: "Locals: Computing Values & Keeping Code DRY",
        subtitle: "Intermediate values and reusable expressions",
        explanation:
          "While input variables are passed from the outside, 'locals' are calculated inside your module. Use locals to avoid repeating complex expressions, format standard naming conventions, or combine multiple tag maps.",
        objectives: [
          "Consolidate repeated expressions into local values",
          "Combine maps with the built-in 'merge()' function",
          "Standardize naming conventions across all resources"
        ],
        keyRules: [
          "Reference local values using 'local.<name>' (singular 'local', not 'locals').",
          "Locals can reference variables, other locals, and resource attributes.",
          "Keep locals focused: avoid over-engineering simple strings."
        ],
        codeSnippet: `locals {
  # Standard prefix for all resources
  prefix = "\${var.project}-\${var.environment}"

  # Merged tags
  standard_tags = merge(var.custom_tags, {
    Project     = var.project
    Environment = var.environment
  })
}

resource "aws_s3_bucket" "logs" {
  bucket = "\${local.prefix}-access-logs"
  tags   = local.standard_tags
}`,
        fileName: "locals.tf",
        codeHighlights: [
          { label: "local.prefix", text: "Accessed using singular 'local.', computed once and reused everywhere" }
        ],
        diagramType: "locals_flow",
        commandToTest: "terraform plan"
      },
      {
        id: "variables-3",
        stepNumber: 3,
        title: "Outputs: Exposing Computed Infrastructure Data",
        subtitle: "Returning endpoints, IP addresses, and values to users or CI/CD",
        explanation:
          "Output values expose information about your infrastructure. They are printed to the terminal after 'terraform apply', queried via 'terraform output', and consumed by parent modules or 'terraform_remote_state' data sources.\n\nWhat happens with sensitive = true? The secret is still saved in your terraform.tfstate file in plaintext — sensitive = true does NOT encrypt it. It only redacts the value from terminal output and logs, replacing it with <sensitive>. Terraform reads the value from the state file normally for plan/apply comparisons. This means the security of your secrets depends on securing the state file itself: use an encrypted remote backend (S3 with encryption) and never commit .tfstate to Git.",
        objectives: [
          "Expose endpoints, DNS records, and generated IDs",
          "Hide sensitive values (passwords, private keys) from terminal logs with 'sensitive = true'",
          "Export values for downstream automation pipelines"
        ],
        keyRules: [
          "Always set 'sensitive = true' on outputs containing database passwords or private keys.",
          "Outputs are only populated after resources are successfully applied into state.",
          "Run 'terraform output -json' in CI/CD scripts to parse infrastructure metadata programmatically."
        ],
        codeSnippet: `output "web_public_ip" {
  description = "Public IP address of web frontend"
  value       = aws_instance.web.public_ip
}

output "db_password" {
  description = "Generated master database password"
  value       = aws_db_instance.main.password
  sensitive   = true  # Hidden in standard terminal logs!
}`,
        fileName: "outputs.tf",
        codeHighlights: [
          { label: "sensitive = true", text: "Redacts the value in CLI output with <sensitive> to prevent credential leaks" }
        ],
        diagramType: "output_flow",
        commandToTest: "terraform output"
      }
    ]
  },
  {
    id: "concept-state",
    conceptId: "state",
    title: "Terraform State & The 3-Way Reconciliation Loop",
    subtitle: "Understanding terraform.tfstate, locking, and configuration drift",
    category: "State & Lifecycle",
    estimatedMinutes: 9,
    icon: "ShieldAlert",
    summary:
      "Terraform state is the single source of truth that maps your declarative HCL code to real-world cloud resources, tracks metadata, and detects out-of-band changes (Configuration Drift).",
    mainObjectives: [
      "Understand what is stored inside terraform.tfstate and why state is mandatory",
      "Master the 3-Way Reconciliation Triangle: Desired State vs State File vs Actual Cloud",
      "Learn how remote backends (S3 + DynamoDB) provide team collaboration and state locking",
      "Detect and remediate out-of-band Configuration Drift"
    ],
    starterFiles: {
      "main.tf": `resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "production-web-1"
    Environment = "Production"
  }
}`
    },
    steps: [
      {
        id: "state-1",
        stepNumber: 1,
        title: "The Purpose of the State File",
        subtitle: "Mapping declarative resource blocks to physical cloud IDs",
        explanation:
          "Cloud APIs don't understand your HCL variable names or local references. The state file records the mapping between 'aws_instance.web' and the real cloud ID 'i-0a1b2c3d4e5f6g7h8', along with all computed metadata, dependencies, and resource schemas.",
        objectives: [
          "Understand that Terraform does NOT query every single cloud API on every run",
          "Observe the JSON structure of terraform.tfstate",
          "Learn why committing state files to Git is dangerous (contains sensitive plaintext secrets!)"
        ],
        keyRules: [
          "NEVER commit terraform.tfstate or terraform.tfstate.backup to Git.",
          "State files contain unencrypted sensitive values (passwords, private keys, tokens).",
          "Always use a secure remote backend with encryption at rest."
        ],
        codeSnippet: `{
  "version": 4,
  "terraform_version": "1.9.0",
  "serial": 12,
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "web_server",
      "instances": [
        {
          "attributes": {
            "id": "i-08a9f24b11cd",
            "instance_type": "t3.micro",
            "public_ip": "54.210.12.89"
          }
        }
      ]
    }
  ]
}`,
        fileName: "terraform.tfstate",
        codeHighlights: [
          { label: "\"id\": \"i-08a9f24b11cd\"", text: "The physical AWS resource identifier mapped to the HCL address" }
        ],
        diagramType: "state_file_map",
        commandToTest: "terraform state list",
        quickCheck: {
          question: "Why should terraform.tfstate NEVER be committed to a public Git repository?",
          options: [
            "Git cannot store JSON files",
            "State files contain unencrypted sensitive data and credentials",
            "It will cause Terraform to crash on init",
            "Terraform only allows storing state on local floppy disks"
          ],
          correctIndex: 1,
          explanation:
            "State files contain full attributes of all resources in plaintext, including generated passwords, API keys, and private tokens. Always use encrypted remote backends."
        }
      },
      {
        id: "state-2",
        stepNumber: 2,
        title: "The 3-Way Reconciliation Triangle",
        subtitle: "How 'terraform plan' calculates actions (+, ~, -)",
        explanation:
          "During 'terraform plan', Terraform compares: (1) Your desired HCL code, (2) The recorded State File, and (3) The actual Real-World Cloud state fetched via refresh API calls. It reconciles differences to calculate the minimum set of changes required.",
        objectives: [
          "Differentiate between Add (+), Modify (~), and Destroy (-)",
          "Understand when an in-place update is possible vs a destructive replacement",
          "Learn how changes to immutable arguments (like VPC CIDR or AMI) force recreation"
        ],
        keyRules: [
          "+ (Green): Resource exists in code but not in state → Will be Created.",
          "~ (Yellow): Resource exists in both, but arguments changed → Will be Updated in-place.",
          "- (Red): Resource exists in state but removed from code → Will be Destroyed.",
          "-/+ (Red/Green): Immutable argument changed → Will be Destroyed and Re-created."
        ],
        codeSnippet: `# Plan Symbol Meanings:
  # + create
  # ~ update in-place
  # - destroy
  # -/+ destroy and then create replacement

Terraform will perform the following actions:

  # aws_instance.web_server will be updated in-place
  ~ resource "aws_instance" "web_server" {
      ~ instance_type = "t2.micro" -> "t3.micro"
        id            = "i-08a9f24b11cd"
        # (5 unchanged attributes hidden)
    }

Plan: 0 to add, 1 to change, 0 to destroy.`,
        fileName: "CLI Output Preview",
        codeHighlights: [
          { label: "~ instance_type", text: "Indicates in-place modification of existing AWS resource" }
        ],
        diagramType: "state_reconciliation",
        commandToTest: "terraform plan"
      },
      {
        id: "state-3",
        stepNumber: 3,
        title: "Remote Backends & State Locking",
        subtitle: "Team collaboration with AWS S3 and DynamoDB",
        explanation:
          "In production teams, storing state locally leads to corrupted state when multiple engineers run commands simultaneously. A remote backend stores state in S3 and uses DynamoDB for mutex state locking.",
        objectives: [
          "Configure an S3 remote backend with DynamoDB locking",
          "Understand how state locking prevents race conditions and corrupted states",
          "Enable versioning on the state bucket for instant disaster recovery"
        ],
        keyRules: [
          "Always enable bucket versioning on the S3 state bucket.",
          "Use DynamoDB table with Primary Key 'LockID' (string) for locking.",
          "Terraform acquires the lock at start of plan/apply and releases it upon completion."
        ],
        codeSnippet: `terraform {
  backend "s3" {
    bucket         = "corp-terraform-state-vault"
    key            = "environments/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}`,
        fileName: "backend.tf",
        codeHighlights: [
          { label: "dynamodb_table", text: "Acquires a mutex lock before running commands, preventing concurrent applies" }
        ],
        diagramType: "remote_backend",
        commandToTest: "terraform init"
      }
    ]
  },
  {
    id: "concept-workflow",
    conceptId: "workflow",
    title: "The Terraform CLI Workflow",
    subtitle: "From clean HCL code to running cloud infrastructure",
    category: "Core Foundations",
    estimatedMinutes: 6,
    icon: "Terminal",
    summary:
      "The core workflow consists of four essential stages: Write → Init → Plan → Apply. Mastering this lifecycle enables reliable, automated CI/CD infrastructure deployments.",
    mainObjectives: [
      "Master the fundamental lifecycle commands: init, validate, fmt, plan, apply, destroy",
      "Understand what happens behind the scenes during each CLI execution phase",
      "Use speculative execution plans to prevent catastrophic production mistakes",
      "Safely evaluate HCL expressions using 'terraform console'"
    ],
    starterFiles: {
      "main.tf": `resource "aws_s3_bucket" "demo_vault" {
  bucket = "cloudops-sandbox-demo-bucket"

  tags = {
    Purpose = "WorkflowMastery"
  }
}`
    },
    steps: [
      {
        id: "workflow-1",
        stepNumber: 1,
        title: "Stage 1: Initialize (terraform init)",
        subtitle: "Preparing the workspace and plugins",
        explanation:
          "'terraform init' is always the first command run in a directory. It downloads provider plugins, configures backend state storage, installs child modules, and verifies plugin checksums.",
        objectives: [
          "Initialize providers and backend storage",
          "Inspect generated .terraform directory and .terraform.lock.hcl",
          "Identify when re-initialization is required (e.g. adding a new module or provider)"
        ],
        keyRules: [
          "Run 'terraform init' whenever you clone a repo or add a new provider/module.",
          "Use 'terraform init -upgrade' to pull newer versions within your constraint limits.",
          "Init does NOT create any real infrastructure or make cloud API calls."
        ],
        codeSnippet: `$ terraform init

Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.42.0...
- Installed hashicorp/aws v5.42.0 (signed by HashiCorp)

Terraform has been successfully initialized!`,
        fileName: "Terminal Simulator",
        codeHighlights: [
          { label: "Installing hashicorp/aws", text: "Fetches binary plugin matching OS architecture into .terraform" }
        ],
        diagramType: "init_stage",
        commandToTest: "terraform init"
      },
      {
        id: "workflow-2",
        stepNumber: 2,
        title: "Stage 2: Plan (terraform plan)",
        subtitle: "Speculative execution and change preview",
        explanation:
          "'terraform plan' reads your code, queries current cloud state via APIs, constructs the dependency DAG, and computes exactly what actions will be taken WITHOUT modifying your live infrastructure.",
        objectives: [
          "Review proposed additions, modifications, and deletions safely",
          "Save execution plans with '-out=tfplan' for guaranteed atomic CI/CD deployments",
          "Catch syntax, typing, and naming mistakes before modifying cloud resources"
        ],
        keyRules: [
          "Never run 'terraform apply' without carefully reviewing the plan first.",
          "Plan is read-only and safe to run at any time.",
          "In automated CI/CD pipelines, save the plan with '-out=tfplan' to ensure apply executes the exact reviewed changes."
        ],
        codeSnippet: `$ terraform plan

Terraform will perform the following actions:

  # aws_s3_bucket.demo_vault will be created
  + resource "aws_s3_bucket" "demo_vault" {
      + arn           = (known after apply)
      + bucket        = "cloudops-sandbox-demo-bucket"
      + id            = (known after apply)
      + region        = "us-east-1"
    }

Plan: 1 to add, 0 to change, 0 to destroy.`,
        fileName: "Terminal Simulator",
        codeHighlights: [
          { label: "(known after apply)", text: "Computed attribute generated by cloud provider during creation" }
        ],
        diagramType: "plan_stage",
        commandToTest: "terraform plan"
      },
      {
        id: "workflow-3",
        stepNumber: 3,
        title: "Stage 3: Apply & Destroy (terraform apply)",
        subtitle: "Executing changes and updating state",
        explanation:
          "'terraform apply' takes the plan and executes parallel API calls against the cloud provider in graph dependency order. Once each resource is provisioned, its attributes are written to state.",
        objectives: [
          "Execute infrastructure provisioning safely",
          "Understand the interactive confirmation prompt ('yes')",
          "Teardown temporary or sandbox environments with 'terraform destroy'"
        ],
        keyRules: [
          "Apply requires an explicit typed confirmation 'yes' unless '-auto-approve' is passed in automated CI.",
          "Terraform runs parallel API calls (default 10 concurrent operations).",
          "If apply fails midway, state retains all successfully created resources (partial apply)."
        ],
        codeSnippet: `$ terraform apply

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_s3_bucket.demo_vault: Creating...
aws_s3_bucket.demo_vault: Creation complete after 3s [id=cloudops-sandbox-demo-bucket]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.`,
        fileName: "Terminal Simulator",
        codeHighlights: [
          { label: "Apply complete!", text: "Resource physical attributes persisted into state file" }
        ],
        diagramType: "apply_stage",
        commandToTest: "terraform apply"
      }
    ]
  },
  {
    id: "concept-modules",
    conceptId: "modules",
    title: "Modules & Reusable Architecture",
    subtitle: "Organizing infrastructure into reusable, encapsulated components",
    category: "Architecture & Scale",
    estimatedMinutes: 8,
    icon: "Layers",
    summary:
      "Modules are containers for multiple resources that are used together. They allow infrastructure teams to create standardized, well-architected building blocks (VPC modules, EKS cluster modules) that application teams can consume safely.",
    mainObjectives: [
      "Understand the difference between Root Modules and Child Modules",
      "Call child modules with input arguments using 'source' blocks",
      "Access module outputs in parent configurations",
      "Use official Terraform Registry modules to follow cloud best practices"
    ],
    starterFiles: {
      "main.tf": `# Consuming a reusable VPC Child Module
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr    = "10.0.0.0/16"
  environment = "production"
  subnet_count = 2
}

# Consuming the module's exported outputs
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnet_ids[0]

  tags = {
    Name = "web-server"
  }
}`
    },
    steps: [
      {
        id: "modules-1",
        stepNumber: 1,
        title: "Anatomy of a Module Call",
        subtitle: "Calling child modules and passing parameters",
        explanation:
          "A module block calls a collection of .tf files located in a local directory or remote Git repository. You supply input variables as arguments, and the module provisions the internal resources encapsulated inside.",
        objectives: [
          "Use the 'source' argument (local path, Git URL, or Terraform Registry)",
          "Pass parameters into child module input variables",
          "Understand that resources inside modules are namespaced: module.<name>.<resource_type>.<name>"
        ],
        keyRules: [
          "Every module block must have a 'source' argument.",
          "Variables defined in the root module are NOT automatically visible inside child modules.",
          "All required inputs defined in the child module's variables.tf must be supplied."
        ],
        codeSnippet: `module "network" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "prod-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
}`,
        fileName: "main.tf",
        codeHighlights: [
          { label: "source", text: "Points to the Terraform Registry or local directory './modules/vpc'" },
          { label: "version", text: "Pins the version of the registry module for predictable builds" }
        ],
        diagramType: "module_interface",
        commandToTest: "terraform validate",
        quickCheck: {
          question: "How do you access an output named 'vpc_id' exported from a module called 'network'?",
          options: [
            "aws_vpc.network.vpc_id",
            "module.network.vpc_id",
            "network.outputs.vpc_id",
            "var.network.vpc_id"
          ],
          correctIndex: 1,
          explanation:
            "Module outputs are accessed via 'module.<module_name>.<output_name>', e.g. module.network.vpc_id."
        }
      },
      {
        id: "modules-2",
        stepNumber: 2,
        title: "Standard Module Structure",
        subtitle: "Organizing professional Terraform codebases",
        explanation:
          "HashiCorp recommends a standard layout for all reusable modules: main.tf (resource definitions), variables.tf (input arguments), outputs.tf (exported values), and README.md.",
        objectives: [
          "Structure module files logically for maintainability",
          "Expose clear, well-documented outputs",
          "Enforce separation of concerns between infrastructure layers"
        ],
        keyRules: [
          "Keep root modules thin: compose reusable child modules.",
          "Document every variable with a 'description' string.",
          "Provide default values for optional arguments only."
        ],
        codeSnippet: `modules/vpc/
├── main.tf        # Resources (aws_vpc, aws_subnet, aws_route_table)
├── variables.tf   # Inputs (vpc_cidr, az_list, enable_dns)
├── outputs.tf     # Outputs (vpc_id, public_subnet_ids, arn)
└── README.md      # Usage examples and requirements`,
        fileName: "Directory Structure",
        codeHighlights: [
          { label: "outputs.tf", text: "Defines the explicit public API of the module for consumers" }
        ],
        diagramType: "module_hierarchy",
        commandToTest: "terraform plan"
      }
    ]
  },
  {
    id: "concept-dag",
    conceptId: "dag",
    title: "Dependency Graphs (DAG) & Parallelism",
    subtitle: "How Terraform builds the execution graph and provisions in parallel",
    category: "Architecture & Scale",
    estimatedMinutes: 7,
    icon: "GitGraph",
    summary:
      "Terraform builds a Directed Acyclic Graph (DAG) by analyzing resource references. It provisions independent resources simultaneously in parallel, maximizing cloud deployment speed.",
    mainObjectives: [
      "Understand how Terraform builds a Directed Acyclic Graph (DAG)",
      "Learn how parallel execution stages drastically reduce deployment time",
      "Identify and resolve Circular Dependency errors (Cycle Errors)",
      "Inspect graphs visually using 'terraform graph'"
    ],
    starterFiles: {
      "main.tf": `# Stage 1: Independent Root Resources (Parallel)
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_s3_bucket" "logs" {
  bucket = "corp-central-logging-bucket"
}

# Stage 2: Depends on Stage 1
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

# Stage 3: Depends on Stage 2
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id
}`
    },
    steps: [
      {
        id: "dag-1",
        stepNumber: 1,
        title: "How the Graph Engine Works",
        subtitle: "Implicit dependency edges and parallel stages",
        explanation:
          "Terraform inspects every attribute reference in your HCL code. If Resource B references Resource A's ID, an edge A → B is created. Resources with 0 inbound dependencies (Stage 1) are executed simultaneously in parallel.",
        objectives: [
          "Understand how reference chains define execution order",
          "Observe parallel provisioning of independent resources (e.g. S3 + VPC simultaneously)",
          "Control concurrency limits using the '-parallelism=N' CLI flag"
        ],
        keyRules: [
          "Terraform runs up to 10 parallel operations by default.",
          "Resources without dependencies are created at the exact same moment in Stage 1.",
          "Teardown during 'terraform destroy' walks the exact same graph in REVERSE order."
        ],
        codeSnippet: `$ terraform graph
digraph {
  "aws_vpc.main" -> "provider.aws"
  "aws_s3_bucket.logs" -> "provider.aws"
  "aws_subnet.public" -> "aws_vpc.main"
  "aws_instance.web" -> "aws_subnet.public"
}`,
        fileName: "Terminal Simulator",
        codeHighlights: [
          { label: "digraph", text: "Graphviz formatted directed graph generated by the engine" }
        ],
        diagramType: "dag_parallelism",
        commandToTest: "terraform graph",
        quickCheck: {
          question: "If Resource A and Resource B have no references between each other, what does Terraform do during apply?",
          options: [
            "Applies them alphabetically one after another",
            "Provisions both in parallel simultaneously",
            "Throws an unresolved dependency error",
            "Halts until you add an explicit depends_on block"
          ],
          correctIndex: 1,
          explanation:
            "Independent resources without dependency edges belong to Stage 1 and are provisioned concurrently in parallel by worker threads."
        }
      },
      {
        id: "dag-2",
        stepNumber: 2,
        title: "Circular Dependencies (Cycle Errors)",
        subtitle: "Detecting and resolving circular references",
        explanation:
          "Because the graph must be Acyclic (no loops), if Resource A references Resource B, and Resource B references Resource A (e.g. a Security Group referencing another SG rule bidirectionally), Terraform cannot determine which to create first and errors out with a Cycle Error.",
        objectives: [
          "Diagnose 'Error: Cycle: aws_security_group.a, aws_security_group.b'",
          "Break cyclic dependencies by splitting monolithic blocks into standalone rule resources",
          "Design clean, decoupled infrastructure architectures"
        ],
        keyRules: [
          "Cycles make it impossible to compute a topological sort.",
          "Always break circular references by separating the relationship into a 3rd resource (like aws_security_group_rule).",
          "Check the DAG graph viewer to visualize dependency bottlenecks."
        ],
        codeSnippet: `# BAD (Causes Cycle Error):
# SG A references SG B's ID, while SG B references SG A's ID in inline rules!

# FIX (Split into standalone rule resources):
resource "aws_security_group" "web" { ... }
resource "aws_security_group" "db"  { ... }

resource "aws_security_group_rule" "web_to_db" {
  security_group_id        = aws_security_group.db.id
  source_security_group_id = aws_security_group.web.id
}`,
        fileName: "security_groups.tf",
        codeHighlights: [
          { label: "aws_security_group_rule", text: "Standalone rule resource breaks the circular reference cycle cleanly" }
        ],
        diagramType: "cycle_error",
        commandToTest: "terraform plan"
      }
    ]
  }
];
