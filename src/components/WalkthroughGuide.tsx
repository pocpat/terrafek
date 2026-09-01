import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Play,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  FileCode,
  Check,
  Copy,
  Layers,
  Award,
  Box,
  Sliders,
  PlugZap,
  ShieldAlert,
  Terminal,
  GitGraph,
  Info,
  Lightbulb,
  FileText
} from "lucide-react";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";
import { VisualWalkthrough, WalkthroughStep } from "../types/terraform";
import { WalkthroughDiagrams } from "./WalkthroughDiagrams";
import { InteractiveCodeSnippet } from "./InteractiveCodeSnippet";
import { ExplainableTerm } from "./ExplainableTerm";
import { SelectionTermExplainer } from "./SelectionTermExplainer";

interface WalkthroughGuideProps {
  currentWalkthroughIndex: number;
  onSelectWalkthrough: (index: number) => void;
  onLoadExampleToEditor: (files: Record<string, string>, commandToRun?: string) => void;
  onAskAiMentor: (prompt: string) => void;
  workspaceViewMode?: "study" | "split" | "editor_only";
  onToggleWorkspaceViewMode?: (mode: "study" | "split") => void;
  onStartLab?: (labIndex: number) => void;
  onCompleteWalkthrough?: (walkthroughId: string) => void;
}

// Maps each walkthrough to the lab that practices the same subject.
// Walkthrough indices → Lab indices (0-based for both).
const WALKTHROUGH_TO_LAB: Record<number, number> = {
  0: 0,  // Providers & Terraform Block    → Lab 1: Your First Cloud Resource
  1: 1,  // Resource Blocks & HCL Anatomy  → Lab 2: Core Terraform Workflow
  2: 2,  // Variables, Locals & Outputs     → Lab 3: Input Variables & Locals
  3: 5,  // State & 3-Way Reconciliation    → Lab 6: State Management & Drift Detection
  4: 1,  // CLI Workflow (init→plan→apply)  → Lab 2: Core Terraform Workflow
  5: 7,  // Modules & Reusable Architecture  → Lab 8: Terraform Modules & Reusability
  6: 3,  // Dependency Graphs (DAG)        → Lab 4: Cloud Networking & Resource Graphs
};

export const WalkthroughGuide: React.FC<WalkthroughGuideProps> = ({
  currentWalkthroughIndex,
  onSelectWalkthrough,
  onLoadExampleToEditor,
  onAskAiMentor,
  workspaceViewMode = "study",
  onToggleWorkspaceViewMode,
  onStartLab,
  onCompleteWalkthrough,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when step or walkthrough changes
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStepIndex, currentWalkthroughIndex]);

  const currentWalkthrough: VisualWalkthrough = WALKTHROUGHS_DATA[currentWalkthroughIndex] || WALKTHROUGHS_DATA[0];
  const steps = currentWalkthrough.steps;
  const currentStep: WalkthroughStep = steps[currentStepIndex] || steps[0];

  // Mark walkthrough as complete when the user reaches the last step
  useEffect(() => {
    if (currentStepIndex === steps.length - 1 && onCompleteWalkthrough) {
      onCompleteWalkthrough(currentWalkthrough.id);
    }
  }, [currentStepIndex, steps.length, currentWalkthrough.id, onCompleteWalkthrough]);

  // Reset step & quiz when walkthrough changes
  const handleSelectWalkthrough = (idx: number) => {
    onSelectWalkthrough(idx);
    setCurrentStepIndex(0);
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedQuizOption(null);
      setIsQuizSubmitted(false);
    } else if (currentWalkthroughIndex < WALKTHROUGHS_DATA.length - 1) {
      handleSelectWalkthrough(currentWalkthroughIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setSelectedQuizOption(null);
      setIsQuizSubmitted(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentStep.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTryInEditor = () => {
    const filesToLoad = currentWalkthrough.starterFiles;
    onLoadExampleToEditor(filesToLoad, currentStep.commandToTest || "terraform plan");
    if (onToggleWorkspaceViewMode) {
      onToggleWorkspaceViewMode("split");
    }
  };

  // Jump to the lab that practices this walkthrough's subject
  const handleStartLab = () => {
    const labIndex = WALKTHROUGH_TO_LAB[currentWalkthroughIndex] ?? 0;
    if (onStartLab) {
      onStartLab(labIndex);
    } else {
      handleTryInEditor();
    }
  };

  const getConceptIcon = (iconName: string) => {
    switch (iconName) {
      case "PlugZap":
        return <PlugZap className="w-4 h-4 text-stone-900" />;
      case "Box":
        return <Box className="w-4 h-4 text-stone-900" />;
      case "Sliders":
        return <Sliders className="w-4 h-4 text-stone-900" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-4 h-4 text-stone-900" />;
      case "Terminal":
        return <Terminal className="w-4 h-4 text-stone-900" />;
      case "Layers":
        return <Layers className="w-4 h-4 text-stone-900" />;
      case "GitGraph":
        return <GitGraph className="w-4 h-4 text-stone-900" />;
      default:
        return <BookOpen className="w-4 h-4 text-stone-900" />;
    }
  };

  return (
    <SelectionTermExplainer>
      <div className="flex flex-col h-full bg-[#F5F8FA] text-stone-900 font-sans select-text overflow-hidden">
        {/* 1. Walkthrough Concept Selector Header */}
      <div className="p-4 border-b border-stone-200 bg-white shrink-0 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-stone-100 border border-stone-200">
              {getConceptIcon(currentWalkthrough.icon)}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                Visual Walkthrough {currentWalkthroughIndex + 1} of {WALKTHROUGHS_DATA.length}
              </span>
              <h2 className="text-sm font-serif font-bold text-stone-900">
                {currentWalkthrough.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-stone-600">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{currentWalkthrough.estimatedMinutes}m</span>
          </div>
        </div>

        {/* Walkthrough Selector Dropdown */}
        <select
          value={currentWalkthroughIndex}
          onChange={(e) => handleSelectWalkthrough(Number(e.target.value))}
          className="w-full bg-[#FAFAFA] border border-stone-200 text-stone-900 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 font-medium cursor-pointer"
        >
          {WALKTHROUGHS_DATA.map((wt, idx) => (
            <option key={wt.id} value={idx}>
              {idx + 1}. {wt.title} ({wt.category})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Step Progress Tabs */}
      <div className="relative z-30 border-b border-stone-200 bg-stone-50 shrink-0">
        <div className="flex items-center justify-between px-3 py-1.5 gap-2">
          {/* Steps list scrollable without clipping tooltip */}
          <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar min-w-0 pr-1">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setSelectedQuizOption(null);
                  setIsQuizSubmitted(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap mr-1 transition-all flex items-center space-x-1.5 cursor-pointer ${
                  idx === currentStepIndex
                    ? "bg-stone-900 text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                }`}
              >
                <span>Step {s.stepNumber}</span>
              </button>
            ))}
          </div>

          {/* Contextual Top Lab / Reading Button with Hover Tooltip */}
          <div className="relative group shrink-0">
            {workspaceViewMode === "study" ? (
              <button
                onClick={handleStartLab}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Lab</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleWorkspaceViewMode?.("study")}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium border border-stone-300 shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reading Mode</span>
              </button>
            )}

            {/* Hover Tooltip explaining the mode - elevated above all sections */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-[9999] w-72 p-3 bg-stone-950 text-stone-100 rounded-xl shadow-2xl border border-stone-800 text-[11.5px] leading-snug animate-in fade-in zoom-in-95 pointer-events-none">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{workspaceViewMode === "study" ? "Reading Mode" : "Hands-on Lab Active"}</span>
              </div>
              <p className="text-stone-300 font-sans">
                {workspaceViewMode === "study"
                  ? "Read through the lesson steps first, then click here to open the hands-on Lab (Task Checklist on the left, Code Editor on the right)."
                  : "Live HCL Code Editor and Cloud Visualizer are open side-by-side. Click here to collapse them and focus purely on reading."}
              </p>
              <div className="absolute bottom-full right-4 w-2.5 h-2.5 bg-stone-950 border-t border-l border-stone-800 rotate-45 mb-[-5px]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scrollable Walkthrough Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4 text-xs bg-[#F5F8FA]">
        {/* LEARNING SECTION 1: Step Overview & Core Lesson */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center font-mono text-[10.5px] font-bold">
                {currentStep.stepNumber}
              </div>
              <span className="text-xs font-serif font-bold text-slate-900 tracking-tight">
                Step {currentStep.stepNumber} Lesson: {currentStep.subtitle}
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white/80 border border-[#CADAE8] px-2 py-0.5 rounded-md">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Primary Bold Learning Title */}
          <h3 className="text-base font-serif font-bold text-slate-900 tracking-tight leading-snug">
            {currentStep.title}
          </h3>

          {/* Core Learning Concept Text */}
          <p className="text-[12px] font-sans font-medium text-slate-800 leading-relaxed">
            {currentStep.explanation}
          </p>
        </div>

        {/* LEARNING SECTION 2: Learning Objectives */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-serif font-bold text-slate-900">
            <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Learning Objectives for this Step:</span>
          </div>
          
          <ul className="space-y-2 pl-0.5">
            {currentStep.objectives.map((obj, i) => (
              <li key={i} className="flex items-start space-x-2.5 text-[11.5px] font-medium text-slate-800 leading-relaxed font-sans bg-white/80 border border-[#CADAE8]/80 p-2.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-900">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LEARNING SECTION 3: Visual Concept Model (Enclosed in the exact same blue style box) */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-serif font-bold text-slate-900">
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Visual Concept Model:</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-800 font-semibold bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
              Interactive Topology
            </span>
          </div>

          {/* Diagram Rendered Inside the Container */}
          <div className="pt-1">
            <WalkthroughDiagrams type={currentStep.diagramType} stepNumber={currentStep.stepNumber} />
          </div>
        </div>

        {/* LEARNING SECTION 4: HCL Code Example & Interactive Explanations */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center">
                <FileCode className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-serif font-bold text-slate-900">
                HCL Code Example ({currentStep.fileName || "main.tf"}):
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-2 py-1 rounded-lg text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#CADAE8] transition-colors flex items-center space-x-1 text-[11px] shadow-2xs font-medium cursor-pointer"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          {/* Interactive Click-to-Explain Code View */}
          <InteractiveCodeSnippet
            code={currentStep.codeSnippet}
            fileName={currentStep.fileName || "main.tf"}
          />

          {/* Explanation Callout Notes for Code Highlights */}
          {currentStep.codeHighlights && currentStep.codeHighlights.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-1.5 text-[10.5px] font-mono uppercase tracking-wider text-slate-600 font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Code Breakdown Notes:</span>
              </div>
              {currentStep.codeHighlights.map((hl, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#FFFDF5] border border-amber-200/90 flex items-start space-x-2.5 text-[11px] shadow-2xs">
                  <span className="font-mono font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0 text-[10.5px]">
                    {hl.label}
                  </span>
                  <span className="text-amber-950 font-sans leading-snug">{hl.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEARNING SECTION 5: Golden Rules & Best Practices */}
        <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 font-sans">
          <div className="flex items-center space-x-2 text-xs font-serif font-bold text-slate-900">
            <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Production Rules & Key Takeaways:</span>
          </div>

          {/* NOTE Callout Box for Key Rules */}
          <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-amber-200/90 shadow-2xs space-y-2">
            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                RULE NOTE
              </span>
              <span className="text-[11px] font-semibold text-amber-900">Recommended Architect Patterns</span>
            </div>
            <ul className="space-y-1.5 pl-0.5 text-[11.5px] text-amber-950 leading-relaxed font-medium">
              {currentStep.keyRules.map((rule, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="font-mono text-amber-600 font-bold text-xs mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* LEARNING SECTION 6: Quick Knowledge Check Quiz */}
        {currentStep.quickCheck && (
          <div className="bg-[#EBF2F8] border border-[#CADAE8] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 font-sans">
            <div className="flex items-center space-x-2 text-xs font-serif font-bold text-slate-900">
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Quick Knowledge Check:</span>
            </div>

            {/* Bold Learning Question */}
            <p className="text-[12px] font-bold text-slate-900 leading-relaxed bg-white/80 border border-[#CADAE8]/80 p-3 rounded-xl shadow-2xs font-sans">
              {currentStep.quickCheck.question}
            </p>

            <div className="space-y-1.5">
              {currentStep.quickCheck.options.map((opt, optIdx) => {
                let btnStyle = "border-[#CADAE8] bg-white hover:bg-slate-50 text-slate-800";
                if (isQuizSubmitted) {
                  if (optIdx === currentStep.quickCheck?.correctIndex) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                  } else if (optIdx === selectedQuizOption) {
                    btnStyle = "border-rose-300 bg-rose-50 text-rose-900";
                  }
                } else if (selectedQuizOption === optIdx) {
                  btnStyle = "border-slate-900 bg-slate-100 text-slate-900 font-semibold";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!isQuizSubmitted) {
                        setSelectedQuizOption(optIdx);
                        setIsQuizSubmitted(true);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex items-center justify-between shadow-2xs cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isQuizSubmitted && optIdx === currentStep.quickCheck?.correctIndex && (
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* NOTE Box for Quiz Explanation */}
            {isQuizSubmitted && (
              <div className="p-3 rounded-xl bg-[#FFFDF5] border border-amber-200/90 text-[11px] text-amber-950 leading-relaxed shadow-2xs space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                    EXPLANATION NOTE
                  </span>
                </div>
                <p className="pt-0.5 font-medium">{currentStep.quickCheck.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Action: Practice in Lab — only on the final step of this walkthrough */}
        {currentStepIndex === steps.length - 1 && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[11px] text-indigo-900 font-semibold font-sans block">
                  Want to try this hands-on?
                </span>
                <span className="text-[10px] text-indigo-700/80 font-sans">
                  Open the Lab to practice what you just learned.
                </span>
              </div>
            </div>
            <button
              onClick={handleStartLab}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Open Lab</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Bottom Step Navigation Footer */}
      <div className="p-3 border-t border-stone-200 bg-white flex items-center justify-between shrink-0 shadow-xs">
        <button
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs font-medium hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] font-mono text-stone-500 font-medium">
          {currentStepIndex + 1} / {steps.length}
        </span>

        <button
          onClick={handleNextStep}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
        >
          <span>{currentStepIndex < steps.length - 1 ? "Next Step" : "Next Topic"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </SelectionTermExplainer>
);
};

