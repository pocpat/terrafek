export interface TermDefinition {
  term: string;
  aliases?: string[];
  formal: string;
  eli5: string;
  category: "syntax" | "concept" | "architecture" | "workflow" | "command" | "cloud";
}

export const GLOSSARY: Record<string, TermDefinition> = {
  hcl: {
    term: "HCL (HashiCorp Configuration Language)",
    aliases: ["HCL", "HashiCorp Configuration Language", "hcl"],
    formal:
      "A domain-specific declarative configuration language created by HashiCorp. It bridges human readability with machine-parsable JSON compatibility to describe cloud infrastructure resources, attributes, and relationships.",
    eli5:
      "Think of HCL like a grocery list for the cloud. Instead of ordering a computer manually, you write down on a list: 'Give me 1 computer and 1 hard drive', and the robot reads your list and buys them for you.",
    category: "syntax"
  },
  declarative: {
    term: "Declarative",
    aliases: ["Declarative", "declarative"],
    formal:
      "A paradigm where you define the desired target end-state of your system, and the tooling computes the delta and executes the requisite steps to achieve that target, unlike imperative scripting which lists explicit operational instructions.",
    eli5:
      "Like ordering a pepperoni pizza at a restaurant: you just say 'I want a pepperoni pizza' (the end result), rather than telling the chef how to roll the dough, turn on the oven, and slice the cheese step-by-step.",
    category: "concept"
  },
  iac: {
    term: "IaC (Infrastructure as Code)",
    aliases: ["IaC", "Infrastructure as Code", "infrastructure as code"],
    formal:
      "The management and provisioning of infrastructure through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.",
    eli5:
      "Writing down the recipe for your entire cloud setup in a text file so you can build 100 identical cloud systems with the push of a button.",
    category: "concept"
  },
  idempotent: {
    term: "Idempotent / Idempotency",
    aliases: ["Idempotent", "idempotency", "Idempotency", "idempotent"],
    formal:
      "A mathematical and computational property where an operation produces the identical resulting state regardless of whether it is applied once or multiple successive times with identical inputs.",
    eli5:
      "Like an elevator button: pressing the 5th-floor button 10 times in a row won't take you to the 50th floor—it just keeps taking you safely to floor 5 without breaking anything.",
    category: "concept"
  },
  state: {
    term: "Terraform State (terraform.tfstate)",
    aliases: ["State", "terraform.tfstate", "state file", "State File", "state"],
    formal:
      "A persistent JSON-formatted metadata mapping between the abstract resource addresses defined in configuration code and the physical infrastructure IDs provisioned in cloud provider APIs.",
    eli5:
      "A digital ledger or inventory notebook where Terraform writes down: 'The virtual machine in our code named web_server is actually ID #i-987654 in Amazon Cloud.'",
    category: "architecture"
  },
  provider: {
    term: "Provider Plugin",
    aliases: ["Provider", "provider", "AWS Provider", "providers", "Provider Plugin"],
    formal:
      "An executable gRPC plugin responsible for abstracting cloud vendor REST APIs (such as AWS, Azure, Google Cloud, or Kubernetes) into standardized CRUD resource and data source schemas.",
    eli5:
      "A multilingual translator. Terraform speaks HCL, and Amazon Cloud speaks AWS API. The AWS Provider translates Terraform's requests into commands Amazon can understand.",
    category: "architecture"
  },
  plugin: {
    term: "Plugin Architecture",
    aliases: ["plugin", "plugins", "provider plugin"],
    formal:
      "Independent binaries communicating with Terraform Core via RPC/gRPC over local IPC, exposing resource lifecycle hooks without recompiling the Terraform binary.",
    eli5:
      "Like game cartridges for a Nintendo console: Terraform is the console, and AWS/Azure plugins are game cartridges you plug in to play in different cloud worlds.",
    category: "architecture"
  },
  grpc: {
    term: "gRPC Protocol",
    aliases: ["grpc", "gRPC", "RPC"],
    formal:
      "A high-performance, open-source universal RPC framework used by Terraform Core to communicate with provider plugins via protocol buffers.",
    eli5:
      "A super-fast direct phone line between Terraform and the cloud plugins so they can talk to each other without delays.",
    category: "architecture"
  },
  resource: {
    term: "Resource Block",
    aliases: ["Resource", "resource block", "resource", "resources"],
    formal:
      "The primary declarative infrastructure element in HCL that declares a piece of managed infrastructure to be created, updated, or destroyed (e.g., virtual machines, VPCs, DNS records).",
    eli5:
      "A single LEGO brick in your digital city—like a single computer server, a database, or a security gate.",
    category: "syntax"
  },
  data: {
    term: "Data Source",
    aliases: ["data source", "data block", "data", "data sources"],
    formal:
      "A read-only query allowing Terraform to fetch information defined outside of Terraform or managed by another separate Terraform configuration.",
    eli5:
      "A phone directory lookup: read existing cloud information (like looking up which Ubuntu version is newest) without building anything new.",
    category: "syntax"
  },
  plan: {
    term: "Execution Plan (terraform plan)",
    aliases: ["Plan", "terraform plan", "Execution Plan", "plan"],
    formal:
      "A speculative execution preview generated by comparing existing state, provider APIs, and desired configuration, calculating the exact diff (+ create, ~ update, - destroy).",
    eli5:
      "A blueprint preview before building a house: the builder shows you a drawing of what will be added or removed before spending a single dollar or hammer swing.",
    category: "workflow"
  },
  apply: {
    term: "Apply (terraform apply)",
    aliases: ["Apply", "terraform apply", "apply"],
    formal:
      "The phase where Terraform executes the planned API calls against the target provider to make real-world infrastructure match configuration, updating the state file upon completion.",
    eli5:
      "The moment the construction crew starts working for real, making phone calls to cloud servers to build your setup.",
    category: "workflow"
  },
  destroy: {
    term: "Destroy (terraform destroy)",
    aliases: ["destroy", "terraform destroy"],
    formal:
      "A targeted or complete teardown command that deletes all managed cloud infrastructure objects recorded in the state file in reverse dependency order.",
    eli5:
      "A demolition button that safely takes down all the cloud servers you built so you don't get billed when you're done experimenting.",
    category: "workflow"
  },
  init: {
    term: "Initialize (terraform init)",
    aliases: ["init", "terraform init"],
    formal:
      "Initializes a working directory containing Terraform configuration files by downloading provider plugins, installing child modules, and setting up backend state storage.",
    eli5:
      "Unpacking the toolbox: downloading the required cloud connectors and preparing the work desk before building anything.",
    category: "workflow"
  },
  drift: {
    term: "Configuration Drift",
    aliases: ["Drift", "drift", "Configuration Drift"],
    formal:
      "The divergence between the actual state of cloud infrastructure (e.g., caused by manual console modifications or out-of-band changes) and the expected state recorded in Terraform configuration/state.",
    eli5:
      "When someone sneaks into the kitchen at night and paints the cabinets yellow without telling anyone. Next morning, the house plan doesn't match the real kitchen anymore.",
    category: "concept"
  },
  lock: {
    term: "State Locking",
    aliases: ["State Lock", "State Locking", "Locking", "state lock", "lock"],
    formal:
      "A concurrency control mechanism (using DynamoDB or backend locks) that prevents simultaneous Terraform write operations from corrupting the state file.",
    eli5:
      "Putting an 'IN USE - DO NOT TOUCH' padlock on the notebook so two people don't try to write notes on the exact same page at the same second.",
    category: "architecture"
  },
  module: {
    term: "Terraform Module",
    aliases: ["Module", "module", "modules"],
    formal:
      "A self-contained package of Terraform configurations managed as a cohesive unit to promote code reusability, standardization, and encapsulation.",
    eli5:
      "A pre-assembled LEGO kit (like a complete castle tower). Instead of assembling 50 individual bricks each time, you just drop in the whole tower kit with one line.",
    category: "concept"
  },
  backend: {
    term: "Remote Backend",
    aliases: ["Backend", "backend", "remote backend", "s3 backend"],
    formal:
      "The storage location and operational abstraction for storing Terraform state files securely off local disks (e.g., AWS S3, Google Cloud Storage, Terraform Cloud).",
    eli5:
      "A secure cloud safe-deposit box where you store your shared master inventory ledger so team members never lose it or overwrite each other's laptops.",
    category: "architecture"
  },
  dag: {
    term: "DAG (Directed Acyclic Graph)",
    aliases: ["DAG", "Directed Acyclic Graph", "Dependency Graph", "graph", "dependency"],
    formal:
      "A topological data structure representing resource dependencies without circular loops, allowing Terraform to parallelize non-dependent resource creations safely.",
    eli5:
      "A smart step-by-step recipe: you must bake the cake base first before putting frosting on top, but you can chop strawberries and melt chocolate at the exact same time.",
    category: "architecture"
  },
  variable: {
    term: "Input Variable",
    aliases: ["variable", "variables", "var", "vars"],
    formal:
      "Parameters that serve as input arguments for customizable Terraform configurations and modules without altering source code directly.",
    eli5:
      "A fill-in-the-blank question (like asking: 'What color do you want your house painted?').",
    category: "syntax"
  },
  output: {
    term: "Output Value",
    aliases: ["output", "outputs"],
    formal:
      "Return values exposed after an apply operation, used for displaying key provisioning data (like public IPs) or passing data between modules.",
    eli5:
      "A receipt printer: once the cloud computer is built, it prints the IP address or web link onto your screen.",
    category: "syntax"
  },
  locals: {
    term: "Local Values (locals)",
    aliases: ["locals", "local", "local value"],
    formal:
      "Internal named expressions within a module to assign a name to an expression, reducing repetition and avoiding duplicated logic.",
    eli5:
      "A nickname or shortcut for a long sentence so you don't have to keep typing it over and over.",
    category: "syntax"
  },
  vpc: {
    term: "VPC (Virtual Private Cloud)",
    aliases: ["VPC", "vpc", "Virtual Private Cloud", "aws_vpc"],
    formal:
      "An isolated private software-defined virtual network logically dedicated to your AWS or cloud account.",
    eli5:
      "A private fenced yard inside the cloud where only your servers and computers are allowed to live.",
    category: "cloud"
  },
  subnet: {
    term: "Subnet",
    aliases: ["subnet", "subnets", "aws_subnet"],
    formal:
      "A segmented subdivision of a VPC's IP address range designated within a specific Availability Zone for traffic isolation.",
    eli5:
      "A specific room or street inside your fenced yard where certain computers gather together.",
    category: "cloud"
  },
  cidr: {
    term: "CIDR Block (Classless Inter-Domain Routing)",
    aliases: ["CIDR", "cidr", "cidr_block", "ip range"],
    formal:
      "A method of allocating IP addresses and routing IP packets using prefix notation (e.g. 10.0.0.0/16) to define address ranges.",
    eli5:
      "The numerical range of house numbers and mailboxes assigned to your digital street.",
    category: "cloud"
  },
  ami: {
    term: "AMI (Amazon Machine Image)",
    aliases: ["AMI", "ami", "machine image", "os image"],
    formal:
      "A pre-configured template containing the operating system, server software, and launch permissions required to launch an EC2 instance.",
    eli5:
      "The master installation disc containing Windows or Linux that boots up your new virtual computer.",
    category: "cloud"
  },
  count: {
    term: "count Meta-Argument",
    aliases: ["count", "meta-argument count"],
    formal:
      "A resource/module meta-argument that accepts an integer and provisions that exact quantity of duplicate resource instances.",
    eli5:
      "A multiplier button: telling Terraform 'Make 3 copies of this computer server'.",
    category: "syntax"
  },
  for_each: {
    term: "for_each Meta-Argument",
    aliases: ["for_each", "meta-argument for_each"],
    formal:
      "A meta-argument accepting a map or set of strings, creating a distinct resource instance per item with key-based addressing.",
    eli5:
      "A smart loop: 'For each employee in this list, give them their own personal security badge.'",
    category: "syntax"
  },
  depends_on: {
    term: "depends_on Meta-Argument",
    aliases: ["depends_on", "explicit dependency"],
    formal:
      "Specifies explicit dependencies between resources where Terraform cannot automatically infer the creation ordering.",
    eli5:
      "A strict rule: 'Do not start building resource B until resource A is 100% finished and ready.'",
    category: "syntax"
  }
};

export function lookupTerm(query: string): TermDefinition | null {
  if (!query) return null;
  const raw = query.trim();
  const normalized = raw.toLowerCase().replace(/[^a-z0-9_ -]/g, "").trim();
  if (!normalized) return null;

  if (GLOSSARY[normalized]) return GLOSSARY[normalized];

  // Try direct key matching
  for (const [k, item] of Object.entries(GLOSSARY)) {
    if (k === normalized) return item;
    if (item.term.toLowerCase() === normalized) return item;
    if (item.aliases?.some((a) => a.toLowerCase() === normalized)) return item;
  }

  // Try partial word matching
  for (const item of Object.values(GLOSSARY)) {
    if (
      normalized.includes(item.term.toLowerCase()) ||
      item.aliases?.some((a) => normalized.includes(a.toLowerCase()) || a.toLowerCase().includes(normalized))
    ) {
      return item;
    }
  }

  // Fallback dynamic generator for cloud/code words
  if (normalized.length >= 3) {
    return {
      term: raw,
      formal: `Technical Terraform/Cloud terminology: '${raw}'. Refers to infrastructure configuration, attributes, or cloud orchestration primitives.`,
      eli5: `A specific setting or building block in Terraform that helps configure your cloud infrastructure.`,
      category: "concept"
    };
  }

  return null;
}
