import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Bot,
  User,
  RefreshCw,
  KeyRound,
  Settings,
  ExternalLink,
  Trash2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  callMentor,
  MissingApiKeyError,
  getStoredApiKey,
  storeApiKey,
  clearApiKey,
  type MentorRequest,
} from "../utils/aiMentorClient";

interface AiMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  labTitle: string;
  labGoal: string;
  terminalOutput?: string;
  initialQuestion?: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

const KEY_GATE_INTRO =
  "🔑 **Connect your own Gemini key to activate the AI Mentor.**\n\nIt's free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — takes about 2 minutes. The key is stored **only in your browser** and every question is billed to **your own free quota**, never to TerrafEK's owner.";

export const AiMentorModal: React.FC<AiMentorModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  labTitle,
  labGoal,
  terminalOutput,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `👋 Hi! I'm your **Terraform DevOps Mentor**. I can explain execution plans, clarify HCL syntax, troubleshoot errors, or guide you through **"${labTitle}"**. How can I help you?`,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  // Bring-your-own-key state
  const [hasOwnKey, setHasOwnKey] = useState<boolean>(() => !!getStoredApiKey());
  const [showKeyGate, setShowKeyGate] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");

  if (!isOpen) return null;

  const saveKey = () => {
    setKeyError("");
    if (storeApiKey(keyInput)) {
      setHasOwnKey(true);
      setShowKeyGate(false);
      setKeyInput("");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "✅ Key connected — the mentor now runs on **your own Gemini quota**. Ask me anything about your lab!" },
      ]);
    } else {
      setKeyError("That doesn't look like a Gemini API key. Keys start with \"AIza\" and are about 39 characters long.");
    }
  };

  const removeKey = () => {
    clearApiKey();
    setHasOwnKey(false);
    setShowKeyGate(false);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "🗑️ Stored key removed from this browser. The mentor is disconnected." },
    ]);
  };

  const sendMessage = async (questionText: string, actionType: MentorRequest["action"] = "chat") => {
    if (!questionText.trim() && actionType === "chat") return;

    const userMsg = questionText || (actionType === "explain_plan" ? "Can you explain my current Terraform plan?" : "Can you give me a hint?");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    if (actionType === "chat") setInputVal("");
    setLoading(true);

    try {
      const { text, source } = await callMentor({
        action: actionType,
        code: currentCode,
        labTitle,
        labGoal,
        terminalOutput,
        userQuestion: userMsg,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: source === "user-key" ? text : `${text}\n\n_(served by your local dev backend)_`,
        },
      ]);
    } catch (err: any) {
      if (err instanceof MissingApiKeyError) {
        setShowKeyGate(true);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: KEY_GATE_INTRO },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `⚠️ ${err.message}` },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const keyGate = (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAFAFA] overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="p-2 rounded-xl bg-stone-900 text-white shadow-xs">
            <KeyRound className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-serif font-bold text-stone-900">Connect your Gemini key</h4>
        </div>

        <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
          Get a free key at{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-stone-900 font-semibold underline decoration-stone-300 hover:decoration-stone-900 inline-flex items-center space-x-0.5"
          >
            <span>aistudio.google.com/apikey</span>
            <ExternalLink className="w-3 h-3" />
          </a>{" "}
          (Google account → "Create API key"). It stays in <span className="font-mono">localStorage</span> on
          this device and is sent only to Google's API — your usage counts against <span className="font-semibold">your own free quota</span>.
        </p>

        <div className="flex items-center space-x-2">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveKey()}
            placeholder="AIza..."
            autoFocus
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <button
            onClick={saveKey}
            disabled={!keyInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-xs"
          >
            Save
          </button>
        </div>

        {keyError && (
          <p className="mt-2 text-[11px] text-rose-700 flex items-start space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{keyError}</span>
          </p>
        )}

        <p className="mt-3 text-[10px] text-stone-400 leading-relaxed">
          TerrafEK has no server-side access to this key and never sees your conversations with Google.
        </p>

        {hasOwnKey && (
          <button
            onClick={removeKey}
            className="mt-3 w-full px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove stored key from this browser</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-stone-900 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center space-x-1.5">
                <span>AI Terraform Mentor</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-md bg-stone-200 text-stone-700">
                  Gemini 3.6 Flash
                </span>
                {hasOwnKey && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-700">
                    your key
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">Context: {labTitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => { setShowKeyGate((v) => !v); setKeyError(""); }}
              title="Manage your Gemini key"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-stone-50 border-b border-stone-200 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => sendMessage("Explain what my Terraform code and plan will do.", "explain_plan")}
            disabled={loading || showKeyGate}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1 shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-stone-700" />
            <span>Explain Plan</span>
          </button>
          <button
            onClick={() => sendMessage("Give me a progressive hint for my current lab task.", "hint")}
            disabled={loading || showKeyGate}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1 shadow-xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
            <span>Get Lab Hint</span>
          </button>
          <button
            onClick={() => sendMessage("Why did my Terraform command encounter an issue?", "diagnose_error")}
            disabled={loading || showKeyGate}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1 shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            <span>Diagnose Error</span>
          </button>
        </div>

        {showKeyGate ? (
          keyGate
        ) : (
          <>
            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs bg-[#FAFAFA]">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start space-x-2.5 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      m.role === "user"
                        ? "bg-stone-900 text-white"
                        : "bg-white text-stone-700 border border-stone-200 shadow-xs"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-stone-900 text-white"
                        : "bg-white border border-stone-200 text-stone-800"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="markdown-body space-y-2">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <span>{m.text}</span>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-stone-600 text-xs animate-pulse p-2 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Terraform code & formulating mentor explanation...</span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputVal, "chat");
              }}
              className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask anything about Terraform, HCL syntax, dependencies, or state..."
                disabled={loading}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 font-sans"
              />
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};