import React, { useState, useRef } from "react";
import {
  FileCode,
  Sparkles,
  RotateCcw,
  CheckCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  SlidersHorizontal,
  X,
  HelpCircle,
  Briefcase,
  Baby,
  Lightbulb
} from "lucide-react";
import { formatHclString } from "../utils/terraformEngine";
import { explainHclLine, LineExplanation } from "../utils/hclLineExplainer";

interface CodeEditorProps {
  files: Record<string, string>;
  activeFile: string;
  onSelectFile: (fileName: string) => void;
  onCodeChange: (fileName: string, content: string) => void;
  onResetCode: () => void;
  onFormatCode: () => void;
  onValidateCode: () => void;
  validationStatus?: { valid: boolean; errors: string[] } | null;
  showStepBadge?: boolean;
}

const SNIPPETS = [
  {
    name: "AWS S3 Bucket",
    code: `resource "aws_s3_bucket" "my_bucket" {
  bucket = "prod-media-storage-\${var.environment}"
  tags = {
    Environment = var.environment
  }
}`
  },
  {
    name: "AWS EC2 Web Server",
    code: `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  tags = {
    Name = "web-server"
  }
}`
  },
  {
    name: "AWS VPC & Subnet",
    code: `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "main-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  tags = { Name = "public-subnet" }
}`
  },
  {
    name: "Output Block",
    code: `output "public_ip" {
  description = "Public IP address"
  value       = aws_instance.web.public_ip
}`
  },
  {
    name: "Variables Block",
    code: `variable "environment" {
  type        = string
  description = "Deployment target"
  default     = "production"
}`
  }
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCodeChange,
  onResetCode,
  onFormatCode,
  onValidateCode,
  validationStatus,
  showStepBadge = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [explainerMode, setExplainerMode] = useState<"formal" | "eli5">("eli5");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentContent = files[activeFile] || "";
  const lines = currentContent.split("\n");
  const lineCount = lines.length;

  const selectedExplanation: LineExplanation | null =
    selectedLineIndex !== null && lines[selectedLineIndex] !== undefined
      ? explainHclLine(lines[selectedLineIndex], selectedLineIndex + 1, lines)
      : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInsertSnippet = (snippetCode: string) => {
    const newContent = currentContent ? `${currentContent}\n\n${snippetCode}` : snippetCode;
    onCodeChange(activeFile, newContent);
    setShowSnippets(false);
  };

  const handleSelectTextareaLine = () => {
    if (textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart;
      const textBeforeCursor = textareaRef.current.value.substring(0, cursorPosition);
      const lineNumber = textBeforeCursor.split("\n").length - 1;
      setSelectedLineIndex(lineNumber);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#18181B] border-r border-stone-200 text-zinc-100 relative">
      {/* File Tabs & Actions Header */}
      <div className="flex items-center justify-between border-b border-stone-800 bg-[#121214] px-3 py-1.5 relative z-40">
        {/* File Tabs & Step Badge */}
        <div className="flex-1 min-w-0 flex items-center space-x-2 overflow-x-auto custom-scrollbar pr-2">
          {showStepBadge && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono tracking-tight shrink-0 flex items-center space-x-1" title="Workflow Step 2: Edit your HCL infrastructure code here">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>② 2. Write HCL</span>
            </span>
          )}
          {Object.keys(files).map((fileName) => {
            const isActive = fileName === activeFile;
            return (
              <button
                key={fileName}
                id={`tab-${fileName.replace(/[^a-zA-Z0-9]/g, "-")}`}
                onClick={() => onSelectFile(fileName)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#18181B] text-zinc-100 border border-zinc-700 shadow-xs font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
                title={`Switch active file: ${fileName}`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{fileName}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center space-x-1.5 pl-2 shrink-0 relative z-50">
          {/* Insert Snippet Dropdown */}
          <div className="relative">
            <button
              id="btn-snippets"
              onClick={() => setShowSnippets(!showSnippets)}
              className={`px-2 py-1 rounded-md border text-xs flex items-center space-x-1 transition-all cursor-pointer ${
                showSnippets
                  ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-xs"
                  : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
              }`}
              title="Insert HCL Resource Snippet (VPC, EC2, S3, RDS, etc.)"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium hidden sm:inline text-[11px]">Snippets</span>
            </button>

            {showSnippets && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div
                  className="fixed inset-0 z-[90] bg-transparent"
                  onClick={() => setShowSnippets(false)}
                />
                {/* Dropdown Menu - explicitly forced to front z-[100] */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e1e24] border border-amber-500/50 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[100] py-1.5 text-zinc-100 divide-y divide-zinc-800/80 backdrop-blur-md">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Insert HCL Template</span>
                    <span className="text-[9px] text-zinc-400 lowercase font-normal">click to insert</span>
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {SNIPPETS.map((snip) => (
                      <button
                        key={snip.name}
                        onClick={() => handleInsertSnippet(snip.code)}
                        className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/90 hover:text-amber-300 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-medium text-[11.5px]">{snip.name}</span>
                        <span className="text-[9.5px] text-zinc-400 group-hover:text-amber-400 font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700">+ Insert</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Format Code */}
          <button
            id="btn-format-hcl"
            onClick={onFormatCode}
            className="p-1.5 sm:px-2 sm:py-1 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-amber-300 hover:bg-zinc-700 text-xs flex items-center space-x-1 transition-colors cursor-pointer"
            title="Auto-format HCL code (terraform fmt): Cleans up whitespace and resource alignment"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium hidden md:inline text-[11px]">Format</span>
          </button>

          {/* Validate Syntax Button - Prominent High-Visibility Button */}
          <button
            id="btn-validate-syntax"
            onClick={onValidateCode}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer border ${
              validationStatus
                ? validationStatus.valid
                  ? "bg-emerald-950/90 text-emerald-300 border-emerald-500 hover:bg-emerald-900"
                  : "bg-rose-950/90 text-rose-300 border-rose-500 hover:bg-rose-900"
                : "bg-emerald-950/40 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/60 hover:text-white hover:border-emerald-400"
            }`}
            title="Check Terraform HCL syntax & block schema (Runs terraform validate simulation)"
          >
            <CheckCheck
              className={`w-3.5 h-3.5 ${
                validationStatus
                  ? validationStatus.valid
                    ? "text-emerald-400"
                    : "text-rose-400"
                  : "text-emerald-400"
              }`}
            />
            <span className="text-[11px] whitespace-nowrap">Validate Syntax</span>
            {validationStatus && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  validationStatus.valid ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-pulse"
                }`}
              />
            )}
          </button>

          {/* Copy code - Compact Icon with Hover Tooltip */}
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy current file contents to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Code - Compact Icon with Hover Tooltip */}
          <button
            id="btn-reset-code"
            onClick={onResetCode}
            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset code editor back to initial starter lab code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Area with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs bg-[#18181B] z-10">
        {/* Line Numbers with Click to Inspect */}
        <div className="w-10 py-3 bg-[#141416] border-r border-zinc-800 text-zinc-600 select-none text-right pr-2 font-mono text-[11px] leading-5 shrink-0">
          {Array.from({ length: Math.max(lineCount, 16) }).map((_, i) => {
            const isSelected = selectedLineIndex === i;
            return (
              <div
                key={i}
                onClick={() => setSelectedLineIndex(isSelected ? null : i)}
                className={`cursor-pointer transition-colors px-0.5 rounded ${
                  isSelected
                    ? "bg-indigo-600 text-white font-bold"
                    : "hover:text-amber-400 hover:bg-zinc-800"
                }`}
                title={`Click to inspect Line ${i + 1}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          id="hcl-code-editor"
          value={currentContent}
          onChange={(e) => onCodeChange(activeFile, e.target.value)}
          onClick={handleSelectTextareaLine}
          onKeyUp={handleSelectTextareaLine}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-zinc-100 resize-none focus:outline-none font-mono text-xs leading-5 custom-scrollbar selection:bg-stone-700/60"
          placeholder="# Enter your Terraform HCL code here..."
        />
      </div>

      {/* Embedded Dual-Mode Line Explainer Drawer */}
      {selectedExplanation && (
        <div className="border-t border-zinc-800 bg-[#16161a] p-3 text-xs z-20 shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono text-[10px] font-bold shrink-0">
                Line {selectedExplanation.lineNum}
              </span>
              <span className="font-mono text-[11px] text-zinc-300 truncate max-w-[220px] sm:max-w-md">
                {selectedExplanation.rawText.trim() || "(empty line)"}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {/* Mode Switcher */}
              <div className="flex items-center p-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setExplainerMode("eli5")}
                  className={`flex items-center space-x-1 py-0.5 px-2 rounded-md font-medium text-[10.5px] transition-all cursor-pointer ${
                    explainerMode === "eli5"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Baby className="w-3 h-3" />
                  <span>Like I'm 5</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExplainerMode("formal")}
                  className={`flex items-center space-x-1 py-0.5 px-2 rounded-md font-medium text-[10.5px] transition-all cursor-pointer ${
                    explainerMode === "formal"
                      ? "bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Professional</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedLineIndex(null)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                title="Close Line Explainer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11.5px] font-sans leading-relaxed">
            {explainerMode === "eli5" ? (
              <div className="flex items-start space-x-2 text-amber-200/90">
                <span className="text-sm">🧸</span>
                <p className="leading-relaxed">
                  {selectedExplanation.eli5}
                </p>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-zinc-200">
                <span className="text-sm">💼</span>
                <p className="leading-relaxed">
                  {selectedExplanation.formal}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Status Footer */}
      {validationStatus && (
        <div
          className={`px-3 py-1.5 border-t text-xs flex items-center justify-between shrink-0 z-10 ${
            validationStatus.valid
              ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
              : "bg-rose-950/60 border-rose-800/60 text-rose-300"
          }`}
        >
          <div className="flex items-center space-x-1.5 overflow-hidden">
            {validationStatus.valid ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate font-mono">HCL Syntax Valid (terraform validate passed)</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate font-mono">{validationStatus.errors[0] || "Validation errors detected"}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
