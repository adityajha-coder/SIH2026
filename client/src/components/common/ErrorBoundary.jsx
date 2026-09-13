import React from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      traceId: "TRC-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console for dev auditing
    console.error("Sovereign ErrorBoundary captured exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F9FC] text-[#10233F] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-[#E2E8F0] shadow-md bg-white">
            <CardContent className="p-8 text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded inline-block border border-amber-200">
                  Exception Handled Gracefully
                </div>
                <h1 className="text-xl font-bold text-[#10233F]">
                  Sovereign Portal Notice
                </h1>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  An unexpected client-side rendering exception occurred while processing this interface. Your session state remains intact.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] font-mono text-slate-600 space-y-1 text-left">
                <div className="flex justify-between text-slate-400">
                  <span>Diagnostic Trace:</span>
                  <span className="font-bold text-[#10233F]">{this.state.traceId}</span>
                </div>
                {this.state.error && (
                  <div className="text-rose-700 truncate font-semibold">
                    {this.state.error.toString()}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <Button
                  onClick={this.handleReload}
                  className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-9 gap-1.5 font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto text-xs h-9 gap-1.5 border-slate-300 text-[#10233F]"
                >
                  <Home className="h-3.5 w-3.5" />
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
