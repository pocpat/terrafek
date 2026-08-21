import React, { useState } from "react";
import { GitGraph, ArrowRight, Network, Box, Server, HardDrive, Shield } from "lucide-react";
import { ParsedResource } from "../types/terraform";

interface GraphViewerProps {
  resources: ParsedResource[];
}

export const GraphViewer: React.FC<GraphViewerProps> = ({ resources }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Group into stages:
  // Stage 1: Resources with 0 dependencies (VPC, standalone S3)
  // Stage 2: Resources depending on stage 1 (Subnets, Security Groups)
  // Stage 3: Resources depending on stage 2 (Instances, Databases, ALBs)

  const stage1 = resources.filter((r) => r.dependsOn.length === 0);
  const stage2 = resources.filter((r) => r.dependsOn.length > 0 && r.dependsOn.some((d) => stage1.some((s) => s.id === d)));
  const stage3 = resources.filter((r) => !stage1.includes(r) && !stage2.includes(r));

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-stone-900 p-6 overflow-auto custom-scrollbar font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <GitGraph className="w-5 h-5 text-stone-700" />
            <h3 className="text-sm font-serif font-bold text-stone-900 tracking-tight">
              Terraform Dependency DAG (Directed Acyclic Graph)
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            Visualizes resource dependency order and parallel provisioning stages (equivalent to{" "}
            <code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded font-mono">terraform graph</code>).
          </p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center p-8 text-xs text-stone-500">
          No resources declared to construct graph. Add resources in the code editor.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
          {/* Stage 1: Root / Independent Tier */}
          <div className="space-y-4 flex-1 max-w-xs w-full">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800 text-center pb-2 border-b border-emerald-200">
              Stage 1: Parallel Roots (0 Deps)
            </div>
            <div className="space-y-3">
              {stage1.map((r) => {
                const isSelected = selectedNode === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedNode(r.id)}
                    className={`p-3.5 rounded-xl border bg-white cursor-pointer transition-all ${
                      isSelected
                        ? "border-stone-900 ring-2 ring-stone-900 shadow-md"
                        : "border-stone-200 hover:border-stone-400 shadow-xs"
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900 font-mono">{r.id}</div>
                    <div className="text-[11px] text-stone-500 mt-1 font-sans">Can provision immediately</div>
                  </div>
                );
              })}
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-stone-400 hidden md:block shrink-0" />

          {/* Stage 2: Intermediate Dependencies */}
          <div className="space-y-4 flex-1 max-w-xs w-full">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700 text-center pb-2 border-b border-stone-200">
              Stage 2: Mid Dependencies
            </div>
            <div className="space-y-3">
              {stage2.length > 0 ? (
                stage2.map((r) => {
                  const isSelected = selectedNode === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedNode(r.id)}
                      className={`p-3.5 rounded-xl border bg-white cursor-pointer transition-all ${
                        isSelected
                          ? "border-stone-900 ring-2 ring-stone-900 shadow-md"
                          : "border-stone-200 hover:border-stone-400 shadow-xs"
                      }`}
                    >
                      <div className="text-xs font-bold text-stone-900 font-mono">{r.id}</div>
                      <div className="text-[11px] text-stone-600 mt-1 font-mono">
                        Waits for: {r.dependsOn.join(", ")}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-stone-500 text-center py-6 border border-dashed border-stone-200 rounded-xl bg-white">
                  No intermediate dependencies
                </div>
              )}
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-stone-400 hidden md:block shrink-0" />

          {/* Stage 3: Dependent Leaf Tier */}
          <div className="space-y-4 flex-1 max-w-xs w-full">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-700 text-center pb-2 border-b border-stone-200">
              Stage 3: Leaf Consumers
            </div>
            <div className="space-y-3">
              {stage3.length > 0 ? (
                stage3.map((r) => {
                  const isSelected = selectedNode === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedNode(r.id)}
                      className={`p-3.5 rounded-xl border bg-white cursor-pointer transition-all ${
                        isSelected
                          ? "border-stone-900 ring-2 ring-stone-900 shadow-md"
                          : "border-stone-200 hover:border-stone-400 shadow-xs"
                      }`}
                    >
                      <div className="text-xs font-bold text-stone-900 font-mono">{r.id}</div>
                      <div className="text-[11px] text-stone-600 mt-1 font-mono">
                        Waits for: {r.dependsOn.join(", ")}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-stone-500 text-center py-6 border border-dashed border-stone-200 rounded-xl bg-white">
                  No leaf dependencies
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
