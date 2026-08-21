import React, { useEffect } from "react";
import {
  Code2,
  Layers,
  Terminal as TerminalIcon,
  FileJson,
  GitGraph,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  BookOpen,
  Compass
} from "lucide-react";
import { LABS_DATA } from "./data/labsData";
import { REMEDIATION_DRILLS_DATA } from "./data/remediationDrillsData";
import { Header } from "./components/Header";
import { LabGuide } from "./components/LabGuide";
import { WalkthroughGuide } from "./components/WalkthroughGuide";
import { CurriculumDashboard } from "./components/CurriculumDashboard";
import { RemediationDrillGuide } from "./components/RemediationDrillGuide";
import { CodeEditor } from "./components/CodeEditor";
import { VisualTopology } from "./components/VisualTopology";
import { TerminalSimulator } from "./components/TerminalSimulator";
import { StateInspector } from "./components/StateInspector";
import { GraphViewer } from "./components/GraphViewer";
import { ResourceInspectorDrawer } from "./components/ResourceInspectorDrawer";
import { AiMentorModal } from "./components/AiMentorModal";
import { QuizModal } from "./components/QuizModal";
import { CheatSheetModal } from "./components/CheatSheetModal";
import { SolutionModal } from "./components/SolutionModal";
import { WorkspaceOrientationGuide } from "./components/WorkspaceOrientationGuide";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { safeSetItem } from "./utils/safeStorage";
import { useNavigation } from "./hooks/useNavigation";
import { useWorkspaceLayout } from "./hooks/useWorkspaceLayout";
import { useGamification } from "./hooks/useGamification";
import { useErrorTracking } from "./hooks/useErrorTracking";
import { useModals } from "./hooks/useModals";
import { useTerraformSession } from "./hooks/useTerraformSession";

export default function App() {
  // 1. Navigation: mode, lab/walkthrough/drill indices, dashboard nav
  const {
    activeMode, setActiveMode,
    currentLabIndex, setCurrentLabIndex,
    currentWalkthroughIndex, setCurrentWalkthroughIndex,
    currentDrillIndex, setCurrentDrillIndex,
    currentLab, currentWalkthrough, currentDrill,
  } = useNavigation();

  // 2. Workspace layout: resizable panels, terminal, drag handlers
  const {
    workspaceViewMode, setWorkspaceViewMode,
    showWorkspaceNotes, setShowWorkspaceNotes,
    leftPanelWidth, isLeftPanelCollapsed, setIsLeftPanelCollapsed,
    centerRatio, terminalHeight, setTerminalHeight,
    isTerminalMaximized, setIsTerminalMaximized,
    isTerminalCollapsed, setIsTerminalCollapsed,
    mainContainerRef, rightColumnContainerRef,
    startLeftResize, startCenterResize, startTerminalResize,
  } = useWorkspaceLayout(activeMode);

  // 3. Gamification: XP, completed labs
  const { completedLabIds, setCompletedLabIds, totalXp, setTotalXp } = useGamification();

  // 4. Error tracking: logged errors, analytics, resolution
  const {
    loggedErrors, setLoggedErrors,
    domainAnalyses, progressSummary, unresolvedErrorCount,
    logNewError, handleResolveError, handleClearErrorHistory,
  } = useErrorTracking(completedLabIds, currentWalkthroughIndex, totalXp);

  // 5. Modals: all modal open/close state
  const {
    selectedResource, setSelectedResource,
    isAiMentorOpen, setIsAiMentorOpen,
    isQuizOpen, setIsQuizOpen,
    isCheatSheetOpen, setIsCheatSheetOpen,
    isSolutionOpen, setIsSolutionOpen,
    aiInitialPrompt, setAiInitialPrompt,
    validationStatus, setValidationStatus,
  } = useModals();

  // 6. Terraform session: files, state, terminal, commands
  const {
    files, setFiles, activeFile, setActiveFile,
    tfState, terminalLogs, setTerminalLogs, isExecuting,
    parsedData, activeRightTab, setActiveRightTab,
    addTerminalLog, handleCodeChange, handleFormatCode, handleValidateCode,
    handleResetCode, handleRunCommand, handleInjectDrift, handleLoadWalkthroughExample,
  } = useTerraformSession({
    activeMode,
    currentLab, currentWalkthrough, currentDrill,
    currentLabIndex, currentWalkthroughIndex, currentDrillIndex,
    completedLabIds, setCompletedLabIds,
    setTotalXp, setWorkspaceViewMode,
    loggedErrors, setLoggedErrors, logNewError,
  });

  // Persist logged errors to localStorage (owned by App since it bridges
  // useErrorTracking and the unified persistence pattern)
  useEffect(() => {
    safeSetItem("tf_logged_errors", JSON.stringify(loggedErrors));
  }, [loggedErrors]);

  // AI Mentor Helper
  const handleAskAiHint = (taskHint: string) => {
    setAiInitialPrompt(taskHint);
    setIsAiMentorOpen(true);
  };

  // Navigation handlers from Dashboard (these cross multiple hooks,
  // so they live here as the orchestrator)
  const handleStartLabFromDashboard = (labIndex: number) => {
    setCurrentLabIndex(labIndex);
    setActiveMode("lab");
    setWorkspaceViewMode("study");
  };

  const handleStartWalkthroughFromDashboard = (walkthroughIndex: number) => {
    setCurrentWalkthroughIndex(walkthroughIndex);
    setActiveMode("walkthrough");
    setWorkspaceViewMode("study");
  };

  const handleStartDrillFromDashboard = (drill: typeof currentDrill) => {
    const drillIdx = REMEDIATION_DRILLS_DATA.findIndex((d) => d.id === drill.id);
    if (drillIdx >= 0) setCurrentDrillIndex(drillIdx);
    setActiveMode("drill");
    setWorkspaceViewMode("study");
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] text-stone-900 overflow-hidden font-sans select-none">
      {/* 1. Global App Header */}
      <Header
        currentLabIndex={currentLabIndex}
        onSelectLab={(idx) => setCurrentLabIndex(idx)}
        currentWalkthroughIndex={currentWalkthroughIndex}
        onSelectWalkthrough={(idx) => setCurrentWalkthroughIndex(idx)}
        completedLabIds={completedLabIds}
        totalXp={totalXp}
        activeMode={activeMode}
        setActiveMode={(mode) => {
          setActiveMode(mode);
          if (mode === "sandbox") {
            setWorkspaceViewMode("editor_only");
          }
        }}
        unresolvedErrorCount={unresolvedErrorCount}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenAiMentor={() => {
          setAiInitialPrompt("");
          setIsAiMentorOpen(true);
        }}
        workspaceViewMode={workspaceViewMode}
        onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
        showWorkspaceNotes={showWorkspaceNotes}
        onToggleWorkspaceNotes={() => setShowWorkspaceNotes((p) => !p)}
      />

      {/* 2. Main Content Area */}
      {activeMode === "dashboard" ? (
        <div className="flex-1 overflow-hidden">
          <ErrorBoundary label="Dashboard">
            <CurriculumDashboard
            completedLabIds={completedLabIds}
            currentLabIndex={currentLabIndex}
            currentWalkthroughIndex={currentWalkthroughIndex}
            loggedErrors={loggedErrors}
            domainAnalyses={domainAnalyses}
            progressSummary={progressSummary}
            totalXp={totalXp}
            onStartLab={handleStartLabFromDashboard}
            onStartWalkthrough={handleStartWalkthroughFromDashboard}
            onStartDrill={handleStartDrillFromDashboard}
            onResolveError={handleResolveError}
            onClearErrorHistory={handleClearErrorHistory}
            onAskAiMentor={(prompt) => {
              setAiInitialPrompt(prompt);
              setIsAiMentorOpen(true);
            }}
          />
          </ErrorBoundary>
        </div>
      ) : workspaceViewMode === "study" && activeMode !== "sandbox" ? (
        /* FOCUSED READING VIEW: Single-screen distraction-free reading of Walkthrough, Lab Brief, or Drill Diagnostic */
        <div className="flex-1 flex justify-center bg-[#F5F8FA] overflow-hidden">
          <div className="w-full max-w-5xl h-full flex flex-col bg-white border-x border-stone-200 shadow-xs overflow-hidden">
            <ErrorBoundary label="Guide">
            {activeMode === "walkthrough" && (
              <WalkthroughGuide
                currentWalkthroughIndex={currentWalkthroughIndex}
                onSelectWalkthrough={(idx) => setCurrentWalkthroughIndex(idx)}
                onLoadExampleToEditor={handleLoadWalkthroughExample}
                onAskAiMentor={handleAskAiHint}
                workspaceViewMode={workspaceViewMode}
                onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
              />
            )}

            {activeMode === "lab" && (
              <LabGuide
                lab={currentLab}
                codeMap={files}
                state={tfState}
                parsedResources={parsedData.resources}
                onNextLab={() => setCurrentLabIndex((i) => Math.min(LABS_DATA.length - 1, i + 1))}
                onPrevLab={() => setCurrentLabIndex((i) => Math.max(0, i - 1))}
                hasPrev={currentLabIndex > 0}
                hasNext={currentLabIndex < LABS_DATA.length - 1}
                onOpenSolution={() => setIsSolutionOpen(true)}
                onAskAiHint={handleAskAiHint}
                isCompleted={completedLabIds.includes(currentLab.id)}
                workspaceViewMode={workspaceViewMode}
                onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
                showWorkspaceNotes={showWorkspaceNotes}
                onToggleWorkspaceNotes={() => setShowWorkspaceNotes((p) => !p)}
              />
            )}

            {activeMode === "drill" && (
              <RemediationDrillGuide
                drill={currentDrill}
                codeMap={files}
                state={tfState}
                parsedResources={parsedData.resources}
                onBackToDashboard={() => setActiveMode("dashboard")}
                onAskAiMentor={handleAskAiHint}
                workspaceViewMode={workspaceViewMode}
                onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
              />
            )}
            </ErrorBoundary>
          </div>
        </div>
      ) : (
        /* Split Practice / Sandbox Workspace Layout */
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Workspace Orientation Guide Banner */}
          <WorkspaceOrientationGuide
            isOpen={showWorkspaceNotes}
            onClose={() => setShowWorkspaceNotes(false)}
            onOpen={() => setShowWorkspaceNotes(true)}
          />

          {/* Resizable 3-Column Split View Layout */}
          <div ref={mainContainerRef} className="flex-1 flex overflow-hidden relative">
            {/* LEFT COLUMN: Walkthrough Guide OR Curriculum Lab Guide OR Targeted Remediation Drill Guide */}
            {!isLeftPanelCollapsed && activeMode !== "sandbox" && (
              <div
                style={{ width: `${leftPanelWidth}px` }}
                className="shrink-0 h-full flex flex-col border-r border-stone-200 bg-[#FAFAFA] shadow-xs z-10 overflow-hidden relative"
              >
                {showWorkspaceNotes && (
                  <div className="bg-blue-50/90 border-b border-blue-200/80 px-3 py-1 text-[11px] font-bold text-blue-900 flex items-center justify-between shrink-0">
                    <span className="flex items-center space-x-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>① 1. Read Objectives & Requirements</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-sans font-normal">Start here</span>
                  </div>
                )}

                {activeMode === "walkthrough" && (
                  <ErrorBoundary label="Guide Panel">
                    <WalkthroughGuide
                      currentWalkthroughIndex={currentWalkthroughIndex}
                      onSelectWalkthrough={(idx) => setCurrentWalkthroughIndex(idx)}
                      onLoadExampleToEditor={handleLoadWalkthroughExample}
                      onAskAiMentor={handleAskAiHint}
                      workspaceViewMode={workspaceViewMode}
                      onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
                    />
                  </ErrorBoundary>
                )}

                {activeMode === "lab" && (
                  <ErrorBoundary label="Guide Panel">
                    <LabGuide
                      lab={currentLab}
                      codeMap={files}
                      state={tfState}
                      parsedResources={parsedData.resources}
                      onNextLab={() => setCurrentLabIndex((i) => Math.min(LABS_DATA.length - 1, i + 1))}
                      onPrevLab={() => setCurrentLabIndex((i) => Math.max(0, i - 1))}
                      hasPrev={currentLabIndex > 0}
                      hasNext={currentLabIndex < LABS_DATA.length - 1}
                      onOpenSolution={() => setIsSolutionOpen(true)}
                      onAskAiHint={handleAskAiHint}
                      isCompleted={completedLabIds.includes(currentLab.id)}
                      workspaceViewMode={workspaceViewMode}
                      onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
                      showWorkspaceNotes={showWorkspaceNotes}
                      onToggleWorkspaceNotes={() => setShowWorkspaceNotes((p) => !p)}
                    />
                  </ErrorBoundary>
                )}

                {activeMode === "drill" && (
                  <ErrorBoundary label="Guide Panel">
                    <RemediationDrillGuide
                      drill={currentDrill}
                      codeMap={files}
                      state={tfState}
                      parsedResources={parsedData.resources}
                      onBackToDashboard={() => setActiveMode("dashboard")}
                      onAskAiMentor={handleAskAiHint}
                      workspaceViewMode={workspaceViewMode}
                      onToggleWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
                    />
                  </ErrorBoundary>
                )}
              </div>
            )}

          {/* LEFT RESIZER BAR */}
          {!isLeftPanelCollapsed && activeMode !== "sandbox" && (
            <div
              onMouseDown={startLeftResize}
              className="w-2 hover:w-2.5 bg-transparent hover:bg-stone-300 active:bg-stone-900 cursor-col-resize shrink-0 transition-colors flex items-center justify-center group z-20 select-none -ml-1"
              title="Drag to resize Guide panel"
            >
              <div className="w-1 h-8 rounded-full bg-stone-300 group-hover:bg-stone-500" />
            </div>
          )}

          {/* COLLAPSE/EXPAND LEFT PANEL TOGGLE PILL */}
          {activeMode !== "sandbox" && (
            <button
              onClick={() => setIsLeftPanelCollapsed((prev) => !prev)}
              className="absolute top-2 left-2 z-30 p-1.5 rounded-lg bg-white/90 hover:bg-white border border-stone-200 shadow-xs text-stone-600 hover:text-stone-900 transition-all backdrop-blur-xs"
              title={isLeftPanelCollapsed ? "Expand Guide Panel" : "Collapse Guide Panel for more Editor room"}
            >
              {isLeftPanelCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-stone-800" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-stone-600" />
              )}
            </button>
          )}

          {/* CENTER COLUMN: Code Editor */}
          <div
            style={{
              flex: `${centerRatio} 1 0%`,
              minWidth: "300px",
            }}
            className="h-full flex flex-col border-r border-stone-200 overflow-hidden bg-white"
          >
            <ErrorBoundary label="Code Editor">
              <CodeEditor
                files={files}
                activeFile={activeFile}
                onSelectFile={(f) => setActiveFile(f)}
                onCodeChange={handleCodeChange}
                onResetCode={handleResetCode}
                onFormatCode={handleFormatCode}
                onValidateCode={handleValidateCode}
                validationStatus={validationStatus}
                showStepBadge={showWorkspaceNotes}
              />
            </ErrorBoundary>
          </div>

          {/* CENTER/RIGHT RESIZER BAR */}
          <div
            onMouseDown={startCenterResize}
            className="w-2 hover:w-2.5 bg-transparent hover:bg-stone-300 active:bg-stone-900 cursor-col-resize shrink-0 transition-colors flex items-center justify-center group z-20 select-none -ml-1"
            title="Drag to adjust Editor vs Visuals ratio"
          >
            <div className="w-1 h-8 rounded-full bg-stone-300 group-hover:bg-stone-500" />
          </div>

          {/* RIGHT COLUMN: Visual Topology, State, Graph, & Resizable Terminal */}
          <div
            ref={rightColumnContainerRef}
            style={{
              flex: `${100 - centerRatio} 1 0%`,
              minWidth: "320px",
            }}
            className="h-full flex flex-col bg-[#FAFAFA] overflow-hidden"
          >
            {/* Right Column Header Tabs */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-white px-2 py-0.5 shrink-0 shadow-2xs">
              <div className="flex items-center space-x-1">
                {showWorkspaceNotes && (
                  <span className="hidden xl:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 text-[8px] font-bold font-mono tracking-tight shrink-0 mr-0.5" title="Workflow Step 4: Inspect real-time Cloud Architecture & State">
                    <span className="w-1 h-1 rounded-full bg-indigo-600" />
                    <span>④ Inspect Cloud</span>
                  </span>
                )}
                <button
                  id="tab-view-topology"
                  onClick={() => {
                    setActiveRightTab("topology");
                    if (isTerminalMaximized) setIsTerminalMaximized(false);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                    activeRightTab === "topology" && !isTerminalMaximized
                      ? "bg-stone-900 text-white shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                  title="Visual Cloud Topology: Interactive multi-tier AWS architecture map"
                >
                  <Layers className="w-2.5 h-2.5" />
                  <span>Topology</span>
                </button>

                <button
                  id="tab-view-terminal"
                  onClick={() => {
                    setActiveRightTab("editor");
                    setIsTerminalMaximized(true);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                    activeRightTab === "editor" || isTerminalMaximized
                      ? "bg-stone-900 text-white shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                  title="CLI Terminal: Full interactive Terraform command execution log"
                >
                  <TerminalIcon className="w-2.5 h-2.5" />
                  <span>Terminal</span>
                  {terminalLogs.length > 0 && (
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </button>

                <button
                  id="tab-view-state"
                  onClick={() => {
                    setActiveRightTab("state");
                    if (isTerminalMaximized) setIsTerminalMaximized(false);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                    activeRightTab === "state" && !isTerminalMaximized
                      ? "bg-stone-900 text-white shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                  title="State & Drift: Inspect terraform.tfstate JSON and simulate cloud drift"
                >
                  <FileJson className="w-2.5 h-2.5" />
                  <span>State & Drift</span>
                </button>

                <button
                  id="tab-view-graph"
                  onClick={() => {
                    setActiveRightTab("graph");
                    if (isTerminalMaximized) setIsTerminalMaximized(false);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                    activeRightTab === "graph" && !isTerminalMaximized
                      ? "bg-stone-900 text-white shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                  title="DAG Dependency Graph: View resource provisioning DAG relationships"
                >
                  <GitGraph className="w-2.5 h-2.5" />
                  <span>DAG Graph</span>
                </button>
              </div>

              {/* Quick Run Plan / Apply Shortcut */}
              <div className="flex items-center space-x-1">
                <button
                  id="btn-quick-plan"
                  onClick={() => handleRunCommand("terraform plan")}
                  className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-[8.5px] font-semibold flex items-center space-x-1 transition-colors shadow-2xs cursor-pointer"
                  title="Quick Plan: Preview Terraform execution plan in terminal"
                >
                  <span>Plan</span>
                </button>
                <button
                  id="btn-quick-apply"
                  onClick={() => handleRunCommand("terraform apply")}
                  className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-white text-[8.5px] font-semibold flex items-center space-x-1 shadow-2xs transition-all border border-stone-800 cursor-pointer"
                  title="Quick Apply: Execute terraform apply to provision resources"
                >
                  <Play className="w-2 h-2 fill-white" />
                  <span>Apply</span>
                </button>
              </div>
            </div>

            {/* Top Panel: Visual Views (Topology / State / Graph) */}
            {!isTerminalMaximized && (
              <div className="flex-1 overflow-hidden relative">
                {activeRightTab === "topology" && (
                  <ErrorBoundary label="Topology">
                    <VisualTopology
                      resources={parsedData.resources}
                      state={tfState}
                      onSelectResource={(r) => setSelectedResource(r)}
                      selectedResourceId={selectedResource?.id}
                    />
                  </ErrorBoundary>
                )}

                {activeRightTab === "state" && (
                  <ErrorBoundary label="State Inspector">
                    <StateInspector
                      state={tfState}
                      parsedResources={parsedData.resources}
                      onInjectDrift={(id, key, val) => handleInjectDrift(id, key, val)}
                      onRefreshState={() => handleRunCommand("terraform refresh")}
                    />
                  </ErrorBoundary>
                )}

                {activeRightTab === "graph" && (
                  <ErrorBoundary label="DAG Graph">
                    <GraphViewer resources={parsedData.resources} />
                  </ErrorBoundary>
                )}
              </div>
            )}

            {/* DRAGGABLE TERMINAL RESIZER BAR */}
            {!isTerminalMaximized && (
              <div
                onMouseDown={startTerminalResize}
                onDoubleClick={() => setIsTerminalCollapsed((prev) => !prev)}
                className="h-3 bg-stone-200 hover:bg-stone-300 active:bg-stone-800 cursor-row-resize flex items-center justify-between px-3 select-none transition-colors group z-20 border-t border-b border-stone-300"
                title="Drag up/down to stretch Terminal. Double-click to toggle collapse."
              >
                <div className="flex items-center space-x-1 text-[10px] text-stone-500 font-mono">
                  <span className="group-hover:text-stone-900 font-semibold transition-colors">CLI Logs Splitter</span>
                  <span>({terminalHeight}px)</span>
                </div>

                {/* Center Grip Handle */}
                <div className="w-14 h-1 rounded-full bg-stone-400 group-hover:bg-stone-700" />

                {/* Quick Height Preset Buttons */}
                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setTerminalHeight(180);
                      setIsTerminalCollapsed(false);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/90 hover:bg-white text-[9.5px] font-mono text-stone-700 border border-stone-300 shadow-2xs"
                    title="Compact height (180px)"
                  >
                    180px
                  </button>
                  <button
                    onClick={() => {
                      setTerminalHeight(340);
                      setIsTerminalCollapsed(false);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/90 hover:bg-white text-[9.5px] font-mono text-stone-700 border border-stone-300 shadow-2xs"
                    title="Comfortable height (340px)"
                  >
                    340px
                  </button>
                  <button
                    onClick={() => {
                      setTerminalHeight(520);
                      setIsTerminalCollapsed(false);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/90 hover:bg-white text-[9.5px] font-mono text-stone-700 border border-stone-300 shadow-2xs"
                    title="Expansive height (520px) to view large multiline logs"
                  >
                    520px
                  </button>
                </div>
              </div>
            )}

            {/* BOTTOM TERMINAL SIMULATOR CONTAINER */}
            <div
              style={{
                height: isTerminalMaximized
                  ? "100%"
                  : isTerminalCollapsed
                  ? "38px"
                  : `${terminalHeight}px`,
              }}
              className="shrink-0 flex flex-col overflow-hidden transition-all duration-75"
            >
              <ErrorBoundary label="Terminal">
                <TerminalSimulator
                  logs={terminalLogs}
                  onRunCommand={handleRunCommand}
                  onClearLogs={() => setTerminalLogs([])}
                  isExecuting={isExecuting}
                  isMaximized={isTerminalMaximized}
                  onToggleMaximize={() => setIsTerminalMaximized((prev) => !prev)}
                  isCollapsed={isTerminalCollapsed}
                  onToggleCollapse={() => setIsTerminalCollapsed((prev) => !prev)}
                  showStepBadge={showWorkspaceNotes}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 3. Resource Inspector Drawer */}
      <ErrorBoundary label="Resource Inspector">
        <ResourceInspectorDrawer
          resource={selectedResource}
          state={tfState}
          onClose={() => setSelectedResource(null)}
        />
      </ErrorBoundary>

      {/* 4. AI Terraform Mentor Modal */}
      <ErrorBoundary label="AI Mentor">
        <AiMentorModal
          isOpen={isAiMentorOpen}
          onClose={() => setIsAiMentorOpen(false)}
          currentCode={files[activeFile] || ""}
          labTitle={activeMode === "walkthrough" ? currentWalkthrough.title : currentLab.title}
          labGoal={activeMode === "walkthrough" ? currentWalkthrough.steps[0]?.title : currentLab.visualGoal}
          terminalOutput={terminalLogs.slice(-2).map((l) => l.output).join("\n")}
          initialQuestion={aiInitialPrompt}
        />
      </ErrorBoundary>

      {/* 5. Scenario Quiz Modal */}
      <ErrorBoundary label="Quiz">
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onRewardXp={(amount) => setTotalXp((xp) => xp + amount)}
        />
      </ErrorBoundary>

      {/* 6. Cheat Sheet Modal */}
      <ErrorBoundary label="Cheat Sheet">
        <CheatSheetModal
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
        />
      </ErrorBoundary>

      {/* 7. Solution Viewer Modal */}
      <ErrorBoundary label="Solution Viewer">
        <SolutionModal
          isOpen={isSolutionOpen}
          onClose={() => setIsSolutionOpen(false)}
          lab={currentLab}
          onApplySolution={(solutionFiles) => {
            setFiles({ ...solutionFiles });
            addTerminalLog("system", "Loaded lab solution files into code editor.");
          }}
        />
      </ErrorBoundary>
    </div>
  );
}
