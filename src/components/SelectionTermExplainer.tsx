import React, { useState, useEffect, useRef } from "react";
import { lookupTerm, TermDefinition } from "../utils/termGlossary";
import { Sparkles, Briefcase, Baby, X, HelpCircle } from "lucide-react";

interface ActiveExplanation {
  term: string;
  definition: TermDefinition;
  x: number;
  y: number;
  placement: "top" | "bottom";
}

export const SelectionTermExplainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeExp, setActiveExp] = useState<ActiveExplanation | null>(null);
  const [mode, setMode] = useState<"formal" | "eli5">("eli5");
  const modalRef = useRef<HTMLDivElement>(null);

  // Listen to text selection inside the container
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // If clicking inside the active modal, don't dismiss or change
      if (modalRef.current && modalRef.current.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // If empty click outside modal, dismiss
        if (activeExp && !modalRef.current?.contains(e.target as Node)) {
          setActiveExp(null);
        }
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length >= 2 && selectedText.length <= 45) {
        const def = lookupTerm(selectedText);
        if (def && containerRef.current) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Calculate relative position within container with clamping to prevent left/right/top overflow
          const rawX = rect.left + rect.width / 2 - containerRect.left;
          const modalWidth = 320;
          const minX = modalWidth / 2 + 16;
          const maxX = containerRect.width - modalWidth / 2 - 16;
          const clampedX = Math.max(minX, Math.min(maxX, rawX));

          // Check if space exists above or if we should pop below
          const spaceAbove = rect.top - containerRect.top;
          const placement: "top" | "bottom" = spaceAbove < 220 ? "bottom" : "top";

          const rawY =
            placement === "top"
              ? rect.top - containerRect.top - 8
              : rect.bottom - containerRect.top + 8;

          setActiveExp({
            term: selectedText,
            definition: def,
            x: clampedX,
            y: rawY,
            placement
          });
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [activeExp]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col overflow-hidden">
      {children}

      {/* Floating Selection Explainer Modal - Confined strictly within container bounds */}
      {activeExp && (
        <div
          ref={modalRef}
          style={{
            left: `${activeExp.x}px`,
            top: `${activeExp.y}px`,
            transform:
              activeExp.placement === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0%)"
          }}
          className="absolute z-50 w-80 bg-stone-950 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 p-4 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-800/90 pb-2.5 mb-2.5">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-5 h-5 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="font-serif font-bold text-stone-100 truncate text-[12.5px]">
                {activeExp.definition.term}
              </span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                {activeExp.definition.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveExp(null)}
                className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-900 rounded-xl border border-stone-800 mb-3">
            <button
              type="button"
              onClick={() => setMode("eli5")}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                mode === "eli5"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Baby className="w-3.5 h-3.5 text-amber-400" />
              <span>Like I'm 5</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("formal")}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                mode === "formal"
                  ? "bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Professional</span>
            </button>
          </div>

          {/* Explanation Text */}
          <div className="text-stone-200 text-[11.5px] leading-relaxed">
            {mode === "eli5" ? (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-100/95 font-sans leading-relaxed">
                <span className="font-semibold text-amber-300 mr-1.5">Simple Analogy:</span>
                "{activeExp.definition.eli5}"
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200 font-sans leading-relaxed">
                <span className="font-semibold text-indigo-300 mr-1.5">Technical:</span>
                {activeExp.definition.formal}
              </div>
            )}
          </div>

          {/* Placement Arrow Pointer */}
          {activeExp.placement === "top" ? (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-stone-950 border-r border-b border-stone-800 rotate-45" />
          ) : (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px w-3 h-3 bg-stone-950 border-l border-t border-stone-800 rotate-45" />
          )}
        </div>
      )}
    </div>
  );
};
