import React from "react";
import ReactDOM from "react-dom/client";
import FloorPlannerApp from "./components/FloorPlannerApp.tsx";
import { appConfig, validateConfig } from "./config/app.config";
import "./index.css";

// Get root element (works for both Django integration and standalone)
const rootElement =
  document.getElementById("floorplanner-root") ||
  document.getElementById("root");

// Validate configuration
if (!validateConfig()) {
  console.error(
    "Invalid configuration detected. Please check your environment variables."
  );
}

// Debug logging
console.log("FloorPlanner main.tsx loaded");
console.log("Root element found:", !!rootElement);
console.log("App config:", appConfig);

// Create standalone app configuration
const standaloneAppConfig = {
  userId: appConfig.auth.mockUser?.id,
  isAuthenticated: !appConfig.auth.enabled || !!appConfig.auth.mockUser,
  apiBaseUrl: appConfig.api.baseUrl,
  wsUrl: appConfig.api.wsUrl,
  features: appConfig.features,
  storage: appConfig.storage,
  development: appConfig.development,
};

console.log("Standalone app config:", standaloneAppConfig);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("FloorPlanner Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
            color: "#dc2626",
          }}
        >
          <h2>❌ FloorPlanner Error</h2>
          <p>Something went wrong loading the FloorPlanner.</p>
          <details style={{ marginTop: "10px", textAlign: "left" }}>
            <summary>Error Details</summary>
            <pre
              style={{
                background: "#f3f4f6",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "12px",
                overflow: "auto",
              }}
            >
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

if (rootElement) {
  try {
    console.log("Creating React root...");
    const root = ReactDOM.createRoot(rootElement);

    console.log("Rendering FloorPlanner app...");
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <FloorPlannerApp config={standaloneAppConfig} />
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log("FloorPlanner app rendered successfully");
  } catch (error) {
    console.error("Failed to render FloorPlanner:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; text-align: center; font-family: Arial, sans-serif;">
        <h2>❌ FloorPlanner Failed to Load</h2>
        <p>Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }</p>
        <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
} else {
  console.error("FloorPlanner root element not found!");
  const fallbackHtml = `
    <div style="padding: 20px; color: red; text-align: center; font-family: Arial, sans-serif;">
      <h2>❌ FloorPlanner Root Element Not Found</h2>
      <p>The element with ID 'floorplanner-root' was not found in the DOM.</p>
      <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;

  // Try to find any container element to show the error
  const body = document.body;
  if (body) {
    body.innerHTML = fallbackHtml;
  }
}
