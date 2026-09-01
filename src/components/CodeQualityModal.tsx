import React, { useMemo } from "react";
import {
  X,
  Award,
  AlertTriangle,
  CheckCircle2,
  Info,
  Baby,
  Wand2,
  FileCode,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { LabDefinition } from "../types/terraform";
import { reviewCodeQuality, QualityCheck } from "../utils/codeQualityEngine";

interface CodeQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: LabDefinition;
  studentFiles: Record<string, string>;
}

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-rose-50/80",
    border: "border-rose-300",
    icon: "text-rose-600",
    text: "text-rose-900",
    label: "Fix Needed",
    labelBg: "bg-rose-100 text-rose-700",
  },
  warning: {
    bg: "bg-amber-50/80",
    border: "border-amber-300",
    icon: "text-amber-600",
    text: "text-amber-900",
    label: "Should Improve",
    labelBg: "bg-amber-100 text-amber-700",
  },
  info: {
    bg: "bg-sky-50/80",
    border: "border-sky-300",
    icon: "text-sky-600",
    text: "text-sky-900",
    label: "Tip",
    labelBg: "bg-sky-100 text-sky-700",
  },
  passed: {
    bg: "bg-emerald-50/80",
    border: "border-emerald-300",
    icon: "text-emerald-600",
    text: "text-emerald-900",
    label: "Passed",
    labelBg: "bg-emerald-100 text-emerald-700",
  },
};

export const CodeQualityModal: React.FC<CodeQualityModalProps> = ({
  isOpen,
  onClose,
  lab,
  studentFiles,
}) => {
  const review = useMemo(
    () => reviewCodeQuality(studentFiles, lab.solutionFiles),
    [studentFiles, lab.solutionFiles]
  );

  if (!isOpen) return null;

  const scoreColor =
    review.score >= 85
      ? "text-emerald-600"
      : review.score >= 70
      ? "text-amber-600"
      : "text-rose-600";

  const scoreBg =
    review.score >= 85
      ? "bg-emerald-50 border-emerald-200"
      : review.score >= 70
      ? "bg-amber-50 border-amber-200"
      : "bg-rose-50 border-rose-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-900">Code Quality Review</h3>
              <p className="text-[11px] text-stone-500 font-sans">{lab.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Banner */}
        <div className="px-5 py-4 border-b border-stone-200 shrink-0">
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${scoreBg}`}>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-serif font-bold ${scoreColor}`}>
                {review.score}
                <span className="text-lg text-stone-400">/100</span>
              </div>
              <div>
                <div className={`text-lg font-serif font-bold ${scoreColor}`}>Grade: {review.grade}</div>
                <div className="text-xs text-stone-500 font-sans">
                  {review.passedCount} of {review.totalCount} quality checks passed
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {review.score >= 85 ? (
                <Award className="w-8 h-8 text-emerald-500" />
              ) : review.score >= 70 ? (
                <Sparkles className="w-8 h-8 text-amber-500" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              )}
            </div>
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-3 bg-[#FAFAFA]">
          {/* Intro message */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-sans leading-relaxed">
            <div className="flex items-start space-x-2">
              <Baby className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                Your code passed the tasks, but passing tasks only checks that the right
                keywords exist. This review compares your code against the reference
                solution and HCL best practices, so you learn the <strong>proper way</strong> to
                write infrastructure code — not just approximately passing.
              </p>
            </div>
          </div>

          {/* Quality Checks */}
          {review.checks.map((check) => {
            const style = SEVERITY_STYLES[check.severity];
            const Icon =
              check.severity === "critical" ? AlertTriangle :
              check.severity === "warning" ? AlertTriangle :
              check.severity === "passed" ? CheckCircle2 : Info;

            return (
              <div
                key={check.id}
                className={`rounded-xl border p-3.5 ${style.bg} ${style.border}`}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Icon className={`w-4 h-4 ${style.icon} shrink-0`} />
                    <span className={`text-sm font-bold ${style.text}`}>
                      {check.title}
                    </span>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9.5px] font-bold ${style.labelBg}`}>
                    {style.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-700 font-sans leading-relaxed mb-2">
                  {check.description}
                </p>

                {/* ELI5 explanation */}
                {check.severity !== "passed" && (
                  <div className="flex items-start space-x-1.5 mt-1.5 p-2 bg-white/60 rounded-lg">
                    <Baby className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                      {check.eli5}
                    </p>
                  </div>
                )}

                {/* Fix hint */}
                {check.severity === "critical" && check.fixHint && (
                  <div className="flex items-center space-x-1.5 mt-2 pt-2 border-t border-stone-200/60">
                    <Wand2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Fix: {check.fixHint}
                    </span>
                  </div>
                )}
                {check.severity === "warning" && check.fixHint && (
                  <div className="flex items-center space-x-1.5 mt-2 pt-2 border-t border-stone-200/60">
                    <Wand2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Suggestion: {check.fixHint}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Missing elements summary */}
          {review.missingFromSolution.length > 0 && (
            <div className="rounded-xl border border-rose-300 p-3.5 bg-rose-50/80">
              <div className="flex items-center space-x-2 mb-2">
                <FileCode className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-rose-900">
                  Missing from your code ({review.missingFromSolution.length})
                </span>
              </div>
              <ul className="space-y-1.5">
                {review.missingFromSolution.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-stone-700 font-sans">
                    <ArrowRight className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFAFA] border-t border-stone-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-stone-500 font-sans max-w-md">
            Tip: You don't need to match the reference solution exactly — there are many valid
            approaches. But the items above teach patterns used in real production code.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 ml-3"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};