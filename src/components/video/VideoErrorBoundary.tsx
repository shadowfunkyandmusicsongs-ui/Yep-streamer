import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  onClose?: () => void;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class VideoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[VideoErrorBoundary] Caught rendering exception:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-full min-h-[420px] bg-slate-950 border border-rose-500/30 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center text-slate-100 z-50">
          {this.props.onClose && (
            <button
              onClick={this.props.onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Playback Engine Interrupted
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            A rendering or stream pipeline exception occurred while initializing the player.
            {this.state.error?.message ? ` Details: ${this.state.error.message}` : ''}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restart Player Engine</span>
            </button>
            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                Return to Browse
              </button>
            )}
          </div>

          {/* Technical Details Preview */}
          <details className="mt-8 text-left max-w-lg w-full bg-slate-900/80 border border-white/5 rounded-xl p-3 text-[11px] font-mono text-slate-400">
            <summary className="cursor-pointer text-slate-300 hover:text-white font-semibold">
              View Technical Crash Stack
            </summary>
            <div className="mt-2 whitespace-pre-wrap overflow-x-auto text-rose-300/80 max-h-40">
              {this.state.error?.stack || this.state.error?.message || 'No stack trace available'}
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
