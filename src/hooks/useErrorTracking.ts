import { useState, useMemo, useCallback } from "react";
import { LoggedErrorEvent, SkillDomainAnalysis, CourseProgressSummary } from "../types/terraform";
import {
  classifyErrorToDomain,
  calculateDomainAnalyses,
  calculateCourseProgress,
} from "../utils/errorAnalyticsEngine";
import { safeGetItem, safeSetItem } from "../utils/safeStorage";

export interface ErrorTrackingState {
  loggedErrors: LoggedErrorEvent[];
  setLoggedErrors: React.Dispatch<React.SetStateAction<LoggedErrorEvent[]>>;
  domainAnalyses: SkillDomainAnalysis[];
  progressSummary: CourseProgressSummary;
  unresolvedErrorCount: number;
  logNewError: (message: string, source: LoggedErrorEvent["source"], command?: string) => void;
  handleResolveError: (errorId: string) => void;
  handleClearErrorHistory: () => void;
}

/**
 * Manages error logging, skill-domain analytics, course progress calculation,
 * and error resolution. Persists logged errors to localStorage.
 *
 * Requires external inputs: completedLabIds and currentWalkthroughIndex
 * for computing domain analyses and course progress.
 */
export function useErrorTracking(
  completedLabIds: string[],
  currentWalkthroughIndex: number,
  totalXp: number,
): ErrorTrackingState {
  const [loggedErrors, setLoggedErrors] = useState<LoggedErrorEvent[]>(() => {
    const saved = safeGetItem("tf_logged_errors");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((e: LoggedErrorEvent) => e && e.id && !e.id.startsWith("err-seed-"));
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const domainAnalyses = useMemo(
    () => calculateDomainAnalyses(loggedErrors, completedLabIds),
    [loggedErrors, completedLabIds],
  );

  const progressSummary = useMemo(
    () => calculateCourseProgress(completedLabIds, currentWalkthroughIndex, totalXp, loggedErrors),
    [completedLabIds, currentWalkthroughIndex, totalXp, loggedErrors],
  );

  const unresolvedErrorCount = useMemo(
    () => loggedErrors.filter((e) => !e.resolved).length,
    [loggedErrors],
  );

  const logNewError = useCallback((message: string, source: LoggedErrorEvent["source"], command?: string) => {
    const { domain, suggestedTopic } = classifyErrorToDomain(message);
    const newErr: LoggedErrorEvent = {
      id: "err-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source,
      command,
      message,
      domain,
      suggestedTopic,
      resolved: false,
    };
    setLoggedErrors((prev) => [newErr, ...prev.slice(0, 24)]);
  }, []);

  const handleResolveError = useCallback((errorId: string) => {
    setLoggedErrors((prev) =>
      prev.map((e) => (e.id === errorId ? { ...e, resolved: true } : e)),
    );
  }, []);

  const handleClearErrorHistory = useCallback(() => {
    setLoggedErrors([]);
  }, []);

  // Persist logged errors
  // (using a separate effect to avoid double-writing on every render;
  // the main useEffect in App.tsx already persisted these, but now
  // the hook owns it)
  // Note: we intentionally don't use useEffect here for persistence —
  // the parent App component's unified persistence effect handles this
  // via safeSetItem("tf_logged_errors", JSON.stringify(loggedErrors)).

  return {
    loggedErrors,
    setLoggedErrors,
    domainAnalyses,
    progressSummary,
    unresolvedErrorCount,
    logNewError,
    handleResolveError,
    handleClearErrorHistory,
  };
}