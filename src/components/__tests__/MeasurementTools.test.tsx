import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import MeasurementTools from "../MeasurementTools";

// Mock the store
vi.mock("../../stores/floorPlanStore", () => ({
  __esModule: true,
  default: () => ({
    measurements: [
      {
        id: "test-measurement-1",
        start: { x: 100, y: 100, id: "p1" },
        end: { x: 200, y: 200, id: "p2" },
        distance: 141.42,
        type: "linear",
      },
      {
        id: "test-measurement-2",
        start: { x: 300, y: 300, id: "p3" },
        end: { x: 400, y: 400, id: "p4" },
        distance: 141.42,
        type: "area",
      },
    ],
    clearanceDetection: true,
    measurementUnit: "ft",
    toggleClearanceDetection: vi.fn(),
    setMeasurementUnit: vi.fn(),
    removeMeasurement: vi.fn(),
    getClearanceIssues: () => [
      {
        id: "issue-1",
        elementType: "door",
        elementId: "door-1",
        description: "Door swing area obstructed by furniture",
        severity: "error",
      },
    ],
  }),
}));

describe("MeasurementTools", () => {
  it("renders measurement tools component", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Measurement Tools")).toBeInTheDocument();
  });

  it("displays the correct number of measurements", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Measurements (2)")).toBeInTheDocument();
  });

  it("displays the correct measurement types", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("linear")).toBeInTheDocument();
    expect(screen.getByText("area")).toBeInTheDocument();
  });

  it("displays virtual tape measure control", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Virtual Tape Measure")).toBeInTheDocument();
  });

  it("displays clearance detection control", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Clearance Detection")).toBeInTheDocument();
    expect(screen.getByText("Door Clearance Issue")).toBeInTheDocument();
  });

  it("displays measurement unit control", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Measurement Unit")).toBeInTheDocument();
  });

  it("displays total area", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Total Area:")).toBeInTheDocument();
  });

  it("displays tools section", () => {
    render(<MeasurementTools />);
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Linear Measurement")).toBeInTheDocument();
    expect(screen.getByText("Area Measurement")).toBeInTheDocument();
    expect(screen.getByText("Angle Measurement")).toBeInTheDocument();
  });

  it("activates a tool when clicked", () => {
    render(<MeasurementTools />);
    const linearToolButton = screen
      .getByText("Linear Measurement")
      .closest("button");
    if (linearToolButton) {
      fireEvent.click(linearToolButton);
      expect(
        screen.getByText("Click two points to measure distance")
      ).toBeInTheDocument();
    }
  });

  it("clear all button removes all measurements", () => {
    const onRemoveMeasurementMock = vi.fn();
    render(<MeasurementTools onRemoveMeasurement={onRemoveMeasurementMock} />);
    const clearAllButton = screen.getByText("Clear All");
    fireEvent.click(clearAllButton);
    expect(onRemoveMeasurementMock).toHaveBeenCalledTimes(2);
  });
});
