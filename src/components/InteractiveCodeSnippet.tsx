import React, { useState } from "react";
import { explainHclLine, LineExplanation } from "../utils/hclLineExplainer";
import { Sparkles, Briefcase, Baby, Info, HelpCircle, X, ChevronRight } from "lucide-react";

interface InteractiveCodeSnippetProps {
  code: string;
  fileName?: string;
  className?: string;
}

export const InteractiveCodeSnippet: React.FC<InteractiveCodeSnippetProps> = ({
  code,
  fileName = "main.tf",
  className = ""
}) => {
  const lines = code.trim().split("\n");
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [explainerMode, setExplainerMode] = useState<"formal" | "eli5">("eli5");

  const selectedExplanation: LineExplanation | null =
    selectedLineIndex !== null && lines[selectedLineIndex] !== undefined
      ? explainHclLine(lines[selectedLineIndex], selectedLineIndex + 1, lines)
      : null;

  return (
    <div className={`rounded-xl border border-[#CADAE8] bg-white shadow-2xs overflow-hidden ${className}`}>
      {/* Header with Hint */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-[#CADAE8] text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-slate-700 text-[11px]">{fileName}</span>
          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
            Click any line to explain
          </span>
        </div>
        {selectedLineIndex !== null && (
          <button
            onClick={() => setSelectedLineIndex(null)}
            className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Close Explainer</span>
          </button>
        )}
      </div>

      {/* Code Lines Container */}
      <div className="p-2 font-mono text-[11.5px] leading-6 overflow-x-auto custom-scrollbar">
        {lines.map((line, idx) => {
          const isSelected = selectedLineIndex === idx;
          const isComment = line.trim().startsWith("#");
          const isResource = line.trim().startsWith("resource") || line.trim().startsWith("data");

          return (
            <div
              key={idx}
              onClick={() => setSelectedLineIndex(isSelected ? null : idx)}
              className={`flex items-center group rounded-md px-2 transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-50/90 text-indigo-950 ring-1 ring-indigo-400 font-semibold"
                  : "hover:bg-slate-100/80 text-slate-900"
              }`}
              title="Click to see what this specific line of Terraform code does"
            >
              {/* Line number */}
              <span className={`w-6 text-right pr-3 select-none text-[10px] font-mono shrink-0 ${
                isSelected ? "text-indigo-600 font-bold" : "text-slate-400 group-hover:text-slate-600"
              }`}>
                {idx + 1}
              </span>

              {/* Line content */}
              <span className={`flex-1 whitespace-pre truncate ${
                isComment ? "text-slate-400 italic" : isResource ? "text-indigo-900 font-bold" : "text-slate-800"
              }`}>
                {line || " "}
              </span>

              {/* Inspect indicator icon */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 text-[10px] pl-2 shrink-0 flex items-center space-x-0.5 font-sans font-medium">
                <HelpCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Explain</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Embedded Line Explainer Modal / Card */}
      {selectedExplanation && (
        <div className="border-t border-indigo-200 bg-gradient-to-r from-indigo-50/95 via-sky-50/90 to-amber-50/80 p-3.5 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-900 text-white font-mono text-[10px] font-bold">
                Line {selectedExplanation.lineNum}
              </span>
              <span className="font-mono text-[11px] text-indigo-950 font-bold truncate max-w-[200px] sm:max-w-md">
                {selectedExplanation.rawText.trim()}
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-0.5 bg-white/90 rounded-lg border border-slate-300 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setExplainerMode("eli5")}
                className={`flex items-center space-x-1 py-0.5 px-2 rounded-md font-medium text-[10.5px] transition-all cursor-pointer ${
                  explainerMode === "eli5"
                    ? "bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Baby className="w-3 h-3 text-amber-700" />
                <span>Like I'm 5</span>
              </button>
              <button
                type="button"
                onClick={() => setExplainerMode("formal")}
                className={`flex items-center space-x-1 py-0.5 px-2 rounded-md font-medium text-[10.5px] transition-all cursor-pointer ${
                  explainerMode === "formal"
                    ? "bg-indigo-100 text-indigo-950 font-bold border border-indigo-300 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-3 h-3 text-indigo-700" />
                <span>Professional</span>
              </button>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="mt-1.5 p-2.5 rounded-xl bg-white/95 border border-indigo-200/80 shadow-2xs text-[11.5px] font-sans leading-relaxed text-slate-800">
            {explainerMode === "eli5" ? (
              <div className="flex items-start space-x-2">
                <span className="text-base leading-none shrink-0">🧸</span>
                <p className="text-amber-950 font-medium leading-relaxed">
                  {selectedExplanation.eli5}
                </p>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <span className="text-base leading-none shrink-0">💼</span>
                <p className="text-slate-900 font-medium leading-relaxed">
                  {selectedExplanation.formal}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
