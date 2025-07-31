import React, { useCallback, useMemo, memo, useEffect, useRef } from "react";

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Performance Monitor Hook
 * Tracks component render times and performance metrics
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTimeRef.current;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Performance] ${componentName} lifetime: ${totalLifetime.toFixed(
            2
          )}ms`
        );
      }
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    renderTimeRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderTimeRef.current;

    if (process.env.NODE_ENV === "development" && renderTime > 16) {
      console.warn(
        `[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`
      );
    }

    return renderTime;
  }, [componentName]);

  return { startRender, endRender };
};

/**
 * Optimized Panel Component
 * Memoized panel component with performance optimizations
 */
interface OptimizedPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
  onVisibilityChange?: (visible: boolean) => void;
}

export const OptimizedPanel = memo<OptimizedPanelProps>(
  ({ id, title, children, isVisible, className, onVisibilityChange }) => {
    const { startRender, endRender } = usePerformanceMonitor(
      `OptimizedPanel-${id}`
    );

    useEffect(() => {
      startRender();
      return () => {
        endRender();
      };
    });

    // Memoize expensive calculations
    const panelStyles = useMemo(
      () => ({
        display: isVisible ? "block" : "none",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-10px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }),
      [isVisible]
    );

    // Only render children when visible
    const optimizedChildren = useMemo(() => {
      return isVisible ? children : null;
    }, [isVisible, children]);

    const handleToggleVisibility = useCallback(() => {
      onVisibilityChange?.(!isVisible);
    }, [isVisible, onVisibilityChange]);

    return (
      <div
        id={id}
        className={cn(
          "panel-optimized",
          "will-change-transform", // GPU acceleration
          className
        )}
        style={panelStyles}
        data-testid={`optimized-panel-${id}`}
      >
        <div className="panel-header">
          <h3>{title}</h3>
          <button
            onClick={handleToggleVisibility}
            aria-label={`Toggle ${title} panel`}
          >
            {isVisible ? "−" : "+"}
          </button>
        </div>

        <div className="panel-content">{optimizedChildren}</div>
      </div>
    );
  }
);

OptimizedPanel.displayName = "OptimizedPanel";

/**
 * Virtual Scrolling Component
 * Optimizes rendering of large lists
 */
interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      start: visibleStart,
      end: visibleEnd,
      items: items.slice(visibleStart, visibleEnd),
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  return (
    <div
      ref={containerRef}
      className={cn("virtual-scroll-container", className)}
      style={{ height: containerHeight, overflow: "auto" }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {visibleItems.items.map((item, index) => (
          <div
            key={visibleItems.start + index}
            style={{
              position: "absolute",
              top: (visibleItems.start + index) * itemHeight,
              height: itemHeight,
              width: "100%",
            }}
          >
            {renderItem(item, visibleItems.start + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Debounced Input Component
 * Optimizes input handling with debouncing
 */
interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value,
  onChange,
  delay = 300,
  placeholder,
  className,
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
      }, delay);
    },
    [onChange, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        "debounced-input",
        "border border-gray-300 rounded px-3 py-2",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
    />
  );
};

/**
 * Intersection Observer Hook
 * Optimizes rendering based on element visibility
 */
export const useIntersectionObserver = (
  threshold = 0.1,
  rootMargin = "0px"
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [ref, setRef] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin]);

  return [setRef, isIntersecting] as const;
};

/**
 * Lazy Loading Component
 * Only renders when component is in viewport
 */
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <div>Loading...</div>,
  threshold = 0.1,
  rootMargin = "100px",
  className,
}) => {
  const [setRef, isIntersecting] = useIntersectionObserver(
    threshold,
    rootMargin
  );
  const [hasLoaded, setHasLoaded] = React.useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return (
    <div ref={setRef} className={className}>
      {hasLoaded ? children : fallback}
    </div>
  );
};

/**
 * Performance Testing Utilities
 */
export const performanceUtils = {
  /**
   * Measure component render time
   */
  measureRenderTime: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const renderTime = end - start;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`
      );
    }

    return renderTime;
  },

  /**
   * Measure memory usage
   */
  measureMemoryUsage: () => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  /**
   * Profile function execution
   */
  profile: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Performance] ${name} execution time: ${(end - start).toFixed(2)}ms`
        );
      }

      return result;
    }) as T;
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: any[]) => any>(fn: T, limit: number): T => {
    let inThrottle = false;
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        fn.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  },

  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(null, args), delay);
    }) as T;
  },

  /**
   * Run performance audit
   */
  runPerformanceAudit: () => {
    const audit = {
      timestamp: new Date().toISOString(),
      memory: performanceUtils.measureMemoryUsage(),
      timing: {
        domContentLoaded: performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming,
        paintMetrics: performance.getEntriesByType("paint"),
      },
      recommendations: [] as string[],
    };

    // Add recommendations based on audit results
    if (audit.memory && audit.memory.used > audit.memory.limit * 0.8) {
      audit.recommendations.push(
        "High memory usage detected. Consider implementing virtual scrolling or lazy loading."
      );
    }

    if (
      audit.timing.domContentLoaded.loadEventEnd -
        audit.timing.domContentLoaded.loadEventStart >
      3000
    ) {
      audit.recommendations.push(
        "Slow page load detected. Consider code splitting and lazy loading."
      );
    }

    return audit;
  },
};

/**
 * Cross-Browser Compatibility Utilities
 */
export const crossBrowserUtils = {
  /**
   * Feature detection
   */
  supportsWebGL: () => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      return false;
    }
  },

  supportsTouch: () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },

  supportsIntersectionObserver: () => {
    return "IntersectionObserver" in window;
  },

  /**
   * Browser detection
   */
  getBrowserInfo: () => {
    const userAgent = navigator.userAgent;
    const browsers = {
      chrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
      safari:
        /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor),
      firefox: /Firefox/.test(userAgent),
      edge: /Edge/.test(userAgent),
      ie: /Trident/.test(userAgent),
    };

    const browser =
      Object.keys(browsers).find(
        (key) => browsers[key as keyof typeof browsers]
      ) || "unknown";

    return {
      browser,
      version:
        userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/)?.[1] ||
        "unknown",
      mobile: /Mobi|Android/i.test(userAgent),
      touch: crossBrowserUtils.supportsTouch(),
      webgl: crossBrowserUtils.supportsWebGL(),
    };
  },

  /**
   * Polyfill for missing features
   */
  addPolyfills: () => {
    // Intersection Observer polyfill
    if (!crossBrowserUtils.supportsIntersectionObserver()) {
      console.warn(
        "IntersectionObserver not supported. Consider adding a polyfill."
      );
    }

    // Add CSS custom properties fallback for IE
    if (crossBrowserUtils.getBrowserInfo().browser === "ie") {
      console.warn(
        "CSS custom properties not fully supported. Consider using a fallback."
      );
    }
  },
};

export default {
  OptimizedPanel,
  VirtualScroll,
  DebouncedInput,
  LazyComponent,
  usePerformanceMonitor,
  useIntersectionObserver,
  performanceUtils,
  crossBrowserUtils,
};
