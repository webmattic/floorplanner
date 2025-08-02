import { vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MaterialPalettePanel } from "../MaterialPalettePanel";
import { TooltipProvider } from "../../ui/tooltip";

// Mock the stores
vi.mock("../../../stores/floorPlanStore", () => ({
  __esModule: true,
  default: () => ({
    lighting: {
      mainLight: 1,
      ambientLight: 0.5,
      temperature: 6500,
    },
    updateSceneLighting: vi.fn(),
  }),
}));

vi.mock("../../../stores/panelStore", () => ({
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
    hidePanel: vi.fn(),
    toggleMinimize: vi.fn(),
    bringToFront: vi.fn(),
    updatePanelPosition: vi.fn(),
    updatePanelSize: vi.fn(),
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
vi.mock("react-rnd", () => ({
  Rnd: ({ children, ...props }: any) => (
    <div data-testid="rnd-container" {...props}>
      {children}
    </div>
  ),
}));

// Mock color theory utilities
vi.mock("../../../utils/colorTheory", () => ({
  generateSmartPalette: vi.fn((_baseColor, type) => {
    const paletteTypes = [
      "monochromatic",
      "analogous",
      "complementary",
      "triadic",
      "split-complementary",
    ];

    return {
      id: `${type}-test`,
      name: `Test ${type}`,
      colors: paletteTypes.map((t) => `#${t.slice(0, 6).padEnd(6, "0")}`),
      type,
      description: `Test ${type} palette`,
    };
  }),
  hexToHsl: vi.fn(() => ({ h: 240, s: 100, l: 50 })),
  hslToHex: vi.fn(() => "#0000FF"),
  isAccessible: vi.fn(() => true),
  PRESET_COLOR_PALETTES: [
    {
      id: "modern",
      name: "Modern Minimalist",
      colors: ["#FFFFFF", "#F5F5F5", "#E0E0E0", "#BDBDBD", "#757575"],
      type: "monochromatic",
      description: "Clean, minimal palette for contemporary spaces",
    },
    {
      id: "warm",
      name: "Warm Comfort",
      colors: ["#FFF8DC", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F"],
      type: "analogous",
      description: "Cozy, inviting colors for comfortable living",
    },
    {
      id: "cool",
      name: "Cool Serenity",
      colors: ["#E0F6FF", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6"],
      type: "analogous",
      description: "Calming blues for peaceful environments",
    },
  ],
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("MaterialPalettePanel", () => {
  it("renders without crashing", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /materials/i })).toBeVisible();
      expect(screen.getByRole("tab", { name: /colors/i })).toBeVisible();
      expect(screen.getByRole("tab", { name: /lighting/i })).toBeVisible();
    });
  });

  it("displays material categories", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /walls/i })).toBeVisible();
      expect(screen.getByRole("tab", { name: /floors/i })).toBeVisible();
      expect(screen.getByRole("tab", { name: /fabrics/i })).toBeVisible();
    });
  });

  it("displays smart palette generator", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    fireEvent.click(screen.getByRole("tab", { name: /colors/i }));

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: /smart palette generator/i })
        ).toBeVisible();
        expect(screen.getByLabelText(/base color/i)).toBeVisible();
      },
      { timeout: 2000 }
    ); // Increased timeout
  });

  it("displays lighting controls", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    fireEvent.click(screen.getByRole("tab", { name: /lighting/i }));

    await waitFor(() => {
      expect(screen.getByTestId("scene-lighting-controls-title")).toBeVisible();
      expect(screen.getByTestId("main-light-intensity-label")).toBeVisible();
      expect(screen.getByTestId("ambient-light-label")).toBeVisible();
      expect(screen.getByTestId("color-temperature-label")).toBeVisible();
      expect(
        screen.getByRole("slider", { name: /main light intensity/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: /ambient light/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: /color temperature/i })
      ).toBeInTheDocument();
    });
  });

  it("displays time of day presets", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    fireEvent.click(screen.getByRole("tab", { name: /lighting/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /night/i })).toBeVisible();
      expect(screen.getByRole("button", { name: /dawn/i })).toBeVisible();
      expect(screen.getByRole("button", { name: /midday/i })).toBeVisible();
      expect(screen.getByRole("button", { name: /sunset/i })).toBeVisible();
    });
  });

  it("generates smart palettes when base color changes", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    fireEvent.click(screen.getByRole("tab", { name: /colors/i }));

    const colorInput = screen.getByLabelText(/base color/i);
    fireEvent.change(colorInput, { target: { value: "#FF0000" } });

    await waitFor(
      () => {
        const generatedPalettes = screen.getAllByText(/test .* palette/i);
        expect(generatedPalettes.length).toBe(5); // 5 palette types
      },
      { timeout: 1000 }
    ); // Increased timeout for async operation
  });

  it("displays preset color palettes", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    fireEvent.click(screen.getByRole("tab", { name: /colors/i }));

    await waitFor(() => {
      expect(screen.getByText(/modern minimalist/i)).toBeVisible();
      expect(screen.getByText(/warm comfort/i)).toBeVisible();
      expect(screen.getByText(/cool serenity/i)).toBeVisible();
    });
  });

  it("shows material textures and colors", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    await waitFor(() => {
      expect(screen.getByText(/white paint/i)).toBeVisible();
      expect(screen.getByText(/red brick/i)).toBeVisible();
      expect(screen.getByText(/wood paneling/i)).toBeVisible();
    });
  });

  it("switches material categories", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    fireEvent.click(screen.getByRole("tab", { name: /floors/i }));

    await waitFor(() => {
      expect(screen.getByTestId("material-texture-hardwood")).toBeVisible();
      expect(screen.getByTestId("material-texture-ceramic-tile")).toBeVisible();
      expect(screen.getByTestId("material-texture-marble")).toBeVisible();
    });
  });

  it("displays helpful instructions", async () => {
    renderWithProviders(<MaterialPalettePanel />);

    await waitFor(() => {
      expect(
        screen.getByTestId("material-panel-instruction-select-elements")
      ).toBeVisible();
      expect(
        screen.getByTestId("material-panel-instruction-smart-palette")
      ).toBeVisible();
      expect(
        screen.getByTestId("material-panel-instruction-lighting-changes")
      ).toBeVisible();
    });
  });
});
