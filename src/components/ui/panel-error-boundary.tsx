import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge } from "./badge.tsx";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";

interface Props {
  children: ReactNode;
  panelId?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export class PanelErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Panel Error Boundary - ${this.props.panelId || "Unknown Panel"}`);
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error monitoring service
    const errorReport = {
      errorId: this.state.errorId,
      panelId: this.props.panelId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Example: Send to error monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });

    console.log("Error report:", errorReport);
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
    });
  };

  private copyErrorDetails = async () => {
    const errorDetails = {
      panelId: this.props.panelId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      // Show success feedback (in a real app, you might use a toast)
      console.log("Error details copied to clipboard");
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <Card className="m-4 border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-700 text-lg">
                  Panel Error
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {this.props.panelId || "Unknown Panel"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {errorId}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertTitle>Something went wrong in this panel</AlertTitle>
              <AlertDescription className="mt-2">
                {error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>

            {process.env.NODE_ENV === "development" && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-red-700 hover:text-red-800">
                  Technical Details (Development Mode)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Error Stack:</strong>
                    <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                      {error?.stack}
                    </pre>
                  </div>
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - retryCount} left)
                </Button>
              )}
              
              <Button
                onClick={this.handleReset}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Reset Panel
              </Button>

              <Button
                onClick={this.copyErrorDetails}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Error Details
              </Button>

              {process.env.NODE_ENV === "production" && (
                <Button
                  onClick={() => {
                    // In a real app, this might open a support ticket or feedback form
                    window.open(
                      `mailto:support@example.com?subject=Panel Error Report&body=Error ID: ${errorId}`,
                      "_blank"
                    );
                  }}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Report Issue
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                This error has been logged and will be investigated. You can continue
                using other panels while this issue is resolved.
              </p>
              {retryCount > 0 && (
                <p className="mt-1 text-amber-600">
                  Retry attempts: {retryCount}/{this.maxRetries}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping panels with error boundaries
export const withPanelErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  panelId: string,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <PanelErrorBoundary panelId={panelId} fallback={fallback}>
      <Component {...props} />
    </PanelErrorBoundary>
  );

  WrappedComponent.displayName = `withPanelErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};