import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PropertiesPanel } from "../PropertiesPanel";
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

const mockFloorPlanStore = {
  selectedElements: [],
  walls: [],
  rooms: [],
  furniture: [],
  updateWall: jest.fn(),
  updateRoom: jest.fn(),
  updateFurniture: jest.fn(),
  removeWall: jest.fn(),
  removeRoom: jest.fn(),
  removeFurniture: jest.fn(),
  clearSelection: jest.fn(),
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
  hidePanel: jest.fn(),
  toggleMinimize: jest.fn(),
  bringToFront: jest.fn(),
  updatePanelPosition: jest.fn(),
  updatePanelSize: jest.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("PropertiesPanel", () => {
  beforeEach(() => {
    (useFloorPlanStore as jest.Mock).mockReturnValue(mockFloorPlanStore);
    (usePanelStore as jest.Mock).mockReturnValue(mockPanelStore);
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderWithProviders(<PropertiesPanel />);
    expect(screen.getByText("Properties")).toBeInTheDocument();
  });

  it("shows no selection message when no elements are selected", () => {
    renderWithProviders(<PropertiesPanel />);
    expect(
      screen.getByText("Select an object to edit its properties")
    ).toBeInTheDocument();
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

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByDisplayValue("Living Room")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("200")).toBeInTheDocument();
    expect(screen.getByDisplayValue("300")).toBeInTheDocument();
    expect(screen.getByDisplayValue("400")).toBeInTheDocument();
  });

  it("displays selected wall properties", () => {
    const mockWall = {
      id: "wall-1",
      points: [0, 0, 100, 0],
      thickness: 8,
      color: "#808080",
    };

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "wall-1", type: "wall" }],
      walls: [mockWall],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText("wall")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#808080")).toBeInTheDocument();
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

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "furniture-1", type: "furniture" }],
      furniture: [mockFurniture],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByDisplayValue("Sofa")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    expect(screen.getByDisplayValue("75")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("150")).toBeInTheDocument();
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

    const mockUpdateRoom = jest.fn();

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
      updateRoom: mockUpdateRoom,
    });

    renderWithProviders(<PropertiesPanel />);

    const labelInput = screen.getByDisplayValue("Living Room");
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

    const mockUpdateRoom = jest.fn();

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
      updateRoom: mockUpdateRoom,
    });

    renderWithProviders(<PropertiesPanel />);

    const colorInput = screen.getByDisplayValue("#FF0000");
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

    const mockRemoveRoom = jest.fn();
    const mockClearSelection = jest.fn();

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
      removeRoom: mockRemoveRoom,
      clearSelection: mockClearSelection,
    });

    renderWithProviders(<PropertiesPanel />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockRemoveRoom).toHaveBeenCalledWith("room-1");
      expect(mockClearSelection).toHaveBeenCalled();
    });
  });

  it("switches between Properties and Layers tabs", () => {
    renderWithProviders(<PropertiesPanel />);

    const layersTab = screen.getByText("Layers");
    fireEvent.click(layersTab);

    expect(screen.getByText("Layer Management")).toBeInTheDocument();
  });

  it("displays layer management interface", () => {
    renderWithProviders(<PropertiesPanel />);

    const layersTab = screen.getByText("Layers");
    fireEvent.click(layersTab);

    expect(screen.getByText("Walls")).toBeInTheDocument();
    expect(screen.getByText("Rooms")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(screen.getByText("Doors & Windows")).toBeInTheDocument();
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

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText("Quick Colors")).toBeInTheDocument();
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

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText("Texture")).toBeInTheDocument();
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

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "room-1", type: "room" }],
      rooms: [mockRoom],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText("Layer Assignment")).toBeInTheDocument();
  });

  it("displays selection status at the bottom", () => {
    renderWithProviders(<PropertiesPanel />);

    expect(
      screen.getByText("Select objects on the canvas to edit their properties")
    ).toBeInTheDocument();
  });

  it("shows correct selection count when multiple elements selected", () => {
    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [
        { id: "room-1", type: "room" },
        { id: "furniture-1", type: "furniture" },
      ],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText("2 objects selected")).toBeInTheDocument();
  });

  it("handles wall thickness slider for wall elements", () => {
    const mockWall = {
      id: "wall-1",
      points: [0, 0, 100, 0],
      thickness: 8,
      color: "#808080",
    };

    (useFloorPlanStore as jest.Mock).mockReturnValue({
      ...mockFloorPlanStore,
      selectedElements: [{ id: "wall-1", type: "wall" }],
      walls: [mockWall],
    });

    renderWithProviders(<PropertiesPanel />);

    expect(screen.getByText("Thickness")).toBeInTheDocument();
    expect(screen.getByText("8px")).toBeInTheDocument();
  });
});
