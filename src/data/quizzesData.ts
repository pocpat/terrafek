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
