import React from "react";
import { X, Server, HardDrive, Network, Database, Shield, Box, Copy, Check } from "lucide-react";
import { ParsedResource, TerraformStateFile } from "../types/terraform";

interface ResourceInspectorDrawerProps {
  resource: ParsedResource | null;
  state: TerraformStateFile;
  onClose: () => void;
}

export const ResourceInspectorDrawer: React.FC<ResourceInspectorDrawerProps> = ({
  resource,
  state,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!resource) return null;

  const stateEntry = state.resources.find((r) => `${r.type}.${r.name}` === resource.id);
  const stateAttrs = stateEntry?.instances[0]?.attributes || {};

  const handleCopyHcl = () => {
    const lines = [
      `resource "${resource.type}" "${resource.name}" {`,
      ...Object.entries(resource.attributes).map(([k, v]) => `  ${k} = ${JSON.stringify(v)}`),
      `}`,
    ].join("\n");
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-stone-200 shadow-2xl z-40 flex flex-col text-stone-900 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-mono">{resource.id}</h3>
            <span className="text-[11px] text-stone-500 font-mono">Provider: {resource.provider}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 text-xs">
        {/* Status Box */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAFAFA] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-semibold font-sans">Provisioning Status</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                stateEntry
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {stateEntry ? "Active (In State)" : "Planned (Pending Apply)"}
            </span>
          </div>
          {stateAttrs.id && (
            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
              <span className="text-stone-500 font-sans">Cloud ID:</span>
              <span className="text-stone-900 font-mono font-semibold">{stateAttrs.id}</span>
            </div>
          )}
          {stateAttrs.arn && (
            <div className="flex items-center justify-between text-[11px] truncate">
              <span className="text-stone-500 font-sans">ARN:</span>
              <span className="text-stone-700 font-mono truncate max-w-[220px]">{stateAttrs.arn}</span>
            </div>
          )}
        </div>

        {/* Declared HCL Arguments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-stone-500">
              Declared HCL Attributes
            </h4>
            <button
              onClick={handleCopyHcl}
              className="text-[11px] text-stone-600 hover:text-stone-900 font-sans flex items-center space-x-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy Block"}</span>
            </button>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 font-mono text-[11.5px] space-y-1.5 custom-scrollbar overflow-x-auto">
            {Object.keys(resource.attributes).length === 0 ? (
              <span className="text-stone-400 italic">No attributes declared</span>
            ) : (
              Object.entries(resource.attributes).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between">
                  <span className="text-stone-600">{key}:</span>
                  <span className="text-stone-900 font-medium text-right ml-2 break-all">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-stone-500 mb-2">Dependencies</h4>
          {resource.dependsOn.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {resource.dependsOn.map((dep) => (
                <span
                  key={dep}
                  className="px-2 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-800 font-mono text-[11px]"
                >
                  {dep}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 italic text-[11px] font-sans">No dependencies (Root Resource)</p>
          )}
        </div>
      </div>
    </div>
  );
};
