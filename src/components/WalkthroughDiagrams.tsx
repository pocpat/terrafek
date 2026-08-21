import React, { useState, useEffect } from "react";
import {
  PlugZap,
  Box,
  Sliders,
  ShieldAlert,
  Terminal,
  GitGraph,
  ArrowRight,
  ArrowDown,
  Lock,
  RefreshCw,
  CheckCircle2,
  Check,
  Server,
  Cloud,
  FileCode,
  Sparkles,
  Database,
  Cpu,
  Workflow,
  Play,
  Pause,
  Maximize2,
  Gauge,
  Moon,
  Sun
} from "lucide-react";
import { motion } from "motion/react";
import { WalkthroughDiagramType } from "../types/terraform";
import { ThemeAnimationControls } from "./ThemeAnimationControls";
import { ExplainableTerm } from "./ExplainableTerm";
import { safeGetItem, safeSetItem } from "../utils/safeStorage";

interface WalkthroughDiagramsProps {
  type: WalkthroughDiagramType;
  stepNumber: number;
  initialAnimated?: boolean;
}

// Reusable Pipe Connector Component (Horizontal)
interface HorizontalPipeProps {
  label?: string;
  isAnimated: boolean;
  color?: "indigo" | "sky" | "amber" | "emerald" | "purple" | "rose" | "teal" | "azure" | "orange";
  duration?: number;
  isDark?: boolean;
}

const HorizontalPipe: React.FC<HorizontalPipeProps> = ({
  label,
  isAnimated,
  color = "indigo",
  duration = 2.2,
  isDark = false,
}) => {
  const darkColorMap = {
    indigo: {
      track: "bg-[#0a122c] border-indigo-500/40",
      line: "bg-indigo-500/50",
      bead: "bg-indigo-400 shadow-[0_0_10px_#818cf8]",
      beadGlow: "bg-indigo-400/50",
      arrow: "text-indigo-400",
      badge: "text-indigo-200 bg-indigo-950/80 border-indigo-500/40"
    },
    sky: {
      track: "bg-[#06182c] border-sky-500/40",
      line: "bg-sky-500/50",
      bead: "bg-sky-400 shadow-[0_0_10px_#38bdf8]",
      beadGlow: "bg-sky-400/50",
      arrow: "text-sky-400",
      badge: "text-sky-200 bg-sky-950/80 border-sky-500/40"
    },
    azure: {
      track: "bg-[#05152a] border-blue-500/40",
      line: "bg-blue-500/50",
      bead: "bg-blue-400 shadow-[0_0_10px_#0078d4]",
      beadGlow: "bg-blue-400/50",
      arrow: "text-blue-400",
      badge: "text-blue-200 bg-blue-950/80 border-blue-500/40"
    },
    orange: {
      track: "bg-[#201005] border-orange-500/40",
      line: "bg-orange-500/50",
      bead: "bg-orange-400 shadow-[0_0_10px_#ff9900]",
      beadGlow: "bg-orange-400/50",
      arrow: "text-orange-400",
      badge: "text-orange-200 bg-orange-950/80 border-orange-500/40"
    },
    amber: {
      track: "bg-[#1c1405] border-amber-500/40",
      line: "bg-amber-500/50",
      bead: "bg-amber-400 shadow-[0_0_10px_#fbbf24]",
      beadGlow: "bg-amber-400/50",
      arrow: "text-amber-400",
      badge: "text-amber-200 bg-amber-950/80 border-amber-500/40"
    },
    emerald: {
      track: "bg-[#051c14] border-emerald-500/40",
      line: "bg-emerald-500/50",
      bead: "bg-emerald-400 shadow-[0_0_10px_#34d399]",
      beadGlow: "bg-emerald-400/50",
      arrow: "text-emerald-400",
      badge: "text-emerald-200 bg-emerald-950/80 border-emerald-500/40"
    },
    purple: {
      track: "bg-[#1a0c2c] border-purple-500/40",
      line: "bg-purple-500/50",
      bead: "bg-purple-400 shadow-[0_0_10px_#c084fc]",
      beadGlow: "bg-purple-400/50",
      arrow: "text-purple-400",
      badge: "text-purple-200 bg-purple-950/80 border-purple-500/40"
    },
    rose: {
      track: "bg-[#220a0f] border-rose-500/40",
      line: "bg-rose-500/50",
      bead: "bg-rose-400 shadow-[0_0_10px_#fb7185]",
      beadGlow: "bg-rose-400/50",
      arrow: "text-rose-400",
      badge: "text-rose-200 bg-rose-950/80 border-rose-500/40"
    },
    teal: {
      track: "bg-[#061c1c] border-teal-500/40",
      line: "bg-teal-500/50",
      bead: "bg-teal-400 shadow-[0_0_10px_#00d4c8]",
      beadGlow: "bg-teal-400/50",
      arrow: "text-teal-400",
      badge: "text-teal-200 bg-teal-950/80 border-teal-500/40"
    }
  };

  const lightColorMap = {
    indigo: {
      track: "bg-indigo-100/80 border-indigo-200/90",
      line: "bg-indigo-300/80",
      bead: "bg-indigo-600 shadow-indigo-400/50",
      beadGlow: "bg-indigo-400/40",
      arrow: "text-indigo-600",
      badge: "text-indigo-800 bg-indigo-100/90 border-indigo-200"
    },
    sky: {
      track: "bg-sky-100/80 border-sky-200/90",
      line: "bg-sky-300/80",
      bead: "bg-sky-600 shadow-sky-400/50",
      beadGlow: "bg-sky-400/40",
      arrow: "text-sky-600",
      badge: "text-sky-800 bg-sky-100/90 border-sky-200"
    },
    azure: {
      track: "bg-blue-100/80 border-blue-200/90",
      line: "bg-blue-300/80",
      bead: "bg-blue-600 shadow-blue-400/50",
      beadGlow: "bg-blue-400/40",
      arrow: "text-blue-600",
      badge: "text-blue-800 bg-blue-100/90 border-blue-200"
    },
    orange: {
      track: "bg-orange-100/80 border-orange-200/90",
      line: "bg-orange-300/80",
      bead: "bg-orange-600 shadow-orange-400/50",
      beadGlow: "bg-orange-400/40",
      arrow: "text-orange-600",
      badge: "text-orange-800 bg-orange-100/90 border-orange-200"
    },
    amber: {
      track: "bg-amber-100/80 border-amber-200/90",
      line: "bg-amber-300/80",
      bead: "bg-amber-600 shadow-amber-400/50",
      beadGlow: "bg-amber-400/40",
      arrow: "text-amber-600",
      badge: "text-amber-800 bg-amber-100/90 border-amber-200"
    },
    emerald: {
      track: "bg-emerald-100/80 border-emerald-200/90",
      line: "bg-emerald-300/80",
      bead: "bg-emerald-600 shadow-emerald-400/50",
      beadGlow: "bg-emerald-400/40",
      arrow: "text-emerald-600",
      badge: "text-emerald-800 bg-emerald-100/90 border-emerald-200"
    },
    purple: {
      track: "bg-purple-100/80 border-purple-200/90",
      line: "bg-purple-300/80",
      bead: "bg-purple-600 shadow-purple-400/50",
      beadGlow: "bg-purple-400/40",
      arrow: "text-purple-600",
      badge: "text-purple-800 bg-purple-100/90 border-purple-200"
    },
    rose: {
      track: "bg-rose-100/80 border-rose-200/90",
      line: "bg-rose-300/80",
      bead: "bg-rose-600 shadow-rose-400/50",
      beadGlow: "bg-rose-400/40",
      arrow: "text-rose-600",
      badge: "text-rose-800 bg-rose-100/90 border-rose-200"
    },
    teal: {
      track: "bg-teal-100/80 border-teal-200/90",
      line: "bg-teal-300/80",
      bead: "bg-teal-600 shadow-teal-400/50",
      beadGlow: "bg-teal-400/40",
      arrow: "text-teal-600",
      badge: "text-teal-800 bg-teal-100/90 border-teal-200"
    }
  };

  const scheme = isDark
    ? (darkColorMap[color] || darkColorMap.indigo)
    : (lightColorMap[color] || lightColorMap.indigo);

  return (
    <div className="flex flex-col items-center justify-center py-1 relative w-full px-1">
      {label && (
        <span
          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border mb-1 whitespace-nowrap shadow-2xs ${scheme.badge}`}
        >
          {label}
        </span>
      )}

      {/* The Cylindrical Pipe Container */}
      <div
        className={`w-full h-3.5 rounded-full border flex items-center relative overflow-hidden px-1 ${scheme.track}`}
      >
        {/* Core Pipe Guide Line */}
        <div className={`w-full h-[1.5px] rounded-full ${scheme.line}`} />

        {/* Animated Flowing Bead / Packet */}
        {isAnimated ? (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
            initial={{ left: "4%" }}
            animate={{ left: "84%" }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glowing outer halo */}
            <div className={`w-3.5 h-3.5 rounded-full blur-xs opacity-70 absolute ${scheme.beadGlow}`} />
            {/* Solid bright bead */}
            <div className={`w-2 h-2 rounded-full ring-1 ring-white/80 shadow-xs ${scheme.bead}`} />
          </motion.div>
        ) : (
          /* Static Dashed / Direct Flow Indicator */
          <div className="absolute inset-0 flex items-center justify-center space-x-1 opacity-70">
            <div className={`w-1.5 h-1.5 rounded-full ${scheme.bead}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${scheme.bead}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${scheme.bead}`} />
          </div>
        )}

        {/* Right Arrow Tip */}
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <svg className={`w-2.5 h-2.5 ${scheme.arrow}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Reusable Vertical Pipe Component
interface VerticalPipeProps {
  label?: string;
  isAnimated: boolean;
  color?: "indigo" | "sky" | "amber" | "emerald" | "purple" | "rose" | "teal" | "azure" | "orange";
  duration?: number;
  heightClass?: string;
  isDark?: boolean;
}

const VerticalPipe: React.FC<VerticalPipeProps> = ({
  label,
  isAnimated,
  color = "indigo",
  duration = 2.0,
  heightClass = "h-8",
  isDark = false,
}) => {
  const darkColorMap = {
    indigo: {
      track: "bg-[#0a122c] border-indigo-500/40",
      line: "bg-indigo-500/50",
      bead: "bg-indigo-400 shadow-[0_0_10px_#818cf8]",
      beadGlow: "bg-indigo-400/50",
      arrow: "text-indigo-400",
      badge: "text-indigo-200 bg-indigo-950/80 border-indigo-500/40"
    },
    sky: {
      track: "bg-[#06182c] border-sky-500/40",
      line: "bg-sky-500/50",
      bead: "bg-sky-400 shadow-[0_0_10px_#38bdf8]",
      beadGlow: "bg-sky-400/50",
      arrow: "text-sky-400",
      badge: "text-sky-200 bg-sky-950/80 border-sky-500/40"
    },
    azure: {
      track: "bg-[#05152a] border-blue-500/40",
      line: "bg-blue-500/50",
      bead: "bg-blue-400 shadow-[0_0_10px_#0078d4]",
      beadGlow: "bg-blue-400/50",
      arrow: "text-blue-400",
      badge: "text-blue-200 bg-blue-950/80 border-blue-500/40"
    },
    orange: {
      track: "bg-[#201005] border-orange-500/40",
      line: "bg-orange-500/50",
      bead: "bg-orange-400 shadow-[0_0_10px_#ff9900]",
      beadGlow: "bg-orange-400/50",
      arrow: "text-orange-400",
      badge: "text-orange-200 bg-orange-950/80 border-orange-500/40"
    },
    amber: {
      track: "bg-[#1c1405] border-amber-500/40",
      line: "bg-amber-500/50",
      bead: "bg-amber-400 shadow-[0_0_10px_#fbbf24]",
      beadGlow: "bg-amber-400/50",
      arrow: "text-amber-400",
      badge: "text-amber-200 bg-amber-950/80 border-amber-500/40"
    },
    emerald: {
      track: "bg-[#051c14] border-emerald-500/40",
      line: "bg-emerald-500/50",
      bead: "bg-emerald-400 shadow-[0_0_10px_#34d399]",
      beadGlow: "bg-emerald-400/50",
      arrow: "text-emerald-400",
      badge: "text-emerald-200 bg-emerald-950/80 border-emerald-500/40"
    },
    purple: {
      track: "bg-[#1a0c2c] border-purple-500/40",
      line: "bg-purple-500/50",
      bead: "bg-purple-400 shadow-[0_0_10px_#c084fc]",
      beadGlow: "bg-purple-400/50",
      arrow: "text-purple-400",
      badge: "text-purple-200 bg-purple-950/80 border-purple-500/40"
    },
    rose: {
      track: "bg-[#220a0f] border-rose-500/40",
      line: "bg-rose-500/50",
      bead: "bg-rose-400 shadow-[0_0_10px_#fb7185]",
      beadGlow: "bg-rose-400/50",
      arrow: "text-rose-400",
      badge: "text-rose-200 bg-rose-950/80 border-rose-500/40"
    },
    teal: {
      track: "bg-[#061c1c] border-teal-500/40",
      line: "bg-teal-500/50",
      bead: "bg-teal-400 shadow-[0_0_10px_#00d4c8]",
      beadGlow: "bg-teal-400/50",
      arrow: "text-teal-400",
      badge: "text-teal-200 bg-teal-950/80 border-teal-500/40"
    }
  };

  const lightColorMap = {
    indigo: {
      track: "bg-indigo-100/80 border-indigo-200/90",
      line: "bg-indigo-300/80",
      bead: "bg-indigo-600 shadow-indigo-400/50",
      beadGlow: "bg-indigo-400/40",
      arrow: "text-indigo-600",
      badge: "text-indigo-800 bg-indigo-100/90 border-indigo-200"
    },
    sky: {
      track: "bg-sky-100/80 border-sky-200/90",
      line: "bg-sky-300/80",
      bead: "bg-sky-600 shadow-sky-400/50",
      beadGlow: "bg-sky-400/40",
      arrow: "text-sky-600",
      badge: "text-sky-800 bg-sky-100/90 border-sky-200"
    },
    azure: {
      track: "bg-blue-100/80 border-blue-200/90",
      line: "bg-blue-300/80",
      bead: "bg-blue-600 shadow-blue-400/50",
      beadGlow: "bg-blue-400/40",
      arrow: "text-blue-600",
      badge: "text-blue-800 bg-blue-100/90 border-blue-200"
    },
    orange: {
      track: "bg-orange-100/80 border-orange-200/90",
      line: "bg-orange-300/80",
      bead: "bg-orange-600 shadow-orange-400/50",
      beadGlow: "bg-orange-400/40",
      arrow: "text-orange-600",
      badge: "text-orange-800 bg-orange-100/90 border-orange-200"
    },
    amber: {
      track: "bg-amber-100/80 border-amber-200/90",
      line: "bg-amber-300/80",
      bead: "bg-amber-600 shadow-amber-400/50",
      beadGlow: "bg-amber-400/40",
      arrow: "text-amber-600",
      badge: "text-amber-800 bg-amber-100/90 border-amber-200"
    },
    emerald: {
      track: "bg-emerald-100/80 border-emerald-200/90",
      line: "bg-emerald-300/80",
      bead: "bg-emerald-600 shadow-emerald-400/50",
      beadGlow: "bg-emerald-400/40",
      arrow: "text-emerald-600",
      badge: "text-emerald-800 bg-emerald-100/90 border-emerald-200"
    },
    purple: {
      track: "bg-purple-100/80 border-purple-200/90",
      line: "bg-purple-300/80",
      bead: "bg-purple-600 shadow-purple-400/50",
      beadGlow: "bg-purple-400/40",
      arrow: "text-purple-600",
      badge: "text-purple-800 bg-purple-100/90 border-purple-200"
    },
    rose: {
      track: "bg-rose-100/80 border-rose-200/90",
      line: "bg-rose-300/80",
      bead: "bg-rose-600 shadow-rose-400/50",
      beadGlow: "bg-rose-400/40",
      arrow: "text-rose-600",
      badge: "text-rose-800 bg-rose-100/90 border-rose-200"
    },
    teal: {
      track: "bg-teal-100/80 border-teal-200/90",
      line: "bg-teal-300/80",
      bead: "bg-teal-600 shadow-teal-400/50",
      beadGlow: "bg-teal-400/40",
      arrow: "text-teal-600",
      badge: "text-teal-800 bg-teal-100/90 border-teal-200"
    }
  };

  const scheme = isDark
    ? (darkColorMap[color] || darkColorMap.indigo)
    : (lightColorMap[color] || lightColorMap.indigo);

  return (
    <div className="flex items-center justify-center space-x-2 my-1">
      {label && (
        <span
          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap shadow-2xs ${scheme.badge}`}
        >
          {label}
        </span>
      )}
      <div
        className={`w-3.5 ${heightClass} rounded-full border flex flex-col items-center justify-between relative overflow-hidden py-1 ${scheme.track}`}
      >
        <div className={`w-[1.5px] h-full rounded-full ${scheme.line}`} />

        {isAnimated ? (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            initial={{ top: "6%" }}
            animate={{ top: "78%" }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`w-3.5 h-3.5 rounded-full blur-xs opacity-70 absolute ${scheme.beadGlow}`} />
            <div className={`w-2 h-2 rounded-full ring-1 ring-white/80 shadow-xs ${scheme.bead}`} />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 opacity-70">
            <div className={`w-1.5 h-1.5 rounded-full ${scheme.bead}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${scheme.bead}`} />
          </div>
        )}

        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <svg className={`w-2.5 h-2.5 ${scheme.arrow}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5l9 14 9-14H3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const WalkthroughDiagrams: React.FC<WalkthroughDiagramsProps> = ({
  type,
  stepNumber,
  initialAnimated = true
}) => {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<"cyber" | "light">(() => {
    const saved = safeGetItem("tf_diagram_theme");
    return saved === "light" ? "light" : "cyber";
  });
  const [isAnimated, setIsAnimated] = useState<boolean>(() => {
    const saved = safeGetItem("tf_diagram_animated");
    return saved !== null ? saved === "true" : initialAnimated;
  });

  const toggleTheme = (mode: "cyber" | "light") => {
    setThemeMode(mode);
    safeSetItem("tf_diagram_theme", mode);
  };

  const toggleAnimation = (animatedState: boolean) => {
    setIsAnimated(animatedState);
    safeSetItem("tf_diagram_animated", String(animatedState));
  };

  const isDark = themeMode === "cyber";

  // Theme & Animation Controls
  const renderModeToggle = () => (
    <div className="flex items-center space-x-2">
      <ThemeAnimationControls
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        isAnimated={isAnimated}
        onToggleAnimation={toggleAnimation}
      />
    </div>
  );

  // Render the specific lesson concept model
  switch (type) {
    case "provider_flow":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-cyan-500/40 text-slate-100 shadow-[0_0_25px_rgba(0,170,255,0.1)]"
            : "bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-teal-50/60 border-indigo-200/90 text-stone-900 shadow-xs"
        }`}>
          {/* Header Banner with Animated/Static Toggle */}
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-cyan-900/60" : "border-indigo-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-cyan-950/80 text-cyan-300 border border-cyan-700/50" : "bg-indigo-100 text-indigo-700"}`}>
                <PlugZap className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-cyan-100" : "text-indigo-950"}`}>
                Provider Plugin & API Translation Architecture
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
            {/* Step 1: HCL Config Cube */}
            <div
              onMouseEnter={() => setActiveHighlight("hcl")}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-3.5 rounded-xl border transition-all ${
                isDark
                  ? activeHighlight === "hcl"
                    ? "border-sky-400 bg-[#081d33] ring-2 ring-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    : "border-sky-500/30 bg-[#051526]/80"
                  : activeHighlight === "hcl"
                  ? "border-sky-500 ring-2 ring-sky-300 bg-sky-100/90 shadow-xs"
                  : "border-sky-200/90 bg-sky-50/90"
              }`}
            >
              <div className={`flex items-center space-x-1.5 text-xs font-serif font-bold mb-1 ${isDark ? "text-sky-200" : "text-sky-950"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? "bg-sky-950 text-sky-300 border border-sky-800" : "bg-sky-200/80 text-sky-800"}`}>
                  <FileCode className="w-3.5 h-3.5" />
                </div>
                <span>1. Declarative HCL</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-sans ${isDark ? "text-sky-300/90" : "text-sky-900"}`}>
                You declare <code className={`font-mono font-semibold px-1 py-0.5 rounded ${isDark ? "bg-sky-950 text-sky-200 border border-sky-800" : "bg-sky-200/60 text-sky-950"}`}>provider "aws"</code> & schemas.
              </p>
              <div className={`mt-2 border rounded p-1.5 text-[10px] font-mono shadow-2xs ${
                isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white/90 border-sky-200 text-sky-900"
              }`}>
                required_providers &#123; aws = ... &#125;
              </div>
            </div>

            {/* Middle Pipe */}
            <div className="w-full md:w-24">
              <HorizontalPipe
                label="gRPC Protocol"
                isAnimated={isAnimated}
                color="sky"
                duration={2.0}
                isDark={isDark}
              />
            </div>

            {/* Step 2: Provider Plugin & Cloud API */}
            <div
              onMouseEnter={() => setActiveHighlight("plugin")}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-3.5 rounded-xl border transition-all ${
                isDark
                  ? activeHighlight === "plugin"
                    ? "border-teal-400 bg-[#072422] ring-2 ring-teal-400/40 shadow-[0_0_15px_rgba(0,212,200,0.3)]"
                    : "border-teal-500/30 bg-[#041a19]/80"
                  : activeHighlight === "plugin"
                  ? "border-teal-500 ring-2 ring-teal-300 bg-teal-100/90 shadow-xs"
                  : "border-teal-200/90 bg-teal-50/90"
              }`}
            >
              <div className={`flex items-center space-x-1.5 text-xs font-serif font-bold mb-1 ${isDark ? "text-teal-200" : "text-teal-950"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? "bg-teal-950 text-teal-300 border border-teal-800" : "bg-teal-200/80 text-teal-800"}`}>
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span>2. Plugin Translates to REST API</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-sans ${isDark ? "text-teal-300/90" : "text-teal-900"}`}>
                Plugin executes HTTP REST calls to AWS/GCP/Azure endpoints.
              </p>
              <div className={`mt-2 border rounded p-1.5 text-[10px] font-mono shadow-2xs ${
                isDark ? "bg-[#020a14] border-teal-900/60 text-teal-300" : "bg-white/90 border-teal-200 text-teal-900"
              }`}>
                POST https://ec2.us-east-1.amazonaws.com/
              </div>
            </div>
          </div>
        </div>
      );

    case "anatomy_breakdown":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-amber-500/40 text-slate-100 shadow-[0_0_25px_rgba(255,153,0,0.1)]"
            : "bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-yellow-50/60 border-amber-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-amber-900/60" : "border-amber-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-amber-950/80 text-amber-300 border border-amber-700/50" : "bg-amber-100 text-amber-800"}`}>
                <Box className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-amber-100" : "text-amber-950"}`}>
                Resource Block Anatomy & Address Resolution
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f1304] border-amber-500/30 text-amber-200" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                isDark ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-amber-100 text-amber-800"
              }`}>
                1. Block Type
              </span>
              <div className={`text-xs font-mono font-bold ${isDark ? "text-amber-300" : "text-amber-950"}`}>resource</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-amber-400/80" : "text-amber-800"}`}>Declares managed infra</p>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f1304] border-amber-500/30 text-amber-200" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                isDark ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-amber-100 text-amber-800"
              }`}>
                2. Resource Type
              </span>
              <div className={`text-xs font-mono font-bold ${isDark ? "text-amber-300" : "text-amber-950"}`}>"aws_s3_bucket"</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-amber-400/80" : "text-amber-800"}`}>Provider + Object schema</p>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f1304] border-amber-500/30 text-amber-200" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                isDark ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-amber-100 text-amber-800"
              }`}>
                3. Local Identifier
              </span>
              <div className={`text-xs font-mono font-bold ${isDark ? "text-amber-300" : "text-amber-950"}`}>"main"</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-amber-400/80" : "text-amber-800"}`}>Referenced inside HCL code</p>
            </div>
          </div>
        </div>
      );

    case "variable_pipeline":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-emerald-500/40 text-slate-100 shadow-[0_0_25px_rgba(46,204,113,0.1)]"
            : "bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-sky-50/60 border-emerald-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-emerald-900/60" : "border-emerald-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50" : "bg-emerald-100 text-emerald-800"}`}>
                <Sliders className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-emerald-100" : "text-emerald-950"}`}>
                Input Variables & Output Pipeline Flow
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            {/* Input Variables */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Inputs (variables.tf)</div>
              <p className={`text-[10px] ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>CLI flags, tfvars, defaults</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200"}`}>
                var.instance_type
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="evaluates" isAnimated={isAnimated} color="emerald" duration={2.0} isDark={isDark} />
            </div>

            {/* Core Resource */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Resource (main.tf)</div>
              <p className={`text-[10px] ${isDark ? "text-sky-300/80" : "text-sky-800"}`}>Constructs Cloud Object</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white border-sky-200"}`}>
                aws_instance.web
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="exports" isAnimated={isAnimated} color="sky" duration={2.0} isDark={isDark} />
            </div>

            {/* Outputs */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0a122c] border-indigo-500/30 text-indigo-200" : "bg-indigo-50/90 border-indigo-200 text-indigo-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Outputs (outputs.tf)</div>
              <p className={`text-[10px] ${isDark ? "text-indigo-300/80" : "text-indigo-800"}`}>Exposed to CI/CD & CLI</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-indigo-900/60 text-indigo-300" : "bg-white border-indigo-200"}`}>
                public_ip = "54.21.0.1"
              </div>
            </div>
          </div>
        </div>
      );

    case "state_reconciliation":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-rose-500/40 text-slate-100 shadow-[0_0_25px_rgba(231,76,60,0.1)]"
            : "bg-gradient-to-br from-rose-50/90 via-red-50/70 to-amber-50/60 border-rose-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-rose-900/60" : "border-rose-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-rose-950/80 text-rose-300 border border-rose-700/50" : "bg-rose-100 text-rose-800"}`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-rose-100" : "text-rose-950"}`}>
                Desired State vs Actual Cloud State (Drift Detection)
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f0907] border-rose-500/30 text-rose-200" : "bg-rose-50/90 border-rose-200 text-rose-950"}`}>
              <div className="text-xs font-serif font-bold">1. Desired State (HCL)</div>
              <div className={`text-xs font-mono mt-1 ${isDark ? "text-rose-300" : "text-rose-800"}`}>instance_type = "t3.micro"</div>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1a0820] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-xs font-serif font-bold">2. State Record (.tfstate)</div>
              <div className={`text-xs font-mono mt-1 ${isDark ? "text-purple-300" : "text-purple-800"}`}>metadata mapping record</div>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-xs font-serif font-bold">3. Actual Real World (AWS)</div>
              <div className={`text-xs font-mono mt-1 ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>live cloud infrastructure</div>
            </div>
          </div>
        </div>
      );

    case "cli_lifecycle":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-purple-500/40 text-slate-100 shadow-[0_0_25px_rgba(155,89,245,0.1)]"
            : "bg-gradient-to-br from-purple-50/90 via-indigo-50/70 to-sky-50/60 border-purple-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-purple-900/60" : "border-purple-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-purple-950/80 text-purple-300 border border-purple-700/50" : "bg-purple-100 text-purple-800"}`}>
                <Terminal className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-purple-100" : "text-purple-950"}`}>
                Terraform Core Command Pipeline Engine
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#140822] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-xs font-mono font-bold">terraform init</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-purple-300/80" : "text-purple-800"}`}>Downloads provider plugins</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#140822] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-xs font-mono font-bold">terraform validate</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-purple-300/80" : "text-purple-800"}`}>Static syntax & type check</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#140822] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-xs font-mono font-bold">terraform plan</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-purple-300/80" : "text-purple-800"}`}>Speculative diff calculation</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/40 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-xs font-mono font-bold">terraform apply</div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>Provisions real cloud resources</p>
            </div>
          </div>
        </div>
      );

    case "dag_parallelism":
    default:
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-emerald-500/40 text-slate-100 shadow-[0_0_25px_rgba(0,212,200,0.1)]"
            : "bg-gradient-to-br from-emerald-50/80 via-sky-50/70 to-indigo-50/70 border-emerald-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-emerald-900/60" : "border-emerald-200/70"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50" : "bg-emerald-100 text-emerald-800"}`}>
                <GitGraph className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-emerald-100" : "text-stone-900"}`}>
                Directed Acyclic Graph (DAG) Parallel Execution
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            {/* Stage 1: Parallel Nodes */}
            <div className={`p-3 rounded-xl border text-center shadow-2xs space-y-1.5 ${
              isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
            }`}>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                isDark ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                Stage 1 (Parallel)
              </span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className={`p-1 rounded border font-bold shadow-2xs ${
                  isDark ? "bg-[#020a14] border-emerald-800 text-emerald-300" : "bg-white border-emerald-300 text-emerald-950"
                }`}>
                  aws_vpc.main
                </div>
                <div className={`p-1 rounded border font-bold shadow-2xs ${
                  isDark ? "bg-[#020a14] border-emerald-800 text-emerald-300" : "bg-white border-emerald-300 text-emerald-950"
                }`}>
                  aws_s3_bucket.logs
                </div>
              </div>
              <span className={`text-[10px] block font-sans font-medium ${isDark ? "text-emerald-400/80" : "text-emerald-900"}`}>
                0 Dependencies (Instant)
              </span>
            </div>

            {/* Pipe 1: Stage 1 -> Stage 2 */}
            <div className="hidden sm:flex w-16">
              <HorizontalPipe
                label="vpc_id"
                isAnimated={isAnimated}
                color="emerald"
                duration={2.0}
                isDark={isDark}
              />
            </div>

            {/* Stage 2 */}
            <div className={`p-3 rounded-xl border text-center shadow-2xs space-y-1.5 ${
              isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"
            }`}>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                isDark ? "bg-sky-950 text-sky-300 border border-sky-800" : "bg-sky-100 text-sky-800"
              }`}>
                Stage 2
              </span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className={`p-1 rounded border font-bold shadow-2xs ${
                  isDark ? "bg-[#020a14] border-sky-800 text-sky-300" : "bg-white border-sky-300 text-sky-950"
                }`}>
                  aws_subnet.public
                </div>
              </div>
              <span className={`text-[10px] block font-sans font-medium ${isDark ? "text-sky-400/80" : "text-sky-900"}`}>
                Waits for VPC ID
              </span>
            </div>

            {/* Pipe 2: Stage 2 -> Stage 3 */}
            <div className="hidden sm:flex w-16">
              <HorizontalPipe
                label="subnet_id"
                isAnimated={isAnimated}
                color="sky"
                duration={2.0}
                isDark={isDark}
              />
            </div>

            {/* Stage 3 */}
            <div className={`p-3 rounded-xl border text-center shadow-2xs space-y-1.5 ${
              isDark ? "bg-[#0a122c] border-indigo-500/30 text-indigo-200" : "bg-indigo-50/90 border-indigo-200 text-indigo-950"
            }`}>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                isDark ? "bg-indigo-950 text-indigo-300 border border-indigo-800" : "bg-indigo-100 text-indigo-800"
              }`}>
                Stage 3
              </span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className={`p-1 rounded border font-bold shadow-2xs ${
                  isDark ? "bg-[#020a14] border-indigo-800 text-indigo-300" : "bg-white border-indigo-300 text-indigo-950"
                }`}>
                  aws_instance.web
                </div>
              </div>
              <span className={`text-[10px] block font-sans font-medium ${isDark ? "text-indigo-400/80" : "text-indigo-900"}`}>
                Waits for Subnet ID
              </span>
            </div>
          </div>
        </div>
      );
  }
};
