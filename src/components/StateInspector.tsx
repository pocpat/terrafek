import React, { useState } from "react";
import {
  FileJson,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Server,
  HardDrive
} from "lucide-react";
import { TerraformStateFile, ParsedResource } from "../types/terraform";

interface StateInspectorProps {
  state: TerraformStateFile;
  parsedResources: ParsedResource[];
  onInjectDrift: (resourceId: string, driftedKey: string, driftedVal: any) => void;
  onRefreshState: () => void;
}

export const StateInspector: React.FC<StateInspectorProps> = ({
  state,
  parsedResources,
  onInjectDrift,
  onRefreshState,
}) => {
  const [activeTab, setActiveTab] = useState<"json" | "drift">("json");
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(state, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-stone-900 font-mono text-xs overflow-hidden">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white border-b border-stone-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="flex p-0.5 bg-stone-100 border border-stone-200 rounded-lg">
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1 rounded-md text-xs font-sans font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "json" ? "bg-stone-900 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>terraform.tfstate</span>
            </button>
            <button
              onClick={() => setActiveTab("drift")}
              className={`px-3 py-1 rounded-md text-xs font-sans font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "drift" ? "bg-stone-900 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Drift Simulator & Lab</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === "json" && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Copy State JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "json" ? (
        <div className="flex-1 p-4 overflow-auto custom-scrollbar bg-[#FDFCFA] font-mono text-xs leading-relaxed text-stone-800">
          <pre className="selection:bg-stone-200">{jsonString}</pre>
        </div>
      ) : (
        <div className="flex-1 p-5 overflow-auto custom-scrollbar bg-[#FAFAFA] space-y-5 font-sans">
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
            <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold mb-1.5 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>What is Configuration Drift?</span>
            </div>
            <p className="text-stone-700 leading-relaxed font-sans">
              Drift occurs when resources managed by Terraform are modified out-of-band (e.g. through the AWS
              Management Console or CLI scripts directly). Use this simulator to simulate manual tampering, then run{" "}
              <code className="bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-900 font-mono">terraform plan</code> to
              observe how Terraform reconciles the difference.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-stone-500 mb-3">
              Simulate Out-of-Band Cloud Changes
            </h4>

            {state.resources.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-300 rounded-xl text-xs text-stone-500 bg-white">
                No active resources in state yet. Run{" "}
                <code className="text-stone-900 font-mono font-semibold bg-stone-100 px-1 py-0.5 rounded">terraform apply</code> first to provision infrastructure.
              </div>
            ) : (
              <div className="space-y-3">
                {state.resources.map((res) => {
                  const key = `${res.type}.${res.name}`;
                  const attrs = res.instances[0]?.attributes || {};

                  return (
                    <div key={key} className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {res.type === "aws_instance" ? (
                            <Server className="w-4 h-4 text-stone-700" />
                          ) : (
                            <HardDrive className="w-4 h-4 text-amber-700" />
                          )}
                          <span className="text-xs font-bold text-stone-900 font-mono">{key}</span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-500">ID: {attrs.id || "res-001"}</span>
                      </div>

                      {/* Drift Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                        {res.type === "aws_instance" && (
                          <>
                            <button
                              onClick={() => onInjectDrift(key, "instance_type", "m5.2xlarge")}
                              className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 text-xs font-medium font-sans transition-colors flex items-center space-x-1"
                            >
                              <span>Simulate Console Resize → m5.2xlarge</span>
                            </button>
                            <button
                              onClick={() => onInjectDrift(key, "instance_type", "t2.nano")}
                              className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-medium font-sans transition-colors flex items-center space-x-1"
                            >
                              <span>Simulate Console Resize → t2.nano</span>
                            </button>
                          </>
                        )}

                        {res.type === "aws_s3_bucket" && (
                          <button
                            onClick={() => onInjectDrift(key, "bucket", "rogue-altered-bucket-name")}
                            className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 text-xs font-medium font-sans transition-colors"
                          >
                            Simulate Manual Bucket Rename
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
