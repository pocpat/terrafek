/**
 * Safe localStorage access helpers.
 *
 * Every read goes through try/catch so the app never crashes on load
 * if localStorage is unavailable (private browsing, disabled cookies,
 * quota exceeded, or corrupted data). Falls back to a sensible default
 * instead of throwing.
 */

/** Safely read a raw string from localStorage. Returns null if unavailable or not set. */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safely read and JSON.parse from localStorage. Returns fallback on any error. */
export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** Safely read a numeric value from localStorage. Returns fallback if not set, NaN, or on error. */
export function safeGetNumber(key: string, fallback: number): number {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const num = Number(saved);
    return isNaN(num) ? fallback : num;
  } catch {
    return fallback;
  }
}

/** Safely write to localStorage. Silently ignores quota or access errors. */
export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore — storage may be full or disabled
  }
}