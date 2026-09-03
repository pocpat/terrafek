import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  Play,
  Award,
  Clock,
  Sparkles,
  AlertTriangle,
  Flame,
  ArrowRight,
  Code2,
  Sliders,
  GitGraph,
  FileJson,
  Layers,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Zap,
  Target,
  FileCode2,
  Check,
  ChevronRight,
  Search,
  BookOpen
} from "lucide-react";
import { LABS_DATA } from "../data/labsData";
import { WALKTHROUGHS_DATA } from "../data/walkthroughsData";
import { REMEDIATION_DRILLS_DATA } from "../data/remediationDrillsData";
import { CURRICULUM_ORDER } from "../data/curriculumSequence";
import {
  LoggedErrorEvent,
  SkillDomainAnalysis,
  CourseProgressSummary,
  RemediationDrill
} from "../types/terraform";
import { SKILL_DOMAINS_INFO } from "../utils/errorAnalyticsEngine";
import { formatLabTitle } from "../utils/labNumbering";
import terrafekLogo from "../assets/images/terrafek_vibrant_icon_1787272277132.jpg";

interface CurriculumDashboardProps {
  completedLabIds: string[];
  completedWalkthroughIds: string[];
  currentLabIndex?: number;
  currentWalkthroughIndex: number;
  totalXp: number;
  loggedErrors: LoggedErrorEvent[];
  domainAnalyses: SkillDomainAnalysis[];
  progressSummary: CourseProgressSummary;
  onStartLab: (labIndex: number) => void;
  onStartWalkthrough: (walkthroughIndex: number) => void;
  onStartDrill: (drill: RemediationDrill) => void;
  onResolveError?: (errorId: string) => void;
  onClearErrorHistory?: () => void;
  onAskAiMentor?: (prompt: string) => void;
  onOpenAiMentor?: (prompt?: string) => void;
  personalDrills?: import("../types/terraform").RemediationDrill[];
}

export const CurriculumDashboard: React.FC<CurriculumDashboardProps> = ({
  completedLabIds,
  completedWalkthroughIds,
  currentLabIndex = 0,
  currentWalkthroughIndex,
  totalXp,
  loggedErrors,
  domainAnalyses,
  progressSummary,
  onStartLab,
  onStartWalkthrough,
  onStartDrill,
  onResolveError,
  onClearErrorHistory,
  onAskAiMentor,
  onOpenAiMentor,
  personalDrills
}) => {
  const [activeTab, setActiveTab] = useState<"syllabus" | "diagnostics" | "drills" | "reference">("syllabus");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedDrillModal, setSelectedDrillModal] = useState<RemediationDrill | null>(null);

  const handleAskMentor = (prompt: string) => {
    if (onAskAiMentor) {
      onAskAiMentor(prompt);
    } else if (onOpenAiMentor) {
      onOpenAiMentor(prompt);
    }
  };

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2":
        return <Code2 className="w-4 h-4 text-stone-900" />;
      case "Sliders":
        return <Sliders className="w-4 h-4 text-stone-900" />;
      case "GitGraph":
        return <GitGraph className="w-4 h-4 text-stone-900" />;
      case "FileJson":
        return <FileJson className="w-4 h-4 text-stone-900" />;
      case "Layers":
        return <Layers className="w-4 h-4 text-stone-900" />;
      default:
        return <Target className="w-4 h-4 text-stone-900" />;
    }
  };

  const getStatusBadge = (status: SkillDomainAnalysis["status"]) => {
    switch (status) {
      case "Mastered":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-100 text-emerald-800">Mastered</span>;
      case "Proficient":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-100 text-blue-800">Proficient</span>;
      case "Needs Practice":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-100 text-amber-900">Needs Practice</span>;
      case "Critical Gap":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-rose-100 text-rose-900 animate-pulse">Critical Gap</span>;
      case "Not Assessed":
      default:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-stone-100 text-stone-500 border border-stone-200">Awaiting Lab Activity</span>;
    }
  };

  // Build phase arrays from the single source-of-truth curriculum sequence.
  // This ensures the Dashboard phase cards always match the recommendation logic.
  const buildPhaseItems = (phaseNum: 1 | 2 | 3) =>
    CURRICULUM_ORDER.filter((item) => item.phase === phaseNum).map((item) => {
      if (item.type === "walkthrough") {
        const wt = WALKTHROUGHS_DATA[item.index];
        return {
          type: "walkthrough" as const,
          index: item.index,
          title: wt.title,
          subtitle: wt.subtitle,
          mins: item.estimatedMinutes,
          category: item.category,
        };
      } else {
        return {
          type: "lab" as const,
          index: item.index,
          lab: LABS_DATA[item.index],
        };
      }
    });

  const phase1Items = buildPhaseItems(1);
  const phase2Items = buildPhaseItems(2);
  const phase3Items = buildPhaseItems(3);

  const handleNextRecommendedClick = () => {
    const next = progressSummary.nextRecommendedLesson;
    if (next.type === "lab") {
      onStartLab(next.index);
    } else if (next.type === "walkthrough") {
      onStartWalkthrough(next.index);
    } else {
      const drill = REMEDIATION_DRILLS_DATA[next.index] || REMEDIATION_DRILLS_DATA[0];
      onStartDrill(drill);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-stone-900 overflow-y-auto custom-scrollbar">
      {/* 1. HERO BANNER: Where to Start & Progress Overview */}
      <div className="bg-white border-b border-stone-200 p-6 md:p-8 shadow-2xs">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md bg-[#0a0c16] shrink-0 hidden sm:flex items-center justify-center">
                <img
                  src={terrafekLogo}
                  alt="TerrafEK Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white font-mono text-[10.5px] font-bold tracking-wider uppercase flex items-center space-x-1">
                    <Compass className="w-3 h-3" />
                    <span>TerrafEK Learning Roadmap</span>
                  </span>
                  <span className="flex items-center space-x-1 text-amber-700 text-xs font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{progressSummary.currentStreakDays} Day Streak</span>
                  </span>
                  <span className="flex items-center space-x-1 text-indigo-700 text-xs font-semibold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Day {progressSummary.totalDaysSinceStart} • {progressSummary.activeDaysCount} active</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  Terraf<span className="text-indigo-600 font-extrabold font-sans">EK</span> CloudOps Curriculum & Diagnostics
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl font-sans">
                  Master Infrastructure as Code with visual walkthroughs, hands-on cloud labs, and automated error diagnostics that pinpoint your skill gaps.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 shrink-0">
              <div className="text-center px-2">
                <span className="text-[10.5px] uppercase font-mono text-stone-500 font-bold block">Progress</span>
                <span className="text-lg font-serif font-bold text-stone-900">{progressSummary.completionPercentage}%</span>
              </div>
              <div className="text-center px-2 border-x border-stone-200">
                <span className="text-[10.5px] uppercase font-mono text-stone-500 font-bold block">Completed</span>
                <span className="text-lg font-serif font-bold text-stone-900">
                  {completedLabIds.length} / {LABS_DATA.length}
                </span>
              </div>
              <div className="text-center px-2">
                <span className="text-[10.5px] uppercase font-mono text-stone-500 font-bold block">Total XP</span>
                <span className="text-lg font-serif font-bold text-stone-900 text-amber-600">+{totalXp}</span>
              </div>
            </div>
          </div>

          {/* 2. HERO CALL TO ACTION: "Start Here / Continue Learning" */}
          <div className="bg-[#18181B] text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-stone-800">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10.5px] font-bold border border-emerald-500/30 uppercase">
                  Recommended Next Step
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {progressSummary.nextRecommendedLesson.type.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-100">
                {progressSummary.nextRecommendedLesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                {progressSummary.nextRecommendedLesson.reason}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto">
              <button
                id="btn-hero-continue-learning"
                onClick={handleNextRecommendedClick}
                className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-white hover:bg-zinc-100 text-stone-900 font-serif font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-stone-900" />
                <span>
                  {completedLabIds.length === 0
                    ? `Start First ${progressSummary.nextRecommendedLesson.type === "lab" ? "Lab" : progressSummary.nextRecommendedLesson.type === "walkthrough" ? "Lesson" : "Drill"}`
                    : "Continue Learning"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENTS NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar p-1 bg-stone-100 border border-stone-200 rounded-xl">
            <button
              id="tab-dashboard-syllabus"
              onClick={() => setActiveTab("syllabus")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === "syllabus"
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Complete Syllabus ({WALKTHROUGHS_DATA.length + LABS_DATA.length} Lessons)</span>
            </button>

            <button
              id="tab-dashboard-diagnostics"
              onClick={() => setActiveTab("diagnostics")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 relative ${
                activeTab === "diagnostics"
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Skill Diagnostics & Error Analysis</span>
              {loggedErrors.filter((e) => !e.resolved).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              id="tab-dashboard-drills"
              onClick={() => setActiveTab("drills")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === "drills"
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Fill The Gap Drills ({REMEDIATION_DRILLS_DATA.length + (personalDrills?.length || 0)})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search concepts, labs, commands..."
              className="bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 w-full sm:w-64 font-medium"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: COMPLETE SYLLABUS & TABLE OF CONTENTS */}
        {/* ======================================================== */}
        {activeTab === "syllabus" && (
          <div className="space-y-8">
            {/* Phase 1 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] uppercase font-mono font-bold text-stone-500 tracking-wider">
                    Phase 1 of 3
                  </span>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Foundations & HCL Syntax Fundamentals
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-500">5 Modules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {phase1Items.map((item, idx) => {
                  if (item.type === "walkthrough") {
                    const isPassed = completedWalkthroughIds.includes(WALKTHROUGHS_DATA[item.index].id) || currentWalkthroughIndex >= item.index;
                    const isCurrent = currentWalkthroughIndex === item.index;
                    return (
                      <div
                        key={`p1-wt-${item.index}`}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all hover:border-stone-400 flex flex-col justify-between space-y-3 ${
                          isPassed
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isCurrent
                            ? "border-stone-800 ring-1 ring-stone-800/20"
                            : "border-stone-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200 uppercase">
                              Visual Walkthrough
                            </span>
                            <div className="flex items-center space-x-1 text-[11px] text-stone-500 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{item.mins}m</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans line-clamp-2">
                            {item.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div className="flex items-center space-x-1 text-xs">
                            {isPassed ? (
                              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <span className="text-stone-500">Not Completed</span>
                            )}
                          </div>

                          <button
                            onClick={() => onStartWalkthrough(item.index)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <span>{isCurrent ? "Resume" : "Start"}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const lab = item.lab;
                    const isDone = completedLabIds.includes(lab.id);
                    return (
                      <div
                        key={lab.id}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all hover:border-stone-400 flex flex-col justify-between space-y-3 ${
                          isDone ? "border-emerald-200 bg-emerald-50/20" : "border-stone-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-200 uppercase">
                              Hands-On Lab
                            </span>
                            <span className="text-[11px] font-serif font-bold text-amber-700">+{lab.xp} XP</span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                            {formatLabTitle(LABS_DATA, lab.id)}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans line-clamp-2">
                            {lab.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div className="flex items-center space-x-1 text-xs">
                            {isDone ? (
                              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Passed ✓</span>
                              </span>
                            ) : (
                              <span className="text-stone-500 font-mono">{lab.tasks.length} Tasks</span>
                            )}
                          </div>

                          <button
                            onClick={() => onStartLab(item.index)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <span>{isDone ? "Review" : "Launch Lab"}</span>
                            <Play className="w-3 h-3 fill-white" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {/* Phase 2 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] uppercase font-mono font-bold text-stone-500 tracking-wider">
                    Phase 2 of 3
                  </span>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    State Engine, DAG Graph & Lifecycle Automation
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-500">6 Modules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {phase2Items.map((item, idx) => {
                  if (item.type === "walkthrough") {
                    const isPassed = completedWalkthroughIds.includes(WALKTHROUGHS_DATA[item.index].id) || currentWalkthroughIndex >= item.index;
                    const isCurrent = currentWalkthroughIndex === item.index;
                    return (
                      <div
                        key={`p2-wt-${item.index}`}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all hover:border-stone-400 flex flex-col justify-between space-y-3 ${
                          isPassed
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isCurrent
                            ? "border-stone-800 ring-1 ring-stone-800/20"
                            : "border-stone-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200 uppercase">
                              Visual Walkthrough
                            </span>
                            <div className="flex items-center space-x-1 text-[11px] text-stone-500 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{item.mins}m</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans line-clamp-2">
                            {item.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div className="flex items-center space-x-1 text-xs">
                            {isPassed ? (
                              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <span className="text-stone-500 font-mono">{item.category}</span>
                            )}
                          </div>
                          <button
                            onClick={() => onStartWalkthrough(item.index)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const lab = item.lab;
                    const isDone = completedLabIds.includes(lab.id);
                    return (
                      <div
                        key={lab.id}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all hover:border-stone-400 flex flex-col justify-between space-y-3 ${
                          isDone ? "border-emerald-200 bg-emerald-50/20" : "border-stone-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-200 uppercase">
                              Hands-On Lab
                            </span>
                            <span className="text-[11px] font-serif font-bold text-amber-700">+{lab.xp} XP</span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                            {formatLabTitle(LABS_DATA, lab.id)}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans line-clamp-2">
                            {lab.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <span className="text-xs text-stone-500 font-mono">{lab.difficulty}</span>
                          <button
                            onClick={() => onStartLab(item.index)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <span>{isDone ? "Review" : "Launch Lab"}</span>
                            <Play className="w-3 h-3 fill-white" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {/* Phase 3 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] uppercase font-mono font-bold text-stone-500 tracking-wider">
                    Phase 3 of 3
                  </span>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Modular Infrastructure & Production Multi-Tier Cloud
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-500">4 Modules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {phase3Items.map((item, idx) => {
                  if (item.type === "walkthrough") {
                    const isPassed = completedWalkthroughIds.includes(WALKTHROUGHS_DATA[item.index].id) || currentWalkthroughIndex >= item.index;
                    const isCurrent = currentWalkthroughIndex === item.index;
                    return (
                      <div
                        key={`p3-wt-${item.index}`}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all hover:border-stone-400 flex flex-col justify-between space-y-3 ${
                          isPassed
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isCurrent
                            ? "border-stone-800 ring-1 ring-stone-800/20"
                            : "border-stone-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200 uppercase">
                            Visual Walkthrough
                          </span>
                          <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans line-clamp-2">
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div className="flex items-center space-x-1 text-xs">
                            {isPassed ? (
                              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <span className="text-stone-500 font-mono">{item.category}</span>
                            )}
                          </div>
                          <button
                            onClick={() => onStartWalkthrough(item.index)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const lab = item.lab;
                    const isDone = completedLabIds.includes(lab.id);
                    return (
                      <div
                        key={lab.id}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3 ${
                          isDone ? "border-emerald-200 bg-emerald-50/20" : "border-stone-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-200 uppercase">
                              Hands-On Lab
                            </span>
                            <span className="text-[11px] font-serif font-bold text-amber-700">+{lab.xp} XP</span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                            {formatLabTitle(LABS_DATA, lab.id)}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans line-clamp-2">
                            {lab.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <span className="text-xs text-stone-500 font-mono">{lab.difficulty}</span>
                          <button
                            onClick={() => onStartLab(item.index)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <span>{isDone ? "Review" : "Launch Lab"}</span>
                            <Play className="w-3 h-3 fill-white" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: SKILL DIAGNOSTICS & ERROR INTELLIGENCE */}
        {/* ======================================================== */}
        {activeTab === "diagnostics" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-stone-900" />
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Real-time Skill Gap Analysis & Error Diagnostics
                </h3>
              </div>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Our diagnostic engine records errors encountered during your terminal sessions, syntax validations, and quiz checks. When mistakes occur in the Lab section, they are automatically categorized below with custom mastery scores and targeted remediation drills.
              </p>
            </div>

            {/* Domain Mastery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {domainAnalyses.map((domain) => {
                const isEvaluated = domain.status !== "Not Assessed";
                const hasErrors = domain.errorCount > 0;

                return (
                  <div
                    key={domain.domain}
                    className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all ${
                      domain.status === "Critical Gap"
                        ? "border-rose-300 ring-1 ring-rose-200 bg-rose-50/10"
                        : domain.status === "Needs Practice"
                        ? "border-amber-300 ring-1 ring-amber-200 bg-amber-50/10"
                        : "border-stone-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-2 rounded-lg border ${
                            domain.status === "Critical Gap"
                              ? "bg-rose-100/60 border-rose-200"
                              : domain.status === "Needs Practice"
                              ? "bg-amber-100/60 border-amber-200"
                              : "bg-stone-100 border-stone-200"
                          }`}
                        >
                          {getDomainIcon(domain.iconName)}
                        </div>
                        {getStatusBadge(domain.status)}
                      </div>

                      <div>
                        <h4 className="text-sm font-serif font-bold text-stone-900">
                          {domain.title}
                        </h4>
                        <p className="text-xs text-stone-600 font-sans line-clamp-2 mt-0.5">
                          {domain.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-stone-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-stone-500">Mastery Score</span>
                        <span className="font-serif font-bold text-stone-900">
                          {isEvaluated ? `${domain.masteryScore}%` : "0%"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            !isEvaluated
                              ? "bg-transparent w-0"
                              : domain.masteryScore >= 80
                              ? "bg-emerald-600"
                              : domain.masteryScore >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: isEvaluated ? `${domain.masteryScore}%` : "0%" }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                        <span>
                          {hasErrors
                            ? `${domain.errorCount} Logged Mistake${domain.errorCount > 1 ? "s" : ""}`
                            : isEvaluated
                            ? "Clean Execution (0 Errors)"
                            : "0 Mistakes (Awaiting Labs)"}
                        </span>

                        {hasErrors ? (
                          <button
                            onClick={() => {
                              const drill =
                                REMEDIATION_DRILLS_DATA.find((d) => d.id === domain.recommendedDrillId) ||
                                REMEDIATION_DRILLS_DATA[0];
                              onStartDrill(drill);
                            }}
                            className="text-stone-900 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Fix Gap Drill</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const labIdx = domain.recommendedLabIndex ?? 0;
                              onStartLab(labIdx);
                            }}
                            className="text-stone-700 font-medium hover:text-stone-950 flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Practice Lab</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error History Log Stream */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-stone-900">
                    Recent Mistake Log & Diagnostic Breakdown
                  </h4>
                  <p className="text-xs text-stone-600 font-sans">
                    Every error caught in your CLI and code editor is recorded here for self-analysis.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAiMentor("Analyze my recent Terraform error history and explain what key architectural concepts I should review.")}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-stone-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-800" />
                  <span>Ask AI for Study Plan</span>
                </button>
              </div>

              {loggedErrors.length === 0 ? (
                <div className="text-center py-6 text-stone-500 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-serif font-medium text-stone-800 text-sm">No Errors Logged Yet!</p>
                  <p className="text-xs font-sans text-stone-500">Run 'terraform plan' or test configurations in the sandbox to see error diagnostics.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {loggedErrors.map((err) => (
                    <div
                      key={err.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-[#FDFCFA] space-y-2 font-sans"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-mono text-[10px] font-bold uppercase">
                            {err.source}
                          </span>
                          <span className="font-mono text-stone-600 font-semibold">{err.command || "terraform"}</span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-500">{err.timestamp}</span>
                      </div>

                      <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-2.5 font-mono text-xs text-rose-950">
                        {err.message}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center space-x-1.5 text-stone-600">
                          <Target className="w-3.5 h-3.5 text-stone-700" />
                          <span>Identified Subject: <strong>{err.suggestedTopic}</strong></span>
                        </div>

                        <button
                          onClick={() => {
                            const drill = REMEDIATION_DRILLS_DATA.find((d) => d.domain === err.domain) || REMEDIATION_DRILLS_DATA[0];
                            onStartDrill(drill);
                          }}
                          className="px-2.5 py-1 rounded bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition-colors flex items-center space-x-1"
                        >
                          <span>Practice Subject Drill</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: FILL THE GAP DRILLS */}
        {/* ======================================================== */}
        {activeTab === "drills" && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-stone-900" />
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Targeted Skill Gap Drills
                </h3>
              </div>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Short, targeted 4-6 minute micro-lessons designed specifically to cure common Terraform bugs, bad interpolation syntax, cyclic references, and state drift mistakes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...REMEDIATION_DRILLS_DATA, ...(personalDrills || [])].map((drill) => (
                <div
                  key={drill.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-stone-400 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-mono text-[10.5px] font-bold border border-stone-200 uppercase">
                        {SKILL_DOMAINS_INFO[drill.domain].title}
                      </span>
                      {drill.id.startsWith("micro-") && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9.5px] font-sans font-bold border border-amber-200">
                          🎯 PERSONAL
                        </span>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-stone-500 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{drill.estimatedMinutes}m</span>
                      </div>
                    </div>

                    <h4 className="text-base font-serif font-bold text-stone-900">
                      {drill.title}
                    </h4>

                    <p className="text-xs text-stone-600 font-sans">
                      {drill.subtitle}
                    </p>

                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11.5px] text-amber-900 font-sans">
                      <strong>Why this matters:</strong> {drill.diagnosticReason}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500">{drill.difficulty}</span>
                    <button
                      id={`btn-launch-drill-${drill.id}`}
                      onClick={() => onStartDrill(drill)}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Drill in Sandbox</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
