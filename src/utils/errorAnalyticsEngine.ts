import {
  LoggedErrorEvent,
  SkillDomain,
  SkillDomainAnalysis,
  CourseProgressSummary
} from "../types/terraform";
import { LABS_DATA } from "../data/labsData";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";
import { REMEDIATION_DRILLS_DATA } from "../data/remediationDrillsData";

// Initial seed errors: starts empty so learners only see diagnostics & skill gaps after actual lab activity and mistakes
export const INITIAL_SEED_ERRORS: LoggedErrorEvent[] = [];

export const DOMAIN_LAB_MAPPING: Record<SkillDomain, { labIds: string[]; primaryLabIndex: number }> = {
  syntax_anatomy: {
    labIds: ["lab-1-first-resource", "lab-2-core-workflow"],
    primaryLabIndex: 0
  },
  variables_types: {
    labIds: ["lab-3-variables-outputs"],
    primaryLabIndex: 2
  },
  resource_dependencies: {
    labIds: ["lab-5-vpc-multi-resource"],
    primaryLabIndex: 4
  },
  state_lifecycle: {
    labIds: ["lab-4-state-lifecycle", "lab-7-drift-recovery"],
    primaryLabIndex: 3
  },
  modules_architecture: {
    labIds: ["lab-6-child-modules", "lab-8-multi-tier-app"],
    primaryLabIndex: 5
  }
};

export const SKILL_DOMAINS_INFO: Record<
  SkillDomain,
  { title: string; description: string; iconName: string; defaultDrillId: string; labIndex: number }
> = {
  syntax_anatomy: {
    title: "HCL Syntax & Anatomy",
    description: "Block declarations, balanced braces, double-quoted strings, and formatting standards.",
    iconName: "Code2",
    defaultDrillId: "drill-syntax-braces",
    labIndex: 0
  },
  variables_types: {
    title: "Variables & Type Constraints",
    description: "Input variables, modern bare references, default types, and local expressions.",
    iconName: "Sliders",
    defaultDrillId: "drill-var-interpolation",
    labIndex: 2
  },
  resource_dependencies: {
    title: "Resource Dependencies & DAG Graph",
    description: "Cross-resource attribute interpolation, implicit vs explicit dependencies, and cyclic resolution.",
    iconName: "GitGraph",
    defaultDrillId: "drill-resource-references",
    labIndex: 4
  },
  state_lifecycle: {
    title: "State Management & Drift Detection",
    description: "State file mappings, 3-way reconciliation, remote locking, and CLI lifecycle stages.",
    iconName: "FileJson",
    defaultDrillId: "drill-state-drift",
    labIndex: 3
  },
  modules_architecture: {
    title: "Modular Cloud Architecture",
    description: "Child module contracts, parameter encapsulation, and reusable multi-tier designs.",
    iconName: "Layers",
    defaultDrillId: "drill-module-contract",
    labIndex: 5
  }
};

/**
 * Classify a raw error message into a SkillDomain
 */
export function classifyErrorToDomain(errorMessage: string): {
  domain: SkillDomain;
  suggestedTopic: string;
} {
  const lower = errorMessage.toLowerCase();

  if (
    lower.includes("syntax") ||
    lower.includes("brace") ||
    lower.includes("quote") ||
    lower.includes("parse") ||
    lower.includes("unclosed") ||
    lower.includes("argument definition")
  ) {
    return {
      domain: "syntax_anatomy",
      suggestedTopic: "HCL Block Anatomy & Formatting"
    };
  }

  if (
    lower.includes("variable") ||
    lower.includes("var.") ||
    lower.includes("type mismatch") ||
    lower.includes("interpolation") ||
    lower.includes("string literal")
  ) {
    return {
      domain: "variables_types",
      suggestedTopic: "Variables & Type Constraints"
    };
  }

  if (
    lower.includes("undeclared resource") ||
    lower.includes("reference") ||
    lower.includes("depends_on") ||
    lower.includes("cycle") ||
    lower.includes("dependency") ||
    lower.includes("attribute")
  ) {
    return {
      domain: "resource_dependencies",
      suggestedTopic: "Resource Attribute References & DAG"
    };
  }

  if (
    lower.includes("state") ||
    lower.includes("drift") ||
    lower.includes("lock") ||
    lower.includes("refresh") ||
    lower.includes("destroy") ||
    lower.includes("plan:")
  ) {
    return {
      domain: "state_lifecycle",
      suggestedTopic: "Terraform State & Drift Reconciliation"
    };
  }

  if (
    lower.includes("module") ||
    lower.includes("source") ||
    lower.includes("output") ||
    lower.includes("child")
  ) {
    return {
      domain: "modules_architecture",
      suggestedTopic: "Reusable Infrastructure Modules"
    };
  }

  return {
    domain: "syntax_anatomy",
    suggestedTopic: "Foundations of Terraform & HCL"
  };
}

/**
 * Compute detailed domain analyses based on logged errors and completed labs
 */
export function calculateDomainAnalyses(
  errors: LoggedErrorEvent[],
  completedLabIds: string[]
): SkillDomainAnalysis[] {
  const domains: SkillDomain[] = [
    "syntax_anatomy",
    "variables_types",
    "resource_dependencies",
    "state_lifecycle",
    "modules_architecture"
  ];

  return domains.map((domain) => {
    const domainErrors = errors.filter((e) => e.domain === domain);
    const resolvedCount = domainErrors.filter((e) => e.resolved).length;
    const errorCount = domainErrors.length;
    const info = SKILL_DOMAINS_INFO[domain];
    const mapping = DOMAIN_LAB_MAPPING[domain];
    const domainCompletedLabs = mapping ? mapping.labIds.filter((id) => completedLabIds.includes(id)) : [];
    const domainCompletedCount = domainCompletedLabs.length;

    let masteryScore = 0;
    let status: SkillDomainAnalysis["status"] = "Not Assessed";
    const totalAttempts = errorCount + domainCompletedCount;

    if (errorCount === 0) {
      if (domainCompletedCount === 0) {
        masteryScore = 0;
        status = "Not Assessed";
      } else {
        masteryScore = 100;
        status = "Mastered";
      }
    } else {
      const unresolvedCount = errorCount - resolvedCount;
      if (unresolvedCount > 0) {
        let score = unresolvedCount >= 3 ? 15 : unresolvedCount === 2 ? 30 : 45;
        if (domainCompletedCount > 0) {
          score += domainCompletedCount * 10;
        }
        masteryScore = Math.min(65, score);
        status = unresolvedCount >= 2 ? "Critical Gap" : "Needs Practice";
      } else {
        // All errors in this domain have been resolved!
        masteryScore = domainCompletedCount > 0 ? 95 : 80;
        status = domainCompletedCount > 0 ? "Mastered" : "Proficient";
      }
    }

    return {
      domain,
      title: info.title,
      description: info.description,
      iconName: info.iconName,
      errorCount,
      totalAttempts,
      masteryScore: Math.round(masteryScore),
      status,
      recentErrors: domainErrors.slice(-3),
      recommendedDrillId: info.defaultDrillId,
      recommendedLabIndex: info.labIndex
    };
  });
}

/**
 * Calculate overall course progress and determine the smart next recommended lesson
 */
export function calculateCourseProgress(
  completedLabIds: string[],
  walkthroughProgressIndex: number,
  totalXp: number,
  errors: LoggedErrorEvent[]
): CourseProgressSummary {
  const totalLabs = LABS_DATA.length;
  const completedLabs = completedLabIds.length;
  const totalWalkthroughs = WALKTHROUGHS_DATA.length;
  const completedWalkthroughs = Math.min(totalWalkthroughs, walkthroughProgressIndex + 1);

  const totalLessons = totalLabs + totalWalkthroughs;
  const totalCompleted = completedLabs + Math.min(walkthroughProgressIndex, totalWalkthroughs);
  const completionPercentage = Math.round((totalCompleted / totalLessons) * 100);

  // Determine next recommended lesson
  let nextRecommended: CourseProgressSummary["nextRecommendedLesson"];

  // If there's an unresolved critical error domain, recommend a remediation drill!
  const criticalError = errors.find((e) => !e.resolved);
  if (criticalError) {
    const drill = REMEDIATION_DRILLS_DATA.find((d) => d.domain === criticalError.domain) || REMEDIATION_DRILLS_DATA[0];
    nextRecommended = {
      type: "drill",
      index: 0,
      title: `Skill Gap Drill: ${drill.title}`,
      reason: `Targeted to resolve your recent error in ${SKILL_DOMAINS_INFO[criticalError.domain].title}`
    };
  } else if (completedLabs < totalLabs) {
    // Recommend next lab
    const nextLabIdx = LABS_DATA.findIndex((l) => !completedLabIds.includes(l.id));
    const targetIdx = nextLabIdx >= 0 ? nextLabIdx : 0;
    nextRecommended = {
      type: "lab",
      index: targetIdx,
      title: LABS_DATA[targetIdx].title,
      reason: `Next core curriculum challenge in ${LABS_DATA[targetIdx].category}`
    };
  } else {
    // Recommend next walkthrough
    const targetWalkthroughIdx = Math.min(totalWalkthroughs - 1, walkthroughProgressIndex);
    nextRecommended = {
      type: "walkthrough",
      index: targetWalkthroughIdx,
      title: WALKTHROUGHS_DATA[targetWalkthroughIdx].title,
      reason: `Concept mastery review: ${WALKTHROUGHS_DATA[targetWalkthroughIdx].subtitle}`
    };
  }

  return {
    totalLessons,
    completedLessons: totalCompleted,
    completionPercentage,
    totalWalkthroughs,
    completedWalkthroughs,
    totalXp,
    currentStreakDays: 3,
    nextRecommendedLesson: nextRecommended
  };
}
