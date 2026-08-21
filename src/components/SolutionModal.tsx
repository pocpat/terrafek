import React, { useState } from "react";
import { Eye, X, Copy, Check, FileCode, ArrowDownRight, Sparkles } from "lucide-react";
import { LabDefinition } from "../types/terraform";

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: LabDefinition;
  onApplySolution: (solutionFiles: Record<string, string>) => void;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  isOpen,
  onClose,
  lab,
  onApplySolution,
}) => {
  const [activeFile, setActiveFile] = useState(Object.keys(lab.solutionFiles)[0] || "main.tf");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSolution = lab.solutionFiles[activeFile] || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSolution);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLoadSolution = () => {
    onApplySolution(lab.solutionFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-900">Solution & Explanation</h3>
              <p className="text-[11px] text-stone-500 font-sans">{lab.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center justify-between px-4 py-2 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {Object.keys(lab.solutionFiles).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFile(f)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors flex items-center space-x-1 ${
                  f === activeFile
                    ? "bg-stone-900 text-white font-medium shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{f}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-md text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Solution Code Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#FDFCFA] font-mono text-xs text-stone-900 leading-relaxed">
          <pre className="whitespace-pre-wrap selection:bg-stone-200">{currentSolution}</pre>
        </div>

        {/* Explanation Footer */}
        <div className="p-4 bg-[#FAFAFA] border-t border-stone-200 space-y-3">
          <div className="p-3.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 leading-relaxed shadow-xs font-sans">
            <span className="font-serif font-bold text-stone-900 block mb-1">Architectural Insight:</span>
            {lab.solutionExplanation}
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleLoadSolution}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Solution into Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
