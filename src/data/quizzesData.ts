import { QuizQuestion } from "../types/terraform";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    category: "Core Workflow",
    question: "Which command must be executed FIRST when cloning a brand new Terraform repository?",
    scenario: "You just downloaded a Terraform codebase from GitHub with provider configurations for AWS and Azure.",
    options: [
      "terraform apply",
      "terraform init",
      "terraform plan",
      "terraform refresh"
    ],
    correctIndex: 1,
    explanation:
      "`terraform init` initializes the working directory, downloads required provider plugins (e.g. AWS provider), and configures the backend."
  },
  {
    id: "q2",
    category: "HCL Syntax",
    question: "In the block `resource \"aws_s3_bucket\" \"logs\" { ... }`, how do you reference the bucket's ID in another resource?",
    codeSnippet: `resource "aws_s3_bucket" "logs" {
  bucket = "company-logs-2026"
}`,
    options: [
      "aws_s3_bucket.logs.id",
      "resources.aws_s3_bucket.logs",
      "var.aws_s3_bucket.logs.id",
      "aws_s3_bucket[\"logs\"].bucket"
    ],
    correctIndex: 0,
    explanation:
      "Resources are addressed by `<RESOURCE_TYPE>.<LOCAL_NAME>.<ATTRIBUTE>`, so `aws_s3_bucket.logs.id` is the standard syntax."
  },
  {
    id: "q3",
    category: "Dependencies & Graph",
    question: "How does Terraform know in which order to provision resources?",
    options: [
      "Top-to-bottom line order in the .tf file",
      "Alphabetical order of resource names",
      "By constructing a Directed Acyclic Graph (DAG) based on references and explicit depends_on",
      "By creating resources sequentially one-by-one"
    ],
    correctIndex: 2,
    explanation:
      "Terraform parses references between resources to build a Directed Acyclic Graph (DAG), enabling independent resources to be built concurrently in parallel."
  },
  {
    id: "q4",
    category: "State & Drift",
    question: "What happens when an engineer modifies an EC2 security group manually in the AWS Console, and you then run `terraform apply`?",
    options: [
      "Terraform crashes with a corruption error",
      "Terraform automatically rewrites your local .tf file to match the console change",
      "Terraform ignores the cloud change completely",
      "Terraform detects the drift and updates the cloud resource back to match the declared HCL code"
    ],
    correctIndex: 3,
    explanation:
      "Terraform is declarative: your code is the source of truth. Running `apply` will reconcile the drifted cloud infrastructure back to what is declared in code."
  },
  {
    id: "q5",
    category: "Scaling",
    question: "Why is `for_each` generally preferred over `count` when managing sets of independent resources?",
    options: [
      "Removing an item from the middle of a `count` list causes re-indexing and accidental destruction/recreation of subsequent resources",
      "`for_each` runs 10x faster than `count`",
      "`count` cannot create more than 5 resources",
      "`for_each` doesn't require a state file"
    ],
    correctIndex: 0,
    explanation:
      "`count` indexes resources by integer ([0], [1], [2]). If index [1] is removed, index [2] becomes [1], causing Terraform to modify/destroy it. `for_each` uses stable string keys."
  },
  {
    id: "q7",
    category: "Files & Secrets",
    question: "You need the EC2 instance size to be different in staging and production. Which file should hold that value?",
    scenario: "Your app.tf has instance_type = \"t3.micro\" hardcoded, but staging uses t3.micro and production uses t3.large.",
    options: [
      "terraform.tfstate — state stores all configurable values",
      "variables.tf — declare the input variable; reference it as var.instance_type in main.tf",
      "main.tf — write two resource blocks, one per environment",
      "It cannot be done — Terraform values are fixed at creation"
    ],
    correctIndex: 1,
    explanation:
      "values you want to change per environment belong in variables.tf as input variables; main.tf references them via var.<name>. That way one codebase serves every environment."
  },
  {
    id: "q8",
    category: "Files & Secrets",
    question: "What does terraform.tfstate contain that your .tf files do NOT?",
    options: [
      "A second copy of your resource arguments, for backup",
      "Cloud-assigned facts: real resource IDs, public IPs, ARNs, and generated passwords",
      "The Terraform provider plugin binaries",
      "Your AWS access keys, encrypted"
    ],
    correctIndex: 1,
    explanation:
      "State is Terraform's MEMORY: it maps each code address (aws_instance.app) to the real cloud resource (i-0a1b2c3d) and records cloud-computed attributes (IPs, ARNs, generated passwords) that exist nowhere in your code."
  },
  {
    id: "q9",
    category: "Files & Secrets",
    question: "You marked an output as sensitive = true. Where can the secret value still be found in plaintext?",
    codeSnippet: `output \"db_password\" {
  value     = aws_db_instance.main.password
  sensitive = true
}`,
    options: [
      "Nowhere — sensitive = true encrypts the value everywhere",
      "In terraform.tfstate, stored in plaintext",
      "Only inside the AWS IAM console",
      "In the .terraform.lock.hcl file"
    ],
    correctIndex: 1,
    explanation:
      "sensitive = true only redacts CLI output (shows <sensitive>). The value is stored unencrypted in terraform.tfstate — protect it with an encrypted remote backend and never commit state to Git."
  },
  {
    id: "q10",
    category: "Files & Secrets",
    question: "Which pair describes the correct division of labor between YOU and Terraform?",
    options: [
      "You write main.tf and variables.tf; Terraform writes and updates terraform.tfstate automatically",
      "You write main.tf, variables.tf, and terraform.tfstate; Terraform only reads them",
      "Terraform writes main.tf from your plan; you maintain terraform.tfstate by hand",
      "You write everything once; Terraform copies variables.tf into terraform.tfstate for backup"
    ],
    correctIndex: 0,
    explanation:
      "You author the wish (main.tf + variables.tf). Terraform alone maintains the memory (terraform.tfstate) — never hand-edit it; cloud-assigned facts live only there, which is why it is not a duplicate of your code."
  },
  {
    id: "q11",
    category: "Files & Secrets",
    question: "What is the correct HCL to enable an output's log redaction — and what does it NOT do?",
    options: [
      'sensitive = "true"; it encrypts the value in the state file',
      'sensitive = true; it only redacts CLI output — the value stays plaintext in tfstate and the DB needs its own encryption',
      'encrypt = true; it encrypts the output value at rest',
      'secret = true; it moves the value into Secrets Manager'
    ],
    correctIndex: 1,
    explanation:
      'Booleans are unquoted in HCL ("true" is a string error). sensitive = true is display redaction only; data at rest needs storage_encrypted/KMS, and the state file needs an encrypted backend.'
  },
  {
    id: "q12",
    category: "Files & Secrets",
    question: "Which resource + argument pair encrypts an RDS database at rest with a key YOU control and can rotate?",
    options: [
      "aws_secretsmanager_secret + secret_string",
      "aws_kms_key + storage_encrypted = true and kms_key_id on the DB",
      "aws_ssm_parameter + SecureString",
      "sensitive = true on the db_password output"
    ],
    correctIndex: 1,
    explanation:
      "Encryption at rest = a KMS key resource plus the encrypted/kms_key_id argument on the storage resource (RDS, EBS, S3). Secrets Manager stores passwords; KMS encrypts data."
  },
  {
    id: "q13",
    category: "Files & Secrets",
    question: "What is the production-grade way to give an RDS instance its master password WITHOUT any human typing it into code?",
    options: [
      "Put it in a Git-ignored terraform.tfvars file",
      "generate a random string in your shell and paste it into variables.tf",
      "manage_master_user_password = true — AWS Secrets Manager creates and rotates it",
      "Base64-encode the password in main.tf"
    ],
    correctIndex: 2,
    explanation:
      "manage_master_user_password = true delegates creation and rotation to AWS Secrets Manager. random_password is the good DIY option; tfvars (even ignored) still lands plaintext in tfstate and on your disk."
  },
  {
    id: "q6",
    category: "Security",
    question: "What does setting `sensitive = true` on an output block achieve?",
    options: [
      "It encrypts the entire .tfstate file with AES-256",
      "It requires a password to run terraform destroy",
      "It prevents the output value from being displayed in plaintext in CLI logs and console output",
      "It locks the cloud provider account"
    ],
    correctIndex: 2,
    explanation:
      "`sensitive = true` suppresses output values from showing up in plaintext in `terraform plan` and `terraform apply` CLI logs."
  }
];
