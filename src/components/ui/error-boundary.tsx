import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorId: string;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}) => (
  <Card className="m-4 border-red-200 bg-red-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        Something went wrong
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-sm text-red-600">
        <p className="font-medium">Error Details:</p>
        <p className="font-mono text-xs bg-red-100 p-2 rounded mt-1 break-all">
          {error.message}
        </p>
        <p className="text-xs text-red-500 mt-1">Error ID: {errorId}</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={resetError}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Reload App
        </Button>
      </div>
    </CardContent>
  </Card>
);

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (if configured)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if reset keys changed
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    // Reset error state if any props changed and resetOnPropsChange is true
    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    // Clear any pending reset
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: "",
    });
  };

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    // Examples: Sentry, Bugsnag, LogRocket, etc.

    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: null, // Could be populated from your auth store
    };

    // For now, just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Report");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Full Report:", errorReport);
      console.groupEnd();
    }

    // In production, send to your error tracking service
    // Example:
    // errorTrackingService.captureException(error, {
    //   extra: errorReport,
    //   tags: { component: 'ErrorBoundary' }
    // });
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props;

    if (hasError && error) {
      return (
        <Fallback
          error={error}
          resetError={this.resetError}
          errorId={errorId}
        />
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Panel-specific error boundary with enhanced features
export const PanelErrorBoundary: React.FC<{
  children: ReactNode;
  panelId: string;
  panelTitle?: string;
}> = ({ children, panelId, panelTitle }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Panel-specific error handling
    console.error(`Panel "${panelId}" encountered an error:`, error, errorInfo);

    // Could trigger panel-specific recovery actions
    // Example: Reset panel state, notify user, etc.
  };

  const PanelErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    resetError,
    errorId,
  }) => (
    <div className="p-4 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <h3 className="font-medium text-gray-900 mb-1">
        {panelTitle || "Panel"} Error
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        This panel encountered an error and couldn't load properly.
      </p>
      <Button onClick={resetError} size="sm" variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reload Panel
      </Button>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-3 text-left">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Error Details (ID: {errorId})
          </summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );

  return (
    <ErrorBoundary
      fallback={PanelErrorFallback}
      onError={handleError}
      resetKeys={[panelId]}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
