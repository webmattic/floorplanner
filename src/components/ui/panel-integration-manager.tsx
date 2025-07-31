import React, { useEffect, useCallback, useMemo } from "react";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";
import useFloorPlanStore from "../../stores/floorPlanStore";
import { ErrorBoundary, PanelErrorBoundary } from "../ui/error-boundary";
import {
  PerformanceMonitor,
  performanceUtils,
} from "../ui/performance-monitor";

interface PanelIntegrationConfig {
  enableErrorBoundaries: boolean;
  enablePerformanceMonitoring: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number;
  enableKeyboardShortcuts: boolean;
  enablePanelSynchronization: boolean;
}

interface PanelIntegrationManagerProps {
  config?: Partial<PanelIntegrationConfig>;
  children: React.ReactNode;
}

const defaultConfig: PanelIntegrationConfig = {
  enableErrorBoundaries: true,
  enablePerformanceMonitoring: process.env.NODE_ENV === "development",
  enableAutoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  enableKeyboardShortcuts: true,
  enablePanelSynchronization: true,
};

// Panel data synchronization service
class PanelSyncService {
  private static instance: PanelSyncService;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  private panelData: Map<string, any> = new Map();

  static getInstance(): PanelSyncService {
    if (!PanelSyncService.instance) {
      PanelSyncService.instance = new PanelSyncService();
    }
    return PanelSyncService.instance;
  }

  // Subscribe to panel data changes
  subscribe(panelId: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(panelId)) {
      this.subscribers.set(panelId, []);
    }
    this.subscribers.get(panelId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(panelId);
      if (subs) {
        const index = subs.indexOf(callback);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  // Update panel data and notify subscribers
  updatePanelData(panelId: string, data: any): void {
    this.panelData.set(panelId, data);
    const subscribers = this.subscribers.get(panelId);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in panel ${panelId} data sync:`, error);
        }
      });
    }
  }

  // Get panel data
  getPanelData(panelId: string): any {
    return this.panelData.get(panelId);
  }

  // Broadcast data to all panels
  broadcast(data: any): void {
    this.subscribers.forEach((callbacks, panelId) => {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error broadcasting to panel ${panelId}:`, error);
        }
      });
    });
  }
}

// Hook for panel data synchronization
export const usePanelSync = (panelId: string) => {
  const syncService = useMemo(() => PanelSyncService.getInstance(), []);

  const updateData = useCallback(
    (data: any) => {
      syncService.updatePanelData(panelId, data);
    },
    [syncService, panelId]
  );

  const subscribe = useCallback(
    (callback: (data: any) => void) => {
      return syncService.subscribe(panelId, callback);
    },
    [syncService, panelId]
  );

  const getData = useCallback(() => {
    return syncService.getPanelData(panelId);
  }, [syncService, panelId]);

  return { updateData, subscribe, getData };
};

// Auto-save functionality
const useAutoSave = (enabled: boolean, interval: number) => {
  const currentFloorPlan = useFloorPlanStore((state) => state.currentFloorPlan);
  const panelStates = usePanelStore((state) => state.panels);
  const lastSave = React.useRef<number>(0);

  const saveData = useCallback(
    performanceUtils.throttle(() => {
      try {
        const saveData = {
          floorPlan: currentFloorPlan,
          panels: panelStates,
          timestamp: Date.now(),
        };

        localStorage.setItem("floorplanner-autosave", JSON.stringify(saveData));
        lastSave.current = Date.now();

        console.log("Auto-saved floor plan data");
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 5000), // Throttle saves to every 5 seconds max
    [currentFloorPlan, panelStates]
  );

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastSave.current >= interval) {
        saveData();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, saveData]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      saveData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, saveData]);
};

// Keyboard shortcuts manager
const useKeyboardShortcuts = (enabled: boolean) => {
  const { showPanel, hidePanel, togglePanel } = usePanelStore();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for panel shortcuts (1-9)
      if (event.ctrlKey || event.metaKey) {
        const key = event.key;

        // Find panel with matching shortcut
        const panelConfig = Object.values(PANEL_CONFIGS).find(
          (config) => config.keyboardShortcut === key
        );

        if (panelConfig) {
          event.preventDefault();

          if (event.shiftKey) {
            hidePanel(panelConfig.id);
          } else {
            togglePanel(panelConfig.id);
          }
        }

        // Global shortcuts
        switch (key) {
          case "h":
            event.preventDefault();
            // Hide all panels
            Object.keys(PANEL_CONFIGS).forEach(hidePanel);
            break;
          case "r":
            event.preventDefault();
            // Reset panel layout
            usePanelStore.getState().resetPanelLayout();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, showPanel, hidePanel, togglePanel]);
};

// Panel validation and health checks
const usePanelHealthCheck = () => {
  const panels = usePanelStore((state) => state.panels);

  useEffect(() => {
    const checkPanelHealth = () => {
      Object.entries(panels).forEach(([panelId, panelState]) => {
        const element = document.getElementById(`panel-${panelId}`);

        if (panelState.isVisible && !element) {
          console.warn(
            `Panel ${panelId} is marked as visible but DOM element not found`
          );
        }

        // Check for panels outside viewport
        if (element && panelState.isVisible) {
          const rect = element.getBoundingClientRect();
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
          };

          if (
            rect.right < 0 ||
            rect.left > viewport.width ||
            rect.bottom < 0 ||
            rect.top > viewport.height
          ) {
            console.warn(`Panel ${panelId} is outside viewport bounds`);
          }
        }
      });
    };

    const interval = setInterval(checkPanelHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [panels]);
};

// Main Panel Integration Manager component
export const PanelIntegrationManager: React.FC<
  PanelIntegrationManagerProps
> = ({ config: userConfig = {}, children }) => {
  const config = { ...defaultConfig, ...userConfig };

  // Initialize services
  useAutoSave(config.enableAutoSave, config.autoSaveInterval);
  useKeyboardShortcuts(config.enableKeyboardShortcuts);
  usePanelHealthCheck();

  // Error boundary wrapper
  const content = config.enableErrorBoundaries ? (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Panel system error:", error, errorInfo);
        // Could send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  ) : (
    children
  );

  return (
    <>
      {content}
      {config.enablePerformanceMonitoring && (
        <PerformanceMonitor
          enabled={true}
          onMetricsUpdate={(metrics) => {
            // Log performance warnings
            if (metrics.fps < 30) {
              console.warn("Low FPS detected:", metrics.fps);
            }
            if (metrics.memoryUsage > 100) {
              console.warn("High memory usage:", metrics.memoryUsage, "MB");
            }
          }}
        />
      )}
    </>
  );
};

// Enhanced floating panel wrapper with integration features
export const IntegratedFloatingPanel: React.FC<{
  panelId: string;
  children: React.ReactNode;
  enableSync?: boolean;
}> = ({ panelId, children, enableSync = true }) => {
  const panelConfig = PANEL_CONFIGS[panelId];
  const { subscribe } = usePanelSync(panelId);

  // Sync panel state changes
  useEffect(() => {
    if (!enableSync) return;

    const unsubscribe = subscribe((data) => {
      // Handle incoming sync data
      console.log(`Panel ${panelId} received sync data:`, data);
    });

    return unsubscribe;
  }, [panelId, subscribe, enableSync]);

  return (
    <PanelErrorBoundary panelId={panelId} panelTitle={panelConfig?.title}>
      {children}
    </PanelErrorBoundary>
  );
};

export default PanelIntegrationManager;
