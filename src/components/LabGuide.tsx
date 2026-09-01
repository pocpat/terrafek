import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Eye,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Info,
  BookOpen,
  Terminal,
  Columns,
  GraduationCap,
  RotateCcw,
  Compass,
  ArrowLeft,
  Copy
} from "lucide-react";
import { LabDefinition, TerraformStateFile, ParsedResource } from "../types/terraform";
import { ConfettiOverlay } from "./ConfettiOverlay";

interface LabGuideProps {
  lab: LabDefinition;
  codeMap: Record<string, string>;
  state: TerraformStateFile;
  parsedResources: ParsedResource[];
  onNextLab: () => void;
  onPrevLab: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenSolution: () => void;
  onAskAiHint: (taskHint: string) => void;
  onOpenQualityReview?: () => void;
  onRedoLab?: () => void;
  onBackToDashboard?: () => void;
  onLabComplete?: (labId: string) => void;
  isCompleted: boolean;
  workspaceViewMode?: "study" | "split" | "editor_only";
  onToggleWorkspaceViewMode?: (mode: "study" | "split") => void;
  showWorkspaceNotes?: boolean;
  onToggleWorkspaceNotes?: () => void;
}

export const LabGuide: React.FC<LabGuideProps> = ({
  lab,
  codeMap,
  state,
  parsedResources,
  onNextLab,
  onPrevLab,
  hasPrev,
  hasNext,
  onOpenSolution,
  onAskAiHint,
  onOpenQualityReview,
  onRedoLab,
  onBackToDashboard,
  onLabComplete,
  isCompleted,
  workspaceViewMode = "study",
  onToggleWorkspaceViewMode,
  showWorkspaceNotes = false,
  onToggleWorkspaceNotes,
}) => {
  const [showTakeaways, setShowTakeaways] = useState(true);
  const [activeHintTaskId, setActiveHintTaskId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    // Strip leading/trailing quotes for clean copying
    const clean = text.replace(/^["']|["']$/g, "");
    navigator.clipboard.writeText(clean);
    setCopiedText(clean);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Render task description with copyable code tokens
  // Detects quoted strings AND bare Terraform code tokens (AMI IDs, resource types, etc.)
  const renderDescriptionWithCopyChips = (description: string) => {
    // Match: quoted strings, AMI IDs, instance types (t2/t3/m5.*), CIDR blocks,
    // AWS resource types (aws_*), regions (us-east-1 etc), and hashicorp source strings
    const tokenRegex = /("[^"]+"|'[^']+'|ami-[a-z0-9]+|\bt[23]\.\w+|\bm5\.\w+|\b10\.\d+\.\d+\.\d+\/\d+|aws_\w+|us-east-\d|us-west-\d|var\.\w+|local\.\w+|each\.\w+|for_each|cidr_block|vpc_id|subnet_id|instance_type)/g;
    const parts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = tokenRegex.exec(description)) !== null) {
      if (match.index > lastIndex) {
        parts.push(description.slice(lastIndex, match.index));
      }
      parts.push(match[0]);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < description.length) {
      parts.push(description.slice(lastIndex));
    }
    return parts.map((part, i) => {
      // Check if this part is a code token (not plain text)
      const isQuoted = /^"[^"]+"$/.test(part) || /^'[^']+'$/.test(part);
      const isBareToken = /^(ami-[a-z0-9]+|t[23]\.\w+|m5\.\w+|10\.\d+\.\d+\.\d+\/\d+|aws_\w+|us-east-\d|us-west-\d|var\.\w+|local\.\w+|each\.\w+|for_each|cidr_block|vpc_id|subnet_id|instance_type)$/i.test(part);
      if (isQuoted || isBareToken) {
        const inner = isQuoted ? part.slice(1, -1) : part;
        const isCopied = copiedText === inner;
        return (
          <button
            key={i}
            onClick={() => handleCopy(inner)}
            className={`inline-flex items-center font-mono text-[11px] border rounded px-1 py-0.5 mx-0.5 transition-colors cursor-pointer ${
              isCopied
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-stone-100 hover:bg-indigo-50 border-stone-200 hover:border-indigo-300 text-indigo-700"
            }`}
            title={`Click to copy: ${inner}`}
          >
            {inner}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Evaluate tasks in real-time, with sticky validation:
  // once a task passes, it stays passed even if state changes later
  const stickyPassed = useRef<boolean[]>(new Array(lab.tasks.length).fill(false));
  const liveStatus = lab.tasks.map((task) => {
    try {
      return task.validationCheck(codeMap, state, parsedResources);
    } catch {
      return false;
    }
  });
  // Merge: sticky stays true once set; live can set new trues
  const taskStatus = liveStatus.map((live, i) => stickyPassed.current[i] || live);
  // Update sticky ref
  taskStatus.forEach((s, i) => { if (s) stickyPassed.current[i] = true; });

  const completedTasksCount = taskStatus.filter(Boolean).length;
  const allTasksDone = completedTasksCount === lab.tasks.length;

  // Confetti: fire ONLY when ALL tasks are complete (not per-task)
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiMessage, setConfettiMessage] = useState("");
  const prevAllDone = useRef(false);

  useEffect(() => {
    if (allTasksDone && !prevAllDone.current) {
      setConfettiMessage(`+${lab.xp} XP Earned!`);
      setConfettiTrigger((t) => t + 1);
      if (onLabComplete) {
        onLabComplete(lab.id);
      }
    }
    prevAllDone.current = allTasksDone;
  }, [allTasksDone, lab.xp, lab.id, onLabComplete]);

  return (
    <div className="flex flex-col h-full bg-[#FAF9F7] border-r border-stone-200 text-stone-900 overflow-y-auto custom-scrollbar">
      {/* Lab Header Banner */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-white shadow-xs">
        {/* Top row: left badges (stacked) + right buttons (stacked) */}
        <div className="flex items-start justify-between mb-2 gap-3">
          {/* Left: Lab info badges stacked vertically */}
          <div className="flex flex-col space-y-1.5">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-1 px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors border border-stone-200 w-fit"
                title="Back to Course Contents"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Labs</span>
              </button>
            )}
            <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 w-fit">
              Lab {lab.level} • {lab.category}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-1 rounded-md border w-fit ${
                lab.difficulty === "Beginner"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : lab.difficulty === "Intermediate"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {lab.difficulty}
            </span>
          </div>

          {/* Right: action buttons stacked vertically, same size */}
          <div className="flex flex-col items-stretch space-y-1.5 min-w-[140px]">
            {showWorkspaceNotes !== undefined && onToggleWorkspaceNotes && workspaceViewMode !== "study" && (
              <button
                onClick={onToggleWorkspaceNotes}
                className={`flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] font-sans font-medium transition-all cursor-pointer ${
                  showWorkspaceNotes
                    ? "bg-stone-900 text-white border-stone-900 font-bold"
                    : "bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700 font-semibold"
                }`}
                title="Step-by-step instructions on how to use the workspace panels"
              >
                <Compass className="w-3 h-3" />
                <span>{showWorkspaceNotes ? "Hide Step Guide" : "How to use Lab"}</span>
              </button>
            )}
            {workspaceViewMode === "study" ? (
              <button
                onClick={() => onToggleWorkspaceViewMode?.("split")}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all cursor-pointer"
                title="Open Code Editor and Visualizer to build this lab"
              >
                <Terminal className="w-3 h-3" />
                <span>Start Lab in Editor</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleWorkspaceViewMode?.("study")}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold border border-stone-200 transition-all cursor-pointer"
                title="Close Code Editor & Visualizer to focus purely on reading"
              >
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <span>Focus Reading View</span>
              </button>
            )}
            <div className="flex items-center justify-center space-x-1 text-amber-700 text-[11px] font-mono font-semibold py-0.5">
              <Award className="w-3 h-3" />
              <span>+{lab.xp} XP</span>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-base font-bold text-stone-900 tracking-tight leading-snug">{lab.title}</h2>
        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed italic">{lab.subtitle}</p>

        {/* View Mode Context Prompt */}
        <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-xs">
          {workspaceViewMode === "study" ? (
            <>
              <span className="text-[11.5px] text-indigo-950 font-medium">
                📖 <strong>Mission Briefing:</strong> Read the requirements below. When ready to code, click "Start Lab in Editor".
              </span>
              <button
                onClick={() => onToggleWorkspaceViewMode?.("split")}
                className="text-[11.5px] font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
              >
                Open Code Editor →
              </button>
            </>
          ) : (
            <>
              <span className="text-[11.5px] text-slate-800">
                🛠️ <strong>Interactive Lab Active:</strong> Edit HCL in the middle panel and test commands in the terminal.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lab Content */}
      <div className="p-4 sm:p-5 space-y-4 flex-1 bg-[#F5F8FA]">
        {/* Real-World Scenario Box */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 text-xs shadow-2xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold mb-1">
            <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif tracking-tight text-xs">Mission Scenario</span>
          </div>
          <p className="text-slate-800 leading-relaxed font-sans bg-white/70 border border-[#CADAE8]/80 p-3 rounded-xl">
            {lab.scenario}
          </p>
          <div className="mt-2 pt-2 border-t border-[#CADAE8]/80 flex items-start space-x-2 text-slate-900">
            <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0" />
            <p className="text-slate-800 font-medium text-[11.5px]">
              <strong className="text-slate-950 font-bold">Visual Goal:</strong> {lab.visualGoal}
            </p>
          </div>
        </div>

        {/* Step-by-Step Task Checklist */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
              <span>Interactive Checklist ({completedTasksCount}/{lab.tasks.length})</span>
            </h3>
            {allTasksDone && (
              <span className="text-[10.5px] text-emerald-800 font-bold flex items-center space-x-1 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>All Passed</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            {lab.tasks.map((task, idx) => {
              const isDone = taskStatus[idx];
              const isHintOpen = activeHintTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`border rounded-xl p-3 transition-all ${
                    isDone
                      ? "bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-2xs"
                      : "bg-white border-[#CADAE8] text-slate-800 hover:border-slate-400 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 font-bold" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium leading-snug font-sans">
                          <span className="text-slate-500 font-mono font-bold mr-1.5">{idx + 1}.</span>
                          {renderDescriptionWithCopyChips(task.description)}
                        </div>
                      </div>
                    </div>

                    {/* Hint Toggle */}
                    <button
                      id={`btn-hint-${task.id}`}
                      onClick={() => setActiveHintTaskId(isHintOpen ? null : task.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
                      title="Toggle Hint"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>

                  {/* Hint Reveal Box */}
                  {isHintOpen && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between text-amber-950 font-bold mb-1">
                        <span className="flex items-center space-x-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                          <span>Task Hint</span>
                        </span>
                        <button
                          onClick={() => onAskAiHint(task.hint)}
                          className="text-[11px] text-amber-900 hover:text-amber-950 font-medium flex items-center space-x-1 underline"
                        >
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Ask AI Mentor</span>
                        </button>
                      </div>
                      <div className="relative">
                        <p className="text-slate-800 font-mono text-[11px] leading-relaxed break-all bg-white p-2 pr-8 rounded-lg border border-amber-200/90 shadow-2xs">
                          {task.hint}
                        </p>
                        <button
                          onClick={() => handleCopy(task.hint)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-900 transition-colors"
                          title="Copy hint to clipboard"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Takeaways / Why this matters */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl overflow-hidden shadow-2xs">
          <button
            onClick={() => setShowTakeaways(!showTakeaways)}
            className="w-full px-4 py-3 bg-[#EBF2F8] flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-[#E3EDF6] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif tracking-tight">Core Architectural Takeaways</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform text-slate-600 ${showTakeaways ? "rotate-90" : ""}`} />
          </button>

          {showTakeaways && (
            <div className="p-3.5 space-y-2 text-xs border-t border-[#CADAE8] bg-white/80">
              {lab.conceptTakeaway.map((point, index) => (
                <div key={index} className="flex items-start space-x-2 text-slate-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="leading-relaxed font-sans">{point}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lab Action Footer */}
      <div className="p-4 border-t border-stone-200 bg-white flex flex-col space-y-2">
        {/* Code Quality Review Button — appears when all tasks are done */}
        {allTasksDone && onOpenQualityReview && (
          <button
            id="btn-quality-review"
            onClick={onOpenQualityReview}
            className="px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Review Code Quality</span>
            <span className="text-[10px] font-mono bg-indigo-800/60 px-1.5 py-0.5 rounded">
              vs Solution
            </span>
          </button>
        )}
        <div className="flex items-center justify-between space-x-2">
          {allTasksDone && onRedoLab && (
            <button
              id="btn-redo-lab"
              onClick={onRedoLab}
              className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors flex-1 shadow-xs"
              title="Reset this lab and try again from scratch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Do It Again</span>
            </button>
          )}
          <button
            id="btn-view-solution"
            onClick={onOpenSolution}
            className="px-3 py-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors flex-1 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Solution</span>
          </button>

          {allTasksDone && hasNext ? (
            <button
              id="btn-next-lab-top"
              onClick={onNextLab}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-all flex-1"
            >
              <span>Next Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center space-x-1 flex-1">
              <button
                id="btn-prev-lab"
                disabled={!hasPrev}
                onClick={onPrevLab}
                className="p-2 rounded-lg bg-white border border-stone-200 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
                title="Previous Lab"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-next-lab"
                disabled={!hasNext}
                onClick={onNextLab}
                className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center justify-center space-x-1 disabled:opacity-30 disabled:pointer-events-none transition-all flex-1 shadow-xs"
              >
                <span>Next Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confetti overlay — fires on top of all panels when tasks turn green */}
      <ConfettiOverlay
        trigger={confettiTrigger}
        message={confettiMessage}
        intensity={allTasksDone ? "lab" : "task"}
      />
    </div>
  );
};
