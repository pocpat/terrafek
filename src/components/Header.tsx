import React from "react";
import {
  Layers,
  Terminal,
  BookOpen,
  HelpCircle,
  Sparkles,
  Award,
  Flame,
  ChevronRight,
  Shield,
  Box,
  Compass,
  Columns
} from "lucide-react";
import { LABS_DATA } from "../data/labsData";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";
import terrafekLogo from "../assets/images/terrafek_vibrant_icon_1787272277132.jpg";
import type { AppMode, ActiveTabMode } from "../hooks/useNavigation";

export type { AppMode, ActiveTabMode };

interface HeaderProps {
  currentLabIndex: number;
  onSelectLab: (index: number) => void;
  currentWalkthroughIndex: number;
  onSelectWalkthrough: (index: number) => void;
  completedLabIds: string[];
  totalXp: number;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  unresolvedErrorCount: number;
  onOpenCheatSheet: () => void;
  onOpenQuiz: () => void;
  onOpenAiMentor: () => void;
  workspaceViewMode?: "study" | "split" | "editor_only";
  onToggleWorkspaceViewMode?: (mode: "study" | "split") => void;
  showWorkspaceNotes?: boolean;
  onToggleWorkspaceNotes?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLabIndex,
  onSelectLab,
  currentWalkthroughIndex,
  onSelectWalkthrough,
  completedLabIds,
  totalXp,
  activeMode,
  setActiveMode,
  unresolvedErrorCount,
  onOpenCheatSheet,
  onOpenQuiz,
  onOpenAiMentor,
  workspaceViewMode = "study",
  onToggleWorkspaceViewMode,
  showWorkspaceNotes = false,
  onToggleWorkspaceNotes,
}) => {
  const currentLab = LABS_DATA[currentLabIndex] || LABS_DATA[0];
  const totalLabs = LABS_DATA.length;
  const completedCount = completedLabIds.length;
  const progressPercent = Math.round((completedCount / totalLabs) * 100);

  // Level calculation: 250 XP per level
  const userLevel = Math.floor(totalXp / 250) + 1;

  // Unified button base classes — all buttons use these for consistent sizing
  const btnBase = "px-2 py-1 rounded-md text-[11px] font-sans font-medium flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap";
  const btnActive = "bg-stone-900 text-white font-bold";
  const btnInactive = "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50";
  const btnOutline = "px-2 py-1 rounded-md text-[11px] font-sans font-medium flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 hover:text-stone-900";

  return (
    <header className="border-b border-stone-200 bg-white text-stone-900 sticky top-0 z-30 select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo & Brand — clean, no badge */}
          <button
            onClick={() => setActiveMode("dashboard")}
            className="flex items-center space-x-2.5 text-left group cursor-pointer focus:outline-none shrink-0"
            title="Go to TerrafEK Dashboard & Syllabus"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm bg-[#0a0c16] flex items-center justify-center group-hover:scale-105 transition-all shrink-0">
              <img
                src={terrafekLogo}
                alt="TerrafEK Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-bold text-sm tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                Terraf<span className="text-indigo-600 font-extrabold font-sans">EK</span>
              </span>
              <span className="text-[10px] text-stone-500 font-sans">Visual Terraform</span>
            </div>
          </button>

          {/* Center: Mode Switcher & Selectors */}
          <div className="flex items-center space-x-1.5">
            {/* Primary Modes Group */}
            <div className="flex p-0.5 bg-stone-100 border border-stone-200 rounded-md">
              <button
                id="btn-mode-dashboard"
                onClick={() => setActiveMode("dashboard")}
                className={`${btnBase} ${activeMode === "dashboard" ? btnActive : btnInactive}`}
                title="Roadmap & Syllabus: Course overview and topic breakdown"
              >
                <Compass className={`w-3 h-3 ${activeMode === "dashboard" ? "text-white" : "text-stone-700"}`} />
                <span className="hidden xl:inline">Roadmap</span>
              </button>
              <button
                id="btn-mode-walkthrough"
                onClick={() => setActiveMode("walkthrough")}
                className={`${btnBase} ${activeMode === "walkthrough" ? btnActive : btnInactive}`}
                title="Visual Walkthroughs: Interactive guided concept walkthroughs"
              >
                <BookOpen className={`w-3 h-3 ${activeMode === "walkthrough" ? "text-white" : "text-indigo-600"}`} />
                <span className="hidden xl:inline">Walkthroughs</span>
              </button>
              <button
                id="btn-mode-labs"
                onClick={() => setActiveMode("lab")}
                className={`${btnBase} ${activeMode === "lab" ? btnActive : btnInactive}`}
                title={`Hands-on Labs: Completed ${completedCount} of ${totalLabs}`}
              >
                <Layers className={`w-3 h-3 ${activeMode === "lab" ? "text-white" : "text-sky-600"}`} />
                <span className="hidden xl:inline">Labs ({completedCount}/{totalLabs})</span>
              </button>
              <button
                id="btn-mode-sandbox"
                onClick={() => setActiveMode("sandbox")}
                className={`${btnBase} ${activeMode === "sandbox" ? btnActive : btnInactive}`}
                title="Freeform Sandbox: Test any Terraform HCL with full CLI simulator"
              >
                <Terminal className={`w-3 h-3 ${activeMode === "sandbox" ? "text-white" : "text-emerald-600"}`} />
                <span className="hidden xl:inline">Sandbox</span>
              </button>
            </div>

            {/* Walkthrough Selector Dropdown */}
            {activeMode === "walkthrough" && (
              <div className="relative hidden sm:block">
                <select
                  id="select-walkthrough-dropdown"
                  value={currentWalkthroughIndex}
                  onChange={(e) => onSelectWalkthrough(Number(e.target.value))}
                  className="bg-white border border-stone-200 hover:border-stone-300 text-stone-800 text-[11px] font-sans font-medium rounded-md px-2 py-1 pr-6 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors appearance-none cursor-pointer max-w-[150px] md:max-w-[200px] truncate"
                  title="Choose Guided Walkthrough Topic"
                >
                  {WALKTHROUGHS_DATA.map((wt, index) => (
                    <option key={wt.id} value={index}>
                      {index + 1}. {wt.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-stone-400">
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </div>
              </div>
            )}

            {/* Lab Selector Dropdown */}
            {activeMode === "lab" && (
              <div className="relative hidden sm:block">
                <select
                  id="select-lab-dropdown"
                  value={currentLabIndex}
                  onChange={(e) => onSelectLab(Number(e.target.value))}
                  className="bg-white border border-stone-200 hover:border-stone-300 text-stone-800 text-[11px] font-sans font-medium rounded-md px-2 py-1 pr-6 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors appearance-none cursor-pointer max-w-[150px] md:max-w-[200px] truncate"
                  title="Choose Hands-on Lab"
                >
                  {LABS_DATA.map((lab, index) => {
                    const isDone = completedLabIds.includes(lab.id);
                    return (
                      <option key={lab.id} value={index}>
                        {isDone ? "✓ " : `${index + 1}. `} {lab.title}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-stone-400">
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </div>
              </div>
            )}

            {/* View Mode Switcher: Study vs Split */}
            {(activeMode === "walkthrough" || activeMode === "lab" || activeMode === "drill") && onToggleWorkspaceViewMode && (
              <div className="flex p-0.5 bg-stone-100 border border-stone-200 rounded-md">
                <button
                  onClick={() => onToggleWorkspaceViewMode("study")}
                  className={`${btnBase} ${workspaceViewMode === "study" ? "bg-white text-stone-900 font-bold" : btnInactive}`}
                  title="Reading Mode: Focus solely on visual concepts and reading guide"
                >
                  <BookOpen className="w-3 h-3 text-indigo-600" />
                  <span className="hidden lg:inline">Reading</span>
                </button>
                <button
                  onClick={() => onToggleWorkspaceViewMode("split")}
                  className={`${btnBase} ${workspaceViewMode === "split" ? "bg-white text-stone-900 font-bold" : btnInactive}`}
                  title="Split Practice Mode: Opens Code Editor & Live Cloud Visualizer"
                >
                  <Columns className="w-3 h-3 text-stone-700" />
                  <span className="hidden lg:inline">Split</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Gamification Stats & Tools */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Level & XP Badge */}
            <div
              className="flex items-center space-x-1 px-2 py-1 bg-stone-50 border border-stone-200 rounded-md text-[11px] font-sans cursor-default"
              title={`Current Player Rank: Level ${userLevel} with ${totalXp} total XP earned`}
            >
              <div className="flex items-center space-x-0.5 text-amber-700">
                <Flame className="w-3 h-3 fill-amber-600 text-amber-600" />
                <span className="font-bold font-mono text-[10px]">Lvl {userLevel}</span>
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center space-x-0.5 text-stone-700">
                <Award className="w-3 h-3 text-stone-600" />
                <span className="font-semibold font-mono text-[10px]">{totalXp} XP</span>
              </div>
            </div>

            {/* AI Terraform Mentor */}
            <button
              id="btn-open-ai-mentor"
              onClick={onOpenAiMentor}
              className="px-2 py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-sans font-medium flex items-center space-x-1 transition-all border border-stone-800 cursor-pointer whitespace-nowrap"
              title="Ask AI Terraform Mentor for instant HCL code reviews, debug tips, and concept explanations"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="hidden md:inline">AI Mentor</span>
            </button>

            {/* Quiz Mode */}
            <button
              id="btn-open-quiz"
              onClick={onOpenQuiz}
              className={`${btnOutline}`}
              title="Practice Scenarios & Interactive Certification Exam Quizzes"
            >
              <HelpCircle className="w-3 h-3 text-stone-600" />
              <span className="hidden xl:inline">Quiz</span>
            </button>

            {/* Cheat Sheet */}
            <button
              id="btn-open-cheatsheet"
              onClick={onOpenCheatSheet}
              className={`${btnOutline}`}
              title="Visual HCL Syntax, Meta-arguments, & CLI Command Cheat Sheet"
            >
              <BookOpen className="w-3 h-3 text-stone-600" />
              <span className="hidden xl:inline">Cheat Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Progress Bar */}
      <div className="w-full bg-stone-100 h-0.5">
        <div
          className="bg-stone-800 h-0.5 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};