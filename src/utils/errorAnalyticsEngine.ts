import {
  LoggedErrorEvent,
  SkillDomain,
  SkillDomainAnalysis,
  CourseProgressSummary
} from "../types/terraform";
import { LABS_DATA } from "../data/labsData";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";
import { REMEDIATION_DRILLS_DATA } from "../data/remediationDrillsData";
import { safeGetItem, safeSetItem, safeGetNumber } from "../utils/safeStorage";
import { CURRICULUM_ORDER } from "../data/curriculumSequence";

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
  },
  resource_attributes: {
    labIds: ["lab-4-networking-dependencies"],
    primaryLabIndex: 3
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
  },
  resource_attributes: {
    title: "Resource Attributes & Tags",
    description: "Tags blocks, security group ingress rules, list arguments, and required resource attributes.",
    iconName: "Tag",
    defaultDrillId: "drill-tags-blocks",
    labIndex: 3
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

  if (
    lower.includes("tags") ||
    lower.includes("ingress") ||
    lower.includes("security group") ||
    lower.includes("security_group") ||
    lower.includes("list") ||
    lower.includes("bracket") ||
    lower.includes("vpc_security_group_ids") ||
    lower.includes("from_port") ||
    lower.includes("to_port")
  ) {
    return {
      domain: "resource_attributes",
      suggestedTopic: "Resource Attributes, Tags & Ingress Rules"
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
    "modules_architecture",
    "resource_attributes"
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
  completedWalkthroughIds: string[],
  completedDrillIds: string[],
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

  // If there's an unresolved error whose domain drill hasn't been completed yet,
  // recommend that remediation drill. Use completedDrillIds (persisted) as the
  // source of truth — not the circular "resolved errors" check.
  const unresolvedErrors = errors.filter((e) => !e.resolved);

  // Find an unresolved error whose matching drill hasn't been completed
  const criticalError = unresolvedErrors.find((err) => {
    const matchingDrill = REMEDIATION_DRILLS_DATA.find((d) => d.domain === err.domain);
    // If no matching drill exists, or the matching drill is NOT in completedDrillIds
    return !matchingDrill || !completedDrillIds.includes(matchingDrill.id);
  });

  if (criticalError) {
    const drill = REMEDIATION_DRILLS_DATA.find((d) => d.domain === criticalError.domain) || REMEDIATION_DRILLS_DATA[0];
    const drillIdx = REMEDIATION_DRILLS_DATA.findIndex((d) => d.id === drill.id);
    nextRecommended = {
      type: "drill",
      index: drillIdx >= 0 ? drillIdx : 0,
      title: `Skill Gap Drill: ${drill.title}`,
      reason: `Targeted to resolve your recent error in ${SKILL_DOMAINS_INFO[criticalError.domain].title}`
    };
  } else {
    // Use the single source-of-truth curriculum sequence to find the
    // first item the user has NOT yet completed.
    const nextItem = CURRICULUM_ORDER.find((item) => {
      if (item.type === "lab") {
        const lab = LABS_DATA[item.index];
        return lab && !completedLabIds.includes(lab.id);
      } else {
        // Walkthrough is "completed" if it's in completedWalkthroughIds (new tracking)
        // OR if the user has moved past it (currentWalkthroughIndex > item.index, old tracking)
        const wt = WALKTHROUGHS_DATA[item.index];
        if (!wt) return true;
        const markedCompleted = completedWalkthroughIds.includes(wt.id);
        const passedByIndex = walkthroughProgressIndex >= item.index;
        return !markedCompleted && !passedByIndex;
      }
    });

    if (nextItem) {
      if (nextItem.type === "lab") {
        const lab = LABS_DATA[nextItem.index];
        nextRecommended = {
          type: "lab",
          index: nextItem.index,
          title: lab.title,
          reason: `Next core curriculum challenge in ${lab.category}`
        };
      } else {
        const wt = WALKTHROUGHS_DATA[nextItem.index];
        nextRecommended = {
          type: "walkthrough",
          index: nextItem.index,
          title: wt.title,
          reason: `Next concept lesson: ${wt.subtitle}`
        };
      }
    } else {
      // Everything is completed — recommend a refresher on the last walkthrough
      const targetWalkthroughIdx = Math.min(totalWalkthroughs - 1, walkthroughProgressIndex);
      nextRecommended = {
        type: "walkthrough",
        index: targetWalkthroughIdx,
        title: WALKTHROUGHS_DATA[targetWalkthroughIdx].title,
        reason: `Concept mastery review: ${WALKTHROUGHS_DATA[targetWalkthroughIdx].subtitle}`
      };
    }
  }

  // === Real streak calculation ===
  // Track the first day the user ever opened the app (persisted in localStorage)
  const todayStr = new Date().toDateString();
  const firstVisit = safeGetItem("tf_first_visit_date");
  if (!firstVisit) {
    safeSetItem("tf_first_visit_date", todayStr);
  }
  const startDate = firstVisit || todayStr;

  // Track the last day the user was active (for streak calculation)
  const lastVisit = safeGetItem("tf_last_visit_date");
  let currentStreakDays = safeGetNumber("tf_streak_days", 0);

  if (lastVisit) {
    const lastDate = new Date(lastVisit);
    const today = new Date(todayStr);
    const diffMs = today.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day — streak unchanged
    } else if (diffDays === 1) {
      // Consecutive day — increment streak
      currentStreakDays += 1;
      safeSetItem("tf_streak_days", String(currentStreakDays));
    } else {
      // Streak broken — reset to 1 (today is a new start)
      currentStreakDays = 1;
      safeSetItem("tf_streak_days", String(currentStreakDays));
    }
  } else {
    // First ever visit
    currentStreakDays = 1;
    safeSetItem("tf_streak_days", "1");
  }

  // Always update last visit to today
  safeSetItem("tf_last_visit_date", todayStr);

  // Calculate total days since first visit
  const startDateTime = new Date(startDate).getTime();
  const todayDateTime = new Date(todayStr).getTime();
  const totalDaysSinceStart = Math.max(1, Math.round((todayDateTime - startDateTime) / (1000 * 60 * 60 * 24)) + 1);

  // Count active days (days the user actually opened the app)
  // We track this as a set of date strings in localStorage
  const activeDaysRaw = safeGetItem("tf_active_days");
  let activeDays: string[] = [];
  try {
    activeDays = activeDaysRaw ? JSON.parse(activeDaysRaw) : [];
  } catch {
    activeDays = [];
  }
  if (!activeDays.includes(todayStr)) {
    activeDays.push(todayStr);
    safeSetItem("tf_active_days", JSON.stringify(activeDays));
  }
  const activeDaysCount = activeDays.length;

  return {
    totalLessons,
    completedLessons: totalCompleted,
    completionPercentage,
    totalWalkthroughs,
    completedWalkthroughs,
    totalXp,
    currentStreakDays,
    totalDaysSinceStart,
    activeDaysCount,
    nextRecommendedLesson: nextRecommended
  };
}
