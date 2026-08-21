import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Check,
  Sparkles,
  CornerDownLeft,
  RefreshCw,
  HelpCircle,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { TerminalCommandLog } from "../types/terraform";

interface TerminalSimulatorProps {
  logs: TerminalCommandLog[];
  onRunCommand: (cmd: string) => void;
  onClearLogs: () => void;
  isExecuting?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  showStepBadge?: boolean;
}

const QUICK_COMMANDS = [
  { label: "init", cmd: "terraform init", desc: "Initialize workspace" },
  { label: "plan", cmd: "terraform plan", desc: "Preview plan" },
  { label: "apply", cmd: "terraform apply", desc: "Provision resources" },
  { label: "validate", cmd: "terraform validate", desc: "Check syntax" },
  { label: "fmt", cmd: "terraform fmt", desc: "Format HCL code" },
  { label: "state list", cmd: "terraform state list", desc: "List state resources" },
  { label: "output", cmd: "terraform output", desc: "Show outputs" },
  { label: "graph", cmd: "terraform graph", desc: "Generate DAG" },
  { label: "refresh", cmd: "terraform refresh", desc: "Reconcile state & detect drift" },
  { label: "destroy", cmd: "terraform destroy", desc: "Destroy infrastructure" },
];

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  logs,
  onRunCommand,
  onClearLogs,
  isExecuting = false,
  isMaximized = false,
  onToggleMaximize,
  onToggleCollapse,
  isCollapsed = false,
  showStepBadge = false,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (!isCollapsed) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isCollapsed]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(null);
    setInputVal("");
    onRunCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(null);
        setInputVal("");
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Auto complete terraform
      if (inputVal === "t" || inputVal === "ter") {
        setInputVal("terraform ");
      } else if (inputVal.startsWith("terraform p")) {
        setInputVal("terraform plan");
      } else if (inputVal.startsWith("terraform a")) {
        setInputVal("terraform apply");
      } else if (inputVal.startsWith("terraform i")) {
        setInputVal("terraform init");
      }
    }
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `$ ${l.command}\n${l.output}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Colorizer for Terraform output logs
  const renderColorizedOutput = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let lineClass = "text-slate-300";

      if (line.startsWith("  +") || line.includes("will be created") || line.includes("Creation complete") || line.includes("Apply complete!")) {
        lineClass = "text-emerald-400 font-medium";
      } else if (line.startsWith("  ~") || line.includes("will be updated in-place") || line.includes("Modifications complete")) {
        lineClass = "text-amber-300 font-medium";
      } else if (line.startsWith("  -") || line.includes("will be destroyed") || line.includes("Destruction complete")) {
        lineClass = "text-rose-400 font-medium";
      } else if (line.startsWith("Error:") || line.includes("Error: ") || line.includes("Missing required")) {
        lineClass = "text-rose-400 font-semibold bg-rose-950/30 px-1 py-0.5 rounded";
      } else if (line.startsWith("Plan:") || line.startsWith("Outputs:")) {
        lineClass = "text-cyan-300 font-bold border-t border-b border-cyan-900/50 py-0.5 my-1";
      } else if (line.includes("Terraform has been successfully initialized!")) {
        lineClass = "text-emerald-300 font-semibold";
      } else if (line.startsWith("#")) {
        lineClass = "text-indigo-400 font-semibold";
      }

      return (
        <div key={idx} className={`${lineClass} font-mono leading-relaxed whitespace-pre-wrap`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#121214] text-zinc-100 font-mono text-xs overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#18181B] border-b border-zinc-800 shrink-0 select-none">
        <div className="flex items-center space-x-2">
          {/* Traffic light dots */}
          <div className="flex items-center space-x-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-sans font-semibold text-zinc-200 text-xs">Terraform CLI Simulator</span>
          {showStepBadge && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10.5px] font-bold font-mono tracking-tight shrink-0 flex items-center space-x-1" title="Workflow Step 3: Execute terraform init / plan / apply commands here">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>③ 3. Run CLI Commands</span>
            </span>
          )}
          {isExecuting && (
            <span className="flex items-center space-x-1 text-[11px] text-amber-400 font-mono animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Executing...</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="btn-copy-terminal"
            onClick={handleCopyLogs}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Copy all terminal output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            id="btn-clear-terminal"
            onClick={onClearLogs}
            className="p-1 rounded text-zinc-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors"
            title="Clear terminal logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {onToggleMaximize && (
            <button
              id="btn-maximize-terminal"
              onClick={onToggleMaximize}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title={isMaximized ? "Restore terminal size" : "Maximize terminal to view full multiline log"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {onToggleCollapse && (
            <button
              id="btn-collapse-terminal"
              onClick={onToggleCollapse}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title={isCollapsed ? "Expand terminal" : "Minimize terminal"}
            >
              {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Command Chips Toolbar */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#141416] border-b border-zinc-800/80 overflow-x-auto custom-scrollbar shrink-0 select-none">
            <span className="text-[10px] uppercase font-sans font-bold text-zinc-500 tracking-wider mr-1 shrink-0">
              Run:
            </span>
            {QUICK_COMMANDS.map((qc) => (
              <button
                key={qc.label}
                id={`btn-cmd-${qc.label.replace(/\s+/g, "-")}`}
                onClick={() => onRunCommand(qc.cmd)}
                disabled={isExecuting}
                className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 border border-zinc-700/60 text-[11px] font-mono transition-colors whitespace-nowrap disabled:opacity-50"
                title={qc.desc}
              >
                {qc.label}
              </button>
            ))}
          </div>

          {/* Logs Scroll Area */}
          <div
            className="flex-1 p-3.5 overflow-y-auto custom-scrollbar space-y-3 font-mono text-[11.5px] bg-[#0E0E10]"
            onClick={() => inputRef.current?.focus()}
          >
            {logs.length === 0 ? (
              <div className="text-zinc-500 py-3 font-mono">
                <p className="text-zinc-400 font-semibold">Terraform v1.9.5 (simulated cloud execution sandbox ready)</p>
                <p className="mt-1 text-[11px] text-zinc-500 font-sans">
                  Type <span className="font-mono text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">terraform init</span>,{" "}
                  <span className="font-mono text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">terraform plan</span>, or click a quick action above to start.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-center space-x-2 text-zinc-300 font-semibold font-mono">
                    <span className="text-emerald-400">user@cloudops:~/terraform$</span>
                    <span className="text-zinc-100">{log.command}</span>
                    <span className="text-[10px] text-zinc-600 font-normal ml-auto">{log.timestamp}</span>
                  </div>
                  <div className="pl-2 border-l border-zinc-800/80">
                    {renderColorizedOutput(log.output)}
                  </div>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Input Prompt */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center px-3.5 py-2.5 bg-[#18181B] border-t border-zinc-800 shrink-0"
          >
            <span className="text-emerald-400 font-bold mr-2.5 select-none font-mono">$</span>
            <input
              ref={inputRef}
              id="terminal-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="terraform plan, terraform apply, terraform console, clear..."
              disabled={isExecuting}
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono text-xs"
            />
            <button
              type="submit"
              disabled={isExecuting || !inputVal.trim()}
              className="p-1 rounded text-zinc-400 hover:text-emerald-400 disabled:opacity-30 transition-colors"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

