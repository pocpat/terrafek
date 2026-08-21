import React, { useState } from "react";
import { BookOpen, X, Search, Copy, Check, Terminal, Code2 } from "lucide-react";
import { CHEAT_SHEET_DATA } from "../data/cheatSheetData";

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredSections = CHEAT_SHEET_DATA.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.syntax.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.explanation.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl h-[650px] flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-900">TerrafEK Visual Syntax & CLI Reference</h3>
              <p className="text-[11px] text-stone-500 font-sans">Instant HCL syntax, meta-arguments, and workflow cheatsheet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-stone-50 border-b border-stone-200">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands, blocks, functions (e.g. plan, for_each, merge, outputs)..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-xs"
            />
          </div>
        </div>

        {/* Sections Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-xs bg-[#FAFAFA]">
          {filteredSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-3">
              <div className="border-b border-stone-200 pb-1.5">
                <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">{sec.title}</h4>
                <p className="text-[11px] text-stone-500 font-sans">{sec.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sec.items.map((item, itemIdx) => {
                  const key = `${secIdx}-${itemIdx}`;
                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs font-sans">{item.title}</span>
                          <button
                            onClick={() => handleCopy(item.example || item.syntax, key)}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="Copy code"
                          >
                            {copiedKey === key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1 leading-relaxed font-sans">{item.explanation}</p>
                      </div>

                      <div className="bg-[#FDFCFA] border border-stone-200 rounded-lg p-2.5 font-mono text-[10.5px] text-stone-900 overflow-x-auto custom-scrollbar whitespace-pre">
                        {item.example || item.syntax}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
