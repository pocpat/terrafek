import React, { useState } from "react";
import {
  Compass,
  X,
  ChevronRight,
  BookOpen,
  Code2,
  Terminal,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  ExternalLink,
  Eye
} from "lucide-react";

interface WorkspaceOrientationGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const WORKSPACE_STEPS = [
  {
    step: 1,
    badge: "Step 1",
    title: "Read the Guide & Requirements",
    location: "Left Panel",
    icon: BookOpen,
    color: "bg-blue-600",
    lightBg: "bg-blue-50/70 border-blue-200 text-blue-950",
    whatToLookAt: "Task Checklist & Scenario Objective",
    whatToRead: "Read the scenario briefing, required resource names (e.g. `aws_vpc.main`), and expected CIDR blocks or AMI values.",
    why: "Terraform is declarative—you must first know the target architecture you want to declare before typing syntax.",
    action: "Check off tasks as you finish them or click 'Ask AI Hint' if you get stuck."
  },
  {
    step: 2,
    badge: "Step 2",
    title: "Write & Edit HCL Code",
    location: "Center Panel",
    icon: Code2,
    color: "bg-amber-600",
    lightBg: "bg-amber-50/70 border-amber-200 text-amber-950",
    whatToLookAt: "File Tabs (`main.tf`, `variables.tf`) & Code Editor",
    whatToRead: "Review starter syntax, parameter values, and code syntax markers. Click the quick snippet buttons (e.g., `+ VPC`, `+ Subnet`) for fast boilerplate insertion.",
    why: "HCL (HashiCorp Configuration Language) defines your desired infrastructure state as code, replacing manual AWS console clicking.",
    action: "Type your resources. Use the 'Validate Syntax' button to check for typo errors before running."
  },
  {
    step: 3,
    badge: "Step 3",
    title: "Execute CLI Commands",
    location: "Bottom-Right / Terminal",
    icon: Terminal,
    color: "bg-emerald-600",
    lightBg: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
    whatToLookAt: "Interactive Terminal CLI & Quick Command Buttons",
    whatToRead: "Click or type commands in standard order: `terraform init` (download provider) ➔ `terraform plan` (preview changes) ➔ `terraform apply` (create cloud resources).",
    why: "Terraform compares your HCL code against the current real-world state and shows you exact additions (+) and destructions (-) before making changes.",
    action: "Review the terminal output: `Plan: 2 to add, 0 to change, 0 to destroy` then confirm apply."
  },
  {
    step: 4,
    badge: "Step 4",
    title: "Inspect Live Cloud & State",
    location: "Right Panel Tabs",
    icon: Layers,
    color: "bg-indigo-600",
    lightBg: "bg-indigo-50/70 border-indigo-200 text-indigo-950",
    whatToLookAt: "Topology Graph, State Inspector, & Diagnostic Doctor",
    whatToRead: "Watch your VPC containers, Subnet cards, and EC2 instances appear dynamically in real time. Switch tabs to inspect `terraform.tfstate` JSON to see how Terraform tracks state internally.",
    why: "Gives you immediate visual feedback that your code successfully provisioned real, connected cloud infrastructure.",
    action: "Click any resource in the diagram to inspect its exact live attributes and dependencies."
  }
];

export const WorkspaceOrientationGuide: React.FC<WorkspaceOrientationGuideProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  if (!isOpen) {
    return null;
  }

  const currentStepInfo = WORKSPACE_STEPS.find((s) => s.step === activeStepTab) || WORKSPACE_STEPS[0];
  const StepIcon = currentStepInfo.icon;

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-slate-900 text-stone-100 border-b border-stone-800 shadow-lg relative z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        {/* Header bar of the notes */}
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
                  <span>Workspace Workflow Notes</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/80 text-[10px] text-indigo-300 font-mono">
                    4-Step Order
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-stone-400">
                Follow this exact sequence across the 3 workspace panels to build and test infrastructure smoothly.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              id="btn-close-workspace-notes"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-medium transition-colors cursor-pointer"
              title="Close these notes once you understand the workspace process"
            >
              <span>Hide Notes</span>
              <X className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* 4 Step Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 pb-2">
          {WORKSPACE_STEPS.map((s) => {
            const Icon = s.icon;
            const isSelected = activeStepTab === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStepTab(s.step)}
                className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-start space-x-2.5 ${
                  isSelected
                    ? "bg-stone-800/90 border-indigo-500 shadow-xs ring-1 ring-indigo-500/40"
                    : "bg-stone-900/60 hover:bg-stone-800/50 border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5 ${
                    isSelected ? s.color : "bg-stone-800 text-stone-300"
                  }`}
                >
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400">
                      {s.location}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </div>
                  <div className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-stone-300"}`}>
                    {s.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Details Container */}
        <div className="mt-2 bg-stone-900/90 rounded-xl p-3.5 border border-stone-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: Where to Look & What to Read */}
          <div className="space-y-1.5 md:border-r md:border-stone-800 md:pr-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono">
              <Eye className="w-3.5 h-3.5" />
              <span>1. Where to Look & Read</span>
            </div>
            <div className="text-xs text-stone-200 font-semibold">
              {currentStepInfo.location}: <span className="text-indigo-300">{currentStepInfo.whatToLookAt}</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              {currentStepInfo.whatToRead}
            </p>
          </div>

          {/* Column 2: What Action to Take */}
          <div className="space-y-1.5 md:border-r md:border-stone-800 md:pr-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
              <StepIcon className="w-3.5 h-3.5" />
              <span>2. What Action to Take</span>
            </div>
            <div className="text-xs text-white font-semibold">
              {currentStepInfo.title}
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {currentStepInfo.action}
            </p>
          </div>

          {/* Column 3: Why we do this (Concept) */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
              <Info className="w-3.5 h-3.5" />
              <span>3. Why This Matters (The "Why")</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed italic">
              "{currentStepInfo.why}"
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10.5px] text-stone-500 font-mono">
                Order: Left Panel ➔ Center ➔ Bottom CLI ➔ Right Visuals
              </span>
              {activeStepTab < 4 ? (
                <button
                  onClick={() => setActiveStepTab((prev) => Math.min(4, prev + 1))}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ready! Close Notes</span>
                  <CheckCircle2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
