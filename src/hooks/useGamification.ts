import { useState, useEffect } from "react";
import { safeGetJSON, safeGetNumber, safeSetItem } from "../utils/safeStorage";

export interface GamificationState {
  completedLabIds: string[];
  setCompletedLabIds: React.Dispatch<React.SetStateAction<string[]>>;
  completedWalkthroughIds: string[];
  setCompletedWalkthroughIds: React.Dispatch<React.SetStateAction<string[]>>;
  completedDrillIds: string[];
  setCompletedDrillIds: React.Dispatch<React.SetStateAction<string[]>>;
  totalXp: number;
  setTotalXp: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Manages gamification state: completed lab IDs, completed walkthrough IDs,
 * completed drill IDs, and total XP. Persists all to localStorage.
 */
export function useGamification(): GamificationState {
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() => {
    return safeGetJSON<string[]>("tf_completed_labs", []);
  });
  const [completedWalkthroughIds, setCompletedWalkthroughIds] = useState<string[]>(() => {
    return safeGetJSON<string[]>("tf_completed_walkthroughs", []);
  });
  const [completedDrillIds, setCompletedDrillIds] = useState<string[]>(() => {
    return safeGetJSON<string[]>("tf_completed_drills", []);
  });
  const [totalXp, setTotalXp] = useState<number>(() => {
    return safeGetNumber("tf_total_xp", 100);
  });

  useEffect(() => {
    safeSetItem("tf_completed_labs", JSON.stringify(completedLabIds));
    safeSetItem("tf_total_xp", String(totalXp));
  }, [completedLabIds, totalXp]);

  useEffect(() => {
    safeSetItem("tf_completed_walkthroughs", JSON.stringify(completedWalkthroughIds));
  }, [completedWalkthroughIds]);

  useEffect(() => {
    safeSetItem("tf_completed_drills", JSON.stringify(completedDrillIds));
  }, [completedDrillIds]);

  return {
    completedLabIds,
    setCompletedLabIds,
    completedWalkthroughIds,
    setCompletedWalkthroughIds,
    completedDrillIds,
    setCompletedDrillIds,
    totalXp,
    setTotalXp,
  };
}