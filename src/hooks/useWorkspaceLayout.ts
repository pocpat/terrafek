import { useState, useEffect, useRef } from "react";
import { safeGetItem, safeGetNumber, safeSetItem } from "../utils/safeStorage";
import type { AppMode } from "./useNavigation";

export type WorkspaceViewMode = "study" | "split" | "editor_only";

export interface WorkspaceLayoutState {
  workspaceViewMode: WorkspaceViewMode;
  setWorkspaceViewMode: React.Dispatch<React.SetStateAction<WorkspaceViewMode>>;
  showWorkspaceNotes: boolean;
  setShowWorkspaceNotes: React.Dispatch<React.SetStateAction<boolean>>;
  leftPanelWidth: number;
  setLeftPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  isLeftPanelCollapsed: boolean;
  setIsLeftPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  centerRatio: number;
  setCenterRatio: React.Dispatch<React.SetStateAction<number>>;
  terminalHeight: number;
  setTerminalHeight: React.Dispatch<React.SetStateAction<number>>;
  isTerminalMaximized: boolean;
  setIsTerminalMaximized: React.Dispatch<React.SetStateAction<boolean>>;
  isTerminalCollapsed: boolean;
  setIsTerminalCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mainContainerRef: React.RefObject<HTMLDivElement | null>;
  rightColumnContainerRef: React.RefObject<HTMLDivElement | null>;
  startLeftResize: (e: React.MouseEvent) => void;
  startCenterResize: (e: React.MouseEvent) => void;
  startTerminalResize: (e: React.MouseEvent) => void;
}

/**
 * Manages the resizable 3-column workspace layout:
 * left panel width, center/right ratio, terminal height,
 * and the global mouse drag handlers for all three resizers.
 * Persists layout preferences to localStorage.
 */
export function useWorkspaceLayout(activeMode: AppMode): WorkspaceLayoutState {
  const [workspaceViewMode, setWorkspaceViewMode] = useState<WorkspaceViewMode>(() => {
    const saved = safeGetItem("tf_workspace_view_mode");
    return (saved as WorkspaceViewMode) || "study";
  });

  const [showWorkspaceNotes, setShowWorkspaceNotes] = useState<boolean>(() => {
    const hasSeenFirstTime = safeGetItem("tf_has_seen_workspace_notes_v2");
    if (!hasSeenFirstTime) {
      safeSetItem("tf_has_seen_workspace_notes_v2", "true");
      return true;
    }
    return false;
  });

  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => safeGetNumber("tf_left_panel_width", 400));
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [centerRatio, setCenterRatio] = useState<number>(() => safeGetNumber("tf_center_ratio", 50));
  const [terminalHeight, setTerminalHeight] = useState<number>(() => safeGetNumber("tf_terminal_height", 320));
  const [isTerminalMaximized, setIsTerminalMaximized] = useState<boolean>(false);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState<boolean>(false);

  const isDraggingLeftRef = useRef(false);
  const isDraggingCenterRef = useRef(false);
  const isDraggingTerminalRef = useRef(false);
  const rightColumnContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Persist layout preferences
  useEffect(() => {
    safeSetItem("tf_workspace_view_mode", workspaceViewMode);
    safeSetItem("tf_show_workspace_notes", String(showWorkspaceNotes));
    safeSetItem("tf_left_panel_width", String(leftPanelWidth));
    safeSetItem("tf_center_ratio", String(centerRatio));
    safeSetItem("tf_terminal_height", String(terminalHeight));
  }, [workspaceViewMode, showWorkspaceNotes, leftPanelWidth, centerRatio, terminalHeight]);

  // Global mouse handlers for fluid, lag-free resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeftRef.current && mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        const newWidth = Math.max(280, Math.min(650, e.clientX - rect.left));
        setLeftPanelWidth(newWidth);
      }

      if (isDraggingCenterRef.current && mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        const leftOffset = isLeftPanelCollapsed || activeMode === "sandbox" ? 0 : leftPanelWidth;
        const availableWidth = rect.width - leftOffset;
        if (availableWidth > 400) {
          const mouseRelX = e.clientX - rect.left - leftOffset;
          const ratio = Math.max(25, Math.min(75, (mouseRelX / availableWidth) * 100));
          setCenterRatio(ratio);
        }
      }

      if (isDraggingTerminalRef.current && rightColumnContainerRef.current) {
        const rect = rightColumnContainerRef.current.getBoundingClientRect();
        const newHeight = Math.max(70, Math.min(rect.height - 100, rect.bottom - e.clientY));
        setTerminalHeight(newHeight);
        if (isTerminalCollapsed) setIsTerminalCollapsed(false);
        if (isTerminalMaximized) setIsTerminalMaximized(false);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeftRef.current || isDraggingCenterRef.current || isDraggingTerminalRef.current) {
        isDraggingLeftRef.current = false;
        isDraggingCenterRef.current = false;
        isDraggingTerminalRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [leftPanelWidth, isLeftPanelCollapsed, activeMode, isTerminalCollapsed, isTerminalMaximized]);

  const startLeftResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingLeftRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startCenterResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingCenterRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startTerminalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingTerminalRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  return {
    workspaceViewMode,
    setWorkspaceViewMode,
    showWorkspaceNotes,
    setShowWorkspaceNotes,
    leftPanelWidth,
    setLeftPanelWidth,
    isLeftPanelCollapsed,
    setIsLeftPanelCollapsed,
    centerRatio,
    setCenterRatio,
    terminalHeight,
    setTerminalHeight,
    isTerminalMaximized,
    setIsTerminalMaximized,
    isTerminalCollapsed,
    setIsTerminalCollapsed,
    mainContainerRef,
    rightColumnContainerRef,
    startLeftResize,
    startCenterResize,
    startTerminalResize,
  };
}