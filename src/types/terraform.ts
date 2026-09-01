export type CloudProvider = "aws" | "google" | "azurerm";

export type ResourceStatus = "planned_add" | "planned_change" | "planned_destroy" | "applied" | "untracked" | "drifted";

export interface ResourceAttribute {
  name: string;
  value: any;
  type: "string" | "number" | "boolean" | "list" | "map" | "reference";
}

export interface ParsedResource {
  id: string; // e.g. "aws_s3_bucket.main"
  type: string; // e.g. "aws_s3_bucket"
  name: string; // e.g. "main"
  provider: CloudProvider;
  category: "storage" | "compute" | "network" | "database" | "security" | "iam" | "generic";
  attributes: Record<string, any>;
  dependsOn: string[];
  status: ResourceStatus;
  driftValue?: Record<string, any>;
  fileOrigin?: string;
  parentResource?: string; // for subnets in VPC, etc.
}

export interface ParsedVariable {
  name: string;
  type?: string;
  description?: string;
  default?: any;
  value?: any;
}

export interface ParsedOutput {
  name: string;
  value: string;
  description?: string;
  sensitive?: boolean;
}

export interface ParsedLocal {
  name: string;
  value: string;
}

export interface ParsedModule {
  name: string;
  source: string;
  inputs: Record<string, any>;
}

export interface TerraformStateFile {
  version: number;
  terraform_version: string;
  serial: number;
  lineage: string;
  outputs: Record<string, { value: any; type: string; sensitive?: boolean }>;
  resources: Array<{
    mode: "managed" | "data";
    type: string;
    name: string;
    provider: string;
    instances: Array<{
      schema_version: number;
      attributes: Record<string, any>;
      dependencies: string[];
    }>;
  }>;
}

export interface LabTask {
  id: string;
  description: string;
  hint: string;
  validationCheck: (codeMap: Record<string, string>, state: TerraformStateFile, parsed: ParsedResource[]) => boolean;
}

export interface LabDefinition {
  id: string;
  level: number; // 0 to 7
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Hero";
  estimatedMinutes: number;
  xp: number;
  category: "Foundations" | "Core Workflow" | "Variables & State" | "Networking & Graph" | "Modules & Scale" | "Production Arch";
  iconName: string;
  scenario: string;
  visualGoal: string;
  conceptTakeaway: string[];
  tasks: LabTask[];
  starterFiles: Record<string, string>;
  solutionFiles: Record<string, string>;
  solutionExplanation: string;
  initialState?: TerraformStateFile;
  architectureDiagramType: "s3_single" | "ec2_web" | "vpc_network" | "multi_tier_app" | "modular_cloud" | "ha_production";
}

export interface TerminalCommandLog {
  id: string;
  command: string;
  output: string;
  isError?: boolean;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  codeSnippet?: string;
  diagramSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export interface CheatSheetSection {
  title: string;
  description: string;
  items: Array<{
    title: string;
    syntax: string;
    explanation: string;
    example: string;
  }>;
}

export type WalkthroughDiagramType =
  | "provider_flow"
  | "provider_config_flow"
  | "plugin_lifecycle"
  | "provider_alias_routing"
  | "anatomy_breakdown"
  | "dependency_graph"
  | "resource_stack"
  | "best_practice_matrix"
  | "variable_pipeline"
  | "locals_flow"
  | "output_flow"
  | "state_reconciliation"
  | "state_file_map"
  | "remote_backend"
  | "init_stage"
  | "plan_stage"
  | "apply_stage"
  | "cli_lifecycle"
  | "module_hierarchy"
  | "module_interface"
  | "data_lookup"
  | "dag_parallelism"
  | "cycle_error";

export interface WalkthroughStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  explanation: string;
  objectives: string[];
  keyRules: string[];
  codeSnippet: string;
  fileName?: string;
  codeHighlights?: Array<{ label: string; text: string }>;
  diagramType: WalkthroughDiagramType;
  diagramData?: any;
  exampleFiles?: Record<string, string>;
  commandToTest?: string;
  quickCheck?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface VisualWalkthrough {
  id: string;
  conceptId: string;
  title: string;
  subtitle: string;
  category: "Core Foundations" | "Configuration Language" | "State & Lifecycle" | "Architecture & Scale";
  estimatedMinutes: number;
  icon: string;
  summary: string;
  mainObjectives: string[];
  steps: WalkthroughStep[];
  starterFiles: Record<string, string>;
}

export type SkillDomain =
  | "syntax_anatomy"
  | "variables_types"
  | "resource_dependencies"
  | "state_lifecycle"
  | "modules_architecture"
  | "resource_attributes";

export interface LoggedErrorEvent {
  id: string;
  timestamp: string;
  source: "validation" | "terminal" | "quiz" | "syntax";
  command?: string;
  message: string;
  contextCode?: string;
  domain: SkillDomain;
  suggestedTopic: string;
  resolved?: boolean;
}

export interface SkillDomainAnalysis {
  domain: SkillDomain;
  title: string;
  description: string;
  iconName: string;
  errorCount: number;
  totalAttempts: number;
  masteryScore: number; // 0 - 100
  status: "Mastered" | "Proficient" | "Needs Practice" | "Critical Gap" | "Not Assessed";
  recentErrors: LoggedErrorEvent[];
  recommendedDrillId: string;
  recommendedLabIndex?: number;
}

export interface RemediationDrill {
  id: string;
  domain: SkillDomain;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  diagnosticReason: string;
  learningConcept: string;
  commonMistakeExplanation: string;
  brokenSnippet: string;
  fixedSnippet: string;
  ruleBulletPoints: string[];
  practiceTask: string;
  commandToTest?: string;
  starterFiles: Record<string, string>;
  solutionFiles: Record<string, string>;
  validationCheck: (codeMap: Record<string, string>, state: TerraformStateFile, parsed: ParsedResource[]) => boolean;
}

export interface CourseProgressSummary {
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  totalWalkthroughs: number;
  completedWalkthroughs: number;
  totalXp: number;
  currentStreakDays: number;
  totalDaysSinceStart: number;
  activeDaysCount: number;
  nextRecommendedLesson: {
    type: "walkthrough" | "lab" | "drill";
    index: number;
    title: string;
    reason: string;
  };
}


