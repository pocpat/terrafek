import { describe, it, expect } from "vitest";
import { pickReplacement } from "../hooks/useModelHealth";

describe("Model Health Agent — pickReplacement", () => {
  it("picks the highest-version stable flash model", () => {
    const models = [
      "models/gemini-2.5-flash",
      "models/gemini-3.6-flash",
      "models/gemini-3.7-flash",
      "models/gemini-3.5-flash-lite",
    ];
    expect(pickReplacement(models)).toBe("gemini-3.7-flash");
  });

  it("never picks preview / lite / tts / image / omni variants", () => {
    const models = [
      "models/gemini-4.0-flash-preview",
      "models/gemini-3.9-flash-lite",
      "models/gemini-3.8-flash-image",
      "models/gemini-3.7-flash",
    ];
    expect(pickReplacement(models)).toBe("gemini-3.7-flash");
  });

  it("prefers deeper versions over shallower (3.10.1 > 3.9)", () => {
    expect(pickReplacement(["models/gemini-3.9-flash", "models/gemini-3.10.1-flash"])).toBe("gemini-3.10.1-flash");
  });

  it("returns null when no stable flash candidate exists", () => {
    const models = [
      "models/gemini-4.0-flash-preview",
      "models/gemini-3.1-pro",
      "models/gemma-4-31b-it",
    ];
    expect(pickReplacement(models)).toBe(null);
  });

  it("treats the models/ prefix as optional", () => {
    expect(pickReplacement(["gemini-4.1-flash"])).toBe("gemini-4.1-flash");
  });
});