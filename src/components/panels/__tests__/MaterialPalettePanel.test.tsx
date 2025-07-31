import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MaterialPalettePanel } from "../MaterialPalettePanel";
import { TooltipProvider } from "../../ui/tooltip";

// Mock the stores
jest.mock("../../../stores/floorPlanStore", () => ({
  __esModule: true,
  default: () => ({
    lighting: {
      mainLight: 1,
      ambientLight: 0.5,
      temperature: 6500,
    },
    updateSceneLighting: jest.fn(),
  }),
}));

jest.mock("../../../stores/panelStore", () => ({
  usePanelStore: () => ({
    panels: {
      materialPalette: {
        position: { x: 100, y: 100 },
        size: { width: 300, height: 400 },
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
  }),
  PANEL_CONFIGS: {
    materialPalette: {
      id: "materialPalette",
      title: "Materials & Colors",
      icon: "Palette",
      defaultPosition: { x: 660, y: 80 },
      defaultSize: { width: 300, height: 400 },
      minSize: { width: 280, height: 350 },
      resizable: true,
      minimizable: true,
      closable: true,
    },
  },
}));

// Mock react-rnd
jest.mock("react-rnd", () => ({
  Rnd: ({ children, ...props }: any) => (
    <div data-testid="rnd-container" {...props}>
      {children}
    </div>
  ),
}));

// Mock color theory utilities
jest.mock("../../../utils/colorTheory", () => ({
  generateSmartPalette: jest.fn((baseColor, type) => ({
    id: `${type}-test`,
    name: `Test ${type}`,
    colors: ["#FF0000", "#00FF00", "#0000FF"],
    type,
    description: `Test ${type} palette`,
  })),
  hexToHsl: jest.fn(() => ({ h: 240, s: 100, l: 50 })),
  hslToHex: jest.fn(() => "#0000FF"),
  isAccessible: jest.fn(() => true),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("MaterialPalettePanel", () => {
  it("renders without crashing", () => {
    renderWithProviders(<MaterialPalettePanel />);
    expect(screen.getByText("Materials")).toBeInTheDocument();
    expect(screen.getByText("Colors")).toBeInTheDocument();
    expect(screen.getByText("Lighting")).toBeInTheDocument();
  });

  it("displays material categories", () => {
    renderWithProviders(<MaterialPalettePanel />);

    expect(screen.getByText("Walls")).toBeInTheDocument();
    expect(screen.getByText("Floors")).toBeInTheDocument();
    expect(screen.getByText("Fabrics")).toBeInTheDocument();
  });

  it("displays smart palette generator", () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Switch to colors tab
    fireEvent.click(screen.getByText("Colors"));

    expect(screen.getByText("Smart Palette Generator")).toBeInTheDocument();
    expect(screen.getByText("Base Color")).toBeInTheDocument();
  });

  it("displays lighting controls", () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Switch to lighting tab
    fireEvent.click(screen.getByText("Lighting"));

    expect(screen.getByText("Scene Lighting Controls")).toBeInTheDocument();
    expect(screen.getByText("Main Light Intensity")).toBeInTheDocument();
    expect(screen.getByText("Ambient Light")).toBeInTheDocument();
    expect(screen.getByText("Color Temperature")).toBeInTheDocument();
  });

  it("displays time of day presets", () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Switch to lighting tab
    fireEvent.click(screen.getByText("Lighting"));

    expect(screen.getByText("Night")).toBeInTheDocument();
    expect(screen.getByText("Dawn")).toBeInTheDocument();
    expect(screen.getByText("Midday")).toBeInTheDocument();
    expect(screen.getByText("Sunset")).toBeInTheDocument();
  });

  it("generates smart palettes when base color changes", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Switch to colors tab
    fireEvent.click(screen.getByText("Colors"));

    // Find and change base color input
    const colorInput = screen.getByDisplayValue("#3B82F6");
    fireEvent.change(colorInput, { target: { value: "#FF0000" } });

    // Should trigger palette generation
    await waitFor(() => {
      expect(screen.getByText("Generated")).toBeInTheDocument();
    });
  });

  it("displays preset color palettes", () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Switch to colors tab
    fireEvent.click(screen.getByText("Colors"));

    expect(screen.getByText("Modern Minimalist")).toBeInTheDocument();
    expect(screen.getByText("Warm Comfort")).toBeInTheDocument();
    expect(screen.getByText("Cool Serenity")).toBeInTheDocument();
  });

  it("shows material textures and colors", () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Should show wall materials by default
    expect(screen.getByText("White Paint")).toBeInTheDocument();
    expect(screen.getByText("Red Brick")).toBeInTheDocument();
    expect(screen.getByText("Wood Paneling")).toBeInTheDocument();
  });

  it("switches material categories", () => {
    renderWithProviders(<MaterialPalettePanel />);

    // Switch to floors
    fireEvent.click(screen.getByText("Floors"));

    expect(screen.getByText("Hardwood")).toBeInTheDocument();
    expect(screen.getByText("Ceramic Tile")).toBeInTheDocument();
    expect(screen.getByText("Marble")).toBeInTheDocument();
  });

  it("displays helpful instructions", () => {
    renderWithProviders(<MaterialPalettePanel />);

    expect(
      screen.getByText(
        "Select elements first, then drag materials/colors to apply"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Use smart palette generator for harmonious color schemes"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lighting changes reflect in 3D view instantly")
    ).toBeInTheDocument();
  });
});
