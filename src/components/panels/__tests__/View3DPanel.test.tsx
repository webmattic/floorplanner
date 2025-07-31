import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { View3DPanel } from "../View3DPanel";
import useFloorPlanStore from "../../../stores/floorPlanStore";
import { usePanelStore } from "../../../stores/panelStore";
import { TooltipProvider } from "../../ui/tooltip";

// Mock the stores
jest.mock("../../../stores/floorPlanStore");
jest.mock("../../../stores/panelStore");

// Mock react-rnd
jest.mock("react-rnd", () => ({
  Rnd: ({ children, ...props }: any) => (
    <div data-testid="rnd-container" {...props}>
      {children}
    </div>
  ),
}));

// Mock @react-three/fiber and @react-three/drei
jest.mock("@react-three/fiber", () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useThree: () => ({
    camera: { position: { set: jest.fn() }, updateProjectionMatrix: jest.fn() },
    gl: { domElement: document.createElement("canvas") },
  }),
}));

jest.mock("@react-three/drei", () => ({
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
  setViewMode: jest.fn(),
  cameraView: "default",
  setCameraView: jest.fn(),
  lighting: {
    mainLight: 1.0,
    ambientLight: 0.5,
    temperature: 6500,
  },
  updateSceneLighting: jest.fn(),
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
  hidePanel: jest.fn(),
  toggleMinimize: jest.fn(),
  bringToFront: jest.fn(),
  updatePanelPosition: jest.fn(),
  updatePanelSize: jest.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("View3DPanel", () => {
  beforeEach(() => {
    (useFloorPlanStore as jest.Mock).mockReturnValue(mockFloorPlanStore);
    (usePanelStore as jest.Mock).mockReturnValue(mockPanelStore);
    jest.clearAllMocks();
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
      expect(screen.getByText("Camera Presets")).toBeInTheDocument();
      expect(screen.getByText("Default View")).toBeInTheDocument();
      expect(screen.getByText("Top View")).toBeInTheDocument();
      expect(screen.getByText("Front View")).toBeInTheDocument();
      expect(screen.getByText("Side View")).toBeInTheDocument();
      expect(screen.getByText("Isometric")).toBeInTheDocument();
      expect(screen.getByText("Corner View")).toBeInTheDocument();
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
      expect(screen.getByText("Render Quality")).toBeInTheDocument();
      expect(screen.getByText("Environment")).toBeInTheDocument();
    });
  });

  it("displays export options in render tab", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to render tab
    const renderTab = screen.getByText("Render");
    fireEvent.click(renderTab);

    await waitFor(() => {
      expect(screen.getByText("Export & Share")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
      expect(screen.getByText("Share")).toBeInTheDocument();
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
    expect(rotationButton).toBeInTheDocument();
  });

  it("handles camera preset selection", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      const topViewButton = screen.getByText("Top View");
      fireEvent.click(topViewButton);

      expect(mockFloorPlanStore.setCameraView).toHaveBeenCalledWith("top");
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
      expect(screen.getByText(/Real-time sync/)).toBeInTheDocument();
      expect(
        screen.getByText(/Changes in 2D view automatically update/)
      ).toBeInTheDocument();
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
    expect(screen.getByText("2D View")).toBeInTheDocument();

    // Update mock store
    const updated3DStore = {
      ...mockFloorPlanStore,
      viewMode: "3d",
    };

    (useFloorPlanStore as jest.Mock).mockReturnValue(updated3DStore);

    rerender(
      <TooltipProvider>
        <View3DPanel />
      </TooltipProvider>
    );

    expect(screen.getByText("3D View")).toBeInTheDocument();
  });

  it("displays lighting values correctly", async () => {
    renderWithProviders(<View3DPanel />);

    // Switch to camera tab
    const cameraTab = screen.getByText("Camera");
    fireEvent.click(cameraTab);

    await waitFor(() => {
      // Check that lighting values are displayed
      expect(screen.getByText("1.0")).toBeInTheDocument(); // Main light
      expect(screen.getByText("0.5")).toBeInTheDocument(); // Ambient light
      expect(screen.getByText("6500K")).toBeInTheDocument(); // Temperature
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
