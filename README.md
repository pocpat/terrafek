<div align="center">

# 🏗️ TerrafEK

**Visual, hands-on interactive Terraform learning platform**

Learn Infrastructure-as-Code through guided labs, visual walkthroughs, a simulated Terraform CLI, real-time cloud topology diagrams, error diagnostics, and an AI mentor.

</div>

---

## ✨ Features

- **10 Progressive Labs** — From your first S3 bucket to production-grade multi-tier architecture
- **5 Visual Walkthroughs** — Interactive concept guides with animated diagrams
- **5 Remediation Drills** — Targeted exercises that fix common skill gaps
- **Simulated Terraform CLI** — Run `init`, `plan`, `apply`, `destroy`, `validate`, `fmt`, `console`, `state`, `graph`, and `refresh` in a safe browser sandbox
- **Real-time Visual Topology** — Cloud architecture diagrams that update as you type code
- **Error Analytics Engine** — Tracks your mistakes, classifies them by skill domain, and recommends targeted drills
- **AI Mentor** — Gemini-powered chat that explains plans, gives hints, and diagnoses errors (works offline with fallback responses)
- **Gamification** — XP points, lab completion badges, confetti celebrations
- **Persistent Progress** — Your progress, layout, and settings are saved locally

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Gemini API key (optional — app works in offline mode without it)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-username>/terrafek.git
   cd terrafek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional — only needed for AI Mentor)
   ```bash
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY to your Gemini API key
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | No | — | Gemini API key for AI Mentor. App works offline without it. |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Which Gemini model to use. |
| `AI_RATE_LIMIT` | No | `10` | Max AI requests per minute per IP. |
| `CORS_ORIGINS` | No | `localhost:3000,5173` | Comma-separated allowed origins. |
| `PORT` | No | `3000` | Server port. |

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite + Express, HMR) |
| `npm run build` | Build frontend + server for production |
| `npm start` | Run the production server |
| `npm test` | Run test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | TypeScript type checking |

## 🧪 Tests

The project includes 91 tests across 6 suites covering the core engine logic:

```
src/test/safeStorage.test.ts         — localStorage crash protection
src/test/terraformEngine.test.ts     — simulated CLI (validate, plan, apply, destroy, console)
src/test/hclParser.test.ts          — HCL parsing (resources, variables, outputs, modules)
src/test/errorAnalyticsEngine.test.ts— error classification and mastery scoring
src/test/ErrorBoundary.test.tsx      — React error boundary crash recovery
src/test/rateLimit.test.ts           — AI endpoint rate limiting
```

## 🏗️ Architecture

```
src/
├── components/     # React UI components
├── data/           # Curriculum content (labs, walkthroughs, drills, quizzes)
├── hooks/          # Custom React hooks (navigation, layout, gamification, etc.)
├── types/          # TypeScript type definitions
├── utils/          # Core logic (HCL parser, Terraform engine, error analytics, safe storage)
└── test/           # Vitest test suites
```

## 📄 License

MIT — see [LICENSE](LICENSE) file. Free to use, share, and learn from.

## 🙏 Acknowledgments

Built with [Google AI Studio](https://ai.studio). Powered by React 19, Vite, Tailwind CSS, and Google Gemini.