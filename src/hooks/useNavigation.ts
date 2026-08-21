import { useState, useEffect } from "react";
import { LABS_DATA } from "../data/labsData";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";
import { REMEDIATION_DRILLS_DATA } from "../data/remediationDrillsData";
import { RemediationDrill } from "../types/terraform";
import { safeGetItem, safeGetNumber, safeSetItem } from "../utils/safeStorage";

// Re-declared here to avoid importing from a .tsx file in a .ts file.
// These must stay in sync with src/components/Header.tsx.
export type AppMode = "dashboard" | "walkthrough" | "lab" | "sandbox" | "drill";
export type ActiveTabMode = "editor" | "topology" | "state" | "graph";

export interface NavigationState {
  activeMode: AppMode;
  setActiveMode: React.Dispatch<React.SetStateAction<AppMode>>;
  currentLabIndex: number;
  setCurrentLabIndex: React.Dispatch<React.SetStateAction<number>>;
  currentWalkthroughIndex: number;
  setCurrentWalkthroughIndex: React.Dispatch<React.SetStateAction<number>>;
  currentDrillIndex: number;
  setCurrentDrillIndex: React.Dispatch<React.SetStateAction<number>>;
  currentLab: (typeof LABS_DATA)[number];
  currentWalkthrough: (typeof WALKTHROUGHS_DATA)[number];
  currentDrill: RemediationDrill;
}

/**
 * Manages app navigation state: active mode (dashboard/lab/walkthrough/drill/sandbox),
 * current lab/walkthrough/drill indices, and dashboard navigation handlers.
 * Persists mode + indices to localStorage.
 */
export function useNavigation(): NavigationState {
  const [activeMode, setActiveMode] = useState<AppMode>(() => {
    const saved = safeGetItem("tf_app_mode");
    return (saved as AppMode) || "dashboard";
  });

  const [currentWalkthroughIndex, setCurrentWalkthroughIndex] = useState<number>(() => {
    const saved = safeGetNumber("tf_walkthrough_index", 0);
    return Math.min(saved, WALKTHROUGHS_DATA.length - 1);
  });

  const [currentLabIndex, setCurrentLabIndex] = useState<number>(() => {
    const saved = safeGetNumber("tf_lab_index", 0);
    return Math.min(saved, LABS_DATA.length - 1);
  });

  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);

  const currentLab = LABS_DATA[currentLabIndex] || LABS_DATA[0];
  const currentWalkthrough = WALKTHROUGHS_DATA[currentWalkthroughIndex] || WALKTHROUGHS_DATA[0];
  const currentDrill = REMEDIATION_DRILLS_DATA[currentDrillIndex] || REMEDIATION_DRILLS_DATA[0];

  // Persist navigation state
  useEffect(() => {
    safeSetItem("tf_app_mode", activeMode);
    safeSetItem("tf_walkthrough_index", String(currentWalkthroughIndex));
    safeSetItem("tf_lab_index", String(currentLabIndex));
  }, [activeMode, currentWalkthroughIndex, currentLabIndex]);

  return {
    activeMode,
    setActiveMode,
    currentLabIndex,
    setCurrentLabIndex,
    currentWalkthroughIndex,
    setCurrentWalkthroughIndex,
    currentDrillIndex,
    setCurrentDrillIndex,
    currentLab,
    currentWalkthrough,
    currentDrill,
  };
}