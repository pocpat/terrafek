import { LabDefinition } from "../types/terraform";

export const LABS_DATA: LabDefinition[] = [
  {
    id: "lab-1-first-resource",
    level: 0,
    title: "1. Your First Cloud Resource",
    subtitle: "Declare an S3 storage bucket and understand the Anatomy of an HCL block",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    xp: 100,
    category: "Foundations",
    iconName: "Box",
    architectureDiagramType: "s3_single",
    scenario:
      "You just joined CloudOps Inc. Your first mission is to provision a secure, scalable cloud storage bucket for company media assets using HashiCorp Configuration Language (HCL).",
    visualGoal: "Create an AWS S3 Bucket named 'prod-analytics-storage-corp' with an Environment tag of 'Production'.",
    conceptTakeaway: [
      "Every resource block follows the format: resource \"<TYPE>\" \"<LOCAL_NAME>\" { ... }",
      "The 'type' tells Terraform what cloud resource to provision (e.g. aws_s3_bucket).",
      "The 'name' is how you reference this resource inside other Terraform code blocks."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Define an 'aws' provider block with region 'us-east-1'.",
        hint: "Add: provider \"aws\" { region = \"us-east-1\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes('provider "aws"') && main.includes("us-east-1");
        }
      },
      {
        id: "task-2",
        description: "Declare a resource of type 'aws_s3_bucket' with label 'analytics_bucket'.",
        hint: "Add: resource \"aws_s3_bucket\" \"analytics_bucket\" { bucket = \"prod-analytics-storage-corp\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes('resource "aws_s3_bucket" "analytics_bucket"') && main.includes("prod-analytics-storage-corp");
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform plan' and 'terraform apply' to provision your bucket.",
        hint: "Open the terminal and run 'terraform plan', then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "aws_s3_bucket" && r.name === "analytics_bucket");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 1: Your First Cloud Resource
# Task: Configure the AWS provider and declare your S3 bucket resource

provider "aws" {
  region = "us-east-1"
}

# TODO: Add your aws_s3_bucket resource below
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "analytics_bucket" {
  bucket = "prod-analytics-storage-corp"

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
`
    },
    solutionExplanation:
      "In HCL, the `aws_s3_bucket` block tells Terraform to talk to the AWS API and create an S3 bucket with the specified globally unique bucket name and tags."
  },
  {
    id: "lab-2-core-workflow",
    level: 1,
    title: "2. The Core Terraform Workflow",
    subtitle: "Master the 4 golden commands: init -> plan -> apply -> destroy",
    difficulty: "Beginner",
    estimatedMinutes: 8,
    xp: 150,
    category: "Core Workflow",
    iconName: "PlayCircle",
    architectureDiagramType: "ec2_web",
    scenario:
      "A developer pushed an EC2 instance configuration. Your job is to initialize the working directory, inspect the planned delta, apply the infrastructure, and safely decommission it.",
    visualGoal: "Understand how Terraform translates your code into real cloud instances and records metadata in terraform.tfstate.",
    conceptTakeaway: [
      "terraform init: Downloads required provider plugins (like hashicorp/aws).",
      "terraform plan: Compares desired code state with current cloud state and shows the execution plan (+ add, ~ change, - destroy).",
      "terraform apply: Executes the plan and updates the terraform.tfstate state file.",
      "terraform destroy: Gracefully removes all tracked resources."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Run 'terraform init' in the terminal to initialize provider plugins.",
        hint: "Type 'terraform init' in the terminal below.",
        validationCheck: () => true
      },
      {
        id: "task-2",
        description: "Run 'terraform plan' to preview the creation of the EC2 instance.",
        hint: "Type 'terraform plan' in the terminal.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("aws_instance") && main.includes("t3.micro");
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform apply' to provision the web server, then inspect the generated state.",
        hint: "Type 'terraform apply' in the terminal.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "aws_instance");
        }
      }
    ],
    starterFiles: {
      "main.tf": `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "Primary-Web-Server"
    Environment = "Dev"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "Primary-Web-Server"
    Environment = "Dev"
  }
}
`
    },
    solutionExplanation:
      "The 4-step workflow is the cornerstone of IaC: `init` prepares your environment, `plan` prevents surprises, `apply` commits the cloud mutation, and `destroy` tears down."
  },
  {
    id: "lab-3-variables-locals",
    level: 2,
    title: "3. Input Variables & Locals",
    subtitle: "Parameterize code with variables.tf, defaults, validation & local values",
    difficulty: "Beginner",
    estimatedMinutes: 10,
    xp: 200,
    category: "Variables & State",
    iconName: "Sliders",
    architectureDiagramType: "ec2_web",
    scenario:
      "Hardcoded values are dangerous in production! Refactor the infrastructure to use customizable input variables and computed local values for standardized resource naming.",
    visualGoal: "Extract hardcoded instance types and environment names into variables.tf and create a computed local name tag.",
    conceptTakeaway: [
      "Input variables (var.<name>) let you customize infrastructure without altering the core configuration.",
      "Local values (local.<name>) hold intermediate expressions and computed strings to keep code DRY.",
      "Variable types include string, number, bool, list(string), and map(string)."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Define an input variable 'environment' in 'variables.tf' with default 'staging'.",
        hint: "In variables.tf: variable \"environment\" { type = string, default = \"staging\" }",
        validationCheck: (codeMap) => {
          const v = codeMap["variables.tf"] || "";
          return v.includes('variable "environment"') && (v.includes("staging") || v.includes("default"));
        }
      },
      {
        id: "task-2",
        description: "Create a 'locals' block in 'main.tf' computing 'server_name' using var.environment.",
        hint: "Add: locals { server_name = \"app-web-\${var.environment}\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("locals") && (main.includes("server_name") || main.includes("var.environment"));
        }
      },
      {
        id: "task-3",
        description: "Use 'local.server_name' in the EC2 instance Name tag, then run 'terraform plan'.",
        hint: "Set Name = local.server_name inside tags.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("local.server_name");
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# TODO: Add locals block here

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = {
    # TODO: Replace with local.server_name
    Name = "app-web-hardcoded"
  }
}
`,
      "variables.tf": `# TODO: Declare variable "environment" and "instance_type"
variable "instance_type" {
  type        = string
  description = "EC2 instance size"
  default     = "t3.micro"
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

locals {
  server_name = "app-web-\${var.environment}"
  common_tags = {
    Project     = "CloudPortal"
    Environment = var.environment
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = merge(local.common_tags, {
    Name = local.server_name
  })
}
`,
      "variables.tf": `variable "instance_type" {
  type        = string
  description = "EC2 instance size"
  default     = "t3.micro"
}

variable "environment" {
  type        = string
  description = "Target deployment environment"
  default     = "staging"
}
`
    },
    solutionExplanation:
      "By separating variables into `variables.tf` and leveraging `locals`, we can spin up identical infrastructure across staging and production without duplicating HCL code."
  },
  {
    id: "lab-4-networking-dependencies",
    level: 3,
    title: "4. Cloud Networking & Resource Graphs",
    subtitle: "Build a VPC, Subnet, and Security Group with implicit dependency wiring",
    difficulty: "Intermediate",
    estimatedMinutes: 12,
    xp: 250,
    category: "Networking & Graph",
    iconName: "Network",
    architectureDiagramType: "vpc_network",
    scenario:
      "You are designing a secure network boundary in AWS. You must construct a Virtual Private Cloud (VPC), create an isolated public subnet, configure a Security Group allowing port 80/443 traffic, and launch an EC2 instance linked inside.",
    visualGoal: "Observe how Terraform builds a Directed Acyclic Graph (DAG) to automatically resolve dependency order (VPC -> Subnet -> EC2).",
    conceptTakeaway: [
      "Implicit Dependencies: When you pass aws_vpc.main.id into aws_subnet.public.vpc_id, Terraform knows the VPC MUST be created first.",
      "Explicit Dependencies: depends_on = [aws_internet_gateway.gw] forces order when references aren't directly passed.",
      "Terraform provisions independent resources in parallel to maximize deployment speed."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare an 'aws_vpc' named 'main' with cidr_block '10.0.0.0/16'.",
        hint: "resource \"aws_vpc\" \"main\" { cidr_block = \"10.0.0.0/16\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes('resource "aws_vpc" "main"') && main.includes("10.0.0.0/16");
        }
      },
      {
        id: "task-2",
        description: "Create an 'aws_subnet' named 'public' referencing 'aws_vpc.main.id'.",
        hint: "resource \"aws_subnet\" \"public\" { vpc_id = aws_vpc.main.id, cidr_block = \"10.0.1.0/24\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes('resource "aws_subnet" "public"') && main.includes("aws_vpc.main.id");
        }
      },
      {
        id: "task-3",
        description: "Attach the subnet to the 'aws_instance' using 'subnet_id = aws_subnet.public.id' and run 'terraform apply'.",
        hint: "In aws_instance.web, add subnet_id = aws_subnet.public.id",
        validationCheck: (_codeMap, state) => {
          const hasVpc = state.resources.some((r) => r.type === "aws_vpc");
          const hasSubnet = state.resources.some((r) => r.type === "aws_subnet");
          const hasInstance = state.resources.some((r) => r.type === "aws_instance");
          return hasVpc && hasSubnet && hasInstance;
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# 1. VPC Boundary
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "production-vpc"
  }
}

# TODO: 2. Declare aws_subnet "public" inside the VPC

# TODO: 3. Declare aws_security_group "web_sg"

# 4. Web Instance
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  # TODO: Connect subnet_id to aws_subnet.public.id

  tags = {
    Name = "web-production"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "production-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1a"
  }
}

resource "aws_security_group" "web_sg" {
  name        = "allow-http-traffic"
  description = "Allow inbound web traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "web-production"
  }
}
`
    },
    solutionExplanation:
      "Because `aws_subnet.public` refers to `aws_vpc.main.id` and `aws_instance.web` refers to `aws_subnet.public.id`, Terraform generates a DAG tree that guarantees VPC creation finishes before the subnet is attempted."
  },
  {
    id: "lab-5-outputs-sensitive",
    level: 4,
    title: "5. Outputs & Sensitive Data Handling",
    subtitle: "Export provisioned attributes and shield secrets with sensitive = true",
    difficulty: "Intermediate",
    estimatedMinutes: 10,
    xp: 250,
    category: "Variables & State",
    iconName: "Key",
    architectureDiagramType: "multi_tier_app",
    scenario:
      "Your CI/CD pipeline and frontend engineers need the public IP and database connection endpoint generated after apply, but credentials must remain redacted in CLI logs.",
    visualGoal: "Configure outputs.tf to export public IPs, bucket ARNs, and mark database passwords as sensitive.",
    conceptTakeaway: [
      "output blocks expose values to the CLI after apply, and allow root modules to consume child module data.",
      "sensitive = true hides values in 'terraform plan' and 'terraform apply' console outputs.",
      "Run 'terraform output' to view outputs at any time."
    ],
    tasks: [
      {
        id: "task-1",
        description: "In 'outputs.tf', define an output 'web_public_ip' exporting 'aws_instance.web.public_ip'.",
        hint: "output \"web_public_ip\" { value = aws_instance.web.public_ip }",
        validationCheck: (codeMap) => {
          const out = codeMap["outputs.tf"] || "";
          return out.includes('output "web_public_ip"') && out.includes("aws_instance.web.public_ip");
        }
      },
      {
        id: "task-2",
        description: "Add an output 'db_password' marked with 'sensitive = true'.",
        hint: "output \"db_password\" { value = var.db_password, sensitive = true }",
        validationCheck: (codeMap) => {
          const out = codeMap["outputs.tf"] || "";
          return out.includes('output "db_password"') && out.includes("sensitive = true");
        }
      },
      {
        id: "task-3",
        description: "Apply your code and verify the outputs displayed in the terminal.",
        hint: "Run 'terraform apply' then check the terminal output section.",
        validationCheck: (_codeMap, state) => {
          return Boolean(state.outputs["web_public_ip"]);
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "api-gateway"
  }
}
`,
      "variables.tf": `variable "db_password" {
  type      = string
  default   = "SuperSecretProdP@ss2026!"
  sensitive = true
}
`,
      "outputs.tf": `# TODO: Export web_public_ip and db_password
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
    Name = "api-gateway"
  }
}
`,
      "variables.tf": `variable "db_password" {
  type      = string
  default   = "SuperSecretProdP@ss2026!"
  sensitive = true
}
`,
      "outputs.tf": `output "web_public_ip" {
  description = "Public IP address of web instance"
  value       = aws_instance.web.public_ip
}

output "db_password" {
  description = "Administrator password for database"
  value       = var.db_password
  sensitive   = true
}
`
    },
    solutionExplanation:
      "Output values are written directly into `terraform.tfstate`. Setting `sensitive = true` prevents accidental leakage in console logs and pull request summaries."
  },
  {
    id: "lab-6-state-and-drift",
    level: 4,
    title: "6. State Management & Drift Detection",
    subtitle: "Understand terraform.tfstate, out-of-band changes, and drift remediation",
    difficulty: "Intermediate",
    estimatedMinutes: 12,
    xp: 300,
    category: "Variables & State",
    iconName: "ShieldAlert",
    architectureDiagramType: "ec2_web",
    scenario:
      "Disaster! A rogue engineer manually logged into the AWS console at 2 AM and changed an EC2 instance size from t3.micro to m5.large. Your state is out of sync with reality (Configuration Drift).",
    visualGoal: "Use the interactive Drift Injector to simulate a cloud drift, run 'terraform plan', and observe how Terraform detects the disparity and proposes remediation.",
    conceptTakeaway: [
      "Terraform state (terraform.tfstate) is the single source of truth mapping your code to real cloud IDs.",
      "Drift occurs when someone makes changes in the cloud console or API without Terraform.",
      "terraform plan checks real cloud state via API calls and plans updates to bring cloud back in line with code."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Run 'terraform apply' to provision the baseline infrastructure.",
        hint: "Run 'terraform apply' in the terminal.",
        validationCheck: (_codeMap, state) => state.resources.length > 0
      },
      {
        id: "task-2",
        description: "Click 'Inject Drift' in the State tab to simulate a manual cloud change.",
        hint: "Switch to the 'State & Drift' tab and click the 'Inject Cloud Drift' button.",
        validationCheck: () => true
      },
      {
        id: "task-3",
        description: "Run 'terraform plan' to see Terraform catch the drift and restore desired state.",
        hint: "Run 'terraform plan' in the terminal.",
        validationCheck: () => true
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "mission-critical-app"
    Environment = "Production"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "mission-critical-app"
    Environment = "Production"
  }
}
`
    },
    solutionExplanation:
      "Terraform is declarative: it enforces that reality matches your declared code. When cloud drift happens, running `terraform apply` overwrites the unauthorized out-of-band change back to `t3.micro`."
  },
  {
    id: "lab-7-count-and-for-each",
    level: 5,
    title: "7. Scaling with Count & For_Each",
    subtitle: "Scale infrastructure dynamically using lists, maps, and iteration meta-arguments",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    xp: 350,
    category: "Modules & Scale",
    iconName: "Copy",
    architectureDiagramType: "multi_tier_app",
    scenario:
      "Your company is expanding into 3 tiers: frontend, backend, and worker. Instead of copying-and-pasting 3 separate resource blocks, use 'for_each' over a map of configurations.",
    visualGoal: "Provision 3 specialized compute instances dynamically using a single 'for_each' meta-argument.",
    conceptTakeaway: [
      "count = 3 creates an indexed array of resources (aws_instance.server[0], [1], [2]).",
      "for_each = toset([...]) or for_each = var.servers creates key-addressed resources (aws_instance.server[\"frontend\"]).",
      "Prefer for_each over count for resources that might be added/removed from the middle of a list to avoid shifting indexes."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Define a map variable 'services' with keys 'frontend', 'backend', and 'worker'.",
        hint: "In variables.tf: variable \"services\" { type = map(string), default = { frontend = \"t3.small\", backend = \"t3.medium\", worker = \"t3.micro\" } }",
        validationCheck: (codeMap) => {
          const v = codeMap["variables.tf"] || "";
          return v.includes("frontend") && v.includes("backend");
        }
      },
      {
        id: "task-2",
        description: "Use 'for_each = var.services' inside 'aws_instance.service' and set 'instance_type = each.value'.",
        hint: "resource \"aws_instance\" \"service\" { for_each = var.services, instance_type = each.value, ... }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("for_each") && (main.includes("each.value") || main.includes("each.key"));
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform plan' and verify 3 distinct instances are planned for creation.",
        hint: "Run 'terraform plan' in the terminal.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("for_each");
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# TODO: Use for_each to dynamically create instances
resource "aws_instance" "service" {
  for_each = var.services

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = each.value

  tags = {
    Name = "service-\${each.key}"
    Role = each.key
  }
}
`,
      "variables.tf": `variable "services" {
  type = map(string)
  default = {
    frontend = "t3.small"
    backend  = "t3.medium"
    worker   = "t3.micro"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "service" {
  for_each = var.services

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = each.value

  tags = {
    Name = "service-\${each.key}"
    Role = each.key
  }
}
`,
      "variables.tf": `variable "services" {
  type = map(string)
  default = {
    frontend = "t3.small"
    backend  = "t3.medium"
    worker   = "t3.micro"
  }
}
`
    },
    solutionExplanation:
      "Using `for_each` produces distinct resource addresses like `aws_instance.service[\"frontend\"]`. If the worker service is later deleted, only the worker is destroyed without disturbing frontend or backend."
  },
  {
    id: "lab-8-modular-architecture",
    level: 6,
    title: "8. Terraform Modules & Reusability",
    subtitle: "Package complex VPC & Compute setups into reusable child modules",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    xp: 400,
    category: "Modules & Scale",
    iconName: "FolderKanban",
    architectureDiagramType: "modular_cloud",
    scenario:
      "Monolithic .tf files become unmaintainable as organizations grow. Modularize your VPC and Web Server into separate `./modules/vpc` and `./modules/webserver` packages.",
    visualGoal: "Wire a root module calling child modules with inputs and outputs.",
    conceptTakeaway: [
      "Root Module: The working directory where you execute 'terraform apply'.",
      "Child Module: A reusable folder containing its own main.tf, variables.tf, and outputs.tf.",
      "Call modules with: module \"my_vpc\" { source = \"./modules/vpc\", cidr = \"10.0.0.0/16\" }",
      "Access module outputs via: module.my_vpc.vpc_id."
    ],
    tasks: [
      {
        id: "task-1",
        description: "In 'main.tf', instantiate the VPC module with 'source = \"./modules/vpc\"'.",
        hint: "module \"vpc\" { source = \"./modules/vpc\", vpc_cidr = \"10.0.0.0/16\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes('module "vpc"') && main.includes("./modules/vpc");
        }
      },
      {
        id: "task-2",
        description: "Pass 'module.vpc.subnet_id' into the web server module.",
        hint: "module \"web\" { source = \"./modules/webserver\", subnet_id = module.vpc.subnet_id }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("module.vpc.subnet_id");
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform init' followed by 'terraform apply'.",
        hint: "Run 'terraform init' then 'terraform apply'.",
        validationCheck: (_codeMap, state) => state.resources.length >= 2
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# 1. Instantiate VPC Module
module "vpc" {
  source   = "./modules/vpc"
  vpc_cidr = "10.0.0.0/16"
}

# TODO: 2. Instantiate Webserver Module passing module.vpc.subnet_id
module "web" {
  source    = "./modules/webserver"
  subnet_id = module.vpc.subnet_id
}
`,
      "modules/vpc/main.tf": `variable "vpc_cidr" {
  type = string
}

resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  tags = {
    Name = "modular-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.this.id
  cidr_block = "10.0.1.0/24"
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "subnet_id" {
  value = aws_subnet.public.id
}
`,
      "modules/webserver/main.tf": `variable "subnet_id" {
  type = string
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = var.subnet_id

  tags = {
    Name = "modular-web"
  }
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source   = "./modules/vpc"
  vpc_cidr = "10.0.0.0/16"
}

module "web" {
  source    = "./modules/webserver"
  subnet_id = module.vpc.subnet_id
}
`,
      "modules/vpc/main.tf": `variable "vpc_cidr" {
  type = string
}

resource "aws_vpc" "this" {
  cidr_block = var.vpc_cidr
  tags = {
    Name = "modular-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.this.id
  cidr_block = "10.0.1.0/24"
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "subnet_id" {
  value = aws_subnet.public.id
}
`,
      "modules/webserver/main.tf": `variable "subnet_id" {
  type = string
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = var.subnet_id

  tags = {
    Name = "modular-web"
  }
}
`
    },
    solutionExplanation:
      "Modules encapsulate infrastructure patterns into reusable building blocks that can be shared across teams via Git repositories or the Terraform Registry."
  },
  {
    id: "lab-9-remote-state-locking",
    level: 6,
    title: "9. Remote State & S3 State Locking",
    subtitle: "Protect team concurrency with S3 remote backends & DynamoDB state locks",
    difficulty: "Advanced",
    estimatedMinutes: 12,
    xp: 400,
    category: "Variables & State",
    iconName: "Lock",
    architectureDiagramType: "s3_single",
    scenario:
      "When multiple engineers run Terraform simultaneously, local state files collide and cause catastrophic corruption. Configure a remote S3 backend with DynamoDB locking.",
    visualGoal: "Add a backend \"s3\" configuration with bucket, key, and dynamodb_table locking.",
    conceptTakeaway: [
      "Remote Backends store terraform.tfstate in cloud storage (S3, GCS, Terraform Cloud).",
      "State Locking prevents concurrent executions from corrupting the state file.",
      "Sensitive output stored in remote state is encrypted at rest in S3."
    ],
    tasks: [
      {
        id: "task-1",
        description: "In the 'terraform' block, configure 'backend \"s3\"' with bucket 'company-tf-state-prod'.",
        hint: "terraform { backend \"s3\" { bucket = \"company-tf-state-prod\", key = \"prod/app.tfstate\", region = \"us-east-1\", dynamodb_table = \"tf-locks\" } }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes('backend "s3"') && main.includes("company-tf-state-prod");
        }
      },
      {
        id: "task-2",
        description: "Specify 'dynamodb_table = \"terraform-state-lock\"' to enable concurrency locking.",
        hint: "Add dynamodb_table = \"terraform-state-lock\" inside backend \"s3\"",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("dynamodb_table") || main.includes("terraform-state-lock");
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform init' to migrate local state to the simulated remote S3 backend.",
        hint: "Type 'terraform init' in the terminal.",
        validationCheck: () => true
      }
    ],
    starterFiles: {
      "main.tf": `terraform {
  required_version = ">= 1.5.0"

  # TODO: Configure backend "s3" here
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "app_data" {
  bucket = "prod-customer-documents-2026"
}
`
    },
    solutionFiles: {
      "main.tf": `terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "company-tf-state-prod"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "app_data" {
  bucket = "prod-customer-documents-2026"
}
`
    },
    solutionExplanation:
      "With S3 + DynamoDB backend configured, every `plan` and `apply` acquires a lock entry in DynamoDB, ensuring zero race conditions between team members."
  },
  {
    id: "lab-10-production-hero",
    level: 7,
    title: "10. Hero: Multi-Tier HA Production Architecture",
    subtitle: "Assemble a full-scale VPC, Public/Private Subnets, ALB, AutoScaling & RDS",
    difficulty: "Hero",
    estimatedMinutes: 20,
    xp: 500,
    category: "Production Arch",
    iconName: "Award",
    architectureDiagramType: "ha_production",
    scenario:
      "Final Hero Challenge: You are the Lead Cloud Architect. Build a highly available, multi-tier enterprise cloud infrastructure containing a custom VPC, Public Subnets for Application Load Balancers, Private Subnets for Web Servers, and an isolated Database Subnet for PostgreSQL RDS!",
    visualGoal: "Create the complete multi-tier enterprise architecture and watch the live visual canvas render every tier and connection link.",
    conceptTakeaway: [
      "Public subnets host Internet Gateways and Load Balancers.",
      "Private subnets host compute nodes protected from direct internet ingress.",
      "Database tier resides in isolated subnets accessible only by the application security group.",
      "Congratulations on completing the 0-to-Hero Terraform path!"
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare the core VPC and both public and private subnets.",
        hint: "Check main.tf for aws_vpc, aws_subnet.public, and aws_subnet.private.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("aws_vpc") && main.includes("aws_subnet");
        }
      },
      {
        id: "task-2",
        description: "Configure the Application Load Balancer 'aws_lb' and RDS database 'aws_db_instance'.",
        hint: "Ensure aws_lb.app_alb and aws_db_instance.postgres are declared.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return (main.includes("aws_lb") || main.includes("aws_alb")) && (main.includes("aws_db_instance") || main.includes("aws_rds"));
        }
      },
      {
        id: "task-3",
        description: "Execute 'terraform apply' to provision the complete enterprise cloud topology.",
        hint: "Type 'terraform apply' in the terminal.",
        validationCheck: (_codeMap, state) => {
          return state.resources.length >= 3;
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# 1. Enterprise VPC
resource "aws_vpc" "prod" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "enterprise-prod-vpc" }
}

# 2. Public Subnet for Load Balancer
resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.prod.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "public-alb-subnet" }
}

# 3. Private Subnet for Application
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.prod.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "private-app-subnet" }
}

# 4. Web Compute Instance
resource "aws_instance" "app_cluster" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.private_1.id
  tags = { Name = "prod-app-server" }
}

# TODO: 5. Declare aws_lb "app_alb"
# TODO: 6. Declare aws_db_instance "postgres"
`,
      "outputs.tf": `output "vpc_id" {
  value = aws_vpc.prod.id
}
`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# 1. Enterprise VPC
resource "aws_vpc" "prod" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "enterprise-prod-vpc" }
}

# 2. Public Subnet for Load Balancer
resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.prod.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "public-alb-subnet" }
}

# 3. Private Subnet for Application
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.prod.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "private-app-subnet" }
}

# 4. Security Group for Web Layer
resource "aws_security_group" "web_sg" {
  name   = "alb-security-group"
  vpc_id = aws_vpc.prod.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 5. Application Load Balancer
resource "aws_lb" "app_alb" {
  name               = "prod-application-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web_sg.id]
  subnets            = [aws_subnet.public_1.id]
}

# 6. Web Compute Instance
resource "aws_instance" "app_cluster" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.private_1.id
  tags = { Name = "prod-app-server" }
}

# 7. Isolated Database Instance
resource "aws_db_instance" "postgres" {
  allocated_storage   = 50
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.t3.medium"
  db_name             = "productiondb"
  username            = "dbadmin"
  password            = "SuperSecurePass2026!"
  skip_final_snapshot = true
}
`,
      "outputs.tf": `output "alb_dns_name" {
  description = "Public URL of Application Load Balancer"
  value       = aws_lb.app_alb.id
}

output "db_endpoint" {
  description = "Database connection host"
  value       = aws_db_instance.postgres.id
  sensitive   = true
}
`
    },
    solutionExplanation:
      "Congratulations! You have mastered the full Terraform journey: from single storage resources to multi-tier resilient cloud architectures with automated dependency resolution, state locking, and secure credential handling."
  }
];
