import { vi } from 'vitest';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PropertiesPanel } from "../PropertiesPanel";
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
  selectedElements: [],
  walls: [],
  rooms: [],
  furniture: [],
  updateWall: vi.fn(),
  updateRoom: vi.fn(),
  updateFurniture: vi.fn(),
  removeWall: vi.fn(),
  removeRoom: vi.fn(),
  removeFurniture: vi.fn(),
  clearSelection: vi.fn(),
};

const mockPanelStore = {
  panels: {
    properties: {
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
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("PropertiesPanel", () => {
  beforeEach(() => {
    (useFloorPlanStore as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue(mockFloorPlanStore);
    (usePanelStore as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue(mockPanelStore);
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderWithProviders(<PropertiesPanel />);
    // Prefer getByRole for headings
    expect(screen.getByRole('heading', { name: /properties/i })).toBeInTheDocument();
  });

  it("shows no selection message when no elements are selected", () => {
    renderWithProviders(<PropertiesPanel />);
    // Prefer getByText for visible messages
    expect(screen.getByText(/no elements selected/i)).toBeInTheDocument();
  });

  it("displays selected room properties", () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
    };

    (useFloorPlanStore as any).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByLabelText(/label/i)).toHaveValue("Living Room");
    expect(screen.getByLabelText(/x/i)).toHaveValue(100);
    expect(screen.getByLabelText(/y/i)).toHaveValue(200);
    expect(screen.getByLabelText(/width/i)).toHaveValue(300);
    expect(screen.getByLabelText(/height/i)).toHaveValue(400);
  });

  it("displays selected wall properties", () => {
    const mockWall = {
      id: "wall-1",
      points: [0, 0, 100, 0],
      thickness: 8,
      color: "#808080",
    };

    (useFloorPlanStore as any).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "wall-1", type: "wall" }],
      walls: [mockWall],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText(/wall type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toHaveValue("#808080");
  });

  it("displays selected furniture properties", () => {
    const mockFurniture = {
      id: "furniture-1",
      x: 50,
      y: 75,
      width: 100,
      height: 150,
      color: "#4169E1",
      label: "Sofa",
    };

    (useFloorPlanStore as any).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "furniture-1", type: "furniture" }],
      furniture: [mockFurniture],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByLabelText(/label/i)).toHaveValue("Sofa");
    expect(screen.getByLabelText(/x/i)).toHaveValue(50);
    expect(screen.getByLabelText(/y/i)).toHaveValue(75);
    expect(screen.getByLabelText(/width/i)).toHaveValue(100);
    expect(screen.getByLabelText(/height/i)).toHaveValue(150);
  });

  it("updates room properties when input values change", async () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
    };

    const mockUpdateRoom = vi.fn();

    (useFloorPlanStore as any).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
      updateRoom: mockUpdateRoom,
    });

    renderWithProviders(<PropertiesPanel />);

    const labelInput = screen.getByLabelText(/label/i);
    fireEvent.change(labelInput, { target: { value: "Bedroom" } });

    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalledWith("room-1", {
        label: "Bedroom",
      });
    });
  });

  it("updates color when color picker changes", async () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
    };

    const mockUpdateRoom = vi.fn();

    (useFloorPlanStore as any).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
      updateRoom: mockUpdateRoom,
    });

    renderWithProviders(<PropertiesPanel />);

    const colorInput = screen.getByLabelText(/color/i);
    fireEvent.change(colorInput, { target: { value: "#00FF00" } });

    await waitFor(() => {
      expect(mockUpdateRoom).toHaveBeenCalledWith("room-1", {
        color: "#00FF00",
      });
    });
  });

  it("deletes selected element when delete button is clicked", async () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
    };

    const mockRemoveRoom = vi.fn();
    const mockClearSelection = vi.fn();

    (useFloorPlanStore as any).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
      removeRoom: mockRemoveRoom,
      clearSelection: mockClearSelection,
    });

    renderWithProviders(<PropertiesPanel />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockRemoveRoom).toHaveBeenCalledWith("room-1");
      expect(mockClearSelection).toHaveBeenCalled();
    });
  });

  it("switches between Properties and Layers tabs", () => {
    renderWithProviders(<PropertiesPanel />);

    const layersTab = screen.getByRole('tab', { name: /layers/i });
    fireEvent.click(layersTab);
    expect(screen.getByRole('heading', { name: /layer management/i })).toBeInTheDocument();
  });

  it("displays layer management interface", () => {
    renderWithProviders(<PropertiesPanel />);

    const layersTab = screen.getByRole('tab', { name: /layers/i });
    fireEvent.click(layersTab);
    expect(screen.getByText(/walls/i)).toBeInTheDocument();
    expect(screen.getByText(/rooms/i)).toBeInTheDocument();
    expect(screen.getByText(/furniture/i)).toBeInTheDocument();
    expect(screen.getByText(/doors/i)).toBeInTheDocument();
  });

  it("shows material swatches for quick color selection", () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
    };

    (useFloorPlanStore as vi.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText(/quick colors/i)).toBeInTheDocument();
  });

  it("shows texture selection dropdown", () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
      texture: "solid",
    };

    (useFloorPlanStore as vi.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByLabelText(/texture/i)).toBeInTheDocument();
  });

  it("shows layer assignment dropdown", () => {
    const mockRoom = {
      id: "room-1",
      x: 100,
      y: 200,
      width: 300,
      height: 400,
      color: "#FF0000",
      label: "Living Room",
    };

    (useFloorPlanStore as vi.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByLabelText(/layer assignment/i)).toBeInTheDocument();
  });

  it("displays selection status at the bottom", () => {
    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText(/selection status/i)).toBeInTheDocument();
  });

  it("shows correct selection count when multiple elements selected", () => {
    (useFloorPlanStore as vi.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [
        { id: "room-1", type: "room" },
        { id: "furniture-1", type: "furniture" },
      ],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText(/2 objects selected/i)).toBeInTheDocument();
  });

  it("handles wall thickness slider for wall elements", () => {
    const mockWall = {
      id: "wall-1",
      points: [0, 0, 100, 0],
      thickness: 8,
      color: "#808080",
    };

    (useFloorPlanStore as vi.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "wall-1", type: "wall" }],
      walls: [mockWall],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText(/wall thickness/i)).toBeInTheDocument();
    expect(screen.getByText(/8px/i)).toBeInTheDocument();
  });
});
