import React, { useState } from "react";
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
  Columns
} from "lucide-react";
import { LabDefinition, TerraformStateFile, ParsedResource } from "../types/terraform";

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
  isCompleted,
  workspaceViewMode = "study",
  onToggleWorkspaceViewMode,
  showWorkspaceNotes = false,
  onToggleWorkspaceNotes,
}) => {
  const [showTakeaways, setShowTakeaways] = useState(true);
  const [activeHintTaskId, setActiveHintTaskId] = useState<string | null>(null);

  // Evaluate tasks in real-time
  const taskStatus = lab.tasks.map((task) => {
    try {
      return task.validationCheck(codeMap, state, parsedResources);
    } catch {
      return false;
    }
  });

  const completedTasksCount = taskStatus.filter(Boolean).length;
  const allTasksDone = completedTasksCount === lab.tasks.length;

  return (
    <div className="flex flex-col h-full bg-[#FAF9F7] border-r border-stone-200 text-stone-900 overflow-y-auto custom-scrollbar">
      {/* Lab Header Banner */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              Lab {lab.level} • {lab.category}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
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

          <div className="flex items-center space-x-2">
            {workspaceViewMode === "study" ? (
              <button
                onClick={() => onToggleWorkspaceViewMode?.("split")}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Open Code Editor and Visualizer to build this lab"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Start Lab in Editor →</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleWorkspaceViewMode?.("study")}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium border border-stone-300 shadow-2xs transition-all cursor-pointer"
                title="Close Code Editor & Visualizer to focus purely on reading"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Close Editor (Focus Read)</span>
              </button>
            )}

            <div className="flex items-center space-x-1 text-amber-700 text-xs font-mono font-semibold pl-1">
              <Award className="w-3.5 h-3.5" />
              <span>+{lab.xp} XP</span>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight leading-snug">{lab.title}</h2>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed italic">{lab.subtitle}</p>

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
              <div className="flex items-center space-x-2 shrink-0 ml-2">
                {onToggleWorkspaceNotes && (
                  <button
                    onClick={onToggleWorkspaceNotes}
                    className={`text-[11.5px] font-semibold flex items-center space-x-1 px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      showWorkspaceNotes
                        ? "bg-indigo-600 border-indigo-700 text-white"
                        : "bg-white hover:bg-stone-50 border-stone-300 text-indigo-700"
                    }`}
                    title="How to use the 3 workspace panels step-by-step"
                  >
                    <span>{showWorkspaceNotes ? "Hide Steps" : "How to use Lab"}</span>
                  </button>
                )}
                <button
                  onClick={() => onToggleWorkspaceViewMode?.("study")}
                  className="text-[11.5px] font-medium text-slate-700 hover:text-stone-900 underline underline-offset-2 cursor-pointer"
                >
                  Focus Reading View
                </button>
              </div>
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
                          {task.description}
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
                      <p className="text-slate-800 font-mono text-[11px] leading-relaxed break-all bg-white p-2 rounded-lg border border-amber-200/90 shadow-2xs">
                        {task.hint}
                      </p>
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
        <div className="flex items-center justify-between space-x-2">
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
    </div>
  );
};
