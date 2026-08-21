import React, { useState, useRef, useEffect } from "react";
import { lookupTerm, TermDefinition } from "../utils/termGlossary";
import { Sparkles, Briefcase, Baby, X } from "lucide-react";

interface ExplainableTermProps {
  termKey: string;
  displayText?: React.ReactNode;
  className?: string;
}

export const ExplainableTerm: React.FC<ExplainableTermProps> = ({
  termKey,
  displayText,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"formal" | "eli5">("eli5");
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  const definition: TermDefinition | null = lookupTerm(termKey);

  // Compute smart bounds-aware position so it never overflows off left or right screen
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 320;
      
      // Calculate how far from the left edge of the viewport
      const spaceOnLeft = rect.left;
      const spaceOnRight = window.innerWidth - rect.right;

      let leftOffset = "50%";
      let transform = "translateX(-50%)";

      // If too close to left margin (e.g. within 160px), align left
      if (spaceOnLeft < popoverWidth / 2 + 16) {
        leftOffset = "0px";
        transform = "translateX(0%)";
      } else if (spaceOnRight < popoverWidth / 2 + 16) {
        leftOffset = "auto";
        transform = "translateX(0%)";
      }

      setPositionStyle({
        left: leftOffset,
        transform
      });
    }
  }, [isOpen]);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!definition) {
    return <span className={className}>{displayText || termKey}</span>;
  }

  return (
    <span className="relative inline-block" ref={triggerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline font-medium cursor-help transition-all underline decoration-indigo-400/60 hover:decoration-indigo-600 hover:text-indigo-600 decoration-1 underline-offset-2 ${className}`}
        title={`Click for Dual-Mode definition of ${definition.term}`}
      >
        {displayText || termKey}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={positionStyle}
          className="absolute z-50 bottom-full mb-2 w-72 sm:w-80 bg-stone-950 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 p-3.5 text-xs animate-in fade-in zoom-in-95 duration-150 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold text-stone-100 truncate text-[12px]">
                {definition.term}
              </span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                {definition.category}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-900/90 rounded-lg border border-stone-800 mb-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMode("eli5");
              }}
              className={`flex items-center justify-center space-x-1.5 py-1 px-2 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                mode === "eli5"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Baby className="w-3 h-3 text-amber-400" />
              <span>Like I'm 5</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMode("formal");
              }}
              className={`flex items-center justify-center space-x-1.5 py-1 px-2 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                mode === "formal"
                  ? "bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Briefcase className="w-3 h-3 text-indigo-400" />
              <span>Professional</span>
            </button>
          </div>

          {/* Explanation Body */}
          <div className="text-stone-300 text-[11.5px] leading-relaxed min-h-[50px] flex items-center">
            {mode === "eli5" ? (
              <p className="text-amber-100/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                "{definition.eli5}"
              </p>
            ) : (
              <p className="text-stone-200 bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
                {definition.formal}
              </p>
            )}
          </div>
        </div>
      )}
    </span>
  );
};
