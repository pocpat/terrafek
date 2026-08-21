import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Server,
  Database,
  Network,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HardDrive,
  Globe,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Activity,
  Lock,
  Cpu,
  Moon,
  Sun,
  Gauge
} from "lucide-react";
import { motion } from "motion/react";
import { ParsedResource, TerraformStateFile } from "../types/terraform";
import { ThemeAnimationControls } from "./ThemeAnimationControls";
import { safeGetItem, safeSetItem } from "../utils/safeStorage";

interface VisualTopologyProps {
  resources: ParsedResource[];
  state: TerraformStateFile;
  onSelectResource: (resource: ParsedResource) => void;
  selectedResourceId?: string | null;
}

export const VisualTopology: React.FC<VisualTopologyProps> = ({
  resources,
  state,
  onSelectResource,
  selectedResourceId,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [themeMode, setThemeMode] = useState<"cyber" | "light">(() => {
    const saved = safeGetItem("tf_topology_theme");
    return saved === "light" ? "light" : "cyber";
  });
  const [isAnimated, setIsAnimated] = useState<boolean>(() => {
    const saved = safeGetItem("tf_topology_animated");
    return saved !== null ? saved === "true" : true;
  });
  const [animSpeed, setAnimSpeed] = useState<number>(1);

  const toggleTheme = (theme: "cyber" | "light") => {
    setThemeMode(theme);
    safeSetItem("tf_topology_theme", theme);
  };

  const toggleAnimation = (val: boolean) => {
    setIsAnimated(val);
    safeSetItem("tf_topology_animated", String(val));
  };

  // Group resources into hierarchy
  const vpcResources = resources.filter((r) => r.type === "aws_vpc");
  const subnetResources = resources.filter((r) => r.type === "aws_subnet");
  const computeResources = resources.filter((r) => r.type === "aws_instance");
  const storageResources = resources.filter((r) => r.type === "aws_s3_bucket");
  const dbResources = resources.filter((r) => r.type.includes("db") || r.type.includes("rds"));
  const sgResources = resources.filter((r) => r.type.includes("security_group"));
  const lbResources = resources.filter((r) => r.type.includes("lb") || r.type.includes("alb"));
  const otherResources = resources.filter(
    (r) =>
      !vpcResources.includes(r) &&
      !subnetResources.includes(r) &&
      !computeResources.includes(r) &&
      !storageResources.includes(r) &&
      !dbResources.includes(r) &&
      !sgResources.includes(r) &&
      !lbResources.includes(r)
  );

  const getResourceStatus = (res: ParsedResource): "applied" | "planned" | "drifted" | "pending" => {
    const inState = state.resources.find((r) => `${r.type}.${r.name}` === res.id);
    if (inState) {
      if (res.driftValue) return "drifted";
      return "applied";
    }
    return "planned";
  };

  const getStatusBadge = (status: "applied" | "planned" | "drifted" | "pending") => {
    if (themeMode === "cyber") {
      switch (status) {
        case "applied":
          return (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 flex items-center space-x-1 shadow-[0_0_8px_rgba(46,204,113,0.3)]">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isAnimated ? "animate-pulse" : ""}`} />
              <span>Active</span>
            </span>
          );
        case "drifted":
          return (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-500/60 flex items-center space-x-1 shadow-[0_0_8px_rgba(231,76,60,0.3)]">
              <span className={`w-1.5 h-1.5 rounded-full bg-rose-400 ${isAnimated ? "animate-ping" : ""}`} />
              <span>Drifted</span>
            </span>
          );
        case "planned":
        default:
          return (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/60 flex items-center space-x-1 shadow-[0_0_8px_rgba(255,153,0,0.3)]">
              <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${isAnimated ? "animate-pulse" : ""}`} />
              <span>Planned (+)</span>
            </span>
          );
      }
    } else {
      switch (status) {
        case "applied":
          return (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80 flex items-center space-x-1 shadow-2xs">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-600 ${isAnimated ? "animate-pulse" : ""}`} />
              <span>Active</span>
            </span>
          );
        case "drifted":
          return (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1 shadow-2xs">
              <span className={`w-1.5 h-1.5 rounded-full bg-rose-600 ${isAnimated ? "animate-ping" : ""}`} />
              <span>Drifted</span>
            </span>
          );
        case "planned":
        default:
          return (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center space-x-1 shadow-2xs">
              <span className={`w-1.5 h-1.5 rounded-full bg-amber-600 ${isAnimated ? "animate-pulse" : ""}`} />
              <span>Planned (+)</span>
            </span>
          );
      }
    }
  };

  const isDark = themeMode === "cyber";

  return (
    <div className={`flex flex-col h-full overflow-hidden relative select-none font-sans transition-colors duration-300 ${
      isDark ? "bg-[#040D1E] text-slate-100" : "bg-[#F7F7F5] text-stone-900"
    }`}>
      {/* Top Diagram Controls */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b z-20 shadow-xs ${
        isDark ? "bg-[#071428] border-cyan-950/80" : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center space-x-2">
          <Layers className={`w-3.5 h-3.5 ${isDark ? "text-cyan-400" : "text-stone-700"}`} />
          <span className={`text-xs font-serif font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Live Cloud Architecture Map
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
            isDark ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/60" : "bg-stone-100 text-stone-600 border-stone-200"
          }`}>
            {resources.length} {resources.length === 1 ? "Node" : "Nodes"}
          </span>
        </div>

        {/* Theme, Static/Animated, & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Shared Theme & Animation Icon Controls */}
          <ThemeAnimationControls
            themeMode={themeMode}
            onToggleTheme={toggleTheme}
            isAnimated={isAnimated}
            onToggleAnimation={toggleAnimation}
            animSpeed={animSpeed}
            onSpeedChange={setAnimSpeed}
          />

          {/* Zoom Controls */}
          <div className={`flex items-center space-x-0.5 border rounded-lg p-0.5 shadow-2xs ${
            isDark ? "bg-[#020a16] border-cyan-900/60" : "bg-stone-100 border-stone-200"
          }`}>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
              title="Zoom Out (70% - 140%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`text-[9.5px] font-mono px-1 font-semibold ${isDark ? "text-cyan-300" : "text-stone-700"}`}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
              title="Zoom In (70% - 140%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
              title="Reset Zoom to 100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Canvas */}
      <div className="flex-1 overflow-auto p-5 flex items-center justify-center custom-scrollbar relative">
        {/* Background Grid & Stars in Cosmic Mode */}
        {isDark ? (
          <>
            <div
              className="absolute inset-0 opacity-[0.25] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#00d4c8 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Subtle glow aura */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-600/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#A8A29E 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        )}

        {resources.length === 0 ? (
          <div className={`text-center p-8 max-w-sm rounded-2xl border shadow-xs ${
            isDark ? "bg-[#071428]/90 border-cyan-900/60 text-slate-200" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-3 ${
              isDark ? "bg-cyan-950/60 text-cyan-400 border-cyan-800/60 shadow-[0_0_15px_rgba(0,212,200,0.2)]" : "bg-stone-100 border-stone-200 text-stone-600"
            }`}>
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-serif font-bold">No Infrastructure Declared Yet</h4>
            <p className={`text-xs mt-1 leading-relaxed font-sans ${isDark ? "text-slate-400" : "text-stone-500"}`}>
              Write HCL code in the editor or run a lab task to watch the cloud topology generate dynamically in real-time.
            </p>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 ease-out space-y-5 w-full max-w-4xl relative z-10"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
          >
            {/* 1. Global / Standalone Storage Tier (S3) - Green/Teal Glowing Card */}
            {storageResources.length > 0 && (
              <div className={`border rounded-2xl p-4 shadow-lg transition-all ${
                isDark
                  ? "bg-gradient-to-br from-[#071a2a]/95 via-[#061826]/90 to-[#040f1a]/95 border-teal-500/40 shadow-[0_0_25px_rgba(0,212,200,0.08)]"
                  : "bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/30 border-amber-200/90"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                      isDark ? "bg-teal-950/90 text-teal-300 border-teal-500/60 shadow-[0_0_8px_rgba(0,212,200,0.3)]" : "bg-amber-100 text-amber-800 border-amber-300/80"
                    }`}>
                      <HardDrive className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-serif font-bold tracking-tight ${isDark ? "text-teal-200" : "text-amber-950"}`}>
                      Global Object Storage Tier (AWS S3)
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? "bg-teal-950/60 text-teal-300 border-teal-700/60" : "bg-amber-100/80 text-amber-800 border-amber-200"
                  }`}>
                    Global Edge Endpoint
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {storageResources.map((res) => {
                    const status = getResourceStatus(res);
                    const isSelected = selectedResourceId === res.id;
                    return (
                      <div
                        key={res.id}
                        onClick={() => onSelectResource(res)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isDark
                            ? isSelected
                              ? "border-teal-400 bg-[#0c2438] ring-2 ring-teal-400 shadow-[0_0_15px_rgba(0,212,200,0.3)] scale-[1.01]"
                              : "border-teal-500/30 bg-[#081b2a]/80 hover:bg-[#0c2438]/90 hover:border-teal-400 shadow-md"
                            : isSelected
                            ? "border-amber-600 ring-2 ring-amber-400 bg-amber-100/90 shadow-md scale-[1.01]"
                            : "border-amber-200/90 bg-white/95 hover:bg-amber-50/60 hover:border-amber-400 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className={`p-2 rounded-lg border ${
                              isDark ? "bg-teal-950/90 text-teal-300 border-teal-500/50" : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}>
                              <HardDrive className="w-4 h-4" />
                            </div>
                            <div>
                              <div className={`text-xs font-bold font-mono ${isDark ? "text-teal-100" : "text-amber-950"}`}>{res.name}</div>
                              <div className={`text-[10px] font-mono ${isDark ? "text-teal-400/80" : "text-amber-700/80"}`}>{res.type}</div>
                            </div>
                          </div>
                          {getStatusBadge(status)}
                        </div>

                        {res.attributes.bucket && (
                          <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10.5px] ${
                            isDark ? "border-teal-900/60" : "border-amber-100/90"
                          }`}>
                            <span className={isDark ? "text-teal-400/80" : "text-amber-800/80"}>Bucket:</span>
                            <span className={`font-mono font-medium truncate max-w-[140px] px-1.5 py-0.2 rounded ${
                              isDark ? "text-teal-200 bg-teal-950/80 border border-teal-800/60" : "text-amber-950 bg-amber-100/60"
                            }`}>
                              {res.attributes.bucket}
                            </span>
                          </div>
                        )}

                        {/* Animated Flowing Shimmer Bead on Applied Node */}
                        {isAnimated && status === "applied" && (
                          <div className={`mt-2 w-full h-1 rounded-full overflow-hidden relative ${
                            isDark ? "bg-teal-950/80" : "bg-amber-200/70"
                          }`}>
                            <motion.div
                              className={`h-full w-10 rounded-full ${
                                isDark ? "bg-teal-400 shadow-[0_0_8px_#00d4c8]" : "bg-emerald-500"
                              }`}
                              initial={{ left: "-20%" }}
                              animate={{ left: "100%" }}
                              transition={{ duration: 2.2 / animSpeed, repeat: Infinity, ease: "linear" }}
                              style={{ position: "relative" }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Virtual Private Cloud (VPC) Boundary Box - Azure/Sky Glowing Container */}
            {vpcResources.length > 0 ? (
              vpcResources.map((vpc) => {
                const isVpcSelected = selectedResourceId === vpc.id;
                const vpcStatus = getResourceStatus(vpc);

                return (
                  <div
                    key={vpc.id}
                    className={`border-2 border-dashed rounded-3xl p-4.5 transition-all shadow-lg ${
                      isDark
                        ? isVpcSelected
                          ? "bg-gradient-to-br from-[#071933]/90 via-[#061426]/90 to-[#040f1f]/90 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_30px_rgba(0,170,255,0.18)]"
                          : "bg-gradient-to-br from-[#071933]/70 via-[#061426]/60 to-[#040f1f]/70 border-cyan-500/40 hover:border-cyan-400/70"
                        : isVpcSelected
                        ? "bg-gradient-to-br from-sky-50/70 via-indigo-50/40 to-slate-50/50 border-sky-600 ring-2 ring-sky-300 shadow-md"
                        : "bg-gradient-to-br from-sky-50/70 via-indigo-50/40 to-slate-50/50 border-sky-300/90 hover:border-sky-400"
                    }`}
                  >
                    {/* VPC Header */}
                    <div
                      onClick={() => onSelectResource(vpc)}
                      className={`flex items-center justify-between mb-3.5 pb-2.5 border-b cursor-pointer ${
                        isDark ? "border-cyan-900/60" : "border-sky-200/80"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl border ${
                          isDark ? "bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,170,255,0.3)]" : "bg-sky-100 text-sky-800 border-sky-200"
                        }`}>
                          <Network className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold font-serif tracking-tight ${isDark ? "text-cyan-100" : "text-sky-950"}`}>
                              {vpc.name}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                              isDark ? "bg-cyan-950/90 text-cyan-300 border-cyan-700/60" : "bg-sky-100 text-sky-900 border-sky-200"
                            }`}>
                              {vpc.attributes.cidr_block || "10.0.0.0/16"}
                            </span>
                          </div>
                          <div className={`text-[10px] font-mono ${isDark ? "text-cyan-400/70" : "text-sky-700/80"}`}>
                            aws_vpc isolated network boundary
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(vpcStatus)}
                    </div>

                    {/* Subnets Inside VPC */}
                    <div className="space-y-3.5">
                      {subnetResources.length > 0 ? (
                        subnetResources.map((sub) => {
                          const isSubSelected = selectedResourceId === sub.id;
                          const subStatus = getResourceStatus(sub);

                          // Instances in this subnet
                          const attachedInstances = computeResources.filter((c) => {
                            if (c.attributes.subnet_id) {
                              return (
                                String(c.attributes.subnet_id).includes(sub.name) ||
                                String(c.attributes.subnet_id).includes(sub.id)
                              );
                            }
                            return true;
                          });

                          return (
                            <div
                              key={sub.id}
                              className={`border rounded-2xl p-3.5 transition-all ${
                                isDark
                                  ? isSubSelected
                                    ? "bg-[#06202e] border-teal-400 ring-2 ring-teal-400/40 shadow-[0_0_15px_rgba(0,212,200,0.25)]"
                                    : "bg-[#051722]/80 border-teal-500/30 hover:border-teal-400/60"
                                  : isSubSelected
                                  ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-300 shadow-md"
                                  : "bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-200/90 hover:border-emerald-400"
                              }`}
                            >
                              <div
                                onClick={() => onSelectResource(sub)}
                                className="flex items-center justify-between mb-2.5 cursor-pointer"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`p-1.5 rounded-lg border ${
                                    isDark ? "bg-teal-950/90 text-teal-300 border-teal-500/50" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  }`}>
                                    <Globe className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-xs font-bold font-mono ${isDark ? "text-teal-200" : "text-emerald-950"}`}>
                                    {sub.name}
                                  </span>
                                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-medium ${
                                    isDark ? "bg-teal-950/80 border-teal-700/60 text-teal-300" : "bg-white border-emerald-200 text-emerald-900"
                                  }`}>
                                    {sub.attributes.cidr_block || "10.0.1.0/24"}
                                  </span>
                                </div>
                                {getStatusBadge(subStatus)}
                              </div>

                              {/* Compute Nodes in Subnet - Orange Glowing EC2 Pods */}
                              {attachedInstances.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                                  {attachedInstances.map((instance) => {
                                    const isInstSelected = selectedResourceId === instance.id;
                                    const instStatus = getResourceStatus(instance);
                                    return (
                                      <div
                                        key={instance.id}
                                        onClick={() => onSelectResource(instance)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                          isDark
                                            ? isInstSelected
                                              ? "border-orange-400 bg-[#241708] ring-2 ring-orange-400 shadow-[0_0_15px_rgba(255,153,0,0.3)] scale-[1.01]"
                                              : "border-orange-500/40 bg-[#170f05]/90 hover:bg-[#201507] hover:border-orange-400 shadow-md"
                                            : isInstSelected
                                            ? "border-indigo-600 ring-2 ring-indigo-400 bg-indigo-100/90 shadow-md scale-[1.01]"
                                            : "border-indigo-200/90 bg-white/95 hover:bg-indigo-50/60 hover:border-indigo-400 shadow-xs"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-2">
                                            <div className={`p-1.5 rounded-lg border ${
                                              isDark ? "bg-orange-950/90 text-orange-300 border-orange-500/50 shadow-[0_0_8px_rgba(255,153,0,0.3)]" : "bg-indigo-100 text-indigo-800 border-indigo-200"
                                            }`}>
                                              <Server className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                              <div className={`text-xs font-bold font-mono ${isDark ? "text-orange-100" : "text-indigo-950"}`}>
                                                {instance.name}
                                              </div>
                                              <div className={`text-[10px] font-mono ${isDark ? "text-orange-400/80" : "text-indigo-700/80"}`}>
                                                {instance.attributes.instance_type || "t3.micro"}
                                              </div>
                                            </div>
                                          </div>
                                          {getStatusBadge(instStatus)}
                                        </div>

                                        {instance.attributes.ami && (
                                          <div className={`mt-2 text-[10px] font-mono truncate px-1.5 py-0.5 rounded border ${
                                            isDark ? "text-orange-300 bg-orange-950/60 border-orange-800/60" : "text-indigo-900 bg-indigo-50/80 border-indigo-100"
                                          }`}>
                                            AMI: {instance.attributes.ami}
                                          </div>
                                        )}

                                        {/* Animated Shimmer Bar on Applied Instance */}
                                        {isAnimated && instStatus === "applied" && (
                                          <div className={`mt-2 w-full h-1 rounded-full overflow-hidden relative ${
                                            isDark ? "bg-orange-950/80" : "bg-indigo-200/70"
                                          }`}>
                                            <motion.div
                                              className={`h-full w-8 rounded-full ${
                                                isDark ? "bg-orange-400 shadow-[0_0_8px_#ff9900]" : "bg-indigo-600"
                                              }`}
                                              initial={{ left: "-20%" }}
                                              animate={{ left: "100%" }}
                                              transition={{ duration: 2.0 / animSpeed, repeat: Infinity, ease: "linear" }}
                                              style={{ position: "relative" }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className={`text-[10.5px] italic py-2 text-center border border-dashed rounded-lg font-sans ${
                                  isDark ? "text-teal-400/60 border-teal-900/60 bg-teal-950/30" : "text-emerald-800/70 border-emerald-200 bg-emerald-50/50"
                                }`}>
                                  No compute nodes attached to this subnet yet
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        /* If VPC exists but no subnet, show compute directly */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {computeResources.map((instance) => {
                            const isInstSelected = selectedResourceId === instance.id;
                            const instStatus = getResourceStatus(instance);
                            return (
                              <div
                                key={instance.id}
                                onClick={() => onSelectResource(instance)}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                  isDark
                                    ? isInstSelected
                                      ? "border-orange-400 bg-[#241708] ring-2 ring-orange-400 shadow-[0_0_15px_rgba(255,153,0,0.3)]"
                                      : "border-orange-500/40 bg-[#170f05]/90 hover:bg-[#201507] hover:border-orange-400 shadow-md"
                                    : isInstSelected
                                    ? "border-indigo-600 ring-2 ring-indigo-400 bg-indigo-100/90 shadow-md"
                                    : "border-indigo-200/90 bg-white/95 hover:bg-indigo-50/60 hover:border-indigo-400 shadow-xs"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-lg border ${
                                      isDark ? "bg-orange-950/90 text-orange-300 border-orange-500/50" : "bg-indigo-100 text-indigo-800 border-indigo-200"
                                    }`}>
                                      <Server className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className={`text-xs font-bold font-mono ${isDark ? "text-orange-100" : "text-indigo-950"}`}>
                                        {instance.name}
                                      </div>
                                      <div className={`text-[10px] font-mono ${isDark ? "text-orange-400/80" : "text-indigo-700"}`}>
                                        {instance.attributes.instance_type || "t3.micro"}
                                      </div>
                                    </div>
                                  </div>
                                  {getStatusBadge(instStatus)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Fallback if no VPC, render compute nodes directly */
              computeResources.length > 0 && (
                <div className={`border rounded-2xl p-4 shadow-lg ${
                  isDark ? "bg-[#100a03]/90 border-orange-500/40" : "bg-gradient-to-br from-indigo-50/80 via-sky-50/40 to-slate-50/40 border-indigo-200/90"
                }`}>
                  <div className={`text-xs font-serif font-bold uppercase tracking-wider mb-3 flex items-center space-x-2 ${
                    isDark ? "text-orange-300" : "text-indigo-950"
                  }`}>
                    <div className={`p-1 rounded ${isDark ? "bg-orange-950 text-orange-300" : "bg-indigo-100 text-indigo-800"}`}>
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <span>Compute Tier (Standalone EC2)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {computeResources.map((instance) => {
                      const isInstSelected = selectedResourceId === instance.id;
                      const instStatus = getResourceStatus(instance);
                      return (
                        <div
                          key={instance.id}
                          onClick={() => onSelectResource(instance)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isDark
                              ? isInstSelected
                                ? "border-orange-400 bg-[#241708] ring-2 ring-orange-400 shadow-[0_0_15px_rgba(255,153,0,0.3)]"
                                : "border-orange-500/40 bg-[#170f05]/90 hover:border-orange-400 shadow-md"
                              : isInstSelected
                              ? "border-indigo-600 ring-2 ring-indigo-400 bg-indigo-100/90 shadow-md"
                              : "border-indigo-200/90 bg-white/95 hover:bg-indigo-50/60 hover:border-indigo-400 shadow-xs"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg border ${
                                isDark ? "bg-orange-950 text-orange-300 border-orange-500/50" : "bg-indigo-100 text-indigo-800 border-indigo-200"
                              }`}>
                                <Server className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`text-xs font-bold font-mono ${isDark ? "text-orange-100" : "text-indigo-950"}`}>{instance.name}</div>
                                <div className={`text-[10px] font-mono ${isDark ? "text-orange-400/80" : "text-indigo-700"}`}>
                                  {instance.attributes.instance_type || "t3.micro"}
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(instStatus)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {/* 3. Database & Load Balancer Tier - Azure Blue & Purple Glowing Cubes */}
            {(dbResources.length > 0 || lbResources.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* RDS Database - Azure Blue Glowing Cube */}
                {dbResources.map((db) => {
                  const isDbSelected = selectedResourceId === db.id;
                  const dbStatus = getResourceStatus(db);
                  return (
                    <div
                      key={db.id}
                      onClick={() => onSelectResource(db)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isDark
                          ? isDbSelected
                            ? "border-blue-400 bg-[#081a33] ring-2 ring-blue-400 shadow-[0_0_15px_rgba(0,120,212,0.4)] scale-[1.01]"
                            : "border-blue-500/40 bg-[#051224]/90 hover:border-blue-400 shadow-md"
                          : isDbSelected
                          ? "border-purple-600 ring-2 ring-purple-400 bg-purple-100/90 shadow-md scale-[1.01]"
                          : "border-purple-200/90 bg-gradient-to-br from-purple-50/90 to-fuchsia-50/50 hover:border-purple-400 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-xl border ${
                            isDark ? "bg-blue-950/90 text-blue-300 border-blue-500/50 shadow-[0_0_8px_rgba(0,120,212,0.3)]" : "bg-purple-100 text-purple-800 border-purple-300"
                          }`}>
                            <Database className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold font-mono ${isDark ? "text-blue-100" : "text-purple-950"}`}>{db.name}</div>
                            <div className={`text-[10px] font-mono ${isDark ? "text-blue-400/80" : "text-purple-800/80"}`}>
                              {db.attributes.engine || "postgres"} • {db.attributes.instance_class || "db.t3.medium"}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(dbStatus)}
                      </div>

                      {/* Animated Shimmer on Applied Database */}
                      {isAnimated && dbStatus === "applied" && (
                        <div className={`mt-2.5 w-full h-1 rounded-full overflow-hidden relative ${
                          isDark ? "bg-blue-950/80" : "bg-purple-200/70"
                        }`}>
                          <motion.div
                            className={`h-full w-8 rounded-full ${
                              isDark ? "bg-blue-400 shadow-[0_0_8px_#0078d4]" : "bg-purple-600"
                            }`}
                            initial={{ left: "-20%" }}
                            animate={{ left: "100%" }}
                            transition={{ duration: 2.3 / animSpeed, repeat: Infinity, ease: "linear" }}
                            style={{ position: "relative" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Load Balancer - Purple Glowing ALB */}
                {lbResources.map((lb) => {
                  const isLbSelected = selectedResourceId === lb.id;
                  const lbStatus = getResourceStatus(lb);
                  return (
                    <div
                      key={lb.id}
                      onClick={() => onSelectResource(lb)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isDark
                          ? isLbSelected
                            ? "border-purple-400 bg-[#1c0c2e] ring-2 ring-purple-400 shadow-[0_0_15px_rgba(155,89,245,0.4)] scale-[1.01]"
                            : "border-purple-500/40 bg-[#140822]/90 hover:border-purple-400 shadow-md"
                          : isLbSelected
                          ? "border-teal-600 ring-2 ring-teal-400 bg-teal-100/90 shadow-md scale-[1.01]"
                          : "border-teal-200/90 bg-gradient-to-br from-teal-50/90 to-cyan-50/50 hover:border-teal-400 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-xl border ${
                            isDark ? "bg-purple-950/90 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(155,89,245,0.3)]" : "bg-teal-100 text-teal-800 border-teal-300"
                          }`}>
                            <Globe className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold font-mono ${isDark ? "text-purple-100" : "text-teal-950"}`}>{lb.name}</div>
                            <div className={`text-[10px] font-mono ${isDark ? "text-purple-400/80" : "text-teal-800/80"}`}>
                              Application Load Balancer (ALB)
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(lbStatus)}
                      </div>

                      {/* Animated Shimmer on Applied Load Balancer */}
                      {isAnimated && lbStatus === "applied" && (
                        <div className={`mt-2.5 w-full h-1 rounded-full overflow-hidden relative ${
                          isDark ? "bg-purple-950/80" : "bg-teal-200/70"
                        }`}>
                          <motion.div
                            className={`h-full w-8 rounded-full ${
                              isDark ? "bg-purple-400 shadow-[0_0_8px_#9b59f5]" : "bg-teal-600"
                            }`}
                            initial={{ left: "-20%" }}
                            animate={{ left: "100%" }}
                            transition={{ duration: 2.1 / animSpeed, repeat: Infinity, ease: "linear" }}
                            style={{ position: "relative" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. Security Groups & Firewalls - Coral Red Glowing Cards */}
            {sgResources.length > 0 && (
              <div className={`border rounded-2xl p-4 shadow-lg ${
                isDark ? "bg-[#1f0907]/90 border-red-500/40" : "bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-slate-50/30 border-rose-200/90"
              }`}>
                <div className={`text-xs font-serif font-bold uppercase tracking-wider mb-2.5 flex items-center space-x-2 ${
                  isDark ? "text-red-300" : "text-rose-950"
                }`}>
                  <div className={`p-1 rounded ${isDark ? "bg-red-950 text-red-300" : "bg-rose-100 text-rose-800"}`}>
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span>Security Groups & Ingress Firewalls</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sgResources.map((sg) => {
                    const isSgSelected = selectedResourceId === sg.id;
                    const sgStatus = getResourceStatus(sg);
                    return (
                      <div
                        key={sg.id}
                        onClick={() => onSelectResource(sg)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isDark
                            ? isSgSelected
                              ? "border-red-400 bg-[#2d0f0c] ring-2 ring-red-400 shadow-[0_0_15px_rgba(231,76,60,0.3)]"
                              : "border-red-500/40 bg-[#180806]/90 hover:border-red-400 shadow-md"
                            : isSgSelected
                            ? "border-rose-600 ring-2 ring-rose-400 bg-rose-100/90 shadow-md"
                            : "border-rose-200/90 bg-white/95 hover:bg-rose-50/60 hover:border-rose-400 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`text-xs font-bold font-mono ${isDark ? "text-red-100" : "text-rose-950"}`}>{sg.name}</div>
                          {getStatusBadge(sgStatus)}
                        </div>
                        <div className={`text-[10.5px] font-mono mt-1 px-1.5 py-0.2 rounded border ${
                          isDark ? "text-red-300 bg-red-950/80 border-red-800/60" : "text-rose-800/80 bg-rose-50 border-rose-100"
                        }`}>
                          {sg.attributes.name || "allow-inbound"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Other Generic Infrastructure Resources */}
            {otherResources.length > 0 && (
              <div className={`border rounded-2xl p-4 shadow-lg ${
                isDark ? "bg-[#0c1424]/90 border-cyan-800/40" : "bg-gradient-to-br from-slate-50/90 to-stone-50/60 border-slate-200/90"
              }`}>
                <div className={`text-xs font-serif font-bold uppercase tracking-wider mb-2.5 flex items-center space-x-2 ${
                  isDark ? "text-cyan-300" : "text-slate-900"
                }`}>
                  <div className={`p-1 rounded ${isDark ? "bg-cyan-950 text-cyan-300" : "bg-slate-100 text-slate-700"}`}>
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <span>Other Declared Resources</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {otherResources.map((res) => {
                    const isResSelected = selectedResourceId === res.id;
                    const resStatus = getResourceStatus(res);
                    return (
                      <div
                        key={res.id}
                        onClick={() => onSelectResource(res)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isDark
                            ? isResSelected
                              ? "border-cyan-400 bg-[#0e1e36] ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,170,255,0.3)]"
                              : "border-cyan-800/40 bg-[#071220]/90 hover:border-cyan-400 shadow-md"
                            : isResSelected
                            ? "border-slate-800 ring-2 ring-slate-400 bg-slate-100 shadow-md"
                            : "border-slate-200/90 bg-white/95 hover:border-slate-400 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`text-xs font-bold font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>{res.name}</div>
                          {getStatusBadge(resStatus)}
                        </div>
                        <div className={`text-[10px] font-mono mt-1 truncate ${isDark ? "text-cyan-400/70" : "text-slate-500"}`}>
                          {res.type}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Legend */}
      <div className={`px-3 py-1.5 border-t flex items-center justify-between text-[10.5px] font-sans shadow-xs shrink-0 ${
        isDark ? "bg-[#071428] border-cyan-950/80 text-slate-400" : "bg-white border-stone-200 text-stone-600"
      }`}>
        <div className="flex items-center space-x-3.5">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#2ecc71]" />
            <span className={isDark ? "text-slate-300" : "text-stone-700"}>Active / Applied</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#ff9900]" />
            <span className={isDark ? "text-slate-300" : "text-stone-700"}>Planned (+)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#e74c3c]" />
            <span className={isDark ? "text-slate-300" : "text-stone-700"}>Drifted</span>
          </span>
        </div>
        <span className={`hidden sm:inline font-mono text-[10px] ${isDark ? "text-cyan-400/70" : "text-stone-500"}`}>
          Click any node cube to inspect state & attributes
        </span>
      </div>
    </div>
  );
};
