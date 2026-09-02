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
        description: "In 'main.tf', declare an aws_instance 'app' and use 'local.server_name' as its Name tag.",
        hint: "Create the resource with a tags block:\nresource \"aws_instance\" \"app\" {\n  ami = \"ami-0c55b159cbfafe1f0\"\n  tags = {\n    Name = local.server_name\n  }\n}",
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
      "main.tf": `# Lab 3: Input Variables & Locals
# TODO Task 1: Configure the AWS provider (region eu-west-1)
# TODO Task 4: Add a locals block computing the server name
# TODO Task 5 & 6: Declare the aws_instance "app" resource

`,
      "variables.tf": `# Lab 3: Input Variables
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
          return /resource\s+"aws_vpc"\s+"main"\s*\{/s.test(main) && main.includes("10.0.0.0/16");
        }
      },
      {
        id: "task-3",
        description: "Create an 'aws_subnet' named 'public' referencing 'aws_vpc.main.id' with cidr_block '10.0.1.0/24'.",
        hint: "Add a resource block that wires the subnet to the VPC:\nresource \"aws_subnet\" \"public\" {\n  vpc_id     = aws_vpc.main.id\n  cidr_block = \"10.0.1.0/24\"\n}",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_subnet"\s+"public"\s*\{/s.test(main) &&
                 main.includes("aws_vpc.main.id") &&
                 main.includes("10.0.1.0/24");
        }
      },
      {
        id: "task-4",
        description: "Create an 'aws_security_group' named 'web_sg' inside the VPC that allows inbound traffic on ports 80 and 443.",
        hint: "Add a security group with two ingress blocks (one for port 80, one for port 443), referencing aws_vpc.main.id:\nresource \"aws_security_group\" \"web_sg\" {\n  name   = \"allow-web-traffic\"\n  vpc_id = aws_vpc.main.id\n\n  ingress {\n    from_port   = 80\n    to_port     = 80\n    protocol    = \"tcp\"\n    cidr_blocks = [\"0.0.0.0/0\"]\n  }\n\n  ingress {\n    from_port   = 443\n    to_port     = 443\n    protocol    = \"tcp\"\n    cidr_blocks = [\"0.0.0.0/0\"]\n  }\n}",
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
      "main.tf": `# Lab 4: Cloud Networking & Resource Graphs
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
          return out.includes('output "db_password"') && /sensitive\s*=\s*true/.test(out);
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
        hint: "In variables.tf: variable \"services\" { type = map(string), default = { frontend = \"t3.small\", backend = \"t3.medium\", worker = \"t3.micro\" } } — but write the three entries yourself.",
        validationCheck: (codeMap) => {
          const v = codeMap["variables.tf"] || "";
          return /variable\s+"services"/.test(v) && /type\s*=\s*map\(string\)/.test(v) &&
                 v.includes("frontend") && v.includes("backend") && v.includes("worker");
        }
      },
      {
        id: "task-2",
        description: "Use the for_each meta-argument to iterate over the 'services' variable you just defined. Each instance should use the iteration value as its instance type.",
        hint: "resource \"aws_instance\" \"service\" { for_each = var.services, instance_type = each.value, ... }",
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
      "variables.tf": `# Lab 7: Scaling with Count & For_Each
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
        validationCheck: (_codeMap, state) => state.resources.length >= 2
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
        hint: "resource \"aws_vpc\" \"prod\" with cidr_block = \"10.0.0.0/16\" and enable_dns_hostnames = true.",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_vpc"\s+"prod"/.test(main) && main.includes("10.0.0.0/16");
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
        description: "Tier 1 — Security: create the security group 'web_sg' inside the VPC allowing inbound TCP 443.",
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
        hint: "resource \"aws_lb\" \"app_alb\" { load_balancer_type = \"application\", security_groups = [aws_security_group.web_sg.id], subnets = [aws_subnet.public_1.id] }",
        validationCheck: (codeMap) => {
          const main = codeMap["main.tf"] || "";
          return /resource\s+"aws_lb"\s+"app_alb"/.test(main) &&
                 /aws_lb"\s+"app_alb"\s*\{[\s\S]*?aws_security_group\.web_sg\.id/.test(main) &&
                 /aws_lb"\s+"app_alb"\s*\{[\s\S]*?aws_subnet\.public_1\.id/.test(main);
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
        description: "Compute tier & launch: declare the app instance 'app_cluster' inside the PRIVATE subnet, then run 'terraform apply' to provision the full topology.",
        hint: "resource \"aws_instance\" \"app_cluster\" { subnet_id = aws_subnet.private_1.id ... } — then type 'terraform apply' in the terminal.",
        validationCheck: (codeMap, state) => {
          const main = codeMap["main.tf"] || "";
          const wired = /resource\s+"aws_instance"\s+"app_cluster"\s*\{[\s\S]*?subnet_id\s*=\s*aws_subnet\.private_1\.id/.test(main);
          return wired && state.resources.length >= 6;
        }
      }
    ],
    starterFiles: {
      "main.tf": `# Lab 10: HERO — Multi-Tier HA Production Architecture
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
  }
];
