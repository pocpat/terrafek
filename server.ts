import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json({ limit: "10mb" }));

// --- CORS ---
// Allow cross-origin requests in development. In production, the frontend
// is served from the same origin so CORS is a no-op, but this prevents
// silent failures during local development with separate ports/origins.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

// --- Rate Limiting (in-memory, per-IP) ---
// Prevents a single client from spamming the Gemini endpoint and racking up API costs.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = process.env.AI_RATE_LIMIT ? Number(process.env.AI_RATE_LIMIT) : 10; // requests per window

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, retryAfter: 0 };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, retryAfter: 0 };
}

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 300_000);

// --- Gemini Client (lazy init) ---
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Configurable model name — defaults to gemini-2.5-flash if not set.
// Override with GEMINI_MODEL env var to switch models without code changes.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// --- Health check ---
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
});

// --- AI Terraform Mentor API ---
app.post("/api/gemini/mentor", async (req, res) => {
  // Rate limit check
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const rl = rateLimit(clientIp);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: `Too many AI requests. Please try again in ${rl.retryAfter} seconds.`,
      retryAfter: rl.retryAfter,
    });
  }

  try {
    const { action, code, labTitle, labGoal, terminalOutput, userQuestion } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback helpful offline response if API key is not yet configured
      let offlineResponse = "";
      if (action === "explain_plan") {
        offlineResponse = "### 📋 Plan Analysis\n\nYour Terraform plan analyzes the delta between your `.tf` files and the current state. When you run `terraform plan`, Terraform creates an execution graph to calculate exactly which resources need creation (`+`), in-place update (`~`), or replacement/destruction (`-`).";
      } else if (action === "hint") {
        offlineResponse = "💡 **Lab Hint:** Check your resource block syntax. Ensure each resource has a type (like `aws_s3_bucket`) and a unique name label (like `main` or `app`). Also verify that all required arguments are supplied and references use `resource_type.name.attribute` syntax.";
      } else {
        offlineResponse = "Terraform is an Infrastructure as Code (IaC) tool that allows you to define cloud and on-prem resources in human-readable HCL (HashiCorp Configuration Language). Try running `terraform init` first to download providers, then `terraform plan` to preview changes, and `terraform apply` to provision them!";
      }
      return res.json({ text: offlineResponse, fallback: true });
    }

    let prompt = "";
    const systemInstruction = "You are a world-class senior DevOps & Terraform Architect and mentor. You explain Terraform concepts visually, clearly, and intuitively for visual learners. Keep explanations concise, structured with bullet points or diagrams when helpful, and avoid overwhelming jargon.";

    if (action === "explain_plan") {
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
    } else if (action === "hint") {
      prompt = `The student is stuck on lab: "${labTitle}".
Lab Goal: ${labGoal}
Current student code:
\`\`\`hcl
${code || ""}
\`\`\`
Terminal output:
\`\`\`
${terminalOutput || ""}
\`\`\`
Provide a targeted, encouraging hint that points them toward the fix without giving away the full answer immediately. Use code snippets if demonstrating syntax conventions.`;
    } else if (action === "diagnose_error") {
      prompt = `The student encountered this error in Terraform:
\`\`\`
${terminalOutput || ""}
\`\`\`
Code:
\`\`\`hcl
${code || ""}
\`\`\`
Explain:
1. Why this error occurred in simple visual terms.
2. The exact conceptual fix needed in their HCL or workflow.`;
    } else {
      prompt = `Lab Context: "${labTitle}"
Student question: ${userQuestion || "Explain Terraform"}
Current code:
\`\`\`hcl
${code || ""}
\`\`\`
Provide a clear, engaging answer with concise code examples if applicable.`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "No response generated.";
    return res.json({ text });
  } catch (error: any) {
    console.error("Gemini mentor error:", error);
    return res.status(500).json({
      error: "Failed to generate mentor response",
      details: error.message,
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Terraform Visual Labs server running on http://0.0.0.0:${PORT}`);
    console.log(`  AI model: ${GEMINI_MODEL}`);
    console.log(`  Rate limit: ${RATE_LIMIT_MAX} requests/min per IP`);
  });
}

startServer();