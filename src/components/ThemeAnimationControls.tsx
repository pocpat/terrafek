import React from "react";
import { Moon, Sun, Sparkles, ZapOff, Gauge } from "lucide-react";

export interface ThemeAnimationControlsProps {
  themeMode: "cyber" | "light";
  onToggleTheme: (mode: "cyber" | "light") => void;
  isAnimated: boolean;
  onToggleAnimation: (animated: boolean) => void;
  animSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  compact?: boolean;
}

export const ThemeAnimationControls: React.FC<ThemeAnimationControlsProps> = ({
  themeMode,
  onToggleTheme,
  isAnimated,
  onToggleAnimation,
  animSpeed,
  onSpeedChange,
  compact = false,
}) => {
  const isDark = themeMode === "cyber";

  return (
    <div className="flex items-center space-x-1.5 shrink-0">
      {/* Cosmic / Light Theme Icon Toggle */}
      <div
        className={`flex items-center p-0.5 rounded-lg border shadow-2xs transition-colors ${
          isDark
            ? "bg-[#020a16] border-cyan-900/60"
            : "bg-stone-100 border-stone-200"
        }`}
        role="group"
        aria-label="Theme Mode Selection"
      >
        <button
          type="button"
          onClick={() => onToggleTheme("cyber")}
          className={`p-1 rounded-md transition-all cursor-pointer ${
            isDark
              ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,170,255,0.35)]"
              : "text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
          }`}
          title="Cosmic Cyber Dark Mode: Neon glowing topology, dark space canvas, and fiber-optic pipelines"
        >
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        <button
          type="button"
          onClick={() => onToggleTheme("light")}
          className={`p-1 rounded-md transition-all cursor-pointer ${
            !isDark
              ? "bg-white text-stone-900 border border-stone-300 shadow-2xs font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
          }`}
          title="Clean Light Theme: High-contrast modern editorial layout for bright environments"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        </button>
      </div>

      {/* Static / Animated Icon Toggle */}
      <div
        className={`flex items-center p-0.5 rounded-lg border shadow-2xs transition-colors ${
          isDark
            ? "bg-[#020a16] border-cyan-900/60"
            : "bg-stone-100 border-stone-200"
        }`}
        role="group"
        aria-label="Animation Mode Selection"
      >
        <button
          type="button"
          onClick={() => onToggleAnimation(false)}
          className={`p-1 rounded-md transition-all cursor-pointer ${
            !isAnimated
              ? isDark
                ? "bg-slate-800 text-slate-100 border border-slate-700 shadow-2xs"
                : "bg-white text-stone-900 border border-stone-300 shadow-2xs"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-white/10"
              : "text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
          }`}
          title="Static Diagram: Fixed architecture blueprint without motion"
        >
          <ZapOff className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleAnimation(true)}
          className={`p-1 rounded-md transition-all cursor-pointer ${
            isAnimated
              ? isDark
                ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,170,255,0.4)]"
                : "bg-indigo-600 text-white shadow-2xs"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-white/10"
              : "text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
          }`}
          title="Animated Flow: Live animated data packets, pulsing network conduits, and dynamic cloud status"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnimated ? (isDark ? "text-cyan-300" : "text-amber-300") : ""}`} />
        </button>
      </div>

      {/* Speed Selector (Optional - when animated) */}
      {isAnimated && onSpeedChange && animSpeed !== undefined && (
        <div
          className={`flex items-center space-x-1 border rounded-lg px-1.5 py-0.5 ${
            isDark
              ? "bg-[#020a16] border-cyan-900/60 text-slate-300"
              : "bg-stone-100 border-stone-200 text-stone-700"
          }`}
          title="Animation Speed: Adjust the velocity of packet transmissions"
        >
          <Gauge className={`w-3 h-3 ${isDark ? "text-cyan-400" : "text-stone-500"}`} />
          <select
            value={animSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-transparent text-[10px] font-mono outline-none cursor-pointer pr-0.5"
            aria-label="Animation Speed"
          >
            <option value="0.5" className={isDark ? "bg-[#071428] text-white" : "bg-white text-stone-900"}>0.5×</option>
            <option value="1" className={isDark ? "bg-[#071428] text-white" : "bg-white text-stone-900"}>1.0×</option>
            <option value="1.5" className={isDark ? "bg-[#071428] text-white" : "bg-white text-stone-900"}>1.5×</option>
            <option value="2" className={isDark ? "bg-[#071428] text-white" : "bg-white text-stone-900"}>2.0×</option>
          </select>
        </div>
      )}
    </div>
  );
};
