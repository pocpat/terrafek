import { useState } from "react";
import { ParsedResource } from "../types/terraform";
import type { ValidationError } from "../utils/terraformEngine";

export interface ModalsState {
  selectedResource: ParsedResource | null;
  setSelectedResource: React.Dispatch<React.SetStateAction<ParsedResource | null>>;
  isAiMentorOpen: boolean;
  setIsAiMentorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isQuizOpen: boolean;
  setIsQuizOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCheatSheetOpen: boolean;
  setIsCheatSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSolutionOpen: boolean;
  setIsSolutionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiInitialPrompt: string;
  setAiInitialPrompt: React.Dispatch<React.SetStateAction<string>>;
  validationStatus: { valid: boolean; errors: string[]; detailedErrors?: ValidationError[] } | null;
  setValidationStatus: React.Dispatch<React.SetStateAction<{ valid: boolean; errors: string[]; detailedErrors?: ValidationError[] } | null>>;
}

/**
 * Manages all modal/drawer open-close state and the AI mentor initial prompt.
 * No persistence needed — modals always start closed on page load.
 */
export function useModals(): ModalsState {
  const [selectedResource, setSelectedResource] = useState<ParsedResource | null>(null);
  const [isAiMentorOpen, setIsAiMentorOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState("");
  const [validationStatus, setValidationStatus] = useState<{ valid: boolean; errors: string[] } | null>(null);

  return {
    selectedResource,
    setSelectedResource,
    isAiMentorOpen,
    setIsAiMentorOpen,
    isQuizOpen,
    setIsQuizOpen,
    isCheatSheetOpen,
    setIsCheatSheetOpen,
    isSolutionOpen,
    setIsSolutionOpen,
    aiInitialPrompt,
    setAiInitialPrompt,
    validationStatus,
    setValidationStatus,
  };
}