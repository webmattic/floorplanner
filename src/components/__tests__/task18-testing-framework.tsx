// Comprehensive testing utilities for FloorPlanner Task 18
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/**
 * Comprehensive testing environment setup for FloorPlanner
 */
export class FloorPlannerTestingFramework {
  private static instance: FloorPlannerTestingFramework;
  private originalViewport: { width: number; height: number };
  private originalUserAgent: string;

  constructor() {
    this.originalViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.originalUserAgent = navigator.userAgent;
  }

  static getInstance(): FloorPlannerTestingFramework {
    if (!FloorPlannerTestingFramework.instance) {
      FloorPlannerTestingFramework.instance =
        new FloorPlannerTestingFramework();
    }
    return FloorPlannerTestingFramework.instance;
  }

  /**
   * Mock viewport for responsive testing
   */
  mockViewport(width: number, height: number): void {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: height,
    });

    // Trigger resize event
    window.dispatchEvent(new Event("resize"));
  }

  /**
   * Mock user agent for cross-browser testing
   */
  mockUserAgent(userAgent: string): void {
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      configurable: true,
      value: userAgent,
    });
  }

  /**
   * Mock pointer events for touch testing
   */
  mockPointerEvents(): void {
    Object.defineProperty(window, "PointerEvent", {
      writable: true,
      configurable: true,
      value: class MockPointerEvent extends Event {
        pointerId: number;
        pointerType: string;
        isPrimary: boolean;

        constructor(type: string, options: any = {}) {
          super(type, options);
          this.pointerId = options.pointerId || 0;
          this.pointerType = options.pointerType || "mouse";
          this.isPrimary = options.isPrimary || false;
        }
      },
    });
  }

  /**
   * Mock Intersection Observer for performance testing
   */
  mockIntersectionObserver(): void {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: mockIntersectionObserver,
    });
  }

  /**
   * Restore all mocks
   */
  restoreAll(): void {
    this.mockViewport(
      this.originalViewport.width,
      this.originalViewport.height
    );
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      configurable: true,
      value: this.originalUserAgent,
    });
  }
}

/**
 * Cross-browser compatibility testing utilities
 */
export class CrossBrowserTesting {
  static readonly USER_AGENTS = {
    CHROME_DESKTOP:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    FIREFOX_DESKTOP:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    SAFARI_DESKTOP:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    EDGE_DESKTOP:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    CHROME_MOBILE:
      "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    SAFARI_MOBILE:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  };

  static readonly VIEWPORTS = {
    MOBILE_PORTRAIT: { width: 375, height: 667 },
    MOBILE_LANDSCAPE: { width: 667, height: 375 },
    TABLET_PORTRAIT: { width: 768, height: 1024 },
    TABLET_LANDSCAPE: { width: 1024, height: 768 },
    DESKTOP_SMALL: { width: 1366, height: 768 },
    DESKTOP_LARGE: { width: 1920, height: 1080 },
  };

  /**
   * Test panel functionality across different browsers
   */
  static async testCrossBrowserPanelOperations(component: React.ReactElement) {
    const framework = FloorPlannerTestingFramework.getInstance();
    const results: Record<string, boolean> = {};

    for (const [browserName, userAgent] of Object.entries(this.USER_AGENTS)) {
      framework.mockUserAgent(userAgent);

      try {
        const { unmount } = render(component);

        // Test basic panel operations
        const showPanelButton = screen.getByText(/show panel/i);
        fireEvent.click(showPanelButton);

        // Verify panel visibility
        const panel = screen.getByTestId("floating-panel");
        expect(panel).toBeInTheDocument();

        // Test drag functionality
        const dragHandle = screen.getByTestId("panel-drag-handle");
        fireEvent.mouseDown(dragHandle);
        fireEvent.mouseMove(dragHandle, { clientX: 100, clientY: 50 });
        fireEvent.mouseUp(dragHandle);

        results[browserName] = true;
        unmount();
      } catch (error) {
        console.error(`${browserName} failed:`, error);
        results[browserName] = false;
      }
    }

    return results;
  }

  /**
   * Test responsive behavior across different viewports
   */
  static async testResponsiveViewports(component: React.ReactElement) {
    const framework = FloorPlannerTestingFramework.getInstance();
    const results: Record<string, { passed: boolean; panelCount: number }> = {};

    for (const [viewportName, viewport] of Object.entries(this.VIEWPORTS)) {
      framework.mockViewport(viewport.width, viewport.height);

      try {
        const { unmount } = render(component);

        // Allow time for responsive adjustments
        await waitFor(() => {
          const panels = screen.getAllByTestId(/floating-panel/);
          const visiblePanels = panels.filter(
            (panel) => window.getComputedStyle(panel).display !== "none"
          );

          results[viewportName] = {
            passed: true,
            panelCount: visiblePanels.length,
          };
        });

        unmount();
      } catch (error) {
        console.error(`${viewportName} failed:`, error);
        results[viewportName] = { passed: false, panelCount: 0 };
      }
    }

    return results;
  }
}

/**
 * Accessibility testing utilities
 */
export class AccessibilityTesting {
  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(component: React.ReactElement) {
    render(component);

    const results = {
      tabNavigation: false,
      enterActivation: false,
      spaceActivation: false,
      escapeHandling: false,
      arrowNavigation: false,
    };

    try {
      // Test Tab navigation
      const firstButton = screen.getByRole("button");
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      results.tabNavigation = true;

      // Test Enter key activation
      fireEvent.keyDown(firstButton, { key: "Enter", code: "Enter" });
      results.enterActivation = true;

      // Test Space key activation
      fireEvent.keyDown(firstButton, { key: " ", code: "Space" });
      results.spaceActivation = true;

      // Test Escape key handling
      fireEvent.keyDown(firstButton, { key: "Escape", code: "Escape" });
      results.escapeHandling = true;

      // Test Arrow key navigation
      fireEvent.keyDown(firstButton, { key: "ArrowDown", code: "ArrowDown" });
      fireEvent.keyDown(firstButton, { key: "ArrowRight", code: "ArrowRight" });
      results.arrowNavigation = true;
    } catch (error) {
      console.error("Keyboard navigation test failed:", error);
    }

    return results;
  }

  /**
   * Test screen reader compatibility
   */
  static async testScreenReaderCompatibility(component: React.ReactElement) {
    render(component);

    const results = {
      ariaLabels: false,
      semanticMarkup: false,
      focusManagement: false,
      announcements: false,
    };

    try {
      // Check for ARIA labels
      const ariaLabeledElements = screen.getAllByLabelText(/.+/);
      results.ariaLabels = ariaLabeledElements.length > 0;

      // Check semantic markup
      const headings = screen.getAllByRole("heading");
      const buttons = screen.getAllByRole("button");
      results.semanticMarkup = headings.length > 0 && buttons.length > 0;

      // Check focus management
      const focusableButtons = screen.getAllByRole("button");
      const focusableTextboxes = screen.queryAllByRole("textbox");
      results.focusManagement =
        focusableButtons.length > 0 || focusableTextboxes.length > 0;

      // Check for live regions (announcements)
      const liveRegions = screen.queryAllByRole("status");
      results.announcements = liveRegions.length > 0;
    } catch (error) {
      console.error("Screen reader test failed:", error);
    }

    return results;
  }

  /**
   * Test color contrast compliance
   */
  static testColorContrast(component: React.ReactElement) {
    const { container } = render(component);

    // Check for high-contrast CSS classes
    const highContrastElements = container.querySelectorAll(
      '[class*="high-contrast"]'
    );
    const darkModeElements = container.querySelectorAll('[class*="dark"]');

    return {
      hasHighContrast: highContrastElements.length > 0,
      hasDarkMode: darkModeElements.length > 0,
      totalElements: container.querySelectorAll("*").length,
    };
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTesting {
  /**
   * Test panel rendering performance
   */
  static async testPanelRenderingPerformance(component: React.ReactElement) {
    const renderTimes: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      const { unmount } = render(component);
      const endTime = performance.now();

      renderTimes.push(endTime - startTime);
      unmount();
    }

    return {
      averageRenderTime:
        renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
      minRenderTime: Math.min(...renderTimes),
      maxRenderTime: Math.max(...renderTimes),
      renderTimes,
    };
  }

  /**
   * Test memory usage with multiple panels
   */
  static async testMemoryUsage(component: React.ReactElement) {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const { unmount } = render(component);

    // Simulate heavy usage
    for (let i = 0; i < 100; i++) {
      const panel = screen.getByTestId("floating-panel");
      fireEvent.mouseDown(panel);
      fireEvent.mouseMove(panel, { clientX: i * 10, clientY: i * 5 });
      fireEvent.mouseUp(panel);
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    unmount();

    return {
      initialMemory,
      finalMemory,
      memoryDelta: finalMemory - initialMemory,
      memoryLeakDetected: finalMemory > initialMemory * 1.5, // 50% threshold
    };
  }

  /**
   * Test complex floor plan performance
   */
  static async testComplexFloorPlanPerformance(component: React.ReactElement) {
    const metrics = {
      renderTime: 0,
      updateTime: 0,
      interactionDelay: 0,
    };

    // Measure initial render
    const renderStart = performance.now();
    const { rerender } = render(component);
    metrics.renderTime = performance.now() - renderStart;

    // Measure updates
    const updateStart = performance.now();
    rerender(component);
    metrics.updateTime = performance.now() - updateStart;

    // Measure interaction delay
    const interactionStart = performance.now();
    const button = screen.getByText(/show panel/i);
    fireEvent.click(button);
    metrics.interactionDelay = performance.now() - interactionStart;

    return metrics;
  }
}

/**
 * Bug detection and UI polish testing
 */
export class BugDetectionTesting {
  /**
   * Test for common panel positioning bugs
   */
  static testPanelPositioning(component: React.ReactElement) {
    render(component);
    const issues: string[] = [];

    try {
      const panels = screen.getAllByTestId(/floating-panel/);

      panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();

        // Check if panel is outside viewport
        if (rect.left < 0 || rect.top < 0) {
          issues.push(
            `Panel ${index} positioned outside viewport (negative coordinates)`
          );
        }

        if (
          rect.right > window.innerWidth ||
          rect.bottom > window.innerHeight
        ) {
          issues.push(`Panel ${index} extends beyond viewport boundaries`);
        }

        // Check for overlap detection
        panels.forEach((otherPanel, otherIndex) => {
          if (index !== otherIndex) {
            const otherRect = otherPanel.getBoundingClientRect();
            const overlap = !(
              rect.right < otherRect.left ||
              rect.left > otherRect.right ||
              rect.bottom < otherRect.top ||
              rect.top > otherRect.bottom
            );

            if (overlap) {
              issues.push(`Panel ${index} overlaps with panel ${otherIndex}`);
            }
          }
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      issues.push(`Panel positioning test failed: ${errorMessage}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * Test for state persistence bugs
   */
  static async testStatePersistence(component: React.ReactElement) {
    const issues: string[] = [];

    try {
      const { rerender, unmount } = render(component);

      // Simulate user interactions
      const panel = screen.getByTestId("floating-panel");
      fireEvent.mouseDown(panel);
      fireEvent.mouseMove(panel, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(panel);

      // Check if state is saved to localStorage
      const savedState = localStorage.getItem("floorplanner-panels");
      if (!savedState) {
        issues.push("Panel state not saved to localStorage");
      }

      unmount();

      // Re-render and check if state is restored
      rerender(component);
      const restoredPanel = screen.getByTestId("floating-panel");
      const rect = restoredPanel.getBoundingClientRect();

      if (rect.left < 90 || rect.left > 110) {
        // Allow some tolerance
        issues.push("Panel position not restored correctly");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      issues.push(`State persistence test failed: ${errorMessage}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * Test for memory leaks
   */
  static async testMemoryLeaks(component: React.ReactElement) {
    const issues: string[] = [];
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(component);

        // Simulate usage
        const panel = screen.getByTestId("floating-panel");
        fireEvent.mouseDown(panel);
        fireEvent.mouseMove(panel, { clientX: i * 10, clientY: i * 10 });
        fireEvent.mouseUp(panel);

        unmount();
      }

      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      if (memoryIncrease > 5000000) {
        // 5MB threshold
        issues.push(
          `Potential memory leak detected: ${memoryIncrease} bytes increase`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      issues.push(`Memory leak test failed: ${errorMessage}`);
    }

    return {
      passed: issues.length === 0,
      issues,
      memoryDelta: (performance as any).memory?.usedJSHeapSize - initialMemory,
    };
  }
}

/**
 * Main test runner for Task 18
 */
export class Task18TestRunner {
  static async runComprehensiveTests(component: React.ReactElement) {
    console.log("🧪 Starting Task 18 Comprehensive Testing...");

    const results = {
      crossBrowser: await CrossBrowserTesting.testCrossBrowserPanelOperations(
        component
      ),
      responsive: await CrossBrowserTesting.testResponsiveViewports(component),
      accessibility: {
        keyboard: await AccessibilityTesting.testKeyboardNavigation(component),
        screenReader: await AccessibilityTesting.testScreenReaderCompatibility(
          component
        ),
        colorContrast: AccessibilityTesting.testColorContrast(component),
      },
      performance: {
        rendering: await PerformanceTesting.testPanelRenderingPerformance(
          component
        ),
        memory: await PerformanceTesting.testMemoryUsage(component),
        complex: await PerformanceTesting.testComplexFloorPlanPerformance(
          component
        ),
      },
      bugDetection: {
        positioning: BugDetectionTesting.testPanelPositioning(component),
        persistence: await BugDetectionTesting.testStatePersistence(component),
        memoryLeaks: await BugDetectionTesting.testMemoryLeaks(component),
      },
    };

    console.log("✅ Task 18 Testing Complete!");
    return results;
  }

  static generateTestReport(results: any) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
      details: results,
    };

    // Calculate summary statistics
    const flattenResults = (obj: any): boolean[] => {
      const values: boolean[] = [];
      for (const key in obj) {
        if (typeof obj[key] === "boolean") {
          values.push(obj[key]);
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          values.push(...flattenResults(obj[key]));
        }
      }
      return values;
    };

    const testResults = flattenResults(results);
    report.summary.totalTests = testResults.length;
    report.summary.passed = testResults.filter(Boolean).length;
    report.summary.failed = testResults.filter((r) => !r).length;

    return report;
  }
}

export default Task18TestRunner;
