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
    visualGoal: "Create an AWS S3 Bucket named 'prod-analytics-storage-corp' with tags: Environment = 'Production' and ManagedBy = 'Terraform'.",
    conceptTakeaway: [
      "Every resource block follows the format: resource \"<TYPE>\" \"<LOCAL_NAME>\" { ... } — e.g. resource \"aws_s3_bucket\" \"analytics_bucket\" { ... }",
      "The <TYPE> (e.g. aws_s3_bucket) tells Terraform what kind of cloud resource to provision.",
      "The <LOCAL_NAME> (e.g. analytics_bucket) is your own label for this resource — you use it to reference the resource in other parts of your code."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Define an 'aws' provider block with region 'us-east-1'.",
        hint: "Add: provider \"aws\" { region = \"us-east-1\" }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const hasProvider = /provider\s+"aws"/.test(main);
          const hasRegion = main.includes("us-east-1");
          return hasProvider && hasRegion;
        }
      },
      {
        id: "task-2",
        description: "Declare a resource of type 'aws_s3_bucket' with local name 'analytics_bucket' and set bucket = 'prod-analytics-storage-corp'.",
        hint: "Add: resource \"aws_s3_bucket\" \"analytics_bucket\" { bucket = \"prod-analytics-storage-corp\" }",
        validationCheck: (codeMap) => {
          // Use regex with flexible whitespace to tolerate extra spaces inside
          // or around quoted strings (e.g. "aws_s3_bucket " with trailing space)
          const main = codeMap["main.tf"] || "";
          const hasResource = /resource\s+"aws_s3_bucket\s*"\s*"analytics_bucket"/.test(main);
          const hasBucket = main.includes("prod-analytics-storage-corp");
          return hasResource && hasBucket;
        }
      },
      {
        id: "task-3",
        description: "Add a tags block with Environment = 'Production' and ManagedBy = 'Terraform'.",
        hint: "Inside the resource, add: tags = { Environment = \"Production\" ManagedBy = \"Terraform\" }\nTag keys are case-sensitive in AWS — exactly Environment and ManagedBy (capital first letters), not environment / managedBy.",
        validationCheck: (codeMap) => {
          const main = (codeMap["main.tf"] || "").replace(/\s+/g, " ");
          const hasTagsBlock = /\btags\s*=\s*\{/.test(main);
          // Tag keys are case-sensitive in AWS: require the exact keys from the task.
          const hasEnvTag = /\bEnvironment\s*=\s*"Production"/.test(main);
          const hasManagedBy = /\bManagedBy\s*=\s*"Terraform"/.test(main);
          return hasTagsBlock && hasEnvTag && hasManagedBy;
        }
      },
      {
        id: "task-4",
        description: "Run 'terraform plan' and 'terraform apply' to provision your bucket.",
        hint: "Open the terminal and run 'terraform plan', then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "aws_s3_bucket" && r.name === "analytics_bucket");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 1: Your First Cloud Resource
# TODO Task 1: Configure the AWS provider (region us-east-1)
# TODO Task 2: Declare the aws_s3_bucket resource below
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
    lesson: "Variables & State",
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
      "A new project needs an EC2 web server. Your job is to write the Terraform code from scratch, run the core workflow commands, add tags, update the resource, and finally decommission it.",
    visualGoal: "Write HCL code yourself, then run init -> plan -> apply -> destroy. See how each command transforms your code into cloud infrastructure.",
    conceptTakeaway: [
      "terraform init: Downloads required provider plugins (like hashicorp/aws).",
      "terraform plan: Compares desired code state with current cloud state and shows the execution plan (+ add, ~ change, - destroy).",
      "terraform apply: Executes the plan and updates the terraform.tfstate state file.",
      "terraform destroy: Gracefully removes all tracked resources."
    ],
    tasks: [
      {
        id: "task-1",
        description: "In main.tf, write the AWS provider block. Set the region to us-east-1.",
        hint: "Type this in the editor:\nprovider \"aws\" {\n  region = \"us-east-1\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /provider\s+"aws"\s*\{[^}]*region\s*=\s*"us-east-1"/s.test(main);
        }
      },
      {
        id: "task-2",
        description: "In main.tf, write an EC2 resource block. Use the resource type aws_instance with local name web_server. Set the AMI ID to ami-0c55b159cbfafe1f0 and the instance type to t3.micro.",
        hint: "Add this resource block (copy the AMI ID carefully — it's ami-0c55b159cbfafe1f0):\nresource \"aws_instance\" \"web_server\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t3.micro\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const hasResource = /resource\s+"aws_instance"\s+"web_server"\s*\{/.test(main);
          const hasAmi = /ami\s*=\s*"ami-[a-z0-9]+"/.test(main);
          const hasInstanceType = /instance_type\s*=\s*"t3\.micro"/.test(main);
          return hasResource && hasAmi && hasInstanceType;
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform plan' in the terminal to preview what will be created. (Checklist task — completes once your code from Task 2 is valid.)",
        hint: "Type 'terraform plan' in the terminal. You should see a + create action for aws_instance.web_server.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_instance"\s+"web_server"\s*\{/.test(main);
        }
      },
      {
        id: "task-4",
        description: "Run 'terraform apply' to provision the EC2 instance.",
        hint: "Type 'terraform apply' in the terminal to create the resource in the cloud.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "aws_instance" && r.name === "web_server");
        }
      },
      {
        id: "task-5",
        description: "Add tags to your EC2 instance. Inside the resource block, add a tags block with Name set to Primary-Web-Server and Environment set to Dev.",
        hint: "Add a tags block inside the resource:\n  tags = {\n    Name        = \"Primary-Web-Server\"\n    Environment = \"Dev\"\n  }\nTag keys are case-sensitive in AWS: it must be exactly Name (capital N), not name.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /\bName\s*=\s*"Primary-Web-Server"/.test(main) && /\bEnvironment\s*=\s*"Dev"/.test(main);
        }
      },
      {
        id: "task-6",
        description: "Run 'terraform apply' again to apply the tag update to the running instance.",
        hint: "Type 'terraform apply' again. Terraform will detect the new tags and update the existing instance in-place. Stuck grey? Tag keys are case-sensitive — the key must be exactly Name (capital N), matching the task wording.",
        validationCheck: (_codeMap, state) => {
          const res = state.resources.find((r) => r.type === "aws_instance" && r.name === "web_server");
          if (!res) return false;
          const attrs = res.instances[0]?.attributes || {};
          return attrs.Name === "Primary-Web-Server" || attrs.tags?.Name === "Primary-Web-Server";
        }
      },
      {
        id: "task-7",
        description: "Run 'terraform destroy' to decommission all resources and clean up.",
        hint: "Type 'terraform destroy' in the terminal. This removes all managed infrastructure.",
        validationCheck: (codeMap, state) => {
          const main = codeMap["main.tf"] || "";
          return state.resources.length === 0 && /resource\s+"aws_instance"\s+"web_server"\s*\{/.test(main);
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Write your Terraform code here.
# Task 1: Add the AWS provider block
# Task 2: Add the aws_instance resource block

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
    lesson: "Variables & State",
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
        description: "Configure the provider block for AWS in the eu-west-1 (Ireland) region — this lab's stack lives in Europe.",
        hint: "A provider block pins the region:\nprovider \"aws\" {\n  region = \"eu-west-1\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /provider\s+"aws"\s*\{[^}]*region\s*=\s*"eu-west-1"/s.test(main);
        }
      },
      {
        id: "task-2",
        description: "In 'variables.tf', declare an input variable 'instance_type' of type string with default 't3.micro'.",
        hint: "In variables.tf:\nvariable \"instance_type\" {\n  type    = string\n  default = \"t3.micro\"\n}",
        validationCheck: (codeMap) => {
          const v = codeMap["variables.tf"] || "";
          return v.includes('variable "instance_type"') && v.includes("t3.micro");
        }
      },
      {
        id: "task-3",
        description: "In 'variables.tf', declare an input variable 'environment' of type string with default 'staging'.",
        hint: "In variables.tf:\nvariable \"environment\" {\n  type    = string\n  default = \"staging\"\n}",
        validationCheck: (codeMap) => {
          const v = codeMap["variables.tf"] || "";
          return v.includes('variable "environment"') && v.includes("staging");
        }
      },
      {
        id: "task-4",
        description: "In 'main.tf', add a 'locals' block that computes 'server_name' = \"app-web-${var.environment}\".",
        hint: "Add a locals block:\nlocals {\n  server_name = \"app-web-${var.environment}\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return main.includes("locals") && main.includes("server_name") && main.includes("var.environment");
        }
      },
      {
        id: "task-5",
        description: "In 'main.tf', declare an aws_instance 'app' and use 'local.server_name' as its Name tag. Include an ami (use \"ami-0c55b159cbfafe1f0\") so the resource is complete.",
        hint: "Create the resource with a tags block (the ami ID comes from Lab 1's instance — reuse it):\nresource \"aws_instance\" \"app\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = var.instance_type\n  tags = {\n    Name = local.server_name\n  }\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_instance"\s+"app"\s*\{/s.test(main) && main.includes("local.server_name");
        }
      },
      {
        id: "task-6",
        description: "In the aws_instance 'app' resource, use the variable you declared (var.instance_type) instead of a hardcoded value for the instance type.",
        hint: "Inside the resource block add:\n  instance_type = var.instance_type",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /instance_type\s*=\s*var\.instance_type/.test(main);
        }
      },
      {
        id: "task-7",
        description: "Run 'terraform plan' in the terminal to validate your configuration. (Checklist task — completes once the variable-driven config is in place.)",
        hint: "Type 'terraform plan' in the terminal. Terraform will parse main.tf and variables.tf and show the planned changes.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_instance"\s+"app"\s*\{/s.test(main) && /instance_type\s*=\s*var\.instance_type/.test(main);
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 2.2: Input Variables & Locals
# TODO Task 1: Configure the AWS provider (region eu-west-1)
# TODO Task 4: Add a locals block computing the server name
# TODO Task 5 & 6: Declare the aws_instance "app" resource

`,
      "variables.tf": `# Lab 2.2: Input Variables
# TODO Task 2: Declare the instance type variable (default t3.micro)
# TODO Task 3: Declare the environment variable (default staging)

`
    },
    solutionFiles: {
      "main.tf": `provider "aws" {
  region = "eu-west-1"
}

locals {
  server_name = "app-web-\${var.environment}"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = {
    Name = local.server_name
  }
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
      "Variables let you parameterize infrastructure (var.instance_type, var.environment) so the same code works across environments, while locals compute derived values like local.server_name once and reuse them. Together they keep configuration DRY and customizable without editing core resource blocks."
  },
  {
    id: "lab-4-networking-dependencies",
    lesson: "Variables & State",
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
        description: "In main.tf, write the AWS provider block. Set the region to us-east-1.",
        hint: "Type this in the editor:\nprovider \"aws\" {\n  region = \"us-east-1\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /provider\s+"aws"\s*\{[^}]*region\s*=\s*"us-east-1"/s.test(main);
        }
      },
      {
        id: "task-2",
        description: "Declare an 'aws_vpc' named 'main' with cidr_block '10.0.0.0/16'.",
        hint: "Add a resource block:\nresource \"aws_vpc\" \"main\" {\n  cidr_block = \"10.0.0.0/16\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const vpcBlock = main.match(/resource\s+"aws_vpc"\s+"main"\s*\{([\s\S]*?)\n\}/);
          return !!vpcBlock && /cidr_block\s*=\s*"10\.0\.0\.0\/16"/.test(vpcBlock[1]);
        }
      },
      {
        id: "task-3",
        description: "Create an 'aws_subnet' named 'public' referencing 'aws_vpc.main.id' with cidr_block '10.0.1.0/24'.",
        hint: "Add a resource block that wires the subnet to the VPC:\nresource \"aws_subnet\" \"public\" {\n  vpc_id     = aws_vpc.main.id\n  cidr_block = \"10.0.1.0/24\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const subBlock = main.match(/resource\s+"aws_subnet"\s+"public"\s*\{([\s\S]*?)\n\}/);
          return !!subBlock &&
                 /vpc_id\s*=\s*aws_vpc\.main\.id/.test(subBlock[1]) &&
                 /cidr_block\s*=\s*"10\.0\.1\.0\/24"/.test(subBlock[1]);
        }
      },
      {
        id: "task-4",
        description: "Create a separate 'aws_security_group' resource named 'web_sg' that BELONGS to the VPC (set vpc_id = aws_vpc.main.id) and allows inbound traffic on ports 80 and 443.",
        hint: "\"Inside the VPC\" means REFERENCED, not nested: write the security group as its own separate top-level resource block, and point its vpc_id at the VPC (Terraform never nests resource blocks inside each other). Add two ingress blocks (one for port 80, one for port 443):\nresource \"aws_security_group\" \"web_sg\" {\n  name   = \"allow-web-traffic\"\n  vpc_id = aws_vpc.main.id\n\n  ingress {\n    from_port   = 80\n    to_port     = 80\n    protocol    = \"tcp\"\n    cidr_blocks = [\"0.0.0.0/0\"]\n  }\n\n  ingress {\n    from_port   = 443\n    to_port     = 443\n    protocol    = \"tcp\"\n    cidr_blocks = [\"0.0.0.0/0\"]\n  }\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const flat = main.replace(/\s+/g, " ");
          return /resource\s+"aws_security_group"\s+"web_sg"\s*\{/s.test(main) &&
                 flat.includes("aws_vpc.main.id") &&
                 /\bingress\b/.test(main) &&
                 main.includes("80") &&
                 main.includes("443");
        }
      },
      {
        id: "task-5",
        description: "Declare an aws_instance named 'web'. Connect it to your subnet and security group by referencing their IDs. Set the AMI to ami-0c55b159cbfafe1f0 and instance type to t3.micro.",
        hint: "Add an EC2 instance wired into your subnet and security group:\nresource \"aws_instance\" \"web\" {\n  ami                    = \"ami-0c55b159cbfafe1f0\"\n  instance_type          = \"t3.micro\"\n  subnet_id              = aws_subnet.public.id\n  vpc_security_group_ids = [aws_security_group.web_sg.id]\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_instance"\s+"web"\s*\{/s.test(main) &&
                 main.includes("aws_subnet.public.id") &&
                 main.includes("aws_security_group.web_sg.id");
        }
      },
      {
        id: "task-6",
        description: "Run 'terraform plan' in the terminal to preview the resource graph Terraform will build. (Checklist task — completes once all four resources are declared in main.tf.)",
        hint: "Type 'terraform plan' in the terminal. You should see a + create action for aws_vpc.main, aws_subnet.public, aws_security_group.web_sg, and aws_instance.web — notice Terraform orders them by dependency.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_vpc"\s+"main"/.test(main) &&
                 /resource\s+"aws_subnet"\s+"public"/.test(main) &&
                 /resource\s+"aws_security_group"\s+"web_sg"/.test(main) &&
                 /resource\s+"aws_instance"\s+"web"/.test(main);
        }
      },
      {
        id: "task-7",
        description: "Run 'terraform apply' to provision the entire network stack.",
        hint: "Type 'terraform apply' in the terminal. Terraform will create the VPC first, then the subnet and security group in parallel, and finally the EC2 instance.",
        validationCheck: (_codeMap, state) => {
          const hasVpc = state.resources.some((r) => r.type === "aws_vpc");
          const hasSubnet = state.resources.some((r) => r.type === "aws_subnet");
          const hasSg = state.resources.some((r) => r.type === "aws_security_group");
          const hasInstance = state.resources.some((r) => r.type === "aws_instance");
          return hasVpc && hasSubnet && hasSg && hasInstance;
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 2.3: Cloud Networking & Resource Graphs
# Build a VPC, Subnet, Security Group, and EC2 instance from scratch.

# Task 1: Add the AWS provider block (region = "us-east-1")

# Task 2: Add aws_vpc "main" with cidr_block = "10.0.0.0/16"

# Task 3: Add aws_subnet "public" referencing aws_vpc.main.id, cidr_block = "10.0.1.0/24"

# Task 4: Add aws_security_group "web_sg" allowing inbound ports 80 and 443

# Task 5: Add aws_instance "web" referencing aws_subnet.public.id and the security group

# Task 6: Run terraform plan
# Task 7: Run terraform apply
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
  name        = "allow-web-traffic"
  description = "Allow inbound HTTP and HTTPS traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
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
      "You built a four-resource network stack entirely by hand. Because `aws_subnet.public` references `aws_vpc.main.id`, the security group references the same VPC, and `aws_instance.web` references both `aws_subnet.public.id` and `aws_security_group.web_sg.id`, Terraform constructs a Directed Acyclic Graph (DAG) from these implicit dependencies. The graph guarantees the VPC is created first, the subnet and security group are created in parallel once the VPC exists, and the EC2 instance is created last — exactly the dependency order you saw in `terraform plan`."
  },
  {
    id: "lab-5-outputs-sensitive",
    lesson: "Variables & State",
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
          const blockMatch = out.match(/output\s+"web_public_ip"\s*\{([\s\S]*?)\n\}/);
          if (!blockMatch) return false;
          return /^\s*value\s*=/m.test(blockMatch[1]) && blockMatch[1].includes("aws_instance.web.public_ip");
        }
      },
      {
        id: "task-2",
        description: "Add an output 'db_password' marked with 'sensitive = true'.",
        hint: "output \"db_password\" { value = var.db_password, sensitive = true }",
        validationCheck: (codeMap) => {
          const out = codeMap["outputs.tf"] || "";
          const blockMatch = out.match(/output\s+"db_password"\s*\{([\s\S]*?)\n\}/);
          if (!blockMatch) return false;
          return /sensitive\s*=\s*true/.test(blockMatch[1]) && /^\s*value\s*=/m.test(blockMatch[1]);
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
      "Disaster! A rogue engineer manually logged into the AWS console at 2 AM and changed an EC2 instance size from t3.micro to m5.large. Your state is out of sync with reality (Configuration Drift). Your team also decided to officially upgrade the instance to t3.small — you need to apply that change and reconcile the drift.",
    visualGoal: "Inject drift via the State tab, run terraform plan to see it detected, then edit your HCL code to upgrade the instance type and run terraform apply to fix everything.",
    conceptTakeaway: [
      "Terraform state (terraform.tfstate) is the single source of truth mapping your code to real cloud IDs.",
      "Drift occurs when someone makes changes in the cloud console or API without Terraform.",
      "terraform plan checks real cloud state via API calls and plans updates to bring cloud back in line with code.",
      "The proper workflow is: edit code -> terraform plan -> terraform apply. Plan shows you what will change, apply makes it happen."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Run 'terraform apply' to provision the baseline EC2 instance with instance_type = t3.micro.",
        hint: "Run 'terraform apply' with the starter configuration — it should create aws_instance.app with its t3.micro size.",
        validationCheck: (_codeMap, state) => state.resources.some((r) => r.type === "aws_instance" && r.instances[0]?.attributes?.instance_type === "t3.micro")
      },
      {
        id: "task-2",
        description: "Switch to the 'State' tab (right panel), click the 'Drift Simulator & Lab' sub-tab, then click 'Simulate Console Resize -> m5.2xlarge' to inject drift.",
        hint: "In the right panel, click the 'State' tab, then click 'Drift Simulator & Lab', then click the red 'Simulate Console Resize' button.",
        validationCheck: (_codeMap, state) => state.resources.some((r) => r.type === "aws_instance" && r.instances[0]?.attributes?.instance_type === "m5.2xlarge")
      },
      {
        id: "task-3",
        description: "Run 'terraform plan' in the terminal while the drift is active and confirm the '~' symbol shows instance_type differs from your code. (Checklist task — completes once the drift you injected in Task 2 is still present in state.)",
        hint: "Type 'terraform plan' in the terminal. Look for the '~' symbol showing instance_type has drifted.",
        validationCheck: (_codeMap, state) => state.resources.some((r) => r.type === "aws_instance" && r.instances[0]?.attributes?.instance_type === "m5.2xlarge")
      },
      {
        id: "task-4",
        description: "Your team decided to officially upgrade the instance. In main.tf, change instance_type from 't3.micro' to 't3.small', then run 'terraform apply' to make the change and reconcile the drift.",
        hint: "In the code editor, change instance_type = \"t3.micro\" to instance_type = \"t3.small\". Then run 'terraform apply' in the terminal.",
        validationCheck: (codeMap, state) => {
          const main = codeMap["main.tf"] || "";
          const codeHasT3Small = /instance_type\s*=\s*"t3\.small"/.test(main);
          const stateHasT3Small = state.resources.some((r) => r.type === "aws_instance" && r.instances[0]?.attributes?.instance_type === "t3.small");
          return codeHasT3Small && stateHasT3Small;
        }
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
  instance_type = "t3.small"

  tags = {
    Name        = "mission-critical-app"
    Environment = "Production"
  }
}
`
    },
    solutionExplanation:
      "Terraform is declarative: it enforces that reality matches your declared code. When cloud drift happens (rogue console change to m5.2xlarge), running 'terraform plan' detects the difference. Then you edit your code to the officially desired size (t3.small) and run 'terraform apply' — Terraform overwrites the unauthorized drift and applies your official upgrade in one step. The proper workflow is always: edit code -> plan -> apply."
  },
  {
    id: "lab-7-count-and-for-each",
    lesson: "Modules & Scale",
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
        hint: "The three tiers are map KEYS; each key maps to that tier's instance size:\n\nvariable \"services\" {\n  type = map(string)\n  default = {\n    frontend = \"t3.small\"\n    backend  = \"t3.medium\"\n    worker   = \"t3.micro\"\n  }\n}\n\nOne line per tier — the key name (frontend/backend/worker) is up to the map, the value is that tier's instance type.",
        validationCheck: (codeMap) => {
          const v = codeMap["variables.tf"] || "";
          return /variable\s+"services"/.test(v) && /type\s*=\s*map\s*\(\s*string\s*\)/.test(v) &&
                 v.includes("frontend") && v.includes("backend") && v.includes("worker");
        }
      },
      {
        id: "task-2",
        description: "Use the for_each meta-argument to iterate over the 'services' variable you just defined. Each instance should use the iteration value as its instance type.",
        hint: "One resource block iterates the whole map — each key becomes its own instance:\n\nresource \"aws_instance\" \"service\" {\n  for_each      = var.services\n  instance_type = each.value\n\n  tags = {\n    Name = \"service-\${each.key}\"\n  }\n}\n\neach.key = \"frontend\" / \"backend\" / \"worker\" — each.value = that tier's instance type.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /for_each\s*=\s*var\.services/.test(main) && main.includes("each.value");
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform plan' and verify 3 distinct instances are planned for creation. (Checklist task — completes once the for_each loop over var.services is wired up.)",
        hint: "Run 'terraform plan' in the terminal. You should see 3 create actions: aws_instance.service[\"frontend\"], [\"backend\"], [\"worker\"].",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_instance"\s+"service"/.test(main) && /for_each\s*=\s*var\.services/.test(main);
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# TODO Task 2: Declare ONE aws_instance resource (local name "service")
#   that iterates over var.services dynamically and uses each entry's
#   value as the instance type. Name tag should include the entry key.
`,
      "variables.tf": `# Lab 4.1: Scaling with Count & For_Each
# TODO Task 1: Declare the "services" variable as a map of instance types
#   with one entry per tier (three tiers total — see your instruction list).
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
    lesson: "Modules & Scale",
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
          return /module\s+"vpc"\s*\{[\s\S]*?source\s*=\s*"\.\/modules\/vpc"/.test(main);
        }
      },
      {
        id: "task-2",
        description: "Pass 'module.vpc.subnet_id' into the web server module.",
        hint: "module \"web\" { source = \"./modules/webserver\", subnet_id = module.vpc.subnet_id }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /module\s+"web"\s*\{[\s\S]*?source\s*=\s*"\.\/modules\/webserver"[\s\S]*?subnet_id\s*=\s*module\.vpc\.subnet_id/.test(main);
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform init' followed by 'terraform apply'.",
        hint: "Run 'terraform init' then 'terraform apply'.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          // Both modules instantiated — the apply flow in this lab's sim
          // provisions through modules, so completion is code-verified.
          return /module\s+"vpc"\s*\{/.test(main) && /module\s+"web"\s*\{/.test(main);
        }
      }
    ],
    starterFiles: {
      "main.tf": `provider "aws" {
  region = "us-east-1"
}

# TODO Task 1: Instantiate the VPC child module with the correct source path
#   and a CIDR of 10.0.0.0/16.
#
# TODO Task 2: Instantiate the Webserver child module and wire its subnet
#   input to the VPC module's subnet output.
#
# The child modules already exist under modules/vpc and modules/webserver —
# your job is the root-module wiring.
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
        description: "In the 'terraform' block, configure the S3 backend for this lab: bucket 'company-tf-state-prod', key 'global/s3/terraform.tfstate' (the key is just a file path YOU choose inside the bucket — your team picked this one), region 'us-east-1'.",
        hint: "The backend block needs three parts — where the state lives and which file inside the bucket:\n\nterraform {\n  backend \"s3\" {\n    bucket = \"company-tf-state-prod\"\n    key    = \"global/s3/terraform.tfstate\"\n    region = \"us-east-1\"\n  }\n}\n\nThe key is NOT something you look up — it's a path YOU invent, like a filename. Convention: <project>/<app>/<environment>.tfstate. This lab's team chose global/s3/terraform.tfstate, so use exactly that. (bucket = which bucket; region = where it lives. Locking: next task.)",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const backend = main.match(/backend\s+"s3"\s*\{([\s\S]*?)\n\s*\}/);
          if (!backend) return false;
          const b = backend[1];
          return /bucket\s*=\s*"company-tf-state-prod"/.test(b) &&
                 /key\s*=\s*"global\/s3\/terraform\.tfstate"/.test(b) &&
                 /region\s*=\s*"us-east-1"/.test(b);
        }
      },
      {
        id: "task-2",
        description: "Enable state locking: add 'dynamodb_table = \"terraform-state-lock\"' inside the backend \"s3\" block.",
        hint: "One line inside the backend block:\n\n  dynamodb_table = \"terraform-state-lock\"\n\nWith a lock table, two engineers running 'apply' at the same time can't corrupt the state — the second one waits. (Terraform 1.10+ can also use S3 native locking with use_lockfile = true — this course uses the classic DynamoDB table.)",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const backend = main.match(/backend\s+"s3"\s*\{([\s\S]*?)\n\s*\}/);
          if (!backend) return false;
          return /dynamodb_table\s*=\s*"terraform-state-lock"/.test(backend[1]);
        }
      },
      {
        id: "task-3",
        description: "Run 'terraform init' to migrate local state to the simulated remote S3 backend. (Checklist task — completes once your backend configuration from Tasks 1-2 is complete.)",
        hint: "Type 'terraform init' in the terminal after finishing the backend block.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /backend\s+"s3"\s*\{/s.test(main) && /dynamodb_table\s*=\s*"terraform-state-lock"/.test(main);
        }
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
        description: "Tier 1 — Network foundation: declare the enterprise VPC 'prod' with CIDR 10.0.0.0/16 and DNS hostnames enabled.",
        hint: "The VPC block needs its CIDR as a QUOTED string argument and the DNS flag:\n\nresource \"aws_vpc\" \"prod\" {\n  cidr_block           = \"10.0.0.0/16\"\n  enable_dns_hostnames = true\n\n  tags = {\n    Name        = \"Prod\"\n    Environment = \"Prod\"\n    ManagedBy   = \"Terraform\"\n  }\n}\n\nNote: the argument is cidr_block (not cidr), and the value is a quoted string — not a [list].",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const vpc = main.match(/resource\s+"aws_vpc"\s+"prod"\s*\{([\s\S]*?)\n\}/);
          if (!vpc) return false;
          const b = vpc[1];
          return /cidr_block\s*=\s*"10\.0\.0\.0\/16"/.test(b) &&
                 /enable_dns_hostnames\s*=\s*true/.test(b);
        }
      },
      {
        id: "task-2",
        description: "Tier 1 — Subnets: declare a public subnet 'public_1' AND a private subnet 'private_1', both wired to aws_vpc.prod.id with their own /24 CIDRs.",
        hint: "Two aws_subnet blocks — public_1 (e.g. 10.0.1.0/24) and private_1 (e.g. 10.0.10.0/24), each with vpc_id = aws_vpc.prod.id.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_subnet"\s+"public_1"/.test(main) &&
                 /resource\s+"aws_subnet"\s+"private_1"/.test(main) &&
                 /aws_subnet"\s+"private_1"\s*\{[\s\S]*?vpc_id\s*=\s*aws_vpc\.prod\.id/.test(main);
        }
      },
      {
        id: "task-3",
        description: "Tier 1 — Security: create a separate security group resource 'web_sg' that BELONGS to the VPC (vpc_id = aws_vpc.prod.id) allowing inbound TCP 443.",
        hint: "resource \"aws_security_group\" \"web_sg\" { vpc_id = aws_vpc.prod.id ... ingress { from_port = 443 ... } }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const sg = /resource\s+"aws_security_group"\s+"web_sg"\s*\{[\s\S]*?\n\}/.exec(main)?.[0] || "";
          return !!sg && sg.includes("aws_vpc.prod.id") && /443/.test(sg);
        }
      },
      {
        id: "task-4",
        description: "Tier 2 — Load balancing: declare the Application Load Balancer 'app_alb' placed in the public subnet and using the web_sg security group.",
        hint: "The ALB takes LISTS for security groups and subnets (they can attach to several), and the references are unquoted:\n\nresource \"aws_lb\" \"app_alb\" {\n  name            = \"app-alb\"\n  load_balancer_type = \"application\"\n  security_groups = [aws_security_group.web_sg.id]\n  subnets         = [aws_subnet.public_1.id]\n}\n\nNote: the argument is subnets (plural, a list) — not subnet_id. And the references have no quotes: quotes would make them plain text.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const lb = main.match(/resource\s+"aws_lb"\s+"app_alb"\s*\{([\s\S]*?)\n\}/);
          if (!lb) return false;
          const b = lb[1];
          return /load_balancer_type\s*=\s*"application"/.test(b) &&
                 /security_groups\s*=\s*\[\s*aws_security_group\.web_sg\.id\s*\]/.test(b) &&
                 /subnets\s*=\s*\[\s*aws_subnet\.public_1\.id\s*\]/.test(b);
        }
      },
      {
        id: "task-5",
        description: "Tier 3 — Data layer: declare the RDS PostgreSQL instance 'postgres' (any sensible instance class and storage).",
        hint: "resource \"aws_db_instance\" \"postgres\" { engine = \"postgres\", instance_class = \"db.t3.medium\", allocated_storage = 50, ... }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_db_instance"\s+"postgres"/.test(main) && /engine\s*=\s*"postgres"/.test(main);
        }
      },
      {
        id: "task-6",
        description: "Compute tier & launch: declare the app instance 'app_cluster' placed in the PRIVATE subnet (subnet_id = aws_subnet.private_1.id — a reference, the instance is its own separate block), then run 'terraform apply' to provision the full topology.",
        hint: "Every EC2 instance needs TWO required arguments — ami (the operating-system image ID) and instance_type (the size) — plus the subnet wiring:\n\nresource \"aws_instance\" \"app_cluster\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t3.medium\"\n  subnet_id     = aws_subnet.private_1.id\n\n  tags = {\n    Name = \"app-cluster\"\n  }\n}\n\n(ami = the OS image ID from AWS; instance_type = t3.micro/t3.medium/... the hardware size. Then run 'terraform apply'.)",
        validationCheck: (codeMap, state) => {
          const main = codeMap["main.tf"] || "";
          const wired = /resource\s+"aws_instance"\s+"app_cluster"\s*\{[\s\S]*?subnet_id\s*=\s*aws_subnet\.private_1\.id/.test(main);
          return wired && state.resources.length >= 6;
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 6: HERO — Multi-Tier HA Production Architecture
# Build every tier from scratch. Order of battle:
#
# TODO Task 1: Enterprise VPC "prod" (CIDR 10.0.0.0/16, DNS hostnames enabled)
# TODO Task 2: Public subnet "public_1" AND private subnet "private_1" wired to the VPC
# TODO Task 3: Security group "web_sg" in the VPC allowing inbound 443
# TODO Task 4: Application Load Balancer "app_alb" in the public subnet, behind web_sg
# TODO Task 5: RDS PostgreSQL instance "postgres"
# TODO Task 6: App instance "app_cluster" in the PRIVATE subnet, then run apply

provider "aws" {
  region = "us-east-1"
}
`,
      "outputs.tf": `# TODO (bonus): export the ALB DNS name and the DB endpoint (mark it sensitive)
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
  },
  {
    id: "lab-11-azure-durable-docs",
    lesson: "Multi-Cloud",
    level: 8,
    title: "11. Azure: Durable Document Storage After the Invoice Loss",
    subtitle: "Azurerm provider, resource groups, and a storage account — beginner",
    difficulty: "Beginner",
    estimatedMinutes: 10,
    xp: 250,
    category: "Multi-Cloud",
    iconName: "Box",
    architectureDiagramType: "s3_single",
    scenario:
      "REAL INCIDENT: On 14 March the accounting team at RetailCo lost 3 months of supplier invoices — they were saved on a former employee's laptop that was wiped during offboarding. Auditors now require every invoice to land in durable cloud storage within a week. You are the cloud engineer on the fix, using Terraform and Azure.",
    visualGoal:
      "Provision an Azure resource group and a blob-enabled storage account for invoice archiving, with cost-tagging, and run the full init -> plan -> apply workflow.",
    conceptTakeaway: [
      "Azure organizes everything through resource groups — think of one as a folder that ties resources to a region and a billing/lifecycle boundary.",
      "The azurerm provider REQUIRES a features {} block inside the provider block — the #1 first-day Azure+Terraform error.",
      "azurerm_storage_account names are globally unique, 3-24 chars, lowercase letters and numbers only.",
      "The same Terraform workflow (init -> plan -> apply) works on every cloud — only the provider block and resource types change."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare the Azure provider: provider \"azurerm\" with a features {} block inside it (Azure's provider refuses to run without one).",
        hint: "Type this in the editor:\nprovider \"azurerm\" {\n  features {}\n}\nfeatures {} looks odd — an empty block — but the azurerm provider requires it before any command will run.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const prov = main.match(/provider\s+"azurerm"\s*\{([\s\S]*?)\n\}/);
          return !!prov && /features\s*\{/.test(prov[1]);
        }
      },
      {
        id: "task-2",
        description: "Declare a resource group named finance_rg with location \"West Europe\" — the region string is the Azure name, NOT the AWS-style code.",
        hint: "Add a resource block:\nresource \"azurerm_resource_group\" \"finance_rg\" {\n  name     = \"finance_rg\"\n  location = \"West Europe\"\n}\nAzure locations are written as region names like \"West Europe\" — writing \"westeurope\" would also be accepted by Azure in the CLI, but the audit-friendly form (and this lab) uses the display name.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const rg = main.match(/resource\s+"azurerm_resource_group"\s+"(?:finance_rg|rg_finance)"\s*\{([\s\S]*?)\n\}/);
          return !!rg && /location\s*=\s*"West Europe"/.test(rg[1]);
        }
      },
      {
        id: "task-3",
        description: "Declare the storage account 'stinvoicearchive' wired to the resource group: name, resource_group_name, and location must all be set.",
        hint: "Add:\nresource \"azurerm_storage_account\" \"invoice_archive\" {\n  name                     = \"stinvoicearchive\"\n  resource_group_name      = azurerm_resource_group.finance_rg.name\n  location                 = azurerm_resource_group.finance_rg.location\n  account_tier             = \"Standard\"\n  account_replication_type = \"GRS\"\n}\nNote the unquoted references azurerm_resource_group.finance_rg.name / .location — quoting them would make them plain text. GRS = geo-redundant: data is copied to a second region hundreds of km away, which is exactly what the auditors want after the loss.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const sa = main.match(/resource\s+"azurerm_storage_account"\s+"invoice_archive"\s*\{([\s\S]*?)\n\}/);
          return !!sa &&
                 /name\s*=\s*"stinvoicearchive"/.test(sa[1]) &&
                 /resource_group_name\s*=\s*azurerm_resource_group\.finance_rg\.name/.test(sa[1]) &&
                 /(?:location\s*=\s*azurerm_resource_group\.finance_rg\.location)|(?:location\s*=\s*"West Europe")/.test(sa[1]);
        }
      },
      {
        id: "task-4",
        description: "Give the storage account a tags block: Environment = \"Production\", ManagedBy = \"Terraform\", CostCentre = \"Finance\".",
        hint: "Inside the storage account block add:\n  tags = {\n    Environment = \"Production\"\n    ManagedBy   = \"Terraform\"\n    CostCentre  = \"Finance\"\n  }\nAzure tags are case-sensitive strings, exactly like AWS tags — CostCentre (no space) matches Finance's tagging policy.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const flat = main.replace(/\s+/g, " ");
          return /\bEnvironment\s*=\s*"Production"/.test(flat) &&
                 /\bManagedBy\s*=\s*"Terraform"/.test(flat) &&
                 /\bCostCentre\s*=\s*"Finance"/.test(flat);
        }
      },
      {
        id: "task-5",
        description: "Enable versioning of blobs by declaring an azurerm_storage_container named 'invoices', with storage_account_name pointing at the storage account's name.",
        hint: "Add:\nresource \"azurerm_storage_container\" \"invoices\" {\n  name                  = \"invoices\"\n  storage_account_name  = azurerm_storage_account.invoice_archive.name\n  container_access_type = \"private\"\n}\nContainers hold the actual blobs (each invoice file would be a blob inside). private access means only authenticated access — a public invoices container is how companies leak data.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const c = main.match(/resource\s+"azurerm_storage_container"\s+"invoices"\s*\{([\s\S]*?)\n\}/);
          return !!c && /storage_account_name\s*=\s*azurerm_storage_account\.invoice_archive\.name/.test(c[1]);
        }
      },
      {
        id: "task-6",
        description: "Run 'terraform init' in the terminal — watch it install the hashicorp/azurerm provider, not AWS. (Checklist task — completes once your resource group from Task 2 exists, since init needs a valid config.)",
        hint: "Type 'terraform init' in the terminal. The output should say Installing hashicorp/azurerm — that's the Azure provider plugin downloading.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const prov = main.match(/provider\s+"azurerm"\s*\{([\s\S]*?)\n\}/);
          return !!prov && /features\s*\{/.test(prov[1]) &&
                 /resource\s+"azurerm_resource_group"/.test(main);
        }
      },
      {
        id: "task-7",
        description: "Run 'terraform plan' then 'terraform apply' to provision the invoice archive.",
        hint: "Type 'terraform plan' first — you should see 3 planned creates — then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "azurerm_storage_account" && r.name === "invoice_archive") &&
                 state.resources.some((r) => r.type === "azurerm_resource_group");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 7.1: Azure Durable Document Storage (RetailCo invoice-loss incident)
# TODO Task 1: provider "azurerm" with a features {} block
# TODO Task 2: resource group finance_rg in "West Europe"
# TODO Task 3: storage account stinvoicearchive wired to the group
# TODO Task 4: tags (Environment / ManagedBy / CostCentre)
# TODO Task 5: storage container "invoices" wired to the account
# TODO Task 6: terraform init
# TODO Task 7: terraform plan + apply
`
    },
    solutionFiles: {
      "main.tf": `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "finance_rg" {
  name     = "finance_rg"
  location = "West Europe"
}

resource "azurerm_storage_account" "invoice_archive" {
  name                     = "stinvoicearchive"
  resource_group_name      = azurerm_resource_group.finance_rg.name
  location                 = azurerm_resource_group.finance_rg.location
  account_tier             = "Standard"
  account_replication_type = "GRS"

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
    CostCentre  = "Finance"
  }
}

resource "azurerm_storage_container" "invoices" {
  name                  = "invoices"
  storage_account_name  = azurerm_storage_account.invoice_archive.name
  container_access_type = "private"
}
`
    },
    solutionExplanation:
      "The auditor's requirement maps to three Azure resources: a resource group (the boundary), a geo-redundant storage account (durable, region-pair copies), and a private container (the invoices folder). Notice how little changed from the AWS labs: same workflow, same dependency-by-reference thinking — only provider block and type names changed."
  },
  {
    id: "lab-12-azure-perimeter-hardening",
    lesson: "Multi-Cloud",
    level: 8,
    title: "12. Azure: Closing the RDP Hole the Pentest Found",
    subtitle: "VNets, subnets, NSG rules & the NIC hop — intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    xp: 350,
    category: "Multi-Cloud",
    iconName: "ShieldAlert",
    architectureDiagramType: "vpc_network",
    scenario:
      "REAL FINDING: A penetration test of Brightline Logistics returned one CRITICAL: RDP (TCP 3389) on their Azure finance VM accepts connections from the entire internet. The tester wrote 'compromise of this host yields domain credentials for the whole finance network.' Your ticket: rebuild the network with a VNet + dedicated subnet, a Network Security Group that permits WinRM 5985 ONLY from the corporate office IP range, and a properly wired Windows VM.",
    visualGoal:
      "Build the Azure network boundary: VNet -> subnet -> NSG with a restricted rule -> NIC -> Windows VM, and watch Terraform resolve the dependency chain.",
    conceptTakeaway: [
      "Azure wiring has one more hop than AWS: VM -> network_interface -> subnet (the NIC owns the subnet, the VM owns the NIC).",
      "azurerm_network_security_rule uses priority numbers (100-4096): lower runs first; port 3389 open to the internet is the classic audit CRITICAL.",
      "address_space (Azure) plays the role cidr_block (AWS) plays — same IP-range idea, provider-specific name."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare the Azure provider again from scratch: provider \"azurerm\" with features {} — then DELETE the pre-written provider block at the bottom of the starter file so only yours remains.",
        hint: "Write at the top of main.tf:\nprovider \"azurerm\" {\n  features {}\n}\nThen delete the starter's provider block at the bottom (everything from provider \"azurerm\" { to its closing }). Two azurerm provider blocks for one provider = invalid config; one valid block satisfies the check, which requires it in the FIRST half of the file.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const firstHalf = main.slice(0, Math.ceil(main.length / 2));
          const prov = firstHalf.match(/provider\s+"azurerm"\s*\{([\s\S]*?)\n\}/);
          // starter's pre-written block sits past the midpoint — if it's still
          // there after removing duplicates, the midpoint boundary keeps this task grey
          return !!prov && /features\s*\{/.test(prov[1]);
        }
      },
      {
        id: "task-2",
        description: "Declare azurerm_resource_group 'sec_rg' with location \"West Europe\"; update the starter TODO comments to mark this task done.",
        hint: "You wrote this in the last lab — same shape:\nresource \"azurerm_resource_group\" \"sec_rg\" {\n  name     = \"sec_rg\"\n  location = \"West Europe\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const rg = main.match(/resource\s+"azurerm_resource_group"\s+"sec_rg"\s*\{([\s\S]*?)\n\}/);
          return !!rg && /location\s*=\s*"West Europe"/.test(rg[1]);
        }
      },
      {
        id: "task-3",
        description: "Declare azurerm_virtual_network 'fin_vnet' with address_space [\"10.1.0.0/16\"], wired to sec_rg by name AND location.",
        hint: "Add:\nresource \"azurerm_virtual_network\" \"fin_vnet\" {\n  name                = \"fin_vnet\"\n  address_space       = [\"10.1.0.0/16\"]\n  location            = azurerm_resource_group.sec_rg.location\n  resource_group_name = azurerm_resource_group.sec_rg.name\n}\naddress_space is a LIST because a VNet can hold several ranges — same idea as AWS VPC CIDRs, different argument name.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const vnet = main.match(/resource\s+"azurerm_virtual_network"\s+"fin_vnet"\s*\{([\s\S]*?)\n\}/);
          return !!vnet &&
                 /address_space\s*=\s*\[\s*"10\.1\.0\.0\/16"\s*\]/.test(vnet[1]) &&
                 /resource_group_name\s*=\s*azurerm_resource_group\.sec_rg\.name/.test(vnet[1]) &&
                 /location\s*=\s*azurerm_resource_group\.sec_rg\.location/.test(vnet[1]);
        }
      },
      {
        id: "task-4",
        description: "Declare azurerm_subnet 'fin_snet' inside fin_vnet with address_prefixes [\"10.1.2.0/24\"].",
        hint: "Add:\nresource \"azurerm_subnet\" \"fin_snet\" {\n  name                 = \"fin_snet\"\n  resource_group_name  = azurerm_resource_group.sec_rg.name\n  virtual_network_name = azurerm_virtual_network.fin_vnet.name\n  address_prefixes     = [\"10.1.2.0/24\"]\n}\nAzure subnets are wired BY NAME REFERENCE (virtual_network_name = ...name), not by an id attribute like AWS.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const sn = main.match(/resource\s+"azurerm_subnet"\s+"fin_snet"\s*\{([\s\S]*?)\n\}/);
          return !!sn &&
                 /virtual_network_name\s*=\s*azurerm_virtual_network\.fin_vnet\.name/.test(sn[1]) &&
                 /address_prefixes\s*=\s*\[\s*"10\.1\.2\.0\/24"\s*\]/.test(sn[1]);
        }
      },
      {
        id: "task-5",
        description: "Declare azurerm_network_security_group 'fin_nsg' wired to sec_rg, then declare an azurerm_network_security_rule 'allow_winrm_office' that allows TCP 5985 ONLY from 203.0.113.0/24 with priority 100.",
        hint: "Two blocks:\nresource \"azurerm_network_security_group\" \"fin_nsg\" {\n  name                = \"fin_nsg\"\n  resource_group_name = azurerm_resource_group.sec_rg.name\n  location            = azurerm_resource_group.sec_rg.location\n}\n\nresource \"azurerm_network_security_rule\" \"allow_winrm_office\" {\n  name                        = \"allow_winrm_office\"\n  priority                    = 100\n  direction                   = \"Inbound\"\n  access                      = \"Allow\"\n  protocol                    = \"Tcp\"\n  source_port_range           = \"*\"\n  destination_port_range      = \"5985\"\n  source_address_prefixes     = [\"203.0.113.0/24\"]\n  destination_address_prefix  = \"*\"\n  resource_group_name         = azurerm_resource_group.sec_rg.name\n  network_security_group_name = azurerm_network_security_group.fin_nsg.name\n}\n203.0.113.0/24 stands in for the corporate office range. NO rule may open 3389 — Azure denies everything not explicitly allowed.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const nsg = main.match(/resource\s+"azurerm_network_security_group"\s+"fin_nsg"\s*\{([\s\S]*?)\n\}/);
          const rule = main.match(/resource\s+"azurerm_network_security_rule"\s+"allow_winrm_office"\s*\{([\s\S]*?)\n\}/);
          if (!nsg || !rule) return false;
          const b = rule[1];
          return /priority\s*=\s*100/.test(b) &&
                 /destination_port_range\s*=\s*"5985"/.test(b) &&
                 /source_address_prefixes\s*=\s*\[\s*"203\.0\.113\.0\/24"\s*\]/.test(b) &&
                 !/3389/.test(b);
        }
      },
      {
        id: "task-6",
        description: "Declare azurerm_network_interface 'fin_nic' wired to fin_snet (ip_configuration with subnet_id and private_ip_address_allocation = \"Dynamic\").",
        hint: "The NIC is the plumbing between VM and subnet:\nresource \"azurerm_network_interface\" \"fin_nic\" {\n  name                = \"fin_nic\"\n  location            = azurerm_resource_group.sec_rg.location\n  resource_group_name = azurerm_resource_group.sec_rg.name\n\n  ip_configuration {\n    name                          = \"internal\"\n    subnet_id                     = azurerm_subnet.fin_snet.id\n    private_ip_address_allocation = \"Dynamic\"\n  }\n}\nThis is the hop AWS doesn't have: the VM never touches the subnet directly.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const nic = main.match(/resource\s+"azurerm_network_interface"\s+"fin_nic"\s*\{([\s\S]*?)\n\}/);
          return !!nic &&
                 /subnet_id\s*=\s*azurerm_subnet\.fin_snet\.id/.test(nic[1]) &&
                 /private_ip_address_allocation\s*=\s*"Dynamic"/.test(nic[1]);
        }
      },
      {
        id: "task-7",
        description: "Wire the NSG to the NIC's ip_configuration with network_security_group_id, then declare azurerm_windows_virtual_machine 'fin_vm' (name fin-vm-01, size Standard_B2s, admin_username finadmin) attached to the NIC via network_interface_ids.",
        hint: "First add INSIDE the NIC's ip_configuration block:\n    network_security_group_id = azurerm_network_security_group.fin_nsg.id\n\nThen the VM:\nresource \"azurerm_windows_virtual_machine\" \"fin_vm\" {\n  name                  = \"fin-vm-01\"\n  resource_group_name   = azurerm_resource_group.sec_rg.name\n  location              = azurerm_resource_group.sec_rg.location\n  size                  = \"Standard_B2s\"\n  admin_username        = \"finadmin\"\n  admin_password        = \"P@ssw0rd1234!\"\n  network_interface_ids = [azurerm_network_interface.fin_nic.id]\n}\nsize is Azure's role for instance_type/machine_type. (A real team would hand the password to a Key Vault secret — see the sensitive-data ideas from Lab 5.)",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const nic = main.match(/resource\s+"azurerm_network_interface"\s+"fin_nic"\s*\{([\s\S]*?)\n\}/);
          const vm = main.match(/resource\s+"azurerm_windows_virtual_machine"\s+"fin_vm"\s*\{([\s\S]*?)\n\}/);
          if (!nic || !vm) return false;
          return /network_security_group_id\s*=\s*azurerm_network_security_group\.fin_nsg\.id/.test(nic[1]) &&
                 /network_interface_ids\s*=\s*\[\s*azurerm_network_interface\.fin_nic\.id\s*\]/.test(vm[1]) &&
                 /size\s*=\s*"Standard_B2s"/.test(vm[1]) &&
                 /admin_username\s*=\s*"finadmin"/.test(vm[1]);
        }
      },
      {
        id: "task-8",
        description: "Run 'terraform plan' and confirm the plan shows NO 3389/allow-internet rule anywhere, then 'terraform apply' to provision the hardened perimeter.",
        hint: "Type 'terraform plan' — expect 6 creates — scan the output for any 3389 (there must be none), then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "azurerm_windows_virtual_machine" && r.name === "fin_vm") &&
                 state.resources.some((r) => r.type === "azurerm_virtual_network");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 7.2: Azure Perimeter Hardening (pentest CRITICAL: RDP open to internet)
# The fix: VNet -> subnet -> NSG (WinRM from office ONLY) -> NIC -> Windows VM
#
# TODO Task 2: resource group sec_rg in "West Europe"
# TODO Task 3: virtual network fin_vnet (address_space 10.1.0.0/16)
# TODO Task 4: subnet fin_snet (address_prefixes 10.1.2.0/24)
# TODO Task 5: NSG fin_nsg + rule allowing TCP 5985 from 203.0.113.0/24 ONLY
# TODO Task 6: network interface fin_nic wired to the subnet
# TODO Task 7: NSG on the NIC + windows VM fin-vm-01 (Standard_B2s)
# TODO Task 8: plan (verify NO 3389 rule) + apply

provider "azurerm" {
  features {}
}
`
    },
    solutionFiles: {
      "main.tf": `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "sec_rg" {
  name     = "sec_rg"
  location = "West Europe"
}

resource "azurerm_virtual_network" "fin_vnet" {
  name                = "fin_vnet"
  address_space       = ["10.1.0.0/16"]
  location            = azurerm_resource_group.sec_rg.location
  resource_group_name = azurerm_resource_group.sec_rg.name
}

resource "azurerm_subnet" "fin_snet" {
  name                 = "fin_snet"
  resource_group_name  = azurerm_resource_group.sec_rg.name
  virtual_network_name = azurerm_virtual_network.fin_vnet.name
  address_prefixes     = ["10.1.2.0/24"]
}

resource "azurerm_network_security_group" "fin_nsg" {
  name                = "fin_nsg"
  resource_group_name = azurerm_resource_group.sec_rg.name
  location            = azurerm_resource_group.sec_rg.location
}

resource "azurerm_network_security_rule" "allow_winrm_office" {
  name                        = "allow_winrm_office"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "5985"
  source_address_prefixes     = ["203.0.113.0/24"]
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.sec_rg.name
  network_security_group_name = azurerm_network_security_group.fin_nsg.name
}

resource "azurerm_network_interface" "fin_nic" {
  name                = "fin_nic"
  location            = azurerm_resource_group.sec_rg.location
  resource_group_name = azurerm_resource_group.sec_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.fin_snet.id
    private_ip_address_allocation = "Dynamic"
    network_security_group_id     = azurerm_network_security_group.fin_nsg.id
  }
}

resource "azurerm_windows_virtual_machine" "fin_vm" {
  name                  = "fin-vm-01"
  resource_group_name   = azurerm_resource_group.sec_rg.name
  location              = azurerm_resource_group.sec_rg.location
  size                  = "Standard_B2s"
  admin_username        = "finadmin"
  admin_password        = "P@ssw0rd1234!"
  network_interface_ids = [azurerm_network_interface.fin_nic.id]
}
`
    },
    solutionExplanation:
      "The audit fix is a chain of six Azure resources, and the wiring teaches Azure's extra hop: VM -> NIC -> subnet. The NSG rule list contains exactly one allow (WinRM 5985 from the office range) and no 3389 — Azure's default-deny does the rest. Compare Lab 4's AWS stack: same DAG thinking, one argument-name translation and one extra hop."
  },
  {
    id: "lab-13-azure-regional-dr-template",
    lesson: "Multi-Cloud",
    level: 8,
    title: "13. Azure: Building the DR Region Before the Next Outage",
    subtitle: "Regions, KV, MSSQL and reusable RG-per-region patterns — intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 18,
    xp: 400,
    category: "Multi-Cloud",
    iconName: "Globe",
    architectureDiagramType: "multi_tier_app",
    scenario:
      "REAL OUTAGE: Azure's West Europe region went dark for 9 hours in March (storage + VM faults). MedSupply, a medical-device portal, was down with it — order intake lost for the day. The board approved a secondary region: everything you built so far now gets a twin in 'North Europe', with the database and secrets standing up FIRST so apps can fail over. Your job: the Terraform for the DR foundations.",
    visualGoal:
      "Provision the DR foundations in a second region: resource group, Key Vault for credentials, and an Azure SQL database — the pieces a failover needs in place before compute lands.",
    conceptTakeaway: [
      "Regions are the blast-radius unit in Azure: a DR plan starts with a second resource group in a different location.",
      "azurerm_key_vault needs soft_delete_enabled + purge_protection_enabled for production — recovering deleted secrets is impossible without them.",
      "Locations are plain strings in Terraform (\"North Europe\") — a single local value can drive both regions' RGs from one place."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare azurerm_resource_group 'dr_rg' with location \"North Europe\" — the twin of the primary region's group.",
        hint: "Same shape as the previous two labs, new region:\nresource \"azurerm_resource_group\" \"dr_rg\" {\n  name     = \"dr_rg\"\n  location = \"North Europe\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const rg = main.match(/resource\s+"azurerm_resource_group"\s+"dr_rg"\s*\{([\s\S]*?)\n\}/);
          return !!rg && /location\s*=\s*"North Europe"/.test(rg[1]);
        }
      },
      {
        id: "task-2",
        description: "Add a locals block computing dr_vault_name = \"kvmedsupply-dr-01\".",
        hint: "Add:\nlocals {\n  dr_vault_name = \"kvmedsupply-dr-01\"\n}\nKey Vault names are globally unique and 3-24 chars — computing it as a local keeps the name consistent everywhere it's referenced (same idea as Lab 3's server_name).",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const l = main.match(/locals\s*\{([\s\S]*?)\n\}/);
          return !!l && /dr_vault_name\s*=\s*"kvmedsupply-dr-01"/.test(l[1]);
        }
      },
      {
        id: "task-3",
        description: "Declare azurerm_key_vault 'dr_vault' wired to dr_rg: use local.dr_vault_name for the name, sku_name = \"standard\", and enable soft_delete_enabled and purge_protection_enabled.",
        hint: "Add:\nresource \"azurerm_key_vault\" \"dr_vault\" {\n  name                      = local.dr_vault_name\n  location                  = azurerm_resource_group.dr_rg.location\n  resource_group_name       = azurerm_resource_group.dr_rg.name\n  tenant_id                 = \"00000000-0000-0000-0000-000000000000\"\n  sku_name                  = \"standard\"\n  soft_delete_enabled       = true\n  purge_protection_enabled  = true\n}\nWhy both flags: soft-delete keeps a deleted vault recoverable for 90 days; purge protection stops even admins from wiping it during that window. Without them a fat-fingered delete = all DR secrets gone, permanently.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const kv = main.match(/resource\s+"azurerm_key_vault"\s+"dr_vault"\s*\{([\s\S]*?)\n\}/);
          return !!kv &&
                 /name\s*=\s*local\.dr_vault_name/.test(kv[1]) &&
                 /soft_delete_enabled\s*=\s*true/.test(kv[1]) &&
                 /purge_protection_enabled\s*=\s*true/.test(kv[1]) &&
                 /sku_name\s*=\s*"standard"/.test(kv[1]);
        }
      },
      {
        id: "task-4",
        description: "Declare azurerm_mssql_server 'dr_sql' wired to dr_rg: name sqlmedsupply-dr, admin_username sqladmin, and version = \"12.0\".",
        hint: "Add:\nresource \"azurerm_mssql_server\" \"dr_sql\" {\n  name                         = \"sqlmedsupply-dr\"\n  resource_group_name          = azurerm_resource_group.dr_rg.name\n  location                     = azurerm_resource_group.dr_rg.location\n  version                      = \"12.0\"\n  administrator_login          = \"sqladmin\"\n  administrator_login_password = \"Replace-With-KV-Secret!\"\n}\n(A real setup stores that password as a Key Vault secret and references it — the vault you just built exists precisely for credentials like this one.)",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const sql = main.match(/resource\s+"azurerm_mssql_server"\s+"dr_sql"\s*\{([\s\S]*?)\n\}/);
          return !!sql &&
                 /name\s*=\s*"sqlmedsupply-dr"/.test(sql[1]) &&
                 /administrator_login\s*=\s*"sqladmin"/.test(sql[1]) &&
                 /version\s*=\s*"12\.0"/.test(sql[1]);
        }
      },
      {
        id: "task-5",
        description: "Declare azurerm_mssql_database 'dr_db' on dr_sql: name medsupply_dr, sku_name = \"Basic\", and a short comment explaining WHY Basic is acceptable for the DR twin.",
        hint: "Add:\nresource \"azurerm_mssql_database\" \"dr_db\" {\n  name      = \"medsupply_dr\"\n  server_id = azurerm_mssql_server.dr_sql.id\n  sku_name  = \"Basic\"\n  # Basic: DR twin only serves traffic during regional failover,\n  # so the cheaper SKU is acceptable until failover completes.\n}\nSKU choice is a cost decision: Basic (~5 DTUs) stands by cheaply while the primary region serves traffic — a DR twin doesn't need production capacity until the outage.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const db = main.match(/resource\s+"azurerm_mssql_database"\s+"dr_db"\s*\{([\s\S]*?)\n\}/);
          return !!db && /sku_name\s*=\s*"Basic"/.test(db[1]) && /server_id\s*=\s*azurerm_mssql_server\.dr_sql\.id/.test(db[1]);
        }
      },
      {
        id: "task-6",
        description: "Add tag CostCentre = \"MedSupply\" to BOTH the dr_rg resource group and the dr_sql server (the board approved DR spend under this cost centre).",
        hint: "Inside each of the two blocks add:\n  tags = {\n    CostCentre = \"MedSupply\"\n  }\nTags on the resource group are inherited by NOTHING automatically — Azure tags don't cascade, so cost-tagging lives (or dies) resource by resource.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const rg = main.match(/resource\s+"azurerm_resource_group"\s+"dr_rg"\s*\{([\s\S]*?)\n\}/);
          const sql = main.match(/resource\s+"azurerm_mssql_server"\s+"dr_sql"\s*\{([\s\S]*?)\n\}/);
          if (!rg || !sql) return false;
          return /\bCostCentre\s*=\s*"MedSupply"/.test(rg[1]) && /\bCostCentre\s*=\s*"MedSupply"/.test(sql[1]);
        }
      },
      {
        id: "task-7",
        description: "Run 'terraform plan' and read the order of operations, then 'terraform apply' to stand up the DR foundations.",
        hint: "Type 'terraform plan' — 4 creates. Then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "azurerm_mssql_server") &&
                 state.resources.some((r) => r.type === "azurerm_key_vault");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 7.3: Azure DR foundations (after the West Europe outage)
# Board ticket: secondary region "North Europe" — vault + SQL FIRST.
#
# TODO Task 1: resource group dr_rg in "North Europe"
# TODO Task 2: locals computing dr_vault_name = "kvmedsupply-dr-01"
# TODO Task 3: key vault dr_vault (soft-delete + purge protection ON)
# TODO Task 4: mssql server dr_sql (sqlmedsupply-dr)
# TODO Task 5: mssql database dr_db (sku Basic — add the WHY comment)
# TODO Task 6: CostCentre = "MedSupply" tag on BOTH rg and server
# TODO Task 7: plan + apply

provider "azurerm" {
  features {}
}
`
    },
    solutionFiles: {
      "main.tf": `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "dr_rg" {
  name     = "dr_rg"
  location = "North Europe"

  tags = {
    CostCentre = "MedSupply"
  }
}

locals {
  dr_vault_name = "kvmedsupply-dr-01"
}

resource "azurerm_key_vault" "dr_vault" {
  name                      = local.dr_vault_name
  location                  = azurerm_resource_group.dr_rg.location
  resource_group_name       = azurerm_resource_group.dr_rg.name
  tenant_id                 = "00000000-0000-0000-0000-000000000000"
  sku_name                  = "standard"
  soft_delete_enabled       = true
  purge_protection_enabled  = true
}

resource "azurerm_mssql_server" "dr_sql" {
  name                         = "sqlmedsupply-dr"
  resource_group_name          = azurerm_resource_group.dr_rg.name
  location                     = azurerm_resource_group.dr_rg.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "Replace-With-KV-Secret!"

  tags = {
    CostCentre = "MedSupply"
  }
}

resource "azurerm_mssql_database" "dr_db" {
  name      = "medsupply_dr"
  server_id = azurerm_mssql_server.dr_sql.id
  sku_name  = "Basic"
  # Basic: DR twin only serves traffic during regional failover,
  # so the cheaper SKU is acceptable until failover completes.
}
`
    },
    solutionExplanation:
      "A regional DR plan is, in Terraform terms, a second resource group in another location plus the stateful services a failover depends on: Key Vault (credentials survive an outage only if the vault does) and a SQL server/database sized for standby. The local for the vault name previews the multi-region pattern: compute names once, reference everywhere."
  },
  {
    id: "lab-14-gcp-data-landing",
    lesson: "Multi-Cloud",
    level: 8,
    title: "14. Google: A Landing Bucket for the Analytics Feed",
    subtitle: "First google provider lab from the data-team ticket — beginner",
    difficulty: "Beginner",
    estimatedMinutes: 10,
    xp: 250,
    category: "Multi-Cloud",
    iconName: "Box",
    architectureDiagramType: "s3_single",
    scenario:
      "REAL TICKET: KiwiRail's data team lands 40 GB of daily sensor exports from a vendor that only speaks Google Cloud. Yesterday's manual console upload silently failed — two weeks of sensor data are missing. The ticket: build a versioned GCS bucket as the landing zone, via Terraform, with lifecycle rules so raw archives age out cheaply instead of piling up.",
    visualGoal:
      "Provision a versioned Google Cloud Storage bucket for vendor data landing with the full workflow, and see the google provider install.",
    conceptTakeaway: [
      "google_storage_bucket needs NO provider region wiring for basics — bucket location is set ON the bucket (location = \"...\"), unlike AWS's provider-level region.",
      "Uniform bucket-level access is the modern default; force_destroy must be true in the sandbox because labs tear resources down.",
      "lifecycle_rule blocks age objects between storage classes — the mechanism that keeps 40 GB/day from bankrupting the project."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare the Google provider block: provider \"google\" with project = \"kiwirail-data\" and region = \"australia-southeast1\".",
        hint: "Type this in the editor:\nprovider \"google\" {\n  project = \"kiwirail-data\"\n  region  = \"australia-southeast1\"\n}\nThe project scopes everything you create (Google's equivalent of an account); the region is where regional resources land by default.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const p = main.match(/provider\s+"google"\s*\{([\s\S]*?)\n\}/);
          return !!p &&
                 /project\s*=\s*"kiwirail-data"/.test(p[1]) &&
                 /region\s*=\s*"australia-southeast1"/.test(p[1]);
        }
      },
      {
        id: "task-2",
        description: "Declare google_storage_bucket 'sensor_landing' with name \"kiwirail-sensor-landing\" and location \"AUSTRALIA-SOUTHEAST1\".",
        hint: "Add:\nresource \"google_storage_bucket\" \"sensor_landing\" {\n  name          = \"kiwirail-sensor-landing\"\n  location      = \"AUSTRALIA-SOUTHEAST1\"\n  force_destroy = true\n}\nBucket names are GLOBAL across all of Google Cloud (like S3). force_destroy = true lets the lab's terraform destroy empty the bucket — in production you'd leave it false as an accident guard.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"sensor_landing"\s*\{([\s\S]*?)\n\}/);
          return !!b &&
                 /name\s*=\s*"kiwirail-sensor-landing"/.test(b[1]) &&
                 /location\s*=\s*"AUSTRALIA-SOUTHEAST1"/.test(b[1]);
        }
      },
      {
        id: "task-3",
        description: "Enable object versioning on the bucket with versioning { enabled = true } — the protection the missing two weeks of data demanded.",
        hint: "Inside the bucket block add:\n  versioning {\n    enabled = true\n  }\nVersioning keeps every overwritten object's previous generation — a bad upload no longer destroys yesterday's file, which is exactly what the incident needed.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"sensor_landing"\s*\{([\s\S]*?)\n\}/);
          return !!b && /versioning\s*\{[\s\S]*enabled\s*=\s*true/.test(b[1]);
        }
      },
      {
        id: "task-4",
        description: "Add a lifecycle_rule INSIDE the bucket block: objects with prefix \"raw/\" transition to STORAGE_CLASS \"NEARLINE\" at age 30 days, and are deleted at age 90.",
        hint: "Two lifecycle rules nested in the bucket block:\n  lifecycle_rule {\n    condition {\n      age    = 30\n      prefix = \"raw/\"\n    }\n    action {\n      type          = \"SetStorageClass\"\n      storage_class = \"NEARLINE\"\n    }\n  }\n\n  lifecycle_rule {\n    condition {\n      age    = 90\n      prefix = \"raw/\"\n    }\n    action {\n      type = \"Delete\"\n    }\n  }\nNote the singular condition/action — rules carry ONE condition block and ONE action block each (Google's format differs from AWS's plural transitions/expiration).",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"sensor_landing"\s*\{([\s\S]*?)\n\}/);
          if (!b) return false;
          return /SetStorageClass/.test(b[1]) && /NEARLINE/.test(b[1]) &&
                 /age\s*=\s*90/.test(b[1]) && /age\s*=\s*30/.test(b[1]) && /Delete/.test(b[1]);
        }
      },
      {
        id: "task-5",
        description: "Run 'terraform init' and confirm the terminal shows hashicorp/google installing. (Checklist task — completes once your bucket from Task 2 exists, since init needs a valid config.)",
        hint: "Type 'terraform init' in the terminal — the plugin lines should name hashicorp/google, not AWS.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"sensor_landing"\s*\{([\s\S]*?)\n\}/);
          return /provider\s+"google"/.test(main) && /kiwirail-data/.test(main) && !!b;
        }
      },
      {
        id: "task-6",
        description: "Run 'terraform plan' then 'terraform apply' to provision the landing bucket.",
        hint: "Type 'terraform plan' (1 create), then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "google_storage_bucket" && r.name === "sensor_landing");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 7.4: GCS landing bucket (data-team ticket: lost sensor uploads)
# TODO Task 1: provider "google" (project kiwirail-data, australia-southeast1)
# TODO Task 2: storage bucket kiwirail-sensor-landing in AUSTRALIA-SOUTHEAST1
# TODO Task 3: enable object versioning
# TODO Task 4: lifecycle rules — raw/ objects: NEARLINE at 30d, delete at 90d
# TODO Task 5: terraform init
# TODO Task 6: terraform plan + apply
`
    },
    solutionFiles: {
      "main.tf": `provider "google" {
  project = "kiwirail-data"
  region  = "australia-southeast1"
}

resource "google_storage_bucket" "sensor_landing" {
  name          = "kiwirail-sensor-landing"
  location      = "AUSTRALIA-SOUTHEAST1"
  force_destroy = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age    = 30
      prefix = "raw/"
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age    = 90
      prefix = "raw/"
    }
    action {
      type = "Delete"
    }
  }
}
`
    },
    solutionExplanation:
      "The landing zone is one bucket with three behaviours layered inside it: versioning (protect against bad overwrites), a cheap-tier transition at 30 days (cost control), and deletion at 90 (retention compliance). Compare the S3 lab: the workflow is identical, but Google nests region INTO the bucket and formats lifecycle as condition/action pairs."
  },
  {
    id: "lab-15-gcp-network-quarantine",
    lesson: "Multi-Cloud",
    level: 8,
    title: "15. Google: Quarantining the Auto-Mode VPC",
    subtitle: "Custom networks, regional subnets, tag-targeted firewall — intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    xp: 350,
    category: "Multi-Cloud",
    iconName: "Network",
    architectureDiagramType: "vpc_network",
    scenario:
      "REAL AUDIT: A config review at KiwiRail found the project's DEFAULT auto-mode VPC: every subnet has the same broad CIDR, implicit internet routes on every instance, and nobody remembers creating it. Auto-mode networks are a quarantine finding in any serious audit. Your ticket: build a custom-mode replacement — VPC, two regional subnets (one per team), and a firewall that only admits SSH from the ops bastion range.",
    visualGoal:
      "Build the custom VPC: network -> regional subnetworks -> tag-targeted firewall rules, and watch the graph arrange the dependency order.",
    conceptTakeaway: [
      "auto_create_subnetworks = false is THE switch that turns an auto-mode VPC into a custom one — subnets become explicit, regional and yours.",
      "Google subnets are REGIONAL (a subnet exists in exactly one region) — the opposite mental model from AWS's AZ-scoped subnets.",
      "Firewall rules target INSTANCES by network tags (target_tags / source_tags), not by security-group attachment like AWS."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare google_compute_network 'custom_vpc' with name \"custom-vpc\" and auto_create_subnetworks = false — the quarantine fix itself.",
        hint: "Add:\nresource \"google_compute_network\" \"custom_vpc\" {\n  name                    = \"custom-vpc\"\n  auto_create_subnetworks = false\n}\nWith the flag false, Google creates NO subnets for you — every subnet that exists is one you declared, which is the point of the audit finding.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const n = main.match(/resource\s+"google_compute_network"\s+"custom_vpc"\s*\{([\s\S]*?)\n\}/);
          return !!n && /auto_create_subnetworks\s*=\s*false/.test(n[1]);
        }
      },
      {
        id: "task-2",
        description: "Declare a locals block computing env_label = \"prod\" (you'll use it in subnet names).",
        hint: "Add:\nlocals {\n  env_label = \"prod\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const l = main.match(/locals\s*\{([\s\S]*?)\n\}/);
          return !!l && /env_label\s*=\s*"prod"/.test(l[1]);
        }
      },
      {
        id: "task-3",
        description: "Declare google_compute_subnetwork 'snet_ops' in region australia-southeast1 with ip_cidr_range \"10.10.1.0/24\", wired to the network by REFERENCE.",
        hint: "Add:\nresource \"google_compute_subnetwork\" \"snet_ops\" {\n  name          = \"snet-ops-\\${local.env_label}\"\n  region        = \"australia-southeast1\"\n  network       = google_compute_network.custom_vpc.id\n  ip_cidr_range = \"10.10.1.0/24\"\n}\nip_cidr_range — NOT cidr_block (that's the AWS name your hands will betray you with). The name uses the local through \\${...} interpolation inside quotes.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const s = main.match(/resource\s+"google_compute_subnetwork"\s+"snet_ops"\s*\{([\s\S]*?)\n\}/);
          return !!s &&
                 /region\s*=\s*"australia-southeast1"/.test(s[1]) &&
                 /network\s*=\s*google_compute_network\.custom_vpc\.id/.test(s[1]) &&
                 /ip_cidr_range\s*=\s*"10\.10\.1\.0\/24"/.test(s[1]);
        }
      },
      {
        id: "task-4",
        description: "Declare google_compute_subnetwork 'snet_apps' in region australia-southeast2 with ip_cidr_range \"10.20.1.0/24\", also wired to custom_vpc.",
        hint: "Same shape, second region:\nresource \"google_compute_subnetwork\" \"snet_apps\" {\n  name          = \"snet-apps-\\${local.env_label}\"\n  region        = \"australia-southeast2\"\n  network       = google_compute_network.custom_vpc.id\n  ip_cidr_range = \"10.20.1.0/24\"\n}\nTwo regions, two subnets — one VPC. In AWS you'd build per-AZ subnets instead; this regional model is Google's key structural difference.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const s = main.match(/resource\s+"google_compute_subnetwork"\s+"snet_apps"\s*\{([\s\S]*?)\n\}/);
          return !!s &&
                 /region\s*=\s*"australia-southeast2"/.test(s[1]) &&
                 /network\s*=\s*google_compute_network\.custom_vpc\.id/.test(s[1]) &&
                 /ip_cidr_range\s*=\s*"10\.20\.1\.0\/24"/.test(s[1]);
        }
      },
      {
        id: "task-5",
        description: "Declare google_compute_firewall 'allow_ssh_bastion' on the custom_vpc network: protocol tcp, ports [\"22\"], source_ranges [\"10.10.1.0/24\"], target_tags [\"ssh-ok\"].",
        hint: "Add:\nresource \"google_compute_firewall\" \"allow_ssh_bastion\" {\n  name    = \"allow-ssh-bastion\"\n  network = google_compute_network.custom_vpc.name\n\n  allow {\n    protocol = \"tcp\"\n    ports    = [\"22\"]\n  }\n\n  source_ranges = [\"10.10.1.0/24\"]\n  target_tags   = [\"ssh-ok\"]\n}\nRead it as: traffic FROM the ops subnet MAY reach instances TAGGED ssh-ok on port 22. Everything else SSH is denied by default.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const f = main.match(/resource\s+"google_compute_firewall"\s+"allow_ssh_bastion"\s*\{([\s\S]*?)\n\}/);
          if (!f) return false;
          const b = f[1];
          return /network\s*=\s*google_compute_network\.custom_vpc\.name/.test(b) &&
                 /allow\s*\{[\s\S]*protocol\s*=\s*"tcp"[\s\S]*ports\s*=\s*\[\s*"22"\s*\]/.test(b) &&
                 /source_ranges\s*=\s*\[\s*"10\.10\.1\.0\/24"\s*\]/.test(b) &&
                 /target_tags\s*=\s*\[\s*"ssh-ok"\s*\]/.test(b);
        }
      },
      {
        id: "task-6",
        description: "Declare google_compute_instance 'ops_bastion' in zone australia-southeast1-a: machine_type \"e2-small\", wired to snet_ops via a network_interface block, with tags [\"ssh-ok\"].",
        hint: "Add:\nresource \"google_compute_instance\" \"ops_bastion\" {\n  name         = \"ops-bastion\"\n  machine_type = \"e2-small\"\n  zone         = \"australia-southeast1-a\"\n  tags         = [\"ssh-ok\"]\n\n  boot_disk {\n    initialize_params {\n      image = \"debian-cloud/debian-12\"\n    }\n  }\n\n  network_interface {\n    subnetwork = google_compute_subnetwork.snet_ops.id\n  }\n}\nThe tags list is what the firewall rule's target_tags matches against — the two are halves of one mechanism.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const i = main.match(/resource\s+"google_compute_instance"\s+"ops_bastion"\s*\{([\s\S]*?)\n\}/);
          if (!i) return false;
          const b = i[1];
          return /machine_type\s*=\s*"e2-small"/.test(b) &&
                 /zone\s*=\s*"australia-southeast1-a"/.test(b) &&
                 /subnetwork\s*=\s*google_compute_subnetwork\.snet_ops\.id/.test(b) &&
                 /tags\s*=\s*\[\s*"ssh-ok"\s*\]/.test(b);
        }
      },
      {
        id: "task-7",
        description: "Run 'terraform plan' to see the dependency order (network before subnetworks, firewall referencing the network), then 'terraform apply'.",
        hint: "Type 'terraform plan' — 4 creates — then 'terraform apply'.",
        validationCheck: (_codeMap, state) => {
          return state.resources.some((r) => r.type === "google_compute_network" && r.name === "custom_vpc") &&
                 state.resources.some((r) => r.type === "google_compute_instance" && r.name === "ops_bastion");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 7.5: Custom-mode VPC quarantine (audit finding: default auto-mode VPC)
# TODO Task 1: network custom-vpc with auto_create_subnetworks = false
# TODO Task 2: locals env_label = "prod"
# TODO Task 3: subnet snet_ops (australia-southeast1, 10.10.1.0/24)
# TODO Task 4: subnet snet_apps (australia-southeast2, 10.20.1.0/24)
# TODO Task 5: firewall allow_ssh_bastion (tcp 22 from ops subnet, target ssh-ok)
# TODO Task 6: instance ops_bastion (e2-small, zone australia-southeast1-a, tags ssh-ok)
# TODO Task 7: plan + apply

provider "google" {
  project = "kiwirail-data"
  region  = "australia-southeast1"
}
`
    },
    solutionFiles: {
      "main.tf": `provider "google" {
  project = "kiwirail-data"
  region  = "australia-southeast1"
}

resource "google_compute_network" "custom_vpc" {
  name                    = "custom-vpc"
  auto_create_subnetworks = false
}

locals {
  env_label = "prod"
}

resource "google_compute_subnetwork" "snet_ops" {
  name          = "snet-ops-\${local.env_label}"
  region        = "australia-southeast1"
  network       = google_compute_network.custom_vpc.id
  ip_cidr_range = "10.10.1.0/24"
}

resource "google_compute_subnetwork" "snet_apps" {
  name          = "snet-apps-\${local.env_label}"
  region        = "australia-southeast2"
  network       = google_compute_network.custom_vpc.id
  ip_cidr_range = "10.20.1.0/24"
}

resource "google_compute_firewall" "allow_ssh_bastion" {
  name    = "allow-ssh-bastion"
  network = google_compute_network.custom_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["10.10.1.0/24"]
  target_tags   = ["ssh-ok"]
}

resource "google_compute_instance" "ops_bastion" {
  name         = "ops-bastion"
  machine_type = "e2-small"
  zone         = "australia-southeast1-a"
  tags         = ["ssh-ok"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.snet_ops.id
  }
}
`
    },
    solutionExplanation:
      "The audit fix is the auto_create_subnetworks = false switch plus explicitly declared regional subnets. Google's structural differences from AWS all show up here: regional (not AZ-scoped) subnets, ip_cidr_range naming, firewall targeting by tags instead of SG attachment, and one VM wired through a network_interface block."
  },
  {
    id: "lab-16-gcp-state-locking",
    lesson: "Multi-Cloud",
    level: 8,
    title: "16. Google: Remote State in GCS After the Concurrent-Apply Collision",
    subtitle: "GCS backend, bucket state locking, IAM-bound state bucket — intermediate",
    difficulty: "Intermediate",
    estimatedMinutes: 18,
    xp: 400,
    category: "Multi-Cloud",
    iconName: "Lock",
    architectureDiagramType: "s3_single",
    scenario:
      "REAL INCIDENT: Two engineers ran terraform apply on the same stack within 90 seconds. Local state files diverged; one apply silently deleted the other's newly created VM, and the 2 AM roll-back cost KiwiRail's freight-tracking dashboard a full day. Post-mortem action #1: ALL stacks move to a shared GCS backend with state locking, a dedicated state bucket, and least-privilege IAM on it.",
    visualGoal:
      "Build the state-management stack: a dedicated GCS bucket for terraform.tfstate with versioning enabled, a least-privilege IAM binding for the CI account, and the backend block wiring it up.",
    conceptTakeaway: [
      "The google backend is declared as backend \"gcs\" with bucket + prefix — prefix is the object path INSIDE the bucket (like S3's key).",
      "GCS backends acquire a LOCK object during state operations — no separate lock database needed (unlike AWS's classic DynamoDB pairing).",
      "State buckets get their OWN versioning + IAM: state is the crown jewels — losing or corrupting it loses every environment."
    ],
    tasks: [
      {
        id: "task-1",
        description: "Declare google_storage_bucket 'tf_state_kiwirail' with name \"kiwirail-tfstate-prod\" and location \"AUSTRALIA-SOUTHEAST1\" — the dedicated state bucket.",
        hint: "Add:\nresource \"google_storage_bucket\" \"tf_state_kiwirail\" {\n  name          = \"kiwirail-tfstate-prod\"\n  location      = \"AUSTRALIA-SOUTHEAST1\"\n  force_destroy = false\n}\nforce_destroy = false this time: Terraform must REFUSE to destroy a bucket holding the team's state — the exact opposite of the lab bucket's setting.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"tf_state_kiwirail"\s*\{([\s\S]*?)\n\}/);
          return !!b &&
                 /name\s*=\s*"kiwirail-tfstate-prod"/.test(b[1]) &&
                 /location\s*=\s*"AUSTRALIA-SOUTHEAST1"/.test(b[1]);
        }
      },
      {
        id: "task-2",
        description: "Enable versioning on the state bucket — a corrupted state must be recoverable to any earlier point.",
        hint: "Inside the state bucket block:\n  versioning {\n    enabled = true\n  }\nSame versioning block as Lab 7.4, but here the payload is terraform.tfstate itself — every apply overwrites it, so generations ARE the undo history.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"tf_state_kiwirail"\s*\{([\s\S]*?)\n\}/);
          return !!b && /versioning\s*\{[\s\S]*enabled\s*=\s*true/.test(b[1]);
        }
      },
      {
        id: "task-3",
        description: "Declare google_project_iam_member 'ci_state_writer' granting roles/storage.objectAdmin on the project to the CI service account \"terraform-ci@kiwirail-data.iam.gserviceaccount.com\".",
        hint: "Add:\nresource \"google_project_iam_member\" \"ci_state_writer\" {\n  project = \"kiwirail-data\"\n  role    = \"roles/storage.objectAdmin\"\n  member  = \"serviceAccount:terraform-ci@kiwirail-data.iam.gserviceaccount.com\"\n}\nobjectAdmin on the project covers the state bucket's objects (create/read/delete state objects) — and STOPS there: no compute, no networking. Least privilege on state means CI can rewrite state but not your cluster.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const iam = main.match(/resource\s+"google_project_iam_member"\s+"ci_state_writer"\s*\{([\s\S]*?)\n\}/);
          return !!iam &&
                 /role\s*=\s*"roles\/storage\.objectAdmin"/.test(iam[1]) &&
                 /member\s*=\s*"serviceAccount:terraform-ci@kiwirail-data\.iam\.gserviceaccount\.com"/.test(iam[1]);
        }
      },
      {
        id: "task-4",
        description: "Configure the remote backend: inside the terraform block, backend \"gcs\" with bucket \"kiwirail-tfstate-prod\" and prefix \"freight/tracker/prod\".",
        hint: "Add:\nterraform {\n  backend \"gcs\" {\n    bucket = \"kiwirail-tfstate-prod\"\n    prefix = \"freight/tracker/prod\"\n  }\n}\nprefix is the path INSIDE the bucket where this stack's state lands — you invent it, team convention <org>/<app>/<env>, exactly like S3's key argument.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          const be = main.match(/backend\s+"gcs"\s*\{([\s\S]*?)\n\s*\}/);
          return !!be &&
                 /bucket\s*=\s*"kiwirail-tfstate-prod"/.test(be[1]) &&
                 /prefix\s*=\s*"freight\/tracker\/prod"/.test(be[1]);
        }
      },
      {
        id: "task-5",
        description: "Run 'terraform init' to migrate the stack to the simulated remote GCS backend.",
        hint: "Type 'terraform init' in the terminal after the backend block is complete — the backend migration happens on init.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /backend\s+"gcs"\s*\{/s.test(main) && /prefix\s*=\s*"freight\/tracker\/prod"/.test(main);
        }
      },
      {
        id: "task-6",
        description: "Add tag ManagedBy = \"Terraform\" to the state bucket, then run 'terraform plan' followed by 'terraform apply' to provision the state stack.",
        hint: "Inside the state bucket block:\n  tags = {\n    ManagedBy = \"Terraform\"\n  }\nThen 'terraform plan' (1 create... the IAM binding applies too) and 'terraform apply'.",
        validationCheck: (codeMap, state) => {
          const main = codeMap["main.tf"] || "";
          const b = main.match(/resource\s+"google_storage_bucket"\s+"tf_state_kiwirail"\s*\{([\s\S]*?)\n\}/);
          const bucketOk = !!b && /\bManagedBy\s*=\s*"Terraform"/.test(b[1]);
          return bucketOk && state.resources.some((r) => r.type === "google_storage_bucket" && r.name === "tf_state_kiwirail");
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 7.6: Remote state in GCS (post-mortem: concurrent apply collision)
# TODO Task 1: state bucket kiwirail-tfstate-prod (AUSTRALIA-SOUTHEAST1, force_destroy FALSE)
# TODO Task 2: versioning on the state bucket
# TODO Task 3: IAM binding — CI service account gets roles/storage.objectAdmin
# TODO Task 4: backend "gcs" (bucket + prefix freight/tracker/prod)
# TODO Task 5: terraform init (backend migration)
# TODO Task 6: ManagedBy tag + plan + apply

provider "google" {
  project = "kiwirail-data"
  region  = "australia-southeast1"
}
`
    },
    solutionFiles: {
      "main.tf": `terraform {
  backend "gcs" {
    bucket = "kiwirail-tfstate-prod"
    prefix = "freight/tracker/prod"
  }
}

provider "google" {
  project = "kiwirail-data"
  region  = "australia-southeast1"
}

resource "google_storage_bucket" "tf_state_kiwirail" {
  name          = "kiwirail-tfstate-prod"
  location      = "AUSTRALIA-SOUTHEAST1"
  force_destroy = false

  versioning {
    enabled = true
  }

  tags = {
    ManagedBy = "Terraform"
  }
}

resource "google_project_iam_member" "ci_state_writer" {
  project = "kiwirail-data"
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:terraform-ci@kiwirail-data.iam.gserviceaccount.com"
}
`
    },
    solutionExplanation:
      "The collision's fix inverts Lab 9's AWS shape: same remote-state reasoning (shared backend, invented path, least-privilege identity), but Google pairs the bucket WITH locking built in — the backend acquires a lock object during state operations instead of needing a DynamoDB table. Versioning on the bucket is the recovery plan for the worst-case corruption the collision caused."
  }
];
