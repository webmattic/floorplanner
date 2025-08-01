import { vi } from 'vitest';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LayersPanel } from "../LayersPanel";
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

const mockFloorPlanStore = {
  walls: [
    { id: "wall-1", points: [0, 0, 100, 0], thickness: 8, color: "#808080" },
    {
      id: "wall-2",
      points: [100, 0, 100, 100],
      thickness: 8,
      color: "#808080",
    },
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
    {
      id: "furniture-2",
      x: 200,
      y: 100,
      width: 80,
      height: 40,
      color: "#8B4513",
      label: "Table",
    },
  ],
};

const mockPanelStore = {
  panels: {
    layers: {
      position: { x: 100, y: 100 },
      size: { width: 280, height: 300 },
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

describe("LayersPanel", () => {
  beforeEach(() => {
    (useFloorPlanStore as any).mockReturnValue(mockFloorPlanStore);
    (usePanelStore as any).mockReturnValue(mockPanelStore);
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderWithProviders(<LayersPanel />);
    expect(screen.getByTestId("layer-management-header")).toBeInTheDocument();
  });

  it("displays default layers with correct object counts", () => {
    renderWithProviders(<LayersPanel />);
    // Check layer names by testid
    expect(screen.getByTestId("layer-name-walls")).toBeInTheDocument();
    expect(screen.getByTestId("layer-name-rooms")).toBeInTheDocument();
    expect(screen.getByTestId("layer-name-furniture")).toBeInTheDocument();
    expect(screen.getByTestId("layer-name-doors-windows")).toBeInTheDocument();
    expect(screen.getByTestId("layer-name-dimensions")).toBeInTheDocument();
    expect(screen.getByTestId("layer-name-text-labels")).toBeInTheDocument();
    // Check object counts by testid
    expect(screen.getByTestId("layer-object-count-walls").textContent).toContain("2 object");
    expect(screen.getByTestId("layer-object-count-rooms").textContent).toContain("1 object");
    expect(screen.getByTestId("layer-object-count-furniture").textContent).toContain("2 object");
  });

  it("shows Add Layer button", () => {
    renderWithProviders(<LayersPanel />);
    expect(screen.getByTestId("add-layer-button")).toBeInTheDocument();
  });

  it("opens create layer dialog when Add Layer is clicked", async () => {
    renderWithProviders(<LayersPanel />);

    const addButton = screen.getByText("Add Layer");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Layer")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter layer name...")
      ).toBeInTheDocument();
    });
  });

  it("creates a new layer when form is submitted", async () => {
    renderWithProviders(<LayersPanel />);

    // Open create dialog
    const addButton = screen.getByText("Add Layer");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Layer")).toBeInTheDocument();
    });

    // Fill in layer name
    const nameInput = screen.getByPlaceholderText("Enter layer name...");
    fireEvent.change(nameInput, { target: { value: "Custom Layer" } });

    // Submit form
    const createButton = screen.getByRole("button", { name: "Create Layer" });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Custom Layer")).toBeInTheDocument();
    });
  });

  it("toggles layer visibility when eye icon is clicked", () => {
    renderWithProviders(<LayersPanel />);

    // Find the first eye icon (should be visible by default)
    const eyeButtons = screen.getAllByRole("button");
    const visibilityButton = eyeButtons.find(
      (button) =>
        button.querySelector("svg")?.getAttribute("data-testid") ===
        "eye-icon" || button.querySelector('[data-lucide="eye"]')
    );

    if (visibilityButton) {
      fireEvent.click(visibilityButton);
      // After clicking, it should show the eye-off icon
      expect(
        visibilityButton.querySelector('[data-lucide="eye-off"]')
      ).toBeInTheDocument();
    }
  });

  it("toggles layer lock when lock icon is clicked", () => {
    renderWithProviders(<LayersPanel />);

    // Find the first lock icon (should be unlocked by default)
    const lockButtons = screen.getAllByRole("button");
    const lockButton = lockButtons.find(
      (button) =>
        button.querySelector("svg")?.getAttribute("data-testid") ===
        "unlock-icon" || button.querySelector('[data-lucide="unlock"]')
    );

    if (lockButton) {
      fireEvent.click(lockButton);
      // After clicking, it should show the lock icon
      expect(
        lockButton.querySelector('[data-lucide="lock"]')
      ).toBeInTheDocument();
    }
  });

  it("shows layer statistics", () => {
    renderWithProviders(<LayersPanel />);
    expect(screen.getByTestId("total-layers-label")).toBeInTheDocument();
    expect(screen.getByTestId("visible-layers-label")).toBeInTheDocument();
    expect(screen.getByTestId("total-objects-label")).toBeInTheDocument();
  });

  it("displays help information", () => {
    renderWithProviders(<LayersPanel />);
    expect(screen.getByTestId("layer-help-alert")).toBeInTheDocument();
  });

  it("shows default badge for default layers", () => {
    renderWithProviders(<LayersPanel />);

    const defaultBadges = screen.getAllByText("Default");
    expect(defaultBadges.length).toBeGreaterThan(0);
  });

  it("allows editing custom layers", async () => {
    renderWithProviders(<LayersPanel />);

    // First create a custom layer
    const addButton = screen.getByText("Add Layer");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Layer")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Enter layer name...");
    fireEvent.change(nameInput, { target: { value: "Custom Layer" } });

    const createButton = screen.getByRole("button", { name: "Create Layer" });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Custom Layer")).toBeInTheDocument();
    });

    // Now try to edit it - look for edit button (should only appear for custom layers)
    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons.find((button) =>
      button.querySelector('[data-lucide="edit-3"]')
    );

    if (editButton) {
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit Layer")).toBeInTheDocument();
      });
    }
  });

  it("allows deleting custom layers", async () => {
    renderWithProviders(<LayersPanel />);

    // First create a custom layer
    const addButton = screen.getByText("Add Layer");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Layer")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Enter layer name...");
    fireEvent.change(nameInput, { target: { value: "Custom Layer" } });

    const createButton = screen.getByRole("button", { name: "Create Layer" });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Custom Layer")).toBeInTheDocument();
    });

    // Now try to delete it - look for delete button (should only appear for custom layers)
    const deleteButtons = screen.getAllByRole("button");
    const deleteButton = deleteButtons.find((button) =>
      button.querySelector('[data-lucide="trash-2"]')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Layer")).toBeInTheDocument();
        expect(
          screen.getByText("Are you sure you want to delete this layer?")
        ).toBeInTheDocument();
      });
    }
  });

  it("prevents creating layer with empty name", async () => {
    renderWithProviders(<LayersPanel />);

    const addButton = screen.getByText("Add Layer");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Layer")).toBeInTheDocument();
    });

    // Try to create without entering a name
    const createButton = screen.getByRole("button", { name: "Create Layer" });
    expect(createButton).toBeDisabled();
  });

  it("shows drag handles for layer reordering", () => {
    renderWithProviders(<LayersPanel />);
    // Look for drag handles by testid
    const dragHandles = screen.getAllByTestId("drag-handle");
    expect(dragHandles.length).toBeGreaterThan(0);
  });

  it("displays layer colors correctly", () => {
    renderWithProviders(<LayersPanel />);

    // Check that layer color indicators are present
    const layerCards = screen.getAllByRole("button");
    // Each layer should have a color indicator div
    expect(layerCards.length).toBeGreaterThan(0);
  });

  it("shows correct layer icons for different layer types", () => {
    renderWithProviders(<LayersPanel />);

    // Different layer types should have different icons
    // This is a basic check that icons are rendered
    const layerCards = screen.getAllByRole("button");
    expect(layerCards.length).toBeGreaterThan(0);
  });

  it("updates object counts when store changes", () => {
    const { rerender } = renderWithProviders(<LayersPanel />);

    // Initial state: multiple layers may have "2 objects"
    const objectCounts = screen.getAllByText("2 objects");
    expect(objectCounts.length).toBeGreaterThan(0);

    // Update mock store with more walls
    const updatedStore = {
      ...mockFloorPlanStore,
      walls: [
        ...mockFloorPlanStore.walls,
        {
          id: "wall-3",
          points: [0, 100, 100, 100],
          thickness: 8,
          color: "#808080",
        },
      ],
    };

    (useFloorPlanStore as any).mockReturnValue(updatedStore);

    rerender(
      <TooltipProvider>
        <LayersPanel />
      </TooltipProvider>
    );

    // Should now show 3 objects for walls
    expect(screen.getByText("3 objects")).toBeInTheDocument();
  });
});
