import React, { ErrorInfo, ReactNode, Suspense } from 'react';
import { MfeManifest } from './types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  mfe: MfeManifest;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MfeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;
  setState: any;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[MFE Isolation Error] Remote ${this.props.mfe.id} crashed:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#121215] border border-red-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl my-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100">
              Remote Micro-Frontend [{this.props.mfe.name}] Mengalami Kendala
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Berhasil diisolasi oleh Shell MFE Error Boundary. Aplikasi utama dan modul micro frontend lainnya tetap berjalan normal secara independen.
            </p>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-[11px] text-red-300 max-w-lg mx-auto text-left overflow-x-auto">
            {this.state.error?.toString() || 'Unknown Remote Exception'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer border border-zinc-700"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Muat Ulang Isolasi Remote MFE</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface MfeContainerProps {
  mfe: MfeManifest;
  children: ReactNode;
}

export const MfeContainer: React.FC<MfeContainerProps> = ({ mfe, children }) => {
  return (
    <MfeErrorBoundary mfe={mfe}>
      <Suspense
        fallback={
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-12 text-center space-y-4 my-6">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-emerald-400">
                Memuat Remote Entry: {mfe.remoteEntryUrl}
              </p>
              <p className="text-[11px] text-zinc-500">
                Module Federation Host & Bridge Syncing ({mfe.bundleSizeKb} KB)...
              </p>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </MfeErrorBoundary>
  );
};
