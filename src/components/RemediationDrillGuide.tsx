import React, { useState } from "react";
import {
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Eye,
  Check,
  Terminal,
  Columns
} from "lucide-react";
import { RemediationDrill, ParsedResource, TerraformStateFile } from "../types/terraform";

interface RemediationDrillGuideProps {
  drill: RemediationDrill;
  codeMap: Record<string, string>;
  state: TerraformStateFile;
  parsedResources: ParsedResource[];
  onBackToDashboard: () => void;
  onAskAiMentor: (prompt: string) => void;
  onDrillCompleted?: () => void;
  workspaceViewMode?: "study" | "split" | "editor_only";
  onToggleWorkspaceViewMode?: (mode: "study" | "split") => void;
}

export const RemediationDrillGuide: React.FC<RemediationDrillGuideProps> = ({
  drill,
  codeMap,
  state,
  parsedResources,
  onBackToDashboard,
  onAskAiMentor,
  onDrillCompleted,
  workspaceViewMode = "study",
  onToggleWorkspaceViewMode,
}) => {
  const [showSolutionComparison, setShowSolutionComparison] = useState(false);

  // Check if drill validation passed
  const isPassed = drill.validationCheck(codeMap, state, parsedResources);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-stone-900 overflow-y-auto custom-scrollbar font-sans select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-200 bg-white sticky top-0 z-10 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Contents</span>
          </button>

          {workspaceViewMode === "study" ? (
            <button
              onClick={() => onToggleWorkspaceViewMode?.("split")}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Open Editor to solve this drill"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Start Fix in Editor →</span>
            </button>
          ) : (
            <button
              onClick={() => onToggleWorkspaceViewMode?.("study")}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium border border-stone-300 shadow-2xs transition-all cursor-pointer"
              title="Close editor and visualizer to focus on reading"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Close Workspace</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10.5px] font-mono font-bold uppercase flex items-center space-x-1">
            <Target className="w-3 h-3 text-rose-700" />
            <span>Targeted Skill Gap Drill</span>
          </span>
          <div className="flex items-center space-x-1 text-xs text-stone-500 font-mono">
            <Clock className="w-3 h-3" />
            <span>{drill.estimatedMinutes} min</span>
          </div>
        </div>

        <h2 className="text-base font-serif font-bold text-stone-900 leading-snug">
          {drill.title}
        </h2>
      </div>

      <div className="p-4 space-y-4 flex-1 bg-[#F5F8FA]">
        {/* 1. Diagnostic Alert Box */}
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 space-y-1.5 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-900">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Diagnostic Trigger</span>
          </div>
          <p className="text-xs font-sans leading-relaxed text-rose-900">
            {drill.diagnosticReason}
          </p>
        </div>

        {/* 2. Concept Breakdown */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Core Terraform Rule
          </h3>
          <p className="text-xs text-slate-800 font-sans leading-relaxed bg-white/70 border border-[#CADAE8]/80 p-2.5 rounded-xl">
            {drill.learningConcept}
          </p>
          <div className="pt-2 border-t border-[#CADAE8]/80 space-y-1.5">
            {drill.ruleBulletPoints.map((rule, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <span className="text-indigo-600 font-mono font-bold">•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. The Practice Task */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Your Fix Objective
            </h3>
            {isPassed && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-300">
                Passed ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-900 font-sans leading-relaxed bg-white p-3 rounded-xl border border-[#CADAE8] shadow-2xs">
            {drill.practiceTask}
          </p>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setShowSolutionComparison((prev) => !prev)}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center space-x-1 bg-white px-2.5 py-1 rounded-lg border border-[#CADAE8] shadow-2xs"
            >
              <Eye className="w-3 h-3" />
              <span>{showSolutionComparison ? "Hide Comparison" : "Compare Broken vs Fixed"}</span>
            </button>

            <button
              onClick={() => onAskAiMentor(`Explain the correct way to solve this drill: ${drill.title}. Rule: ${drill.learningConcept}`)}
              className="text-xs text-indigo-700 font-semibold flex items-center space-x-1 hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Ask AI Hint</span>
            </button>
          </div>
        </div>

        {/* 4. Broken vs Fixed Code Diff (Collapsible) */}
        {showSolutionComparison && (
          <div className="space-y-3">
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
              <span className="text-[10.5px] font-mono font-bold text-rose-800 uppercase block">
                Common Broken Anti-Pattern
              </span>
              <pre className="font-mono text-[11px] text-rose-950 whitespace-pre-wrap overflow-x-auto bg-white/70 p-2.5 rounded-xl border border-rose-200">
                {drill.brokenSnippet}
              </pre>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
              <span className="text-[10.5px] font-mono font-bold text-emerald-800 uppercase block">
                Correct Architectural Fix
              </span>
              <pre className="font-mono text-[11px] text-emerald-950 whitespace-pre-wrap overflow-x-auto bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                {drill.fixedSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* 5. Success Banner */}
        {isPassed && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 shadow-2xs animate-fade-in">
            <div className="flex items-center space-x-2 font-serif font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Knowledge Gap Resolved!</span>
            </div>
            <p className="text-xs font-sans text-emerald-800 leading-relaxed">
              Great job! You diagnosed and resolved the syntax/configuration flaw. Your error mastery score has improved.
            </p>
            <button
              onClick={onBackToDashboard}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Return to Course Syllabus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
