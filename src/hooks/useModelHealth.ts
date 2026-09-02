/**
 * MODEL HEALTH AGENT (in-app agent #10)
 *
 * Runs once on the first app-open of each day (per browser):
 *  1. If the user has no stored Gemini key -> skip silently (mentor inactive).
 *  2. Probe the active model via models.get (free, consumes no quota).
 *  3. If the model still exists -> record the healthy check and stay quiet.
 *  4. If the model was retired (404) -> list available models, pick the newest
 *     STABLE gemini-*-flash family model (no preview/tts/image/omni variants),
 *     persist it as the active model, and report the migration so the UI can
 *     inform the user.
 *
 * This is deliberate determinism, not an LLM: a health check must be cheap,
 * offline-tolerant, and never hallucinate a model name.
 */

import { useEffect, useState } from "react";
import { DEFAULT_GEMINI_MODEL } from "../utils/aiMentorClient";

const HEALTH_KEY_PREFIX = "terrafek_model_health_";
const ACTIVE_MODEL_KEY = "terrafek_gemini_model";

export type ModelHealthStatus = "idle" | "checking" | "healthy" | "migrated" | "unreachable" | "no-replacement";

export interface ModelHealth {
  status: ModelHealthStatus;
  /** Human-readable one-liner for the UI banner (empty when nothing to say). */
  note: string;
  activeModel: string;
}

function todayKey(): string {
  return HEALTH_KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

function getActiveModel(): string {
  try {
    return window.localStorage.getItem(ACTIVE_MODEL_KEY) || DEFAULT_GEMINI_MODEL;
  } catch {
    return DEFAULT_GEMINI_MODEL;
  }
}

function setActiveModel(model: string): void {
  try {
    window.localStorage.setItem(ACTIVE_MODEL_KEY, model);
  } catch {
    /* private browsing — the override simply won't persist */
  }
}

/** Newest stable gemini-N(.-N)*-flash model, excluding preview/tts/image/etc. */
export function pickReplacement(models: string[]): string | null {
  const candidates = models
    .map((m) => m.replace(/^models\//, ""))
    .filter(
      (m) =>
        /^gemini-\d+(\.\d+)*-flash$/.test(m) && // stable flash family only
        !/preview|lite|tts|image|omni|transcribe/.test(m),
    );
  if (candidates.length === 0) return null;
  const versionOf = (m: string): number[] =>
    (m.match(/\d+/g) || [0]).map(Number);
  candidates.sort((a, b) => {
    const va = versionOf(a);
    const vb = versionOf(b);
    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
      const d = (vb[i] || 0) - (va[i] || 0);
      if (d !== 0) return d; // descending: newest first
    }
    return 0;
  });
  return candidates[0];
}

async function probeModel(model: string, apiKey: string): Promise<{ ok: boolean; retired: boolean; modelList?: string[] }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}`,
      { headers: { "x-goog-api-key": apiKey } },
    );
    if (res.ok) return { ok: true, retired: false };
    if (res.status === 404) {
      // Retired — fetch the catalog to find a successor.
      try {
        const listRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models?pageSize=100",
          { headers: { "x-goog-api-key": apiKey } },
        );
        if (listRes.ok) {
          const data = await listRes.json();
          const names: string[] = (data?.models || []).map((m: any) => m.name);
          return { ok: false, retired: true, modelList: names };
        }
      } catch {
        /* catalog unreachable — fall through */
      }
      return { ok: false, retired: true };
    }
    return { ok: false, retired: false }; // 401/403/429/5xx — not a retirement signal
  } catch {
    return { ok: false, retired: false }; // network offline — don't act
  }
}

export function useModelHealth(): ModelHealth {
  const [health, setHealth] = useState<ModelHealth>({
    status: "idle",
    note: "",
    activeModel: typeof window !== "undefined" ? getActiveModel() : DEFAULT_GEMINI_MODEL,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 0. Once-per-day guard (per browser).
      try {
        if (window.localStorage.getItem(todayKey())) return;
        window.localStorage.setItem(todayKey(), "checked");
      } catch {
        return; // localStorage unavailable — can't guard or persist; stay quiet
      }

      // 1. Only meaningful when the user runs the mentor on their own key.
      let apiKey: string | null = null;
      try {
        apiKey = window.localStorage.getItem("terrafek_gemini_api_key");
      } catch {
        return;
      }
      if (!apiKey || apiKey.trim().length < 20) return;

      setHealth((h) => ({ ...h, status: "checking" }));
      const model = getActiveModel();
      const result = await probeModel(model, apiKey);
      if (cancelled) return;

      if (result.ok) {
        setHealth({ status: "healthy", note: "", activeModel: model });
        return;
      }

      if (result.retired) {
        const replacement = result.modelList ? pickReplacement(result.modelList) : null;
        if (replacement && replacement !== model) {
          setActiveModel(replacement);
          setHealth({
            status: "migrated",
            note: `🤖 Model Health Agent: "${model}" was retired by Google — auto-migrated the AI Mentor to "${replacement}".`,
            activeModel: replacement,
          });
          return;
        }
        setHealth({
          status: "no-replacement",
          note: `🤖 Model Health Agent: "${model}" was retired and no stable replacement was found. The AI Mentor may fail until Google ships a new stable model.`,
          activeModel: model,
        });
        return;
      }

      // Probe failed for a non-retirement reason (offline, rate limit, auth) —
      // don't alarm the user; retry again tomorrow or on next first-open.
      setHealth({ status: "unreachable", note: "", activeModel: model });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return health;
}