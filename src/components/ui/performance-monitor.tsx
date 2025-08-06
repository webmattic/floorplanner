import React, { useEffect, useRef, useState } from "react";
import { usePanelStore } from "../../stores/panelStore";

interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  fps: number;
  panelCount: number;
  visiblePanelCount: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  samplingInterval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

// Performance monitoring hook
export const usePerformanceMonitor = (enabled = false) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    updateTime: 0,
    memoryUsage: 0,
    fps: 0,
    panelCount: 0,
    visiblePanelCount: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef<number | null>(null);

  const getVisiblePanels = usePanelStore((state) => state.getVisiblePanels);
  const panels = usePanelStore((state) => state.panels);

  const measureFPS = () => {
    frameCount.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime.current;

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      frameCount.current = 0;
      lastTime.current = currentTime;

      setMetrics((prev) => ({ ...prev, fps }));
    }

    if (enabled) {
      animationFrame.current = requestAnimationFrame(measureFPS);
    }
  };

  const getMemoryUsage = (): number => {
    if ("memory" in performance) {
      const memInfo = (performance as any).memory;
      return Math.round((memInfo.usedJSHeapSize / 1024 / 1024) * 100) / 100; // MB
    }
    return 0;
  };

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const visiblePanels = getVisiblePanels();
      const panelCount = Object.keys(panels).length;
      const visiblePanelCount = visiblePanels.length;
      const memoryUsage = getMemoryUsage();

      setMetrics((prev) => ({
        ...prev,
        panelCount,
        visiblePanelCount,
        memoryUsage,
      }));
    };

    // Start FPS monitoring
    animationFrame.current = requestAnimationFrame(measureFPS);

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 1000);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      clearInterval(interval);
    };
  }, [enabled, getVisiblePanels, panels]);

  return metrics;
};

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for high-frequency updates
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for consistent update rates
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let lastTime = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        func(...args);
      }
    };
  },

  // Optimize panel rendering with RAF
  scheduleUpdate: (callback: () => void) => {
    requestAnimationFrame(callback);
  },

  // Batch multiple panel updates
  batchUpdates: (updates: (() => void)[]) => {
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  },

  // Memory cleanup for panels
  cleanupPanel: (panelId: string) => {
    // Clean up any event listeners, timers, or subscriptions
    const panelElement = document.getElementById(`panel-${panelId}`);
    if (panelElement) {
      // Remove any attached event listeners
      const events = ["mousemove", "mouseup", "touchmove", "touchend"];
      events.forEach((event) => {
        panelElement.removeEventListener(event, () => {});
      });
    }
  },

  // Optimize drag operations
  optimizeDrag: {
    // Use transform3d for hardware acceleration
    setTransform: (element: HTMLElement, x: number, y: number) => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },

    // Reduce update frequency during drag
    throttledUpdate: (() => {
      let lastTime = 0;
      return (callback: () => void) => {
        const now = Date.now();
        if (now - lastTime >= 16) {
          // ~60fps
          lastTime = now;
          callback();
        }
      };
    })(),

    // Use will-change for better performance
    enableOptimization: (element: HTMLElement) => {
      element.style.willChange = "transform";
    },

    disableOptimization: (element: HTMLElement) => {
      element.style.willChange = "auto";
    },
  },
};

// React component for performance monitoring display
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = false,
  samplingInterval: _samplingInterval = 1000,
  onMetricsUpdate,
}) => {
  const metrics = usePerformanceMonitor(enabled);

  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  onMetricsUpdateRef.current = onMetricsUpdate;

  useEffect(() => {
    if (onMetricsUpdateRef.current) {
      onMetricsUpdateRef.current(metrics);
    }
  }, [
    metrics.fps,
    metrics.memoryUsage,
    metrics.visiblePanelCount,
    metrics.panelCount,
    metrics.renderTime,
    metrics.updateTime,
  ]);

  if (!enabled || process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50">
      <div className="space-y-1">
        <div>FPS: {metrics.fps}</div>
        <div>Memory: {metrics.memoryUsage}MB</div>
        <div>
          Panels: {metrics.visiblePanelCount}/{metrics.panelCount}
        </div>
        <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
        <div>Update: {metrics.updateTime.toFixed(1)}ms</div>
      </div>
    </div>
  );
};

// HOC for performance-optimized panels
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.memo((props: P) => {
    const renderStart = useRef(performance.now());

    useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 16) {
        // Log slow renders (>16ms)
        console.warn(`Slow panel render: ${renderTime.toFixed(2)}ms`);
      }
    });

    return <Component {...props} />;
  });
};

export default PerformanceMonitor;
