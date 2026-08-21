import { useState, useEffect } from "react";
import { safeGetJSON, safeGetNumber, safeSetItem } from "../utils/safeStorage";

export interface GamificationState {
  completedLabIds: string[];
  setCompletedLabIds: React.Dispatch<React.SetStateAction<string[]>>;
  totalXp: number;
  setTotalXp: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Manages gamification state: completed lab IDs and total XP.
 * Persists both to localStorage.
 */
export function useGamification(): GamificationState {
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() => {
    return safeGetJSON<string[]>("tf_completed_labs", []);
  });
  const [totalXp, setTotalXp] = useState<number>(() => {
    return safeGetNumber("tf_total_xp", 100);
  });

  useEffect(() => {
    safeSetItem("tf_completed_labs", JSON.stringify(completedLabIds));
    safeSetItem("tf_total_xp", String(totalXp));
  }, [completedLabIds, totalXp]);

  return {
    completedLabIds,
    setCompletedLabIds,
    totalXp,
    setTotalXp,
  };
}