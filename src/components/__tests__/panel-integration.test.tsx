import { renderHook, act } from "@testing-library/react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";
import { ErrorBoundary } from "../ui/error-boundary";
import { PerformanceMonitor } from "../ui/performance-monitor";

// Mock data for testing
export const mockFloorPlanData = {
  id: "test-floorplan",
  title: "Test Floor Plan",
  walls: [
    {
      id: "wall-1",
      points: [0, 0, 100, 0],
      thickness: 10,
      color: "#000000",
    },
  ],
  rooms: [
    {
      id: "room-1",
      x: 10,
      y: 10,
      width: 80,
      height: 60,
      color: "#f0f0f0",
      label: "Living Room",
    },
  ],
  furniture: [
    {
      id: "furniture-1",
      x: 20,
      y: 20,
      width: 30,
      height: 20,
      color: "#8B4513",
      label: "Sofa",
    },
  ],
};

export const mockPanelStates = {
  drawingTools: {
    position: { x: 20, y: 80 },
    size: { width: 280, height: 400 },
    isMinimized: false,
    isVisible: true,
    zIndex: 1,
    isDocked: false,
    isSnapped: false,
  },
  furnitureLibrary: {
    position: { x: 320, y: 80 },
    size: { width: 320, height: 450 },
    isMinimized: false,
    isVisible: true,
    zIndex: 2,
    isDocked: false,
    isSnapped: false,
  },
};

// Testing utilities
export class PanelTestHelper {
  // Test panel visibility
  static testPanelVisibility = async (panelId: string) => {
    const { result } = renderHook(() => usePanelStore());

    // Initially hidden
    expect(result.current.isPanelVisible(panelId)).toBe(false);

    // Show panel
    act(() => {
      result.current.showPanel(panelId);
    });

    expect(result.current.isPanelVisible(panelId)).toBe(true);

    // Hide panel
    act(() => {
      result.current.hidePanel(panelId);
    });

    expect(result.current.isPanelVisible(panelId)).toBe(false);
  };

  // Test panel positioning
  static testPanelPositioning = async (panelId: string) => {
    const { result } = renderHook(() => usePanelStore());

    const newPosition = { x: 100, y: 200 };

    act(() => {
      result.current.showPanel(panelId);
      result.current.updatePanelPosition(panelId, newPosition);
    });

    const panelState = result.current.panels[panelId];
    expect(panelState.position).toEqual(newPosition);
  };

  // Test panel resizing
  static testPanelResizing = async (panelId: string) => {
    const { result } = renderHook(() => usePanelStore());

    const newSize = { width: 400, height: 300 };

    act(() => {
      result.current.showPanel(panelId);
      result.current.updatePanelSize(panelId, newSize);
    });

    const panelState = result.current.panels[panelId];
    expect(panelState.size).toEqual(newSize);
  };

  // Test panel minimization
  static testPanelMinimization = async (panelId: string) => {
    const { result } = renderHook(() => usePanelStore());

    act(() => {
      result.current.showPanel(panelId);
    });

    expect(result.current.isPanelMinimized(panelId)).toBe(false);

    act(() => {
      result.current.minimizePanel(panelId);
    });

    expect(result.current.isPanelMinimized(panelId)).toBe(true);

    act(() => {
      result.current.maximizePanel(panelId);
    });

    expect(result.current.isPanelMinimized(panelId)).toBe(false);
  };

  // Test panel docking
  static testPanelDocking = async (panelId: string) => {
    const { result } = renderHook(() => usePanelStore());

    act(() => {
      result.current.showPanel(panelId);
      result.current.dockPanel(panelId, "left");
    });

    const panelState = result.current.panels[panelId];
    expect(panelState.isDocked).toBe(true);
    expect(panelState.dockPosition).toBe("left");

    act(() => {
      result.current.undockPanel(panelId);
    });

    const updatedState = result.current.panels[panelId];
    expect(updatedState.isDocked).toBe(false);
    expect(updatedState.dockPosition).toBeUndefined();
  };

  // Test keyboard shortcuts
  static testKeyboardShortcuts = async () => {
    const { result } = renderHook(() => usePanelStore());

    // Test panel shortcuts
    Object.entries(PANEL_CONFIGS).forEach(([panelId, config]) => {
      if (config.keyboardShortcut) {
        // Simulate keyboard shortcut
        fireEvent.keyDown(document, {
          key: config.keyboardShortcut,
          ctrlKey: true,
        });

        // Panel should be visible
        expect(result.current.isPanelVisible(panelId)).toBe(true);

        // Press again to toggle off
        fireEvent.keyDown(document, {
          key: config.keyboardShortcut,
          ctrlKey: true,
        });

        expect(result.current.isPanelVisible(panelId)).toBe(false);
      }
    });
  };

  // Test panel state persistence
  static testPanelPersistence = async () => {
    const { result } = renderHook(() => usePanelStore());

    // Modify panel states
    act(() => {
      result.current.showPanel("drawingTools");
      result.current.updatePanelPosition("drawingTools", { x: 50, y: 100 });
      result.current.minimizePanel("drawingTools");
    });

    // Get current state
    const currentState = result.current.panels["drawingTools"];

    // Simulate page reload by creating new hook instance
    const { result: newResult } = renderHook(() => usePanelStore());

    // State should be persisted
    expect(newResult.current.panels["drawingTools"]).toEqual(currentState);
  };
}

// Integration tests for panel system
describe("Panel Integration Tests", () => {
  beforeEach(() => {
    // Reset stores before each test
    usePanelStore.getState().resetPanelLayout();
    localStorage.clear();
  });

  test("Panel visibility management", async () => {
    await PanelTestHelper.testPanelVisibility("drawingTools");
  });

  test("Panel positioning", async () => {
    await PanelTestHelper.testPanelPositioning("drawingTools");
  });

  test("Panel resizing", async () => {
    await PanelTestHelper.testPanelResizing("furnitureLibrary");
  });

  test("Panel minimization", async () => {
    await PanelTestHelper.testPanelMinimization("materialPalette");
  });

  test("Panel docking", async () => {
    await PanelTestHelper.testPanelDocking("properties");
  });

  test("Keyboard shortcuts", async () => {
    await PanelTestHelper.testKeyboardShortcuts();
  });

  test("Panel state persistence", async () => {
    await PanelTestHelper.testPanelPersistence();
  });

  test("Multiple panel interactions", async () => {
    const { result } = renderHook(() => usePanelStore());

    // Show multiple panels
    act(() => {
      result.current.showPanel("drawingTools");
      result.current.showPanel("furnitureLibrary");
      result.current.showPanel("materialPalette");
    });

    expect(result.current.getVisiblePanels().length).toBe(3);

    // Test z-index management
    act(() => {
      result.current.bringToFront("furnitureLibrary");
    });

    const furniturePanel = result.current.panels["furnitureLibrary"];
    const otherPanels = Object.values(result.current.panels).filter(
      (p) => p.isVisible && p !== furniturePanel
    );

    expect(otherPanels.every((p) => p.zIndex < furniturePanel.zIndex)).toBe(
      true
    );
  });

  test("Panel grouping functionality", async () => {
    const { result } = renderHook(() => usePanelStore());
    it("should manage panel groups", () => {
      let groupId: string = "";

      // Create a group
      act(() => {
        groupId = result.current.createGroup("Design Tools", [
          "drawingTools",
          "materialPalette",
        ]);
      });

      expect(result.current.panelGroups[groupId]).toBeDefined();
      expect(result.current.panelGroups[groupId].panelIds).toEqual([
        "drawingTools",
        "materialPalette",
      ]);

      // Add panel to group
      act(() => {
        result.current.addPanelToGroup("properties", groupId);
      });

      expect(result.current.panelGroups[groupId].panelIds).toContain(
        "properties"
      );

      // Remove panel from group
      act(() => {
        result.current.removePanelFromGroup("properties");
      });

      expect(result.current.panelGroups[groupId].panelIds).not.toContain(
        "properties"
      );
    });

    test("Workspace presets", async () => {
      const { result } = renderHook(() => usePanelStore());
      let presetId: string = "";

      // Set up custom panel layout
      act(() => {
        result.current.showPanel("drawingTools");
        result.current.showPanel("furnitureLibrary");
        result.current.updatePanelPosition("drawingTools", { x: 10, y: 10 });
        result.current.minimizePanel("furnitureLibrary");
      });

      // Create preset
      act(() => {
        presetId = result.current.createPreset(
          "My Custom Layout",
          "Layout for design work"
        );
      });

      expect(result.current.workspacePresets[presetId]).toBeDefined();

      // Modify layout
      act(() => {
        result.current.hidePanel("drawingTools");
        result.current.showPanel("materialPalette");
      });

      // Apply preset
      act(() => {
        result.current.applyPreset(presetId);
      });

      // Should restore original layout
      expect(result.current.isPanelVisible("drawingTools")).toBe(true);
      expect(result.current.isPanelVisible("furnitureLibrary")).toBe(true);
      expect(result.current.isPanelMinimized("furnitureLibrary")).toBe(true);
    });

    test("Error boundary functionality", async () => {
      // This would test error boundaries in a real component
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    test("Performance monitoring", async () => {
      // Mock performance API
      const mockPerformance = {
        now: jest.fn(() => Date.now()),
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        },
      };

      Object.defineProperty(window, "performance", {
        value: mockPerformance,
        writable: true,
      });

      const onMetricsUpdate = jest.fn();

      render(
        <PerformanceMonitor enabled={true} onMetricsUpdate={onMetricsUpdate} />
      );

      await waitFor(() => {
        expect(onMetricsUpdate).toHaveBeenCalled();
      });

      const metrics = onMetricsUpdate.mock.calls[0][0];
      expect(metrics).toHaveProperty("fps");
      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("panelCount");
    });
  });
});

export default PanelTestHelper;
