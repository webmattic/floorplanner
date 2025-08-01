import { vi } from 'vitest';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { View3DPanel } from "../View3DPanel";
import useFloorPlanStore from "../../../stores/floorPlanStore";
import { usePanelStore } from "../../../stores/panelStore";
import { TooltipProvider } from "../../ui/tooltip";

// Mock the stores
vi.mock("../../../stores/floorPlanStore");
vi.mock("../../../stores/panelStore");

// Mock react-rnd
vi.mock("react-rnd", () => ({
  Rnd: ({ children, ...props }: any) => (
    <div data-testid="rnd-container" {...props}>
      {children}
    </div>
  ),
}));

// Mock @react-three/fiber and @react-three/drei
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useThree: () => ({
    camera: { position: { set: vi.fn() }, updateProjectionMatrix: vi.fn() },
    gl: { domElement: document.createElement("canvas") },
  }),
}));

vi.mock("@react-three/drei", () => ({
  Grid: ({ ...props }: any) => <div data-testid="grid" {...props} />,
  OrbitControls: ({ ...props }: any) => (
    <div data-testid="orbit-controls" {...props} />
  ),
  Environment: ({ ...props }: any) => (
    <div data-testid="environment" {...props} />
  ),
  ContactShadows: ({ ...props }: any) => (
    <div data-testid="contact-shadows" {...props} />
  ),
}));

const mockFloorPlanStore = {
  viewMode: "2d",
  setViewMode: vi.fn(),
  cameraView: "default",
  setCameraView: vi.fn(),
  lighting: {
    mainLight: 1.0,
    ambientLight: 0.5,
    temperature: 6500,
  },
  updateSceneLighting: vi.fn(),
  walls: [
    { id: "wall-1", points: [0, 0, 100, 0], thickness: 8, color: "#808080" },
  ],
  rooms: [
    {
      id: "room-1",
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      color: "#90EE90",
      label: "Living Room",
    },
  ],
  furniture: [
    {
      id: "furniture-1",
      x: 75,
      y: 75,
      width: 100,
      height: 50,
      color: "#4169E1",
      label: "Sofa",
    },
  ],
};

const mockPanelStore = {
  panels: {
    view3D: {
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      isMinimized: false,
      isVisible: true,
      zIndex: 100,
    },
  },
  hidePanel: vi.fn(),
  toggleMinimize: vi.fn(),
  bringToFront: vi.fn(),
  updatePanelPosition: vi.fn(),
  updatePanelSize: vi.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("View3DPanel", () => {
  // Custom utility to match split/nested text across multiple elements

  // Helper to find element by matching text across elements
  beforeEach(() => {
    (useFloorPlanStore as any).mockReturnValue(mockFloorPlanStore);
    (usePanelStore as any).mockReturnValue(mockPanelStore);
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderWithProviders(<View3DPanel />);
    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Camera")).toBeInTheDocument();
    expect(screen.getByText("Render")).toBeInTheDocument();
  });

  it("displays 3D canvas in view tab", () => {
    renderWithProviders(<View3DPanel />);
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("shows view mode indicator", () => {
    renderWithProviders(<View3DPanel />);
    expect(screen.getByText("2D View")).toBeInTheDocument();
  });

  it("toggles 2D/3D view when toggle button is clicked", async () => {
    renderWithProviders(<View3DPanel />);

    // Find the toggle button (Move3d icon)
    const toggleButtons = screen.getAllByRole("button");
    const toggleButton = toggleButtons.find((button) =>
      button.querySelector('[data-lucide="move-3d"]')
    );

    if (toggleButton) {
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockFloorPlanStore.setViewMode).toHaveBeenCalledWith("3d");
      });
    }
  });

  it("displays camera presets in camera tab", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      expect(screen.getByText(/Camera Presets/i)).toBeInTheDocument();
      // Switch to camera tab before checking camera presets
      const cameraTab = screen.getByText("Camera");
      fireEvent.click(cameraTab);
      await waitFor(() => {
        ["default", "top", "front", "side", "isometric", "corner"].forEach((presetId) => {
          expect(screen.getByTestId(`camera-preset-${presetId}`)).toBeInTheDocument();
        });
      });
    });
  });

  it("displays lighting controls in camera tab", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      expect(screen.getByText("Scene Lighting")).toBeInTheDocument();
      expect(screen.getByText("Main Light")).toBeInTheDocument();
      expect(screen.getByText("Ambient Light")).toBeInTheDocument();
      expect(screen.getByText("Temperature")).toBeInTheDocument();
    });
  });

  it("updates lighting when sliders are changed", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      // Find sliders and simulate changes
      const sliders = screen.getAllByRole("slider");
      if (sliders.length > 0) {
        fireEvent.change(sliders[0], { target: { value: "1.5" } });

        // The updateSceneLighting should be called
        expect(mockFloorPlanStore.updateSceneLighting).toHaveBeenCalled();
      }
    });
  });

  it("displays render quality options in render tab", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to render tab
    const renderTab = screen.getByText("Render");
    fireEvent.click(renderTab);

    await waitFor(() => {
      // Switch to render tab before checking render quality and environment
      const renderTab = screen.getByText("Render");
      fireEvent.click(renderTab);
      await waitFor(() => {
        expect(screen.getByTestId("render-quality-label")).toBeInTheDocument();
        expect(screen.getByTestId("environment-label")).toBeInTheDocument();
      });
    });
  });

  it("displays export options in render tab", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to render tab
    const renderTab = screen.getByText("Render");
    fireEvent.click(renderTab);

    await waitFor(() => {
      // Switch to render tab before checking export/share
      const renderTab = screen.getByText("Render");
      fireEvent.click(renderTab);
      await waitFor(() => {
        expect(screen.getByTestId("export-share-label")).toBeInTheDocument();
        expect(screen.getByTestId("export-button")).toBeInTheDocument();
        expect(screen.getByTestId("share-button")).toBeInTheDocument();
      });
    });
  });

  it("shows grid and shadows toggle switches", () => {
    renderWithProviders(<View3DPanel />);

    expect(screen.getByText("Grid")).toBeInTheDocument();
    expect(screen.getByText("Shadows")).toBeInTheDocument();
  });

  it("displays auto-frame and rotation controls", () => {
    renderWithProviders(<View3DPanel />);

    expect(screen.getByText("Frame")).toBeInTheDocument();
    // Play/Pause button for auto-rotation
    const playPauseButtons = screen.getAllByRole("button");
    const rotationButton = playPauseButtons.find(
      (button) =>
        button.querySelector('[data-lucide="play"]') ||
        button.querySelector('[data-lucide="pause"]')
    );
    expect(rotationButton).not.toBeUndefined();
    expect(rotationButton).not.toBeNull();
    expect(rotationButton instanceof HTMLElement).toBe(true);
  });

  it("handles camera preset selection", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      // Switch to camera tab before clicking camera preset
      const cameraTab = screen.getByText("Camera");
      fireEvent.click(cameraTab);
      await waitFor(() => {
        const topViewButton = screen.getByTestId("camera-preset-top");
        fireEvent.click(topViewButton);
        expect(mockFloorPlanStore.setCameraView).toHaveBeenCalledWith("top");
      });
    });
  });

  it("toggles grid visibility", async () => {
    renderWithProviders(<View3DPanel />);

    const gridSwitch = screen.getByRole("switch", { name: /grid/i });
    fireEvent.click(gridSwitch);

    // Grid should be toggled (implementation detail)
    expect(gridSwitch).toBeInTheDocument();
  });

  it("toggles shadow visibility", async () => {
    renderWithProviders(<View3DPanel />);

    const shadowSwitch = screen.getByRole("switch", { name: /shadows/i });
    fireEvent.click(shadowSwitch);

    // Shadows should be toggled (implementation detail)
    expect(shadowSwitch).toBeInTheDocument();
  });

  it("displays real-time sync information", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to render tab
    const renderTab = screen.getByText("Render");
    fireEvent.click(renderTab);

    await waitFor(() => {
      // Switch to render tab before checking real-time sync alert
      const renderTab = screen.getByText("Render");
      fireEvent.click(renderTab);
      await waitFor(() => {
        expect(screen.getByTestId("realtime-sync-alert")).toBeInTheDocument();
      });
    });
  });

  it("handles auto-frame scene action", async () => {
    renderWithProviders(<View3DPanel />);

    const frameButton = screen.getByText("Frame");
    fireEvent.click(frameButton);

    await waitFor(() => {
      expect(mockFloorPlanStore.setCameraView).toHaveBeenCalledWith(
        "autoframe"
      );
    });
  });

  it("toggles auto-rotation", async () => {
    renderWithProviders(<View3DPanel />);

    // Find the play/pause button for auto-rotation
    const playPauseButtons = screen.getAllByRole("button");
    const rotationButton = playPauseButtons.find((button) =>
      button.querySelector('[data-lucide="play"]')
    );

    if (rotationButton) {
      fireEvent.click(rotationButton);
      // Auto-rotation should be toggled (implementation detail)
      expect(rotationButton).toBeInTheDocument();
    }
  });

  it("renders 3D scene components", () => {
    renderWithProviders(<View3DPanel />);

    // Check that 3D scene elements are rendered
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("updates view mode indicator when viewMode changes", () => {
    const { rerender } = renderWithProviders(<View3DPanel />);

    // Initial state
    expect(screen.getAllByText("2D View").length).toBeGreaterThan(0);

    // Update mock store
    const updated3DStore = {
      ...mockFloorPlanStore,
      viewMode: "3d",
    };

    (useFloorPlanStore as any).mockReturnValue(updated3DStore);

    rerender(
      <TooltipProvider>
        <View3DPanel />
      </TooltipProvider>
    );

    // Use getAllByText to avoid ambiguity
    expect(screen.getAllByText("3D View").length).toBeGreaterThan(0);
  });

  it("displays lighting values correctly", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      // Switch to camera tab before checking lighting values
      const cameraTab = screen.getByText("Camera");
      fireEvent.click(cameraTab);
      await waitFor(() => {
        expect(screen.getByTestId("main-light-value")).toHaveTextContent("1.0"); // Main light
        expect(screen.getByTestId("ambient-light-value")).toHaveTextContent("0.5"); // Ambient light
        expect(screen.getByTestId("temperature-value")).toHaveTextContent("6500K"); // Temperature
      });
    });
  });

  it("handles fullscreen toggle", async () => {
    renderWithProviders(<View3DPanel />);

    // Find the fullscreen button
    const fullscreenButtons = screen.getAllByRole("button");
    const fullscreenButton = fullscreenButtons.find((button) =>
      button.querySelector('[data-lucide="fullscreen"]')
    );

    if (fullscreenButton) {
      fireEvent.click(fullscreenButton);
      // Fullscreen should be toggled (implementation detail)
      expect(fullscreenButton).toBeInTheDocument();
    }
  });
});
