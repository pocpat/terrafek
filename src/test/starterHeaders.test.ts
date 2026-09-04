import { describe, it, expect } from "vitest";
import { LABS_DATA } from "../data/labsData";
import { computeLabNumbers } from "../utils/labNumbering";

/**
 * Golden rule: starter-file headers must match the computed lab numbering
 * (labNumbering.ts — one lab per lesson = N, several labs = N.1/N.2).
 * Prevents the guide panel ("Lab 2.3") and the code window ("# Lab 4")
 * from drifting apart again.
 */
describe("starter file headers match computed lab numbering", () => {
  const numbers = computeLabNumbers(LABS_DATA);

  it("every '# Lab N' header in starter files uses the lab's computed label", () => {
    for (const lab of LABS_DATA) {
      const expected = `# Lab ${numbers.get(lab.id)!.label}`;
      for (const [fileName, content] of Object.entries(lab.starterFiles)) {
        const firstLine = content.split("\n")[0];
        const token = firstLine.match(/^# Lab ([\d.]+)/);
        if (token) {
          expect(`${lab.id}/${fileName}: ${token[1]}`).toBe(`${lab.id}/${fileName}: ${numbers.get(lab.id)!.label}`);
          void expected;
        }
      }
    }
  });

  it("lab ids referenced by headers exist and every numbered lab has a header on main.tf", () => {
    for (const lab of LABS_DATA) {
      const main = lab.starterFiles["main.tf"] || "";
      if (/^# Lab \d/.test(main.split("\n")[0])) {
        expect(numbers.has(lab.id)).toBe(true);
      }
    }
  });
});