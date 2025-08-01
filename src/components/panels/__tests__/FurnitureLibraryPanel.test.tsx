import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// Vitest provides built-in matchers
import { FurnitureLibraryPanel } from "../FurnitureLibraryPanel";
import { TooltipProvider } from "../../ui/tooltip";

// Mock the stores

import { vi } from "vitest";
vi.mock("../../../stores/floorPlanStore", () => ({
  __esModule: true,
  default: () => ({
    gridSize: 50,
    snapToGrid: true,
    addFurniture: vi.fn(),
  }),
}));

vi.mock("../../../stores/panelStore", () => ({
  usePanelStore: () => ({
    panels: {
      furnitureLibrary: {
        position: { x: 100, y: 100 },
        size: { width: 320, height: 450 },
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
    furnitureLibrary: {
      id: "furnitureLibrary",
      title: "Furniture Library",
      icon: "Package",
      defaultPosition: { x: 320, y: 80 },
      defaultSize: { width: 320, height: 450 },
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

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("FurnitureLibraryPanel", () => {
  it("renders without crashing", () => {
    renderWithProviders(<FurnitureLibraryPanel />);
    expect(
      screen.getByPlaceholderText("Search furniture...")
    ).toBeInTheDocument();
  });

  it("displays furniture categories", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    expect(screen.getByText("Seating")).toBeInTheDocument();
    expect(screen.getByText("Tables")).toBeInTheDocument();
    expect(screen.getByText("Bedroom")).toBeInTheDocument();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Lighting")).toBeInTheDocument();
    expect(screen.getByText("Decor")).toBeInTheDocument();
  });

  it("displays furniture items for selected category", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    // Default category is "seating"
    expect(screen.getByText("Modern Sofa")).toBeInTheDocument();
    expect(screen.getByText("Office Chair")).toBeInTheDocument();
    expect(screen.getByText("Armchair")).toBeInTheDocument();
  });

  it("filters furniture items by search query", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    const searchInput = screen.getByPlaceholderText("Search furniture...");
    fireEvent.change(searchInput, { target: { value: "sofa" } });

    expect(screen.getByText("Modern Sofa")).toBeInTheDocument();
    expect(screen.queryByText("Office Chair")).not.toBeInTheDocument();
  });

  it("shows filter options when filter button is clicked", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    const filterButton = screen.getByRole("button", { name: /filter/i });
    fireEvent.click(filterButton);

    expect(screen.getByText("Filter by tags:")).toBeInTheDocument();
  });

  it("displays correct item count", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    // Should show count of seating items (4 items in the seating category)
    expect(screen.getByText("4 items found")).toBeInTheDocument();
  });

  it("switches categories when tab is clicked", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    const tablesTab = screen.getByText("Tables");
    fireEvent.click(tablesTab);

    expect(screen.getByText("Dining Table")).toBeInTheDocument();
    expect(screen.getByText("Coffee Table")).toBeInTheDocument();
    expect(screen.queryByText("Modern Sofa")).not.toBeInTheDocument();
  });

  it("shows instructions for drag and drop", () => {
    renderWithProviders(<FurnitureLibraryPanel />);

    expect(
      screen.getByText("Drag furniture to canvas for automatic placement")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Items snap to grid when enabled")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Use corner handles to resize after placement")
    ).toBeInTheDocument();
  });
});
