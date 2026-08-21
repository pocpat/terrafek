import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable React Error Boundary.
 *
 * Catches render errors in its children and shows a styled fallback
 * with a "Try Again" button instead of a full white-screen crash.
 * Place around major UI sections (panels, modals, workspace areas)
 * so a crash in one area doesn't kill the rest of the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const label = this.props.label || "Unknown";
    console.error(`[ErrorBoundary: ${label}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const label = this.props.label || "Component";

      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-[#FAFAFA] text-center overflow-auto custom-scrollbar">
          <div className="flex flex-col items-center max-w-sm">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xs font-bold text-stone-900 mb-1 font-sans">
              {label} crashed
            </h3>
            <p className="text-[11px] text-stone-500 mb-3 leading-relaxed font-mono break-all">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}