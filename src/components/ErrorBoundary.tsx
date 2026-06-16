import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
            
            {/* Visual Icon Alert */}
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-bold text-white uppercase tracking-wide">
                Se detectó una inconsistencia
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                El estado de la aplicación cargado en tu navegador experimentó un conflicto temporal. Por favor presiona "Reiniciar Aplicación" para reestablecer el estado local.
              </p>
            </div>

            {/* Error logs collapse (for debugging) */}
            {this.state.error && (
              <details className="text-left bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-400 max-h-40 overflow-y-auto">
                <summary className="cursor-pointer font-sans font-bold text-slate-500 select-none pb-1">
                  Detalles técnicos del error
                </summary>
                <div className="whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-705/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recargar Página
              </button>
              
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar Aplicación
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
