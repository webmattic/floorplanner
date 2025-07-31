import React, { useEffect, useState } from "react";

interface AppConfig {
  userId: string | undefined;
  isAuthenticated: boolean;
  apiBaseUrl: string;
  wsUrl: string;
}

interface FloorPlannerAppProps {
  config: AppConfig;
}

const FloorPlannerApp: React.FC<FloorPlannerAppProps> = ({ config }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log("Initializing FloorPlanner with config:", config);
      
      // Simulate initialization
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Failed to initialize FloorPlanner:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FloorPlanner...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">FloorPlanner Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-2">
        <h1 className="text-xl font-semibold text-gray-800">FloorPlanner</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">FloorPlanner Canvas</h2>
            <p className="text-gray-600">Ready to start designing!</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Config: {config.isAuthenticated ? "Authenticated" : "Not authenticated"}</p>
              <p>API: {config.apiBaseUrl}</p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <aside className="w-80 bg-white m-4 rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Tools & Properties</h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Drawing Tools</h4>
              <p className="text-sm text-gray-600">Select tools to start drawing</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Properties</h4>
              <p className="text-sm text-gray-600">Element properties will appear here</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Layers</h4>
              <p className="text-sm text-gray-600">Manage your design layers</p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-2 text-sm text-gray-500">
        FloorPlanner v2.0 - Status: {config.isAuthenticated ? "Ready" : "Demo Mode"}
      </footer>
    </div>
  );
};

export default FloorPlannerApp;