import { useEffect, useRef, useCallback, useState } from "react";
import { usePanelStore } from "../stores/panelStore";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  panelCount: number;
  visiblePanelCount: number;
  lastUpdate: number;
  frameRate: number;
  isLagging: boolean;
}

interface PanelPerformanceData {
  panelId: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  memoryImpact: number;
}

export const usePanelPerformance = () => {
  const { panels } = usePanelStore();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    panelCount: 0,
    visiblePanelCount: 0,
    lastUpdate: Date.now(),
    frameRate: 60,
    isLagging: false,
  });
  
  const [panelData, setPanelData] = useState<Record<string, PanelPerformanceData>>({});
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Monitor frame rate
  const updateFrameRate = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
      
      setMetrics(prev => ({
        ...prev,
        frameRate: fps,
        isLagging: fps < 30, // Consider lagging if below 30 FPS
      }));
    }
    
    frameCountRef.current++;
    requestAnimationFrame(updateFrameRate);
  }, []);

  // Monitor memory usage
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
      }));
    }
  }, []);

  // Monitor render performance
  const measureRenderTime = useCallback((panelId: string, renderTime: number) => {
    setPanelData(prev => {
      const existing = prev[panelId] || {
        panelId,
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        memoryImpact: 0,
      };

      const newRenderCount = existing.renderCount + 1;
      const newAverageRenderTime = 
        (existing.averageRenderTime * existing.renderCount + renderTime) / newRenderCount;

      return {
        ...prev,
        [panelId]: {
          ...existing,
          renderCount: newRenderCount,
          averageRenderTime: newAverageRenderTime,
          lastRenderTime: renderTime,
        },
      };
    });

    // Track overall render times
    renderTimesRef.current.push(renderTime);
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift(); // Keep only last 100 measurements
    }

    const averageRenderTime = 
      renderTimesRef.current.reduce((sum, time) => sum + time, 0) / 
      renderTimesRef.current.length;

    setMetrics(prev => ({
      ...prev,
      renderTime: averageRenderTime,
      lastUpdate: Date.now(),
    }));
  }, []);

  // Update panel counts
  useEffect(() => {
    const panelCount = Object.keys(panels).length;
    const visiblePanelCount = Object.values(panels).filter(panel => panel.isVisible).length;

    setMetrics(prev => ({
      ...prev,
      panelCount,
      visiblePanelCount,
    }));
  }, [panels]);

  // Initialize performance monitoring
  useEffect(() => {
    // Start frame rate monitoring
    requestAnimationFrame(updateFrameRate);

    // Update memory usage periodically
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    // Set up Performance Observer for paint timing
    if ('PerformanceObserver' in window) {
      try {
        performanceObserverRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'measure' && entry.name.startsWith('panel-render-')) {
              const panelId = entry.name.replace('panel-render-', '');
              measureRenderTime(panelId, entry.duration);
            }
          });
        });

        performanceObserverRef.current.observe({ 
          entryTypes: ['measure', 'navigation', 'paint'] 
        });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }

    return () => {
      clearInterval(memoryInterval);
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, [updateFrameRate, updateMemoryUsage, measureRenderTime]);

  // Performance optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.frameRate < 30) {
      recommendations.push("Frame rate is low. Consider reducing the number of visible panels.");
    }

    if (metrics.visiblePanelCount > 8) {
      recommendations.push("Many panels are visible. Hide unused panels to improve performance.");
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push("High memory usage detected. Consider refreshing the page.");
    }

    if (metrics.renderTime > 16) {
      recommendations.push("Slow rendering detected. Check for complex panel content.");
    }

    const slowPanels = Object.values(panelData).filter(
      panel => panel.averageRenderTime > 10
    );
    if (slowPanels.length > 0) {
      recommendations.push(
        `Slow panels detected: ${slowPanels.map(p => p.panelId).join(', ')}`
      );
    }

    return recommendations;
  }, [metrics, panelData]);

  // Performance actions
  const optimizePerformance = useCallback(() => {
    const { minimizeAllPanels, resetPanelLayout } = usePanelStore.getState();
    
    if (metrics.frameRate < 20) {
      // Emergency optimization: minimize all panels
      minimizeAllPanels();
      return "Emergency optimization: All panels minimized due to low frame rate.";
    }

    if (metrics.visiblePanelCount > 10) {
      // Hide some panels
      const panelIds = Object.keys(panels);
      const visiblePanels = panelIds.filter(id => panels[id].isVisible);
      const panelsToHide = visiblePanels.slice(8); // Keep only 8 visible
      
      panelsToHide.forEach(panelId => {
        usePanelStore.getState().hidePanel(panelId);
      });
      
      return `Hid ${panelsToHide.length} panels to improve performance.`;
    }

    return "No immediate optimizations needed.";
  }, [metrics, panels]);

  // Create a performance measurement wrapper for panel renders
  const measurePanelRender = useCallback((panelId: string, renderFn: () => void) => {
    const measureName = `panel-render-${panelId}`;
    performance.mark(`${measureName}-start`);
    
    renderFn();
    
    performance.mark(`${measureName}-end`);
    performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
  }, []);

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    if (metrics.frameRate >= 50 && metrics.renderTime < 10) {
      return { status: 'excellent', color: 'green' };
    } else if (metrics.frameRate >= 30 && metrics.renderTime < 16) {
      return { status: 'good', color: 'blue' };
    } else if (metrics.frameRate >= 20 && metrics.renderTime < 25) {
      return { status: 'fair', color: 'yellow' };
    } else {
      return { status: 'poor', color: 'red' };
    }
  }, [metrics]);

  return {
    metrics,
    panelData,
    getOptimizationRecommendations,
    optimizePerformance,
    measurePanelRender,
    getPerformanceStatus,
  };
};