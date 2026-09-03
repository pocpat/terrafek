/**
 * LAB NUMBERING — single source for how labs are numbered in the UI.
 *
 * User rule: a lesson with ONE lab shows a single number ("3. Input Variables…").
 * A lesson with SEVERAL labs numbers them N.1, N.2, N.3…
 *
 * Grouping: labs sharing the same `lesson` key belong to one lesson. Labs
 * without a `lesson` key are each their own single-lab lesson (numbered by
 * their order of appearance among lessons).
 */

export interface NumberableLab {
  id: string;
  title: string;
  lesson?: string; // optional lesson group key — labs sharing it get N.1, N.2
}

export interface LabNumber {
  /** "3" for single-lab lessons, "3.2" for the 2nd lab of lesson 3 */
  label: string;
  /** Lesson number N */
  lesson: number;
  /** Sub-number within the lesson (undefined when the lesson has one lab) */
  sub?: number;
}

/** Compute stable numbering for all labs in display order. */
export function computeLabNumbers<T extends NumberableLab>(labs: T[]): Map<string, LabNumber> {
  const numbers = new Map<string, LabNumber>();
  let lessonCounter = 0;
  let currentKey: string | null = null;
  let subCounter = 0;
  let currentGroupSize = 0;

  // First pass: group sizes (only CONSECUTIVE labs with the same key form a lesson)
  const groupSizes = new Map<string, number>();
  let prevKey: string | null = null;
  for (const lab of labs) {
    const key = lab.lesson || `__single__${lab.id}`;
    groupSizes.set(key, (groupSizes.get(key) || 0) + 1);
    void prevKey;
    prevKey = key;
  }

  // Second pass: assign numbers
  for (const lab of labs) {
    const key = lab.lesson || `__single__${lab.id}`;
    if (key !== currentKey) {
      lessonCounter += 1;
      currentKey = key;
      subCounter = 0;
      currentGroupSize = groupSizes.get(key) || 1;
    }
    subCounter += 1;
    const isMulti = currentGroupSize > 1;
    numbers.set(lab.id, {
      label: isMulti ? `${lessonCounter}.${subCounter}` : `${lessonCounter}`,
      lesson: lessonCounter,
      sub: isMulti ? subCounter : undefined,
    });
  }

  return numbers;
}

/** Display title: "N. Title" or "N.M Title", stripping any legacy "N. " prefix in the data. */
export function formatLabTitle<T extends NumberableLab>(labs: T[], labId: string): string {
  const numbers = computeLabNumbers(labs);
  const lab = labs.find((l) => l.id === labId);
  if (!lab) return "";
  const n = numbers.get(labId);
  const bare = lab.title.replace(/^\d+(\.\d+)?\.\s*/, "");
  return `${n?.label ?? "?"}. ${bare}`;
}