/**
 * CURRICULUM SEQUENCE — Single Source of Truth
 *
 * This file defines the exact order in which lessons, labs, and drills
 * should be completed. The Dashboard phases, the "Recommended Next Step"
 * hero banner, and the progress calculator all read from this list.
 *
 * NEVER duplicate this ordering elsewhere — always import from here.
 */

export type CurriculumItemType = "walkthrough" | "lab" | "drill";

export interface CurriculumStep {
  /** Position in the overall curriculum (0-indexed) */
  order: number;
  /** Which phase this item belongs to (1, 2, 3, or 4) */
  phase: 1 | 2 | 3 | 4;
  /** What type of content this is */
  type: CurriculumItemType;
  /** Index into WALKTHROUGHS_DATA, LABS_DATA, or REMEDIATION_DRILLS_DATA */
  index: number;
  /** Short label shown in the Dashboard phase cards */
  title: string;
  /** Subtitle / description */
  subtitle: string;
  /** Category label for the phase header */
  category: string;
  /** Estimated minutes to complete */
  estimatedMinutes: number;
}

/**
 * The canonical curriculum order.
 * Indices refer to the arrays in labsData.ts, walkthroughsData.ts, and remediationDrillsData.ts.
 *
 * NOTE: titles/subtitles are filled at runtime by the consumer to avoid importing
 * .ts data files into this .ts file. This file only defines ORDER and indices.
 */
export const CURRICULUM_ORDER: Array<{
  phase: 1 | 2 | 3 | 4;
  type: CurriculumItemType;
  index: number;
  category: string;
  estimatedMinutes: number;
}> = [
  // ── Phase 1: Foundations, HCL Syntax & The Core CLI Workflow ──
  { phase: 1, type: "walkthrough", index: 0, category: "Foundations", estimatedMinutes: 6 },
  { phase: 1, type: "walkthrough", index: 1, category: "Foundations", estimatedMinutes: 6 },
  { phase: 1, type: "lab",         index: 0, category: "Foundations", estimatedMinutes: 5 },
  { phase: 1, type: "walkthrough", index: 2, category: "Configuration", estimatedMinutes: 6 },
  { phase: 1, type: "lab",         index: 1, category: "Core Workflow", estimatedMinutes: 8 },
  { phase: 1, type: "walkthrough", index: 4, category: "Lifecycle", estimatedMinutes: 5 },

  // ── Phase 2: State Engine, DAG Graph & Lifecycle Automation ──
  { phase: 2, type: "walkthrough", index: 3, category: "State & Drift", estimatedMinutes: 9 },
  { phase: 2, type: "lab",         index: 2, category: "Variables & State", estimatedMinutes: 10 },
  { phase: 2, type: "lab",         index: 3, category: "Networking & Graph", estimatedMinutes: 12 },
  { phase: 2, type: "walkthrough", index: 6, category: "DAG Graph", estimatedMinutes: 6 },
  { phase: 2, type: "lab",         index: 4, category: "Variables & State", estimatedMinutes: 10 },
  { phase: 2, type: "walkthrough", index: 7, category: "Secrets & Encryption", estimatedMinutes: 8 },

  // ── Phase 3: Modular Infrastructure & Production Multi-Tier Cloud ──
  { phase: 3, type: "walkthrough", index: 5, category: "Modules", estimatedMinutes: 7 },
  { phase: 3, type: "lab",         index: 5, category: "Variables & State", estimatedMinutes: 12 },
  { phase: 3, type: "lab",         index: 6, category: "Modules & Scale", estimatedMinutes: 15 },
  { phase: 3, type: "lab",         index: 7, category: "Modules & Scale", estimatedMinutes: 15 },
  { phase: 3, type: "lab",         index: 8, category: "State & Locking", estimatedMinutes: 12 },
  { phase: 3, type: "lab",         index: 9, category: "Production Arch", estimatedMinutes: 20 },

  // ── Phase 4: Multi-Cloud Engineering — the same Terraform skills on Azure & Google Cloud ──
  // Real-world briefs: each lab starts from an incident/ticket a cloud team actually hits.
  { phase: 4, type: "lab",         index: 10, category: "Multi-Cloud Foundations", estimatedMinutes: 10 },
  { phase: 4, type: "lab",         index: 11, category: "Multi-Cloud Foundations", estimatedMinutes: 15 },
  { phase: 4, type: "lab",         index: 12, category: "Multi-Cloud Foundations", estimatedMinutes: 18 },
  { phase: 4, type: "lab",         index: 13, category: "Multi-Cloud Foundations", estimatedMinutes: 10 },
  { phase: 4, type: "lab",         index: 14, category: "Multi-Cloud Foundations", estimatedMinutes: 15 },
  { phase: 4, type: "lab",         index: 15, category: "Multi-Cloud Foundations", estimatedMinutes: 18 },
];