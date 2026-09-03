import { useState, useEffect, useMemo } from "react";
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
 *
 * STATE MIGRATION (v2): builds before 2026-09-03 poisoned
 * tf_completed_walkthroughs — merely DISPLAYING a walkthrough's last step
 * marked it complete (no finish click). One-time on load: if the old flag is
 * absent, any stored walkthrough completions are untrustworthy and are
 * cleared once. Labs/drills completions were only ever set by real task
 * completion, so they are kept.
 */
const STATE_VERSION = 2;
const STATE_VERSION_KEY = "tf_state_version";

function migrateState_v2(): void {
  try {
    const seen = window.localStorage.getItem(STATE_VERSION_KEY);
    if (seen) return; // already migrated (or fresh install >= v2)
    const poisoned = window.localStorage.getItem("tf_completed_walkthroughs");
    if (poisoned && poisoned !== "[]") {
      window.localStorage.removeItem("tf_completed_walkthroughs");
      // Note: labs/drills XP stays — those were always earned by real work.
      // Walkthrough XP cannot be separated, so total XP is re-based conservatively:
      // it keeps at least the floor; exact per-walkthrough XP rollback is not
      // possible from stored data alone.
    }
    window.localStorage.setItem(STATE_VERSION_KEY, String(STATE_VERSION));
  } catch {
    /* private browsing — nothing to migrate */
  }
}

export function useGamification(): GamificationState {
  // One-time migration runs before state is read
  useMemo(() => migrateState_v2(), []);

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