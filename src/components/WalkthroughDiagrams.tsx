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
  Sun,
  Layers,
  Download,
  FolderTree,
  Network,
  Search,
  AlertTriangle,
  KeyRound,
  XCircle
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
              <p className={`text-[10px] mt-1 ${isDark ? "text-amber-400/80" : "text-amber-800"}`}>Terraform-only label (AWS never sees it)</p>
            </div>
          </div>
        </div>
      );

    case "dependency_graph":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-sky-500/40 text-slate-100 shadow-[0_0_25px_rgba(56,189,248,0.1)]"
            : "bg-gradient-to-br from-sky-50/90 via-indigo-50/70 to-blue-50/60 border-sky-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-sky-900/60" : "border-sky-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-sky-950/80 text-sky-300 border border-sky-700/50" : "bg-sky-100 text-sky-800"}`}>
                <GitGraph className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-sky-100" : "text-sky-950"}`}>
                Implicit Dependency Graph: VPC .id flows to Subnet
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
            {/* VPC Block (source) */}
            <div
              onMouseEnter={() => setActiveHighlight("vpc")}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-3.5 rounded-xl border transition-all ${
                isDark
                  ? activeHighlight === "vpc"
                    ? "border-sky-400 bg-[#081d33] ring-2 ring-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    : "border-sky-500/30 bg-[#051526]/80"
                  : activeHighlight === "vpc"
                  ? "border-sky-500 ring-2 ring-sky-300 bg-sky-100/90 shadow-xs"
                  : "border-sky-200/90 bg-sky-50/90"
              }`}
            >
              <div className={`flex items-center space-x-1.5 text-xs font-serif font-bold mb-1 ${isDark ? "text-sky-200" : "text-sky-950"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? "bg-sky-950 text-sky-300 border border-sky-800" : "bg-sky-200/80 text-sky-800"}`}>
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span>aws_vpc.main</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-sans ${isDark ? "text-sky-300/90" : "text-sky-900"}`}>
                Created first. AWS assigns a real cloud ID.
              </p>
              <div className={`mt-2 border rounded p-1.5 text-[10px] font-mono shadow-2xs ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white/90 border-sky-200 text-sky-900"}`}>
                .id = vpc-abc123
              </div>
            </div>

            {/* Dependency Arrow with flowing .id */}
            <div className="w-full md:w-28">
              <HorizontalPipe
                label=".id flows here"
                isAnimated={isAnimated}
                color="sky"
                duration={2.5}
                isDark={isDark}
              />
            </div>

            {/* Subnet Block (destination) */}
            <div
              onMouseEnter={() => setActiveHighlight("subnet")}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-3.5 rounded-xl border transition-all ${
                isDark
                  ? activeHighlight === "subnet"
                    ? "border-indigo-400 bg-[#0a122c] ring-2 ring-indigo-400/40 shadow-[0_0_15px_rgba(129,140,248,0.3)]"
                    : "border-indigo-500/30 bg-[#060a1c]/80"
                  : activeHighlight === "subnet"
                  ? "border-indigo-500 ring-2 ring-indigo-300 bg-indigo-100/90 shadow-xs"
                  : "border-indigo-200/90 bg-indigo-50/90"
              }`}
            >
              <div className={`flex items-center space-x-1.5 text-xs font-serif font-bold mb-1 ${isDark ? "text-indigo-200" : "text-indigo-950"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? "bg-indigo-950 text-indigo-300 border border-indigo-800" : "bg-indigo-200/80 text-indigo-800"}`}>
                  <Server className="w-3.5 h-3.5" />
                </div>
                <span>aws_subnet.public</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-sans ${isDark ? "text-indigo-300/90" : "text-indigo-900"}`}>
                Created second. Waits for VPC, then uses its ID.
              </p>
              <div className={`mt-2 border rounded p-1.5 text-[10px] font-mono shadow-2xs ${isDark ? "bg-[#020a14] border-indigo-900/60 text-indigo-300" : "bg-white/90 border-indigo-200 text-indigo-900"}`}>
                vpc_id = aws_vpc.main.id
              </div>
            </div>
          </div>

          {/* Bottom annotation */}
          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-sky-400/80" : "text-sky-700"}`}>
            Terraform builds the DAG automatically: VPC first, then Subnet. No manual wait scripts needed.
          </div>
        </div>
      );

    case "resource_stack":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-purple-500/40 text-slate-100 shadow-[0_0_25px_rgba(192,132,252,0.1)]"
            : "bg-gradient-to-br from-purple-50/90 via-fuchsia-50/70 to-pink-50/60 border-purple-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-purple-900/60" : "border-purple-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-purple-950/80 text-purple-300 border border-purple-700/50" : "bg-purple-100 text-purple-800"}`}>
                <Layers className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-purple-100" : "text-purple-950"}`}>
                for_each: One Definition Block creates Multiple Instances
              </span>
            </div>
            {renderModeToggle()}
          </div>

          {/* Top: single definition block */}
          <div className="flex justify-center mb-1">
            <div className={`p-3 rounded-xl border text-center min-w-[220px] ${
              isDark ? "bg-[#1a0c2c] border-purple-500/40 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"
            }`}>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                isDark ? "bg-purple-950 text-purple-300 border border-purple-800" : "bg-purple-100 text-purple-800"
              }`}>
                One Definition Block
              </span>
              <div className={`text-xs font-mono font-bold ${isDark ? "text-purple-300" : "text-purple-950"}`}>
                for_each = toset(["finance", "engineering", "marketing"])
              </div>
              <p className={`text-[10px] mt-1 ${isDark ? "text-purple-400/80" : "text-purple-800"}`}>
                A single resource block with a for_each loop
              </p>
            </div>
          </div>

          {/* Vertical connector */}
          <div className="flex justify-center">
            <VerticalPipe label="expands into" isAnimated={isAnimated} color="purple" duration={1.8} heightClass="h-6" isDark={isDark} />
          </div>

          {/* Bottom: three instance boxes */}
          <div className="grid grid-cols-3 gap-2 mt-1">
            {["finance", "engineering", "marketing"].map((dept, idx) => (
              <motion.div
                key={dept}
                initial={isAnimated ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: isAnimated ? idx * 0.25 : 0 }}
                className={`p-2.5 rounded-xl border text-center ${
                  isDark ? "bg-[#0c0420] border-purple-500/30 text-purple-200" : "bg-white/90 border-purple-200 text-purple-950"
                }`}
              >
                <div className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center mb-1 ${
                  isDark ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" : "bg-purple-100 text-purple-700"
                }`}>
                  <Box className="w-4 h-4" />
                </div>
                <div className={`text-[10px] font-mono font-bold ${isDark ? "text-purple-300" : "text-purple-950"}`}>
                  [{dept}]
                </div>
                <div className={`text-[9px] mt-0.5 ${isDark ? "text-purple-400/70" : "text-purple-700"}`}>
                  corp-{dept}-archive
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom annotation */}
          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-purple-400/80" : "text-purple-700"}`}>
            Each instance is uniquely addressable: aws_s3_bucket.departments["finance"], ["engineering"], ["marketing"]
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

    case "locals_flow":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-teal-500/40 text-slate-100 shadow-[0_0_25px_rgba(0,212,200,0.1)]"
            : "bg-gradient-to-br from-teal-50/90 via-cyan-50/70 to-emerald-50/60 border-teal-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-teal-900/60" : "border-teal-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-teal-950/80 text-teal-300 border border-teal-700/50" : "bg-teal-100 text-teal-800"}`}>
                <Sliders className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-teal-100" : "text-teal-950"}`}>
                Locals: Computing Intermediate Values from Variables
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            {/* Input Variables (left) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Input Variables</div>
              <p className={`text-[10px] ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>var.environment, var.project</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200"}`}>
                var.environment = "dev"
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="feed into" isAnimated={isAnimated} color="emerald" duration={2.0} isDark={isDark} />
            </div>

            {/* Locals block (center) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#061c1c] border-teal-500/30 text-teal-200" : "bg-teal-50/90 border-teal-200 text-teal-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">locals {} (Computed)</div>
              <p className={`text-[10px] ${isDark ? "text-teal-300/80" : "text-teal-800"}`}>prefix = var.project + "-" + var.environment</p>
              <p className={`text-[10px] ${isDark ? "text-teal-300/80" : "text-teal-800"}`}>standard_tags = merge(...)</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-teal-900/60 text-teal-300" : "bg-white border-teal-200"}`}>
                local.prefix, local.standard_tags
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="reused in" isAnimated={isAnimated} color="teal" duration={2.0} isDark={isDark} />
            </div>

            {/* Resources (right) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Resources</div>
              <p className={`text-[10px] ${isDark ? "text-sky-300/80" : "text-sky-800"}`}>DRY: one expression, many resources</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white border-sky-200"}`}>
                bucket = local.prefix + "-logs"
              </div>
            </div>
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-teal-400/80" : "text-teal-700"}`}>
            Locals compute once from variables, then are reused across all resources — keeping your code DRY.
          </div>
        </div>
      );

    case "output_flow":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-indigo-500/40 text-slate-100 shadow-[0_0_25px_rgba(129,140,248,0.1)]"
            : "bg-gradient-to-br from-indigo-50/90 via-violet-50/70 to-blue-50/60 border-indigo-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-indigo-900/60" : "border-indigo-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-indigo-950/80 text-indigo-300 border border-indigo-700/50" : "bg-indigo-100 text-indigo-800"}`}>
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-indigo-100" : "text-indigo-950"}`}>
                Outputs: Exposing Computed Values to Users & CI/CD
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            {/* Resource (left) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Resource (after apply)</div>
              <p className={`text-[10px] ${isDark ? "text-sky-300/80" : "text-sky-800"}`}>aws_instance.web created in AWS</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white border-sky-200"}`}>
                .public_ip = 54.21.0.1
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label=".public_ip" isAnimated={isAnimated} color="sky" duration={2.0} isDark={isDark} />
            </div>

            {/* Output block (center) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0a122c] border-indigo-500/30 text-indigo-200" : "bg-indigo-50/90 border-indigo-200 text-indigo-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">output "web_public_ip"</div>
              <p className={`text-[10px] ${isDark ? "text-indigo-300/80" : "text-indigo-800"}`}>value = aws_instance.web.public_ip</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-indigo-900/60 text-indigo-300" : "bg-white border-indigo-200"}`}>
                sensitive = true (for secrets)
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="exposes to" isAnimated={isAnimated} color="indigo" duration={2.0} isDark={isDark} />
            </div>

            {/* Consumers (right) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1a0c2c] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">CLI & CI/CD</div>
              <p className={`text-[10px] ${isDark ? "text-purple-300/80" : "text-purple-800"}`}>terraform output -json</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-purple-900/60 text-purple-300" : "bg-white border-purple-200"}`}>
                {"{ web_public_ip: '54.21.0.1' }"}
              </div>
            </div>
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-indigo-400/80" : "text-indigo-700"}`}>
            Outputs are populated only after apply. Use sensitive = true for passwords and keys.
          </div>
        </div>
      );

    case "state_file_map":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-amber-500/40 text-slate-100 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
            : "bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-yellow-50/60 border-amber-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-amber-900/60" : "border-amber-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-amber-950/80 text-amber-300 border border-amber-700/50" : "bg-amber-100 text-amber-800"}`}>
                <Database className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-amber-100" : "text-amber-950"}`}>
                State File: Mapping Your HCL Names to Real Cloud IDs
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            {/* HCL Code (left) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f1304] border-amber-500/30 text-amber-200" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">HCL Code</div>
              <p className={`text-[10px] ${isDark ? "text-amber-300/80" : "text-amber-800"}`}>resource "aws_instance" "web_server"</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-amber-900/60 text-amber-300" : "bg-white border-amber-200"}`}>
                aws_instance.web_server
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="maps to" isAnimated={isAnimated} color="amber" duration={2.0} isDark={isDark} />
            </div>

            {/* State File (center) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1a0820] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">terraform.tfstate</div>
              <p className={`text-[10px] ${isDark ? "text-purple-300/80" : "text-purple-800"}`}>JSON record with cloud ID</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-purple-900/60 text-purple-300" : "bg-white border-purple-200"}`}>
                "id": "i-08a9f24b"
              </div>
            </div>

            <div className="w-full md:w-16">
              <HorizontalPipe label="points to" isAnimated={isAnimated} color="purple" duration={2.0} isDark={isDark} />
            </div>

            {/* Real Cloud (right) */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-xs font-serif font-bold mb-1">Real AWS Resource</div>
              <p className={`text-[10px] ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>EC2 instance i-08a9f24b</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200"}`}>
                t3.micro, public_ip
              </div>
            </div>
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-amber-400/80" : "text-amber-700"}`}>
            The state file is the bridge: it stores the real cloud ID for each HCL name. Never commit it to Git — it contains plaintext secrets.
          </div>
        </div>
      );

    case "remote_backend":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-sky-500/40 text-slate-100 shadow-[0_0_25px_rgba(56,189,248,0.1)]"
            : "bg-gradient-to-br from-sky-50/90 via-blue-50/70 to-cyan-50/60 border-sky-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            isDark ? "border-sky-900/60" : "border-sky-100/80"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-sky-950/80 text-sky-300 border border-sky-700/50" : "bg-sky-100 text-sky-800"}`}>
                <Lock className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-sky-100" : "text-sky-950"}`}>
                Remote Backend: S3 State + DynamoDB Locking
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
            {/* S3 Bucket (left) */}
            <div className={`p-3.5 rounded-xl border ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}>
              <div className={`flex items-center space-x-1.5 text-xs font-serif font-bold mb-1 ${isDark ? "text-sky-200" : "text-sky-950"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? "bg-sky-950 text-sky-300 border border-sky-800" : "bg-sky-200/80 text-sky-800"}`}>
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span>S3 Bucket (State)</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-sans ${isDark ? "text-sky-300/90" : "text-sky-900"}`}>
                Stores terraform.tfstate, encrypted at rest. Versioning enabled for rollback.
              </p>
              <div className={`mt-2 border rounded p-1.5 text-[10px] font-mono shadow-2xs ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white/90 border-sky-200 text-sky-900"}`}>
                encrypt = true
              </div>
            </div>

            {/* Lock flow */}
            <div className="w-full md:w-28">
              <HorizontalPipe
                label="protected by"
                isAnimated={isAnimated}
                color="sky"
                duration={2.5}
                isDark={isDark}
              />
            </div>

            {/* DynamoDB (right) */}
            <div className={`p-3.5 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className={`flex items-center space-x-1.5 text-xs font-serif font-bold mb-1 ${isDark ? "text-emerald-200" : "text-emerald-950"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-emerald-200/80 text-emerald-800"}`}>
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>DynamoDB (Lock)</span>
              </div>
              <p className={`text-[11px] leading-relaxed font-sans ${isDark ? "text-emerald-300/90" : "text-emerald-900"}`}>
                Acquires mutex lock before plan/apply. Prevents concurrent team corruption.
              </p>
              <div className={`mt-2 border rounded p-1.5 text-[10px] font-mono shadow-2xs ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white/90 border-emerald-200 text-emerald-900"}`}>
                LockID = "prod/tf"
              </div>
            </div>
          </div>

          {/* Team workflow annotation */}
          <div className={`mt-3 flex items-center justify-center space-x-2 text-[10px] font-sans ${isDark ? "text-sky-400/80" : "text-sky-700"}`}>
            <span>Engineer A runs</span>
            <span className={`font-mono font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>&#128274; LOCK</span>
            <span>{"->"} plan/apply {"->"}</span>
            <span className={`font-mono font-bold ${isDark ? "text-amber-400" : "text-amber-700"}`}>&#128275; UNLOCK</span>
            <span>{"->"} Engineer B can now run safely</span>
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

    case "plugin_lifecycle": {
      const stages = [
        {
          name: "terraform init",
          desc: "Registry queried, checksums pinned in .terraform.lock.hcl",
          icon: Download,
          scheme: "sky" as const,
          mono: "hashicorp/aws v5.42.0"
        },
        {
          name: "gRPC handshake",
          desc: "Core launches the plugin binary as a separate process",
          icon: Network,
          scheme: "purple" as const,
          mono: ".terraform/providers/ registry.tfproviders"
        },
        {
          name: "Plan / Apply",
          desc: "Core delegates every CRUD call; Core itself is cloud-agnostic",
          icon: Play,
          scheme: "emerald" as const,
          mono: "UpsertResource → POST ec2.us-east-1"
        },
        {
          name: "Plugin shutdown",
          desc: "Process exits when the CLI run completes",
          icon: Pause,
          scheme: "rose" as const,
          mono: "gRPC channel closed, PID gone"
        }
      ];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-sky-500/40 text-slate-100 shadow-[0_0_25px_rgba(56,189,248,0.1)]"
            : "bg-gradient-to-br from-sky-50/90 via-blue-50/70 to-indigo-50/60 border-sky-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-sky-900/60" : "border-sky-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-sky-950/80 text-sky-300 border border-sky-700/50" : "bg-sky-100 text-sky-800"}`}>
                <PlugZap className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-sky-100" : "text-sky-950"}`}>
                Provider Plugin Lifecycle: Core Delegates, Plugin Executes
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.name}>
                  <motion.div
                    initial={isAnimated ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: isAnimated ? idx * 0.15 : 0 }}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl border ${
                      isDark
                        ? { sky: "bg-[#051526] border-sky-500/30", purple: "bg-[#0c0420] border-purple-500/30", emerald: "bg-[#041a14] border-emerald-500/30", rose: "bg-[#180a0e] border-rose-500/30" }[stage.scheme]
                        : { sky: "bg-sky-50/90 border-sky-200", purple: "bg-purple-50/90 border-purple-200", emerald: "bg-emerald-50/90 border-emerald-200", rose: "bg-rose-50/90 border-rose-200" }[stage.scheme]
                    }`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border ${
                      isDark
                        ? { sky: "bg-sky-950/80 text-sky-300 border-sky-800", purple: "bg-purple-950/80 text-purple-300 border-purple-800", emerald: "bg-emerald-950/80 text-emerald-300 border-emerald-800", rose: "bg-rose-950/80 text-rose-300 border-rose-800" }[stage.scheme]
                        : { sky: "bg-sky-100 text-sky-800 border-sky-200", purple: "bg-purple-100 text-purple-800 border-purple-200", emerald: "bg-emerald-100 text-emerald-800 border-emerald-200", rose: "bg-rose-100 text-rose-800 border-rose-200" }[stage.scheme]
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-serif font-bold">{stage.name}</div>
                      <div className={`text-[10px] ${isDark ? "text-slate-400/90" : "text-stone-600"}`}>{stage.desc}</div>
                    </div>
                    <div className={`hidden sm:block px-1.5 py-0.5 rounded border text-[9px] font-mono whitespace-nowrap ${
                      isDark ? "bg-[#020a14] border-slate-700/60 text-slate-300" : "bg-white/90 border-slate-200 text-stone-700"
                    }`}>
                      {stage.mono}
                    </div>
                  </motion.div>
                  {idx < stages.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <VerticalPipe label={idx === 1 ? "per resource CRUD" : idx === 2 ? "parallel calls" : "download"} isAnimated={isAnimated} color={stage.scheme} duration={1.6} heightClass="h-5" isDark={isDark} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-sky-400/80" : "text-sky-700"}`}>
            Terraform Core never talks to AWS directly — the plugin process speaks the cloud's REST/gRPC dialect so Core stays cloud-agnostic.
          </div>
        </div>
      );
    }

    case "provider_config_flow":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-emerald-500/40 text-slate-100 shadow-[0_0_25px_rgba(46,204,113,0.1)]"
            : "bg-gradient-to-br from-emerald-50/90 via-green-50/70 to-teal-50/60 border-emerald-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-emerald-900/60" : "border-emerald-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50" : "bg-emerald-100 text-emerald-800"}`}>
                <Sliders className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-emerald-100" : "text-emerald-950"}`}>
                provider "aws" {`{ }`} — Region, Credentials & Default Tags
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Region */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="flex items-center space-x-1.5 text-[11px] font-serif font-bold mb-1">
                <Cloud className="w-3.5 h-3.5" />
                <span>region</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>
                Target API endpoint for EVERY resource below it.
              </p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200"}`}>
                region = "us-east-1"
              </div>
            </div>

            {/* Credentials */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f1304] border-amber-500/30 text-amber-200" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}>
              <div className="flex items-center space-x-1.5 text-[11px] font-serif font-bold mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>credentials</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${isDark ? "text-amber-300/80" : "text-amber-800"}`}>
                NEVER hardcoded: env vars, AWS profile, or IAM Role / OIDC.
              </p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-amber-900/60 text-amber-300" : "bg-white border-amber-200"}`}>
                AWS_ACCESS_KEY_ID env
              </div>
            </div>

            {/* default_tags */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0a122c] border-indigo-500/30 text-indigo-200" : "bg-indigo-50/90 border-indigo-200 text-indigo-950"}`}>
              <div className="flex items-center space-x-1.5 text-[11px] font-serif font-bold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>default_tags</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${isDark ? "text-indigo-300/80" : "text-indigo-800"}`}>
                Corporate metadata stamped onto every tagged resource, automatically.
              </p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-indigo-900/60 text-indigo-300" : "bg-white border-indigo-200"}`}>
                Environment="Production" ✓
              </div>
            </div>
          </div>

          {/* Tag inheritance fan-out */}
          <div className="flex justify-center mt-2">
            <VerticalPipe label="tags inherited by" isAnimated={isAnimated} color="emerald" duration={1.8} heightClass="h-6" isDark={isDark} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["s3_bucket", "ec2 instance", "iam role"].map((kind, idx) => (
              <motion.div
                key={kind}
                initial={isAnimated ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: isAnimated ? idx * 0.2 : 0 }}
                className={`p-2 rounded-xl border text-center ${isDark ? "bg-[#0c0420] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}
              >
                <div className="text-[10px] font-mono font-bold">{kind}</div>
                <div className={`text-[9px] ${isDark ? "text-purple-400/80" : "text-purple-700"}`}>inherits tags ✓</div>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "provider_alias_routing": {
      const routes = [
        {
          key: "default",
          label: "no provider argument →",
          region: "us-east-1",
          resource: 'aws_s3_bucket "primary"',
          color: "sky" as const,
          dashed: false
        },
        {
          key: "west",
          label: "provider = aws.west →",
          region: "us-west-2",
          resource: 'aws_s3_bucket "dr_replica"',
          color: "orange" as const,
          dashed: true
        }
      ];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-orange-500/40 text-slate-100 shadow-[0_0_25px_rgba(255,153,0,0.1)]"
            : "bg-gradient-to-br from-orange-50/90 via-amber-50/70 to-yellow-50/60 border-orange-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-orange-900/60" : "border-orange-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-orange-950/80 text-orange-300 border border-orange-700/50" : "bg-orange-100 text-orange-800"}`}>
                <Network className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-orange-100" : "text-orange-950"}`}>
                Provider Aliases: One Config, Two Regional Routes
              </span>
            </div>
            {renderModeToggle()}
          </div>

          {/* Two provider configs side by side */}
          <div className="grid grid-cols-2 gap-2">
            {routes.map((r) => (
              <div key={r.key} className={`p-2.5 rounded-xl border ${isDark ? (r.dashed ? "bg-[#201005] border-orange-500/40" : "bg-[#051526] border-sky-500/40") : (r.dashed ? "bg-orange-50/90 border-orange-300" : "bg-sky-50/90 border-sky-300")}`}>
                <div className={`text-[10px] font-mono font-bold ${isDark ? (r.dashed ? "text-orange-300" : "text-sky-300") : (r.dashed ? "text-orange-900" : "text-sky-900")}`}>
                  provider "aws" {r.key === "west" ? '{ alias = "west" }' : "{ default }"}
                </div>
                <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400/80" : "text-stone-600"}`}>region = "{r.region}"</div>
              </div>
            ))}
          </div>

          {/* Routing pipes down to resources */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {routes.map((r, idx) => (
              <div key={r.key} className="flex flex-col items-center">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border mb-0.5 ${isDark ? "bg-slate-900/80 border-slate-700 text-slate-300" : "bg-white/90 border-slate-300 text-stone-700"}`}>
                  {r.label}
                </span>
                <VerticalPipe label={r.region} isAnimated={isAnimated} color={r.color} duration={2.0 + idx * 0.4} heightClass="h-8" isDark={isDark} />
              </div>
            ))}
          </div>

          {/* Destinations */}
          <div className="grid grid-cols-2 gap-2">
            {routes.map((r, idx) => (
              <motion.div
                key={r.key}
                initial={isAnimated ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: isAnimated ? idx * 0.25 : 0 }}
                className={`p-2.5 rounded-xl border text-center ${isDark ? "bg-[#051c14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}
              >
                <div className="text-[10px] font-mono font-bold">{r.resource}</div>
                <div className={`text-[9px] mt-0.5 ${isDark ? "text-emerald-400/80" : "text-emerald-700"}`}>
                  deploys in {r.region} {r.dashed ? "(explicit alias)" : "(implicit default)"}
                </div>
              </motion.div>
            ))}
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-orange-400/80" : "text-orange-700"}`}>
            Exactly one provider block per type can omit alias. Omit provider = on a resource and it silently uses that default.
          </div>
        </div>
      );
    }

    case "init_stage":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-cyan-500/40 text-slate-100 shadow-[0_0_25px_rgba(0,170,255,0.1)]"
            : "bg-gradient-to-br from-cyan-50/90 via-sky-50/70 to-blue-50/60 border-cyan-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-cyan-900/60" : "border-cyan-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-cyan-950/80 text-cyan-300 border border-cyan-700/50" : "bg-cyan-100 text-cyan-800"}`}>
                <Download className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-cyan-100" : "text-cyan-950"}`}>
                terraform init — Workspace Initialization
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">1. Providers installed</div>
              <p className={`text-[10px] ${isDark ? "text-sky-300/80" : "text-sky-800"}`}>Binaries land in .terraform/providers/, checksums pinned in .terraform.lock.hcl</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white border-sky-200"}`}>hashicorp/aws v5.42.0 ✓</div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1a0c2c] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">2. Backend configured</div>
              <p className={`text-[10px] ${isDark ? "text-purple-300/80" : "text-purple-800"}`}>State storage target set up (local file or S3 bucket) — but NO cloud API call</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-purple-900/60 text-purple-300" : "bg-white border-purple-200"}`}>Initializing backend... ✓</div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">3. Child modules fetched</div>
              <p className={`text-[10px] ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>Module sources cloned into .terraform/modules/</p>
              <div className={`mt-2 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200"}`}>.terraform/ created ✓</div>
            </div>
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-cyan-400/80" : "text-cyan-700"}`}>
            Re-run init whenever you add a provider, module, or backend. It never creates real infrastructure.
          </div>
        </div>
      );

    case "plan_stage": {
      const diffs = [
        { sym: "+", what: "aws_s3_bucket.demo_vault", note: "will be created", color: "emerald" as const },
        { sym: "+", what: "aws_s3_bucket.demo_vault.arn", note: "(known after apply)", color: "emerald" as const }
      ];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-amber-500/40 text-slate-100 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
            : "bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-orange-50/60 border-amber-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-amber-900/60" : "border-amber-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-amber-950/80 text-amber-300 border border-amber-700/50" : "bg-amber-100 text-amber-800"}`}>
                <Search className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-amber-100" : "text-amber-950"}`}>
                terraform plan — Read-Only Dry-Run Diff
              </span>
            </div>
            {renderModeToggle()}
          </div>

          {/* 3 inputs converge into the plan computation */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { t: "HCL code", c: "emerald" },
              { t: "state file", c: "purple" },
              { t: "live cloud refresh", c: "sky" }
            ].map((inp) => (
              <div key={inp.t} className={`p-2 rounded-xl border text-center text-[10px] font-mono font-bold ${
                isDark
                  ? { emerald: "bg-[#041a14] border-emerald-500/30 text-emerald-200", purple: "bg-[#0c0420] border-purple-500/30 text-purple-200", sky: "bg-[#051526] border-sky-500/30 text-sky-200" }[inp.c as "emerald" | "purple" | "sky"]
                  : { emerald: "bg-emerald-50/90 border-emerald-200 text-emerald-950", purple: "bg-purple-50/90 border-purple-200 text-purple-950", sky: "bg-sky-50/90 border-sky-200 text-sky-950" }[inp.c as "emerald" | "purple" | "sky"]
              }`}>
                {inp.t}
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <VerticalPipe label="compared" isAnimated={isAnimated} color="amber" duration={1.8} heightClass="h-6" isDark={isDark} />
          </div>

          {/* Diff output panel */}
          <div className={`rounded-xl border p-3 font-mono text-[10px] space-y-1 ${isDark ? "bg-[#020a14] border-amber-700/50 text-amber-200" : "bg-white/95 border-amber-300 text-stone-800"}`}>
            {diffs.map((d) => (
              <div key={d.what} className="flex items-center space-x-2">
                <span className={`font-bold w-3 text-center ${d.sym === "+" ? (isDark ? "text-emerald-400" : "text-emerald-700") : isDark ? "text-amber-400" : "text-amber-700"}`}>{d.sym}</span>
                <span className="font-bold">{d.what}</span>
                <span className={`ml-auto ${isDark ? "text-slate-400/80" : "text-stone-500"}`}>{d.note}</span>
              </div>
            ))}
            <div className={`pt-1 mt-1 border-t text-[9px] font-sans ${isDark ? "border-amber-900/40 text-amber-300/90" : "border-amber-200 text-amber-800"}`}>
              Plan: 1 to add, 0 to change, 0 to destroy. — infrastructure NOT touched (read-only)
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center space-x-2 text-[10px] font-sans">
            <Pause className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
            <span className={isDark ? "text-emerald-300/90" : "text-emerald-800"}>Safe to run anytime</span>
            <span className={isDark ? "text-slate-400" : "text-stone-500"}>·</span>
            <span className={isDark ? "text-slate-300/90" : "text-stone-700"}>Save with -out=tfplan for atomic CI/CD apply</span>
          </div>
        </div>
      );
    }

    case "apply_stage":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-emerald-500/40 text-slate-100 shadow-[0_0_25px_rgba(46,204,113,0.1)]"
            : "bg-gradient-to-br from-emerald-50/90 via-green-50/70 to-lime-50/60 border-emerald-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-emerald-900/60" : "border-emerald-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50" : "bg-emerald-100 text-emerald-800"}`}>
                <Play className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-emerald-100" : "text-emerald-950"}`}>
                terraform apply / destroy — Real Execution
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
            {[
              { cmd: '"yes"', note: "Typed confirmation gate", icon: null },
              { cmd: "API calls", note: "Parallel (default 10), in DAG order", icon: Cloud },
              { cmd: "state write", note: "Attributes persisted to .tfstate", icon: Database },
              { cmd: "destroy?", note: "Same graph walked in REVERSE", icon: Pause }
            ].map((s, idx) => (
              <motion.div
                key={s.cmd}
                initial={isAnimated ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: isAnimated ? idx * 0.18 : 0 }}
                className={`p-2.5 rounded-xl border text-center ${
                  idx >= 2
                    ? isDark ? "bg-[#041a14] border-emerald-500/40 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                    : isDark ? "bg-[#140822] border-purple-500/30 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"
                }`}
              >
                {s.icon && <s.icon className="w-4 h-4 mx-auto mb-1 opacity-70" />}
                <div className="text-[11px] font-mono font-bold">{s.cmd}</div>
                <p className={`text-[10px] mt-1 ${isDark ? "text-slate-400/90" : "text-stone-600"}`}>{s.note}</p>
              </motion.div>
            ))}
          </div>

          <div className={`mt-3 rounded-xl border p-2.5 font-mono text-[10px] ${isDark ? "bg-[#020a14] border-emerald-700/40 text-emerald-300" : "bg-white/95 border-emerald-300 text-emerald-900"}`}>
            aws_s3_bucket.demo_vault: Creating... → Creation complete [id=cloudops-sandbox-demo-bucket]
            <span className={`block mt-0.5 font-sans text-[9px] ${isDark ? "text-slate-400/90" : "text-stone-600"}`}>Apply complete! Resources: 1 added — state now records it; partial apply keeps successes on failure.</span>
          </div>
        </div>
      );

    case "best_practice_matrix": {
      const habits = [
        {
          icon: Layers,
          title: "tags = { }",
          detail: "Name, Environment, ManagedBy — every AWS resource, always",
          sample: 'Environment = "production"',
          ring: "emerald"
        },
        {
          icon: ShieldAlert,
          title: "ingress { }",
          detail: "from_port + to_port + protocol + cidr_blocks — all four required",
          sample: 'from_port = 80, cidr = ["0.0.0.0/0"]',
          ring: "rose"
        },
        {
          icon: Box,
          title: "_ids = [ list ]",
          detail: "Plural attributes take [] brackets — attach several SGs at once",
          sample: "vpc_security_group_ids = [a, b]",
          ring: "sky"
        },
        {
          icon: Server,
          title: "map_public_ip_on_launch",
          detail: "true → public subnet (internet-facing); false → private subnet",
          sample: "true = public, false = private",
          ring: "amber"
        }
      ];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-teal-500/40 text-slate-100 shadow-[0_0_25px_rgba(0,212,200,0.1)]"
            : "bg-gradient-to-br from-teal-50/90 via-cyan-50/70 to-sky-50/60 border-teal-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-teal-900/60" : "border-teal-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-teal-950/80 text-teal-300 border border-teal-700/50" : "bg-teal-100 text-teal-800"}`}>
                <Check className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-teal-100" : "text-teal-950"}`}>
                Every Resource Block Habits Checklist
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {habits.map((h, idx) => {
              const Icon = h.icon;
              const ringMap: Record<string, string> = isDark
                ? { emerald: "bg-[#041a14] border-emerald-500/30", rose: "bg-[#180a0e] border-rose-500/30", sky: "bg-[#051526] border-sky-500/30", amber: "bg-[#1f1304] border-amber-500/30" }
                : { emerald: "bg-emerald-50/90 border-emerald-200", rose: "bg-rose-50/90 border-rose-200", sky: "bg-sky-50/90 border-sky-200", amber: "bg-amber-50/90 border-amber-200" };
              const badgeMap: Record<string, string> = isDark
                ? { emerald: "bg-emerald-950 text-emerald-300 border-emerald-800", rose: "bg-rose-950 text-rose-300 border-rose-800", sky: "bg-sky-950 text-sky-300 border-sky-800", amber: "bg-amber-950 text-amber-300 border-amber-800" }
                : { emerald: "bg-emerald-100 text-emerald-800", rose: "bg-rose-100 text-rose-800", sky: "bg-sky-100 text-sky-800", amber: "bg-amber-100 text-amber-800" };
              return (
                <motion.div
                  key={h.title}
                  initial={isAnimated ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: isAnimated ? idx * 0.12 : 0 }}
                  className={`p-3 rounded-xl border flex items-start space-x-2 ${ringMap[h.ring]}`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center border ${badgeMap[h.ring]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono font-bold">{h.title}</div>
                    <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400/90" : "text-stone-600"}`}>{h.detail}</p>
                    <div className={`mt-1 px-1.5 py-0.5 rounded inline-block text-[9px] font-mono border ${isDark ? "bg-[#020a14] border-slate-700/60 text-slate-300" : "bg-white/90 border-slate-200 text-stone-700"}`}>
                      {h.sample}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-teal-400/80" : "text-teal-700"}`}>
            Omit a REQUIRED attribute and terraform plan fails before any cloud API call — adopt these four habits in every block.
          </div>
        </div>
      );
    }

    case "module_hierarchy":
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-purple-500/40 text-slate-100 shadow-[0_0_25px_rgba(192,132,252,0.1)]"
            : "bg-gradient-to-br from-purple-50/90 via-violet-50/70 to-indigo-50/60 border-purple-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-purple-900/60" : "border-purple-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-purple-950/80 text-purple-300 border border-purple-700/50" : "bg-purple-100 text-purple-800"}`}>
                <FolderTree className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-purple-100" : "text-purple-950"}`}>
                Module Hierarchy: Root → Child Encapsulation
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${isDark ? "bg-slate-900/80 border-slate-700 text-slate-300" : "bg-white/90 border-slate-300 text-stone-600"}`}>
                step {stepNumber}
              </span>
              {renderModeToggle()}
            </div>
          </div>

          {/* Root module on top */}
          <div className="flex justify-center">
            <div className={`p-3 rounded-xl border text-center min-w-[240px] ${isDark ? "bg-[#1a0c2c] border-purple-500/40 text-purple-200" : "bg-purple-50/90 border-purple-200 text-purple-950"}`}>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${isDark ? "bg-purple-950 text-purple-300 border border-purple-800" : "bg-purple-100 text-purple-800"}`}>
                Root Module (your .tf files)
              </span>
              <div className="text-[11px] font-mono font-bold">main.tf · variables.tf · outputs.tf</div>
              <div className={`text-[10px] mt-1 ${isDark ? "text-purple-400/80" : "text-purple-800"}`}>Namespaced root of every address</div>
            </div>
          </div>

          <div className="flex justify-center my-1">
            <VerticalPipe label="calls via source =" isAnimated={isAnimated} color="purple" duration={2.0} heightClass="h-7" isDark={isDark} />
          </div>

          {/* Child module block */}
          <div className={`flex justify-center ${isDark ? "" : ""}`}>
            <div className={`p-3 rounded-xl border border-dashed text-center min-w-[260px] ${isDark ? "bg-[#051c1c] border-teal-500/40 text-teal-200" : "bg-teal-50/90 border-teal-400 text-teal-950"}`}>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${isDark ? "bg-teal-950 text-teal-300 border border-teal-800" : "bg-teal-100 text-teal-800"}`}>
                Child Module (modules/vpc)
              </span>
              <div className="text-[11px] font-mono font-bold">contains its own resources</div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-teal-300/80" : "text-teal-800"}`}>invisible to parent except its declared inputs &amp; outputs</div>
            </div>
          </div>

          <div className="flex justify-center my-1">
            <VerticalPipe label="provisions" isAnimated={isAnimated} color="teal" duration={2.0} heightClass="h-6" isDark={isDark} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["aws_vpc", "aws_subnet ×2", "aws_route_table"].map((r, idx) => (
              <motion.div
                key={r}
                initial={isAnimated ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: isAnimated ? idx * 0.15 : 0 }}
                className={`p-2 rounded-xl border text-center text-[10px] font-mono font-bold ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}
              >
                {r}
              </motion.div>
            ))}
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-purple-400/80" : "text-purple-700"}`}>
            Inside the hierarchy, addresses nest: module.vpc.aws_subnet.public — yet the root never sees child internals, only its interface.
          </div>
        </div>
      );

    case "module_interface": {
      const inputs = [
        { k: "source", u: "terraform-aws-modules/vpc/aws", pin: true },
        { k: "vpc_cidr", u: '"10.0.0.0/16"', pin: true },
        { k: "environment", u: '"production"', pin: false }
      ];
      const outputs = ["vpc_id", "public_subnet_ids", "nat_public_ips"];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-indigo-500/40 text-slate-100 shadow-[0_0_25px_rgba(129,140,248,0.1)]"
            : "bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-sky-50/60 border-indigo-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-indigo-900/60" : "border-indigo-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-indigo-950/80 text-indigo-300 border border-indigo-700/50" : "bg-indigo-100 text-indigo-800"}`}>
                <Box className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-indigo-100" : "text-indigo-950"}`}>
                Anatomy of a Module Call: inputs in, outputs out
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            {/* Inputs */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">Inputs (arguments)</div>
              {inputs.map((i) => (
                <div key={i.k} className={`mt-1 p-1 rounded font-mono text-[9px] border ${isDark ? "bg-[#020a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200"}`}>
                  {i.k} = {i.u} {i.pin && <span className={isDark ? "text-amber-400" : "text-amber-700"}>required!</span>}
                </div>
              ))}
              <p className={`text-[9px] mt-1.5 ${isDark ? "text-slate-400/80" : "text-stone-600"}`}>Root vars are NOT auto-visible inside children — every input must be supplied.</p>
            </div>

            {/* Module black box with pipes */}
            <div className="flex flex-col items-center">
              <HorizontalPipe label="feeds" isAnimated={isAnimated} color="emerald" duration={1.8} isDark={isDark} />
              <div className={`w-full p-2.5 rounded-xl border border-dashed text-center my-1 ${isDark ? "bg-[#0c0420] border-purple-500/50 text-purple-200" : "bg-purple-50/90 border-purple-400 text-purple-950"}`}>
                <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full inline-block mb-0.5 ${isDark ? "bg-purple-950 text-purple-300 border border-purple-800" : "bg-purple-100 text-purple-800"}`}>
                  sealed capsule
                </span>
                <div className="text-[10px] font-mono font-bold">module "network"</div>
                <div className={`text-[9px] ${isDark ? "text-purple-400/80" : "text-purple-700"}`}>internals encapsulated</div>
              </div>
              <HorizontalPipe label="exports" isAnimated={isAnimated} color="indigo" duration={1.8} isDark={isDark} />
            </div>

            {/* Outputs */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#0a122c] border-indigo-500/30 text-indigo-200" : "bg-indigo-50/90 border-indigo-200 text-indigo-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">Outputs (the public API)</div>
              {outputs.map((o) => (
                <div key={o} className={`mt-1 p-1 rounded font-mono text-[9px] border ${isDark ? "bg-[#020a14] border-indigo-900/60 text-indigo-300" : "bg-white border-indigo-200"}`}>
                  module.network.{o}
                </div>
              ))}
              <p className={`text-[9px] mt-1.5 ${isDark ? "text-slate-400/80" : "text-stone-600"}`}>Consumed by the root: subnet_id = module.vpc.public_subnet_ids[0]</p>
            </div>
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-indigo-400/80" : "text-indigo-700"}`}>
            source + version pin reproducible building blocks; everything else crosses the interface only as inputs → outputs.
          </div>
        </div>
      );
    }

    case "data_lookup": {
      const rows = [
        { attr: "ami", value: "ami-0c55b159cbfafe1f0", note: "resolved at plan time" },
        { attr: "most_recent", value: "true", note: "latest matching image" },
        { attr: "owners", value: '["099720109477"]', note: "canonical owner ID" }
      ];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-sky-500/40 text-slate-100 shadow-[0_0_25px_rgba(56,189,248,0.1)]"
            : "bg-gradient-to-br from-sky-50/90 via-cyan-50/70 to-blue-50/60 border-sky-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-sky-900/60" : "border-sky-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-sky-950/80 text-sky-300 border border-sky-700/50" : "bg-sky-100 text-sky-800"}`}>
                <Search className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-sky-100" : "text-sky-950"}`}>
                data {`{ }`}: Read-Only Cloud Lookup
              </span>
            </div>
            {renderModeToggle()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1f1304] border-amber-500/30 text-amber-200" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">Query (no infrastructure)</div>
              <div className={`mt-1 p-1.5 rounded font-mono text-[10px] border ${isDark ? "bg-[#020a14] border-amber-900/60 text-amber-300" : "bg-white border-amber-200"}`}>
                data "aws_ami" "ubuntu"
              </div>
              <p className={`text-[10px] mt-1.5 ${isDark ? "text-amber-300/80" : "text-amber-800"}`}>Fetches an EXISTING cloud object without creating one.</p>
            </div>
            <div className="hidden md:flex flex-col items-center space-y-1 px-1">
              <HorizontalPipe label="filter" isAnimated={isAnimated} color="amber" duration={2.0} isDark={isDark} />
              <HorizontalPipe label="read-only" isAnimated={isAnimated} color="sky" duration={2.4} isDark={isDark} />
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#051526] border-sky-500/30 text-sky-200" : "bg-sky-50/90 border-sky-200 text-sky-950"}`}>
              <div className="text-[11px] font-serif font-bold mb-1">Result → use anywhere</div>
              {rows.map((r) => (
                <div key={r.attr} className={`mt-1 p-1 rounded font-mono text-[9px] border flex justify-between ${isDark ? "bg-[#020a14] border-sky-900/60 text-sky-300" : "bg-white border-sky-200 text-sky-900"}`}>
                  <span>{r.attr} = {r.value}</span>
                </div>
              ))}
              <div className={`mt-1.5 p-1.5 rounded font-mono text-[9px] border ${isDark ? "bg-[#041a14] border-emerald-900/60 text-emerald-300" : "bg-white border-emerald-200 text-emerald-900"}`}>
                resource uses data.aws_ami.ubuntu.id
              </div>
            </div>
          </div>

          <div className={`mt-3 text-center text-[10px] font-sans ${isDark ? "text-sky-400/80" : "text-sky-700"}`}>
            resource = create it; data = find it. Lookups run at plan time and refresh on every run.
          </div>
        </div>
      );
    }

    case "cycle_error": {
      const steps = [
        {
          title: "FAIL: the cycle",
          body: "SG A references SG B and SG B references SG A — no topological order exists",
          mono: "Error: Cycle: aws_security_group.a, aws_security_group.b",
          icon: XCircle,
          broken: true
        },
        {
          title: "BREAK: extract the edge",
          body: "Move the relationship into its own resource — each node now has one direction only",
          mono: "aws_security_group_rule \"web_to_db\"",
          icon: AlertTriangle,
          broken: false
        },
        {
          title: "PASS: acyclic again",
          body: "SG web → RULE → SG db forms a straight line Terraform can schedule",
          mono: "web → web_to_db → db (DAG ✓)",
          icon: Check,
          broken: false
        }
      ];
      return (
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg font-sans transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#061426]/95 via-[#040d1e]/95 to-[#08182b]/95 border-rose-500/40 text-slate-100 shadow-[0_0_25px_rgba(231,76,60,0.1)]"
            : "bg-gradient-to-br from-rose-50/90 via-red-50/70 to-orange-50/60 border-rose-200/90 text-stone-900 shadow-xs"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${isDark ? "border-rose-900/60" : "border-rose-100/80"}`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-md ${isDark ? "bg-rose-950/80 text-rose-300 border border-rose-700/50" : "bg-rose-100 text-rose-800"}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className={`text-xs font-serif font-bold ${isDark ? "text-rose-100" : "text-rose-950"}`}>
                Breaking a Circular Dependency
              </span>
            </div>
            {renderModeToggle()}
          </div>

          {/* Top visual: bad vs fixed topology */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Cycle */}
            <div className={`p-3 rounded-xl border relative overflow-hidden ${isDark ? "bg-[#1f0907] border-rose-500/40" : "bg-rose-50/90 border-rose-300"}`}>
              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full inline-block mb-2 ${isDark ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-rose-100 text-rose-800 border border-rose-300"}`}>
                ✗ cycle (impossible)
              </span>
              <svg viewBox="0 0 200 90" className="w-full h-20">
                <defs>
                  <marker id="cyc-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 z" fill={isDark ? "#fb7185" : "#e11d48"} />
                  </marker>
                </defs>
                {/* A -> B top */}
                <line x1="55" y1="30" x2="145" y2="30" stroke={isDark ? "#fb7185" : "#e11d48"} strokeWidth="1.5" markerEnd="url(#cyc-arrow)" />
                {/* B -> A bottom (reverse) */}
                <line x1="145" y1="60" x2="55" y2="60" stroke={isDark ? "#fb7185" : "#e11d48"} strokeWidth="1.5" markerEnd="url(#cyc-arrow)" />
                <rect x="8" y="22" width="48" height="20" rx="4" fill={isDark ? "#2a0d12" : "#ffe4e6"} stroke={isDark ? "#fb7185" : "#f43f5e"} />
                <text x="32" y="36" textAnchor="middle" fontSize="8" fill={isDark ? "#fda4af" : "#9f1239"} fontFamily="monospace">SG A</text>
                <rect x="144" y="22" width="48" height="20" rx="4" fill={isDark ? "#2a0d12" : "#ffe4e6"} stroke={isDark ? "#fb7185" : "#f43f5e"} />
                <text x="168" y="36" textAnchor="middle" fontSize="8" fill={isDark ? "#fda4af" : "#9f1239"} fontFamily="monospace">SG B</text>
                <text x="100" y="80" textAnchor="middle" fontSize="7" fill={isDark ? "#fda4af" : "#9f1239"} fontFamily="monospace">A→B and B→A = no first move</text>
              </svg>
            </div>
            {/* Fixed */}
            <div className={`p-3 rounded-xl border ${isDark ? "bg-[#041a14] border-emerald-500/40" : "bg-emerald-50/90 border-emerald-300"}`}>
              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full inline-block mb-2 ${isDark ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-emerald-100 text-emerald-800 border border-emerald-300"}`}>
                ✓ acyclic (fix)
              </span>
              <svg viewBox="0 0 200 90" className="w-full h-20">
                <defs>
                  <marker id="fix-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 z" fill={isDark ? "#34d399" : "#059669"} />
                  </marker>
                </defs>
                <line x1="56" y1="40" x2="84" y2="40" stroke={isDark ? "#34d399" : "#059669"} strokeWidth="1.5" markerEnd="url(#fix-arrow)" />
                <line x1="118" y1="40" x2="146" y2="40" stroke={isDark ? "#34d399" : "#059669"} strokeWidth="1.5" markerEnd="url(#fix-arrow)" />
                <rect x="8" y="28" width="46" height="20" rx="4" fill={isDark ? "#05261a" : "#d1fae5"} stroke={isDark ? "#34d399" : "#10b981"} />
                <text x="31" y="42" textAnchor="middle" fontSize="8" fill={isDark ? "#6ee7b7" : "#065f46"} fontFamily="monospace">SG web</text>
                <rect x="86" y="28" width="32" height="20" rx="4" fill={isDark ? "#05261a" : "#d1fae5"} stroke={isDark ? "#34d399" : "#10b981"} strokeDasharray="3 2" />
                <text x="102" y="42" textAnchor="middle" fontSize="7" fill={isDark ? "#6ee7b7" : "#065f46"} fontFamily="monospace">rule</text>
                <rect x="148" y="28" width="44" height="20" rx="4" fill={isDark ? "#05261a" : "#d1fae5"} stroke={isDark ? "#34d399" : "#10b981"} />
                <text x="170" y="42" textAnchor="middle" fontSize="8" fill={isDark ? "#6ee7b7" : "#065f46"} fontFamily="monospace">SG db</text>
                <text x="100" y="80" textAnchor="middle" fontSize="7" fill={isDark ? "#6ee7b7" : "#065f46"} fontFamily="monospace">standalone rule resource splits the loop</text>
              </svg>
            </div>
          </div>

          {/* Steps row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={isAnimated ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: isAnimated ? idx * 0.15 : 0 }}
                  className={`p-2.5 rounded-xl border ${s.broken ? (isDark ? "bg-[#1f0907] border-rose-500/30 text-rose-200" : "bg-rose-50/90 border-rose-200 text-rose-950") : (isDark ? "bg-[#041a14] border-emerald-500/30 text-emerald-200" : "bg-emerald-50/90 border-emerald-200 text-emerald-950")}`}
                >
                  <div className="flex items-center space-x-1.5 text-[11px] font-serif font-bold">
                    <Icon className={`w-3.5 h-3.5 ${s.broken ? "text-rose-500" : "text-emerald-500"}`} />
                    <span>{s.title}</span>
                  </div>
                  <p className={`text-[9.5px] mt-1 leading-relaxed ${isDark ? "text-slate-400/90" : "text-stone-600"}`}>{s.body}</p>
                  <div className={`mt-1 p-1 rounded font-mono text-[9px] border ${isDark ? "bg-[#020a14] border-slate-700/60 text-slate-300" : "bg-white/90 border-slate-200 text-stone-700"}`}>
                    {s.mono}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

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
