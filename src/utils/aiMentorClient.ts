/**
 * AI Mentor client with "Bring Your Own Key" support.
 *
 * Resolution order:
 *  1. If the visitor stored their OWN Gemini key (localStorage) -> call Google's
 *     Generative Language API directly from the browser. Their key, their quota.
 *  2. Otherwise, try the local dev server route (/api/gemini/mentor) — this keeps
 *     local development unchanged (the express server uses the operator's .env key).
 *  3. If that route doesn't exist (e.g. static hosting on Vercel), throw
 *     MissingApiKeyError so the UI can show the key gate.
 *
 * The stored key is never logged and is only ever sent to generativelanguage.googleapis.com.
 */

const STORAGE_KEY = "terrafek_gemini_api_key";
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class MissingApiKeyError extends Error {
  constructor() {
    super("No Gemini API key configured");
    this.name = "MissingApiKeyError";
  }
}

export function getStoredApiKey(): string | null {
  try {
    const k = window.localStorage.getItem(STORAGE_KEY);
    return k && k.trim().length > 20 ? k.trim() : null;
  } catch {
    return null;
  }
}

export function storeApiKey(key: string): boolean {
  const trimmed = key.trim();
  // Gemini keys are long alphanumeric strings starting with "AIza"
  if (!/^AIza[0-9A-Za-z_\-]{30,}$/.test(trimmed)) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}

export function clearApiKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private browsing — nothing to clear */
  }
}

export interface MentorRequest {
  action: "explain_plan" | "hint" | "diagnose_error" | "chat";
  code?: string;
  labTitle?: string;
  labGoal?: string;
  terminalOutput?: string;
  userQuestion?: string;
}

/** Build the same prompts the express server uses, so behavior is identical. */
export function buildMentorPrompt(req: MentorRequest): { system: string; prompt: string } {
  const systemInstruction =
    "You are a world-class senior DevOps & Terraform Architect and mentor. You explain Terraform concepts visually, clearly, and intuitively for visual learners. Keep explanations concise, structured with bullet points or diagrams when helpful, and avoid overwhelming jargon.";

  const code = req.code || "";
  const terminalOutput = req.terminalOutput || "";
  const labTitle = req.labTitle || "";
  const labGoal = req.labGoal || "";

  let prompt: string;
  if (req.action === "explain_plan") {
    prompt = `The user is in a lab titled "${labTitle}".
Lab Goal: ${labGoal}
Current Terraform Code:
\`\`\`hcl
${code || "No code"}
\`\`\`
Terminal / Plan output:
\`\`\`
${terminalOutput || "No plan output yet"}
\`\`\`
Please explain in clear, friendly terms:
1. What will this plan do to the cloud infrastructure?
2. What dependencies exist?
3. Any risks or best practices to keep in mind?`;
  } else if (req.action === "hint") {
    prompt = `The student is stuck on lab: "${labTitle}".
Lab Goal: ${labGoal}
Current student code:
\`\`\`hcl
${code}
\`\`\`
Terminal output:
\`\`\`
${terminalOutput}
\`\`\`
Provide a targeted, encouraging hint that points them toward the fix without giving away the full answer immediately. Use code snippets if demonstrating syntax conventions.`;
  } else if (req.action === "diagnose_error") {
    prompt = `The student encountered this error in Terraform:
\`\`\`
${terminalOutput}
\`\`\`
Code:
\`\`\`hcl
${code}
\`\`\`
Explain:
1. Why this error occurred in simple visual terms.
2. The exact conceptual fix needed in their HCL or workflow.`;
  } else {
    prompt = `Lab Context: "${labTitle}"
Student question: ${req.userQuestion || "Explain Terraform"}
Current code:
\`\`\`hcl
${code}
\`\`\`
Provide a clear, engaging answer with concise code examples if applicable.`;
  }

  return { system: systemInstruction, prompt };
}

/** Direct browser -> Google call using the VISITOR'S OWN key. */
async function callGeminiDirect(apiKey: string, req: MentorRequest): Promise<string> {
  const { system, prompt } = buildMentorPrompt(req);
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      // Google returns e.g. { error: { message: "API key not valid..." } }
      detail = body?.error?.message || detail;
    } catch {
      /* keep generic detail */
    }
    if (res.status === 400 && /api key not valid/i.test(detail)) {
      clearApiKey(); // dead key — drop it so the gate reappears
      throw new Error("Your Gemini API key was rejected (invalid or deleted). Please reconnect with a fresh key from aistudio.google.com/apikey.");
    }
    if (res.status === 429) {
      throw new Error("Your Gemini quota is temporarily exhausted (HTTP 429). Wait a minute and try again — this uses YOUR free tier, not anyone else's.");
    }
    throw new Error(`Gemini API error: ${detail}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("") || "";
  return text || "No response generated.";
}

/** Try the local express mentor route (dev convenience). Returns null if it doesn't exist. */
async function callLocalServer(req: MentorRequest): Promise<string | null> {
  try {
    const res = await fetch("/api/gemini/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null; // 404 on static hosting, rate limits handled server-side in dev
    const data = await res.json();
    return data?.text || null;
  } catch {
    return null;
  }
}

export async function callMentor(req: MentorRequest): Promise<{ text: string; source: "user-key" | "local-server" }> {
  const ownKey = getStoredApiKey();
  if (ownKey) {
    return { text: await callGeminiDirect(ownKey, req), source: "user-key" };
  }
  const local = await callLocalServer(req);
  if (local !== null) return { text: local, source: "local-server" };
  throw new MissingApiKeyError();
}