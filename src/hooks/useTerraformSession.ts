import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  createEmptyState,
  formatHclString,
  runTerraformValidate,
  runTerraformPlan,
  applyTerraform,
  destroyTerraform,
  evaluateConsoleExpression,
  type ValidationError,
} from "../utils/terraformEngine";
import { parseHclCode } from "../utils/hclParser";
import {
  TerraformStateFile,
  TerminalCommandLog,
  LabDefinition,
  VisualWalkthrough,
  RemediationDrill,
  LoggedErrorEvent,
} from "../types/terraform";
import type { AppMode } from "./useNavigation";
import type { ActiveTabMode } from "./useNavigation";
import type { WorkspaceViewMode } from "./useWorkspaceLayout";

export interface TerraformSessionState {
  files: Record<string, string>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeFile: string;
  setActiveFile: React.Dispatch<React.SetStateAction<string>>;
  tfState: TerraformStateFile;
  setTfState: React.Dispatch<React.SetStateAction<TerraformStateFile>>;
  terminalLogs: TerminalCommandLog[];
  setTerminalLogs: React.Dispatch<React.SetStateAction<TerminalCommandLog[]>>;
  isExecuting: boolean;
  parsedData: ReturnType<typeof parseHclCode>;
  validationStatus: { valid: boolean; errors: string[]; detailedErrors?: ValidationError[] } | null;
  setValidationStatus: React.Dispatch<React.SetStateAction<{ valid: boolean; errors: string[]; detailedErrors?: ValidationError[] } | null>>;
  activeRightTab: ActiveTabMode;
  setActiveRightTab: React.Dispatch<React.SetStateAction<ActiveTabMode>>;
  addTerminalLog: (command: string, output: string, isError?: boolean) => void;
  handleCodeChange: (fileName: string, content: string) => void;
  handleFormatCode: () => void;
  handleValidateCode: () => void;
  handleResetCode: () => void;
  handleRunCommand: (rawCmd: string) => void;
  handleInjectDrift: (resourceId: string, driftedKey: string, driftedVal: any) => void;
  handleLoadWalkthroughExample: (exampleFiles: Record<string, string>, commandToRun?: string) => void;
}

interface UseTerraformSessionParams {
  activeMode: AppMode;
  currentLab: LabDefinition;
  currentWalkthrough: VisualWalkthrough;
  currentDrill: RemediationDrill;
  currentLabIndex: number;
  currentWalkthroughIndex: number;
  currentDrillIndex: number;
  completedLabIds: string[];
  setCompletedLabIds: React.Dispatch<React.SetStateAction<string[]>>;
  setTotalXp: React.Dispatch<React.SetStateAction<number>>;
  setWorkspaceViewMode: React.Dispatch<React.SetStateAction<WorkspaceViewMode>>;
  loggedErrors: LoggedErrorEvent[];
  setLoggedErrors: React.Dispatch<React.SetStateAction<LoggedErrorEvent[]>>;
  logNewError: (message: string, source: LoggedErrorEvent["source"], command?: string) => void;
}

/**
 * Manages the core Terraform simulation session:
 * - Multi-file code editor state (files, active file)
 * - Simulated Terraform state + terminal logs
 * - Real-time HCL parsing (parsedData)
 * - Lab/walkthrough/drill file loading on mode switch
 * - Lab completion detection (XP + confetti)
 * - Drill resolution detection (marks errors resolved)
 * - Terminal command execution (init, plan, apply, destroy, validate, fmt, etc.)
 * - Drift injection
 */
export function useTerraformSession(params: UseTerraformSessionParams): TerraformSessionState {
  const {
    activeMode,
    currentLab,
    currentWalkthrough,
    currentDrill,
    currentLabIndex,
    currentWalkthroughIndex,
    currentDrillIndex,
    completedLabIds,
    setCompletedLabIds,
    setTotalXp,
    setWorkspaceViewMode,
    setLoggedErrors,
    logNewError,
  } = params;

  const [files, setFiles] = useState<Record<string, string>>(() => {
    const wt = currentWalkthrough; // WALKTHROUGHS_DATA[0] at init
    return { ...wt.starterFiles };
  });
  const [activeFile, setActiveFile] = useState<string>("main.tf");
  const [tfState, setTfState] = useState<TerraformStateFile>(createEmptyState());
  const [terminalLogs, setTerminalLogs] = useState<TerminalCommandLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<ActiveTabMode>("topology");
  const [validationStatus, setValidationStatus] = useState<{ valid: boolean; errors: string[] } | null>(null);

  // Refs to avoid stale closures in callbacks
  const filesRef = useRef(files);
  const tfStateRef = useRef(tfState);
  const activeFileRef = useRef(activeFile);
  filesRef.current = files;
  tfStateRef.current = tfState;
  activeFileRef.current = activeFile;

  // Real-time HCL parsing for topology and graph
  const parsedData = useMemo(() => parseHclCode(files), [files]);

  const addTerminalLog = useCallback(
    (command: string, output: string, isError = false) => {
      const newLog: TerminalCommandLog = {
        id: "log-" + Math.random().toString(36).substring(2, 9),
        command,
        output,
        isError,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      setTerminalLogs((prev) => [...prev, newLog]);
      if (isError) {
        logNewError(output, "terminal", command);
      }
    },
    [logNewError],
  );

  // Load starter files when switching lab, walkthrough, or drill
  useEffect(() => {
    if (activeMode === "lab") {
      setFiles({ ...currentLab.starterFiles });
      setActiveFile(Object.keys(currentLab.starterFiles)[0] || "main.tf");
      setTfState(currentLab.initialState ? JSON.parse(JSON.stringify(currentLab.initialState)) : createEmptyState());
      setValidationStatus(null);
      addTerminalLog("system", `Loaded Lab: ${currentLab.title}. Type 'terraform init' or 'terraform plan' to begin.`);
    } else if (activeMode === "walkthrough") {
      setFiles({ ...currentWalkthrough.starterFiles });
      setActiveFile(Object.keys(currentWalkthrough.starterFiles)[0] || "main.tf");
      setTfState(createEmptyState());
      setValidationStatus(null);
      addTerminalLog("system", `Loaded Walkthrough: ${currentWalkthrough.title}. Follow along on the left guide.`);
    } else if (activeMode === "drill") {
      setFiles({ ...currentDrill.starterFiles });
      setActiveFile(Object.keys(currentDrill.starterFiles)[0] || "main.tf");
      setTfState(createEmptyState());
      setValidationStatus(null);
      addTerminalLog("system", `Loaded Targeted Skill Drill: ${currentDrill.title}. Fix the syntax/configuration flaw on the left.`);
    }
  }, [currentLabIndex, currentWalkthroughIndex, currentDrillIndex, activeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if current lab is completed
  useEffect(() => {
    if (activeMode === "lab" && !completedLabIds.includes(currentLab.id)) {
      const allPassed = currentLab.tasks.every((task) => {
        try {
          return task.validationCheck(files, tfState, parsedData.resources);
        } catch {
          return false;
        }
      });

      if (allPassed) {
        setCompletedLabIds((prev) => [...prev, currentLab.id]);
        setTotalXp((xp) => xp + currentLab.xp);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        addTerminalLog("system", `🎉 Congratulations! You completed "${currentLab.title}" and earned +${currentLab.xp} XP!`);
      }
    }
  }, [files, tfState, parsedData, currentLab, activeMode, completedLabIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if current drill is resolved
  useEffect(() => {
    if (activeMode === "drill") {
      try {
        const passed = currentDrill.validationCheck(files, tfState, parsedData.resources);
        if (passed) {
          setLoggedErrors((prev) =>
            prev.map((err) => (err.domain === currentDrill.domain ? { ...err, resolved: true } : err)),
          );
        }
      } catch {
        // Validation check in progress
      }
    }
  }, [files, tfState, parsedData, currentDrill, activeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCodeChange = useCallback((fileName: string, content: string) => {
    setFiles((prev) => ({ ...prev, [fileName]: content }));
  }, []);

  const handleFormatCode = useCallback(() => {
    const formatted = formatHclString(filesRef.current[activeFileRef.current] || "");
    handleCodeChange(activeFileRef.current, formatted);
    addTerminalLog("terraform fmt", `Formatted ${activeFileRef.current} successfully.`);
  }, [addTerminalLog, handleCodeChange]);

  const handleValidateCode = useCallback(() => {
    const result = runTerraformValidate(filesRef.current);
    setValidationStatus(result);
    if (result.valid) {
      addTerminalLog("terraform validate", "Success! The configuration is valid.");
    } else {
      addTerminalLog("terraform validate", `Error: ${result.errors.join("\n")}`, true);
      result.errors.forEach((err) => {
        logNewError(err, "validation", "terraform validate");
      });
    }
  }, [addTerminalLog, logNewError]);

  const handleResetCode = useCallback(() => {
    if (activeMode === "lab") {
      setFiles({ ...currentLab.starterFiles });
      setTfState(createEmptyState());
      addTerminalLog("system", "Reset code back to initial lab starter files.");
    } else if (activeMode === "walkthrough") {
      setFiles({ ...currentWalkthrough.starterFiles });
      setTfState(createEmptyState());
      addTerminalLog("system", "Reset code back to walkthrough starter files.");
    } else if (activeMode === "drill") {
      setFiles({ ...currentDrill.starterFiles });
      setTfState(createEmptyState());
      addTerminalLog("system", "Reset code back to drill starter files.");
    }
  }, [activeMode, currentLab, currentWalkthrough, currentDrill, addTerminalLog]);

  // Execute terminal commands
  const handleRunCommand = useCallback(
    (rawCmd: string) => {
      const cmd = rawCmd.trim();
      if (!cmd) return;

      if (cmd === "clear") {
        setTerminalLogs([]);
        return;
      }

      if (cmd === "help" || cmd === "terraform -help" || cmd === "terraform --help") {
        const helpMsg = `Usage: terraform [options] <subcommand> [args]

Main commands:
  init          Prepare your working directory for other commands
  validate      Check whether the configuration is valid
  plan          Show changes required by the current configuration
  apply         Create or update infrastructure
  destroy       Destroy previously-created infrastructure
  fmt           Reformat your configuration in standard style
  state         Advanced state management (list, show)
  output        Show output values from your root module
  graph         Generate a Graphviz DAG of the execution graph
  console       Try Terraform expressions at an interactive command prompt
  refresh      Reconcile state with real-world infrastructure and detect drift`;
        addTerminalLog(cmd, helpMsg);
        return;
      }

      if (cmd === "terraform init" || cmd.startsWith("terraform init")) {
        setIsExecuting(true);
        setTimeout(() => {
          setIsExecuting(false);
          const initOutput = `Initializing the backend...
Initializing provider plugins...
|- Finding hashicorp/aws versions matching "~> 5.0"...
|- Installing hashicorp/aws v5.42.0...
|- Installed hashicorp/aws v5.42.0 (signed by HashiCorp)

Terraform has created a lock file .terraform.lock.hcl to record the provider selections it made above.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure.`;
          addTerminalLog(cmd, initOutput);
        }, 500);
        return;
      }

      if (cmd === "terraform fmt") {
        handleFormatCode();
        return;
      }

      if (cmd === "terraform validate") {
        handleValidateCode();
        return;
      }

      if (cmd === "terraform plan" || cmd.startsWith("terraform plan")) {
        setIsExecuting(true);
        setTimeout(() => {
          setIsExecuting(false);
          // Run validation first so semantic errors show in the editor
          const validateResult = runTerraformValidate(filesRef.current);
          setValidationStatus(validateResult);
          const plan = runTerraformPlan(filesRef.current, tfStateRef.current);
          addTerminalLog(cmd, plan.outputLog);
        }, 400);
        return;
      }

      if (cmd === "terraform apply" || cmd.startsWith("terraform apply")) {
        setIsExecuting(true);
        setTimeout(() => {
          setIsExecuting(false);
          const result = applyTerraform(filesRef.current, tfStateRef.current);
          setTfState(result.newState);
          addTerminalLog(cmd, result.logs.join("\n"));
          if (result.appliedResources.length > 0) {
            setTotalXp((xp) => xp + 15);
          }
        }, 600);
        return;
      }

      if (cmd === "terraform destroy" || cmd.startsWith("terraform destroy")) {
        setIsExecuting(true);
        setTimeout(() => {
          setIsExecuting(false);
          const result = destroyTerraform(tfStateRef.current);
          setTfState(result.newState);
          addTerminalLog(cmd, result.logs.join("\n"));
        }, 500);
        return;
      }

      if (cmd === "terraform state list") {
        if (tfStateRef.current.resources.length === 0) {
          addTerminalLog(cmd, "No resources currently managed in terraform.tfstate.");
        } else {
          const list = tfStateRef.current.resources.map((r) => `${r.type}.${r.name}`).join("\n");
          addTerminalLog(cmd, list);
        }
        return;
      }

      if (cmd.startsWith("terraform state show")) {
        const target = cmd.replace("terraform state show", "").trim();
        const r = tfStateRef.current.resources.find((item) => `${item.type}.${item.name}` === target);
        if (r) {
          const out =
            `# ${r.type}.${r.name}:\nresource "${r.type}" "${r.name}" {\n` +
            Object.entries(r.instances[0]?.attributes || {})
              .map(([k, v]) => `    ${k} = ${JSON.stringify(v)}`)
              .join("\n") +
            "\n}";
          addTerminalLog(cmd, out);
        } else {
          addTerminalLog(cmd, `No instance found for resource address "${target}".`, true);
        }
        return;
      }

      if (cmd === "terraform output") {
        if (Object.keys(tfStateRef.current.outputs).length === 0) {
          addTerminalLog(cmd, "Warning: No outputs found in state.");
        } else {
          const outLines = Object.entries(tfStateRef.current.outputs)
            .map(([k, v]) => `${k} = ${v.sensitive ? "<sensitive>" : `"${v.value}"`}`)
            .join("\n");
          addTerminalLog(cmd, outLines);
        }
        return;
      }

      if (cmd === "terraform graph") {
        const dotLines = [
          "digraph {",
          '  compound = "true"',
          '  newrank = "true"',
          '  subgraph "root" {',
          ...parsedData.resources.map((r) => `    "[root] ${r.id} (expand)"`),
          ...parsedData.resources.flatMap((r) =>
            r.dependsOn.map((d) => `    "[root] ${r.id} (expand)" -> "[root] ${d} (expand)"`),
          ),
          "  }",
          "}",
        ].join("\n");
        addTerminalLog(cmd, dotLines);
        setActiveRightTab("graph");
        return;
      }

      if (cmd.startsWith("terraform console")) {
        const expr = cmd.replace("terraform console", "").trim();
        if (!expr) {
          addTerminalLog(cmd, "Terraform console expression evaluator ready. Example: terraform console var.environment");
        } else {
          const result = evaluateConsoleExpression(expr, filesRef.current, tfStateRef.current);
          addTerminalLog(cmd, result);
        }
        return;
      }

      if (cmd === "terraform refresh" || cmd.startsWith("terraform refresh")) {
        setIsExecuting(true);
        setTimeout(() => {
          setIsExecuting(false);
          const state = tfStateRef.current;
          if (state.resources.length === 0) {
            addTerminalLog(cmd, "No resources found in state to refresh.");
            return;
          }
          const logs: string[] = [];
          logs.push("Refreshing state...");
          logs.push("");
          state.resources.forEach((r) => {
            const id = r.instances[0]?.attributes?.id || "res-unknown";
            logs.push(`${r.type}.${r.name}: Refreshing state... [id=${id}]`);
            logs.push(`${r.type}.${r.name}: Modifications complete after 0s [id=${id}]`);
          });
          logs.push("");
          logs.push("Terraform has updated the state file to reflect the current real-world infrastructure.");
          logs.push("");
          // Report any drift detected between code and state
          const parsed = parseHclCode(filesRef.current);
          let driftFound = false;
          parsed.resources.forEach((res) => {
            const stateRes = state.resources.find((r) => `${r.type}.${r.name}` === res.id);
            if (stateRes) {
              const stateAttrs = stateRes.instances[0]?.attributes || {};
              Object.entries(res.attributes).forEach(([k, v]) => {
                if (stateAttrs[k] !== undefined && String(stateAttrs[k]) !== String(v)) {
                  if (!driftFound) {
                    logs.push("Drift detected between configuration and state:");
                    driftFound = true;
                  }
                  logs.push(`  ~ ${res.id}: ${k} = "${stateAttrs[k]}" (state) vs "${v}" (config)`);
                }
              });
            }
          });
          if (!driftFound) {
            logs.push("No drift detected. State is consistent with configuration.");
          }
          logs.push("");
          logs.push("State refresh complete.");
          addTerminalLog(cmd, logs.join("\n"));
        }, 400);
        return;
      }

      // Fallback unrecognized command
      addTerminalLog(cmd, `Error: Unknown command "${cmd}". Try 'terraform init', 'terraform plan', 'terraform apply', or 'help'.`, true);
    },
    [addTerminalLog, handleFormatCode, handleValidateCode, parsedData, setTotalXp],
  );

  const handleInjectDrift = useCallback(
    (resourceId: string, driftedKey: string, driftedVal: any) => {
      setTfState((prevState) => {
        const next = JSON.parse(JSON.stringify(prevState)) as TerraformStateFile;
        const resIndex = next.resources.findIndex((r) => `${r.type}.${r.name}` === resourceId);
        if (resIndex >= 0) {
          next.resources[resIndex].instances[0].attributes[driftedKey] = driftedVal;
        }
        return next;
      });

      addTerminalLog(
        "cloud-console",
        `⚠️ Out-of-band drift injected! AWS Management Console changed ${resourceId} [${driftedKey} = ${JSON.stringify(driftedVal)}]. Run 'terraform plan' to see drift detection.`,
      );
    },
    [addTerminalLog],
  );

  const handleLoadWalkthroughExample = useCallback(
    (exampleFiles: Record<string, string>, commandToRun?: string) => {
      setFiles({ ...exampleFiles });
      const firstFileName = Object.keys(exampleFiles)[0] || "main.tf";
      setActiveFile(firstFileName);
      setWorkspaceViewMode("split");
      addTerminalLog("system", `Loaded visual walkthrough example into live code editor (${firstFileName}).`);
      if (commandToRun) {
        handleRunCommand(commandToRun);
      }
    },
    [addTerminalLog, handleRunCommand, setWorkspaceViewMode],
  );

  return {
    files,
    setFiles,
    activeFile,
    setActiveFile,
    tfState,
    setTfState,
    terminalLogs,
    setTerminalLogs,
    isExecuting,
    parsedData,
    validationStatus,
    setValidationStatus,
    activeRightTab,
    setActiveRightTab,
    addTerminalLog,
    handleCodeChange,
    handleFormatCode,
    handleValidateCode,
    handleResetCode,
    handleRunCommand,
    handleInjectDrift,
    handleLoadWalkthroughExample,
  };
}