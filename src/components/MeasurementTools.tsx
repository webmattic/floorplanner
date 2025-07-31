import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Separator } from "./ui/separator.tsx";
import { Badge } from "./ui/badge.tsx";
import { Ruler, Square, Calculator, Target, AlertTriangle } from "lucide-react";
// @ts-ignore - Import UI components
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
// @ts-ignore - Import UI components
import { Switch } from "../components/ui/switch";
// @ts-ignore - Import UI components
import { Label } from "../components/ui/label.tsx";
// @ts-ignore - Import UI components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import useFloorPlanStore from "../stores/floorPlanStore";

interface MeasurementPoint {
  x: number;
  y: number;
  id: string;
}

interface Measurement {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  distance: number;
  type: "linear" | "area" | "angle";
  label?: string;
}

interface ClearanceIssue {
  id: string;
  elementType: string;
  elementId: string;
  description: string;
  severity: "warning" | "error";
}

interface MeasurementToolsProps {
  measurements?: Measurement[];
  onAddMeasurement?: (measurement: Measurement) => void;
  onRemoveMeasurement?: (id: string) => void;
  unit?: "ft" | "m" | "px";
}

// Define FloorPlanStore interface to avoid TypeScript errors
interface FloorPlanStoreState {
  measurements?: Measurement[];
  clearanceDetection?: boolean;
  measurementUnit?: "ft" | "m" | "px";
  toggleClearanceDetection?: () => void;
  setMeasurementUnit?: (unit: "ft" | "m" | "px") => void;
  removeMeasurement?: (id: string) => void;
  getClearanceIssues?: () => ClearanceIssue[];
  calculateTotalArea?: () => number;
}

const MeasurementTools: React.FC<MeasurementToolsProps> = ({
  measurements: propMeasurements,
  onRemoveMeasurement: propOnRemoveMeasurement,
  unit: propUnit = "ft",
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [virtualTapeMeasure, setVirtualTapeMeasure] =
    useState<Measurement | null>(null);
  const [showAutomaticAnnotations, setShowAutomaticAnnotations] =
    useState(true);

  // Use the store to manage measurements, clearance detection, and preferred units
  const floorPlanStore = useFloorPlanStore() as unknown as FloorPlanStoreState;
  const measurements = floorPlanStore.measurements || propMeasurements || [];
  const clearanceDetection = floorPlanStore.clearanceDetection || true;
  const setClearanceDetection =
    floorPlanStore.toggleClearanceDetection || (() => {});
  const preferredUnit = floorPlanStore.measurementUnit || propUnit;
  const setPreferredUnit = floorPlanStore.setMeasurementUnit || (() => {});
  const calculateTotalArea = floorPlanStore.calculateTotalArea || (() => 0);
  const onRemoveMeasurement = (id: string) => {
    floorPlanStore.removeMeasurement?.(id);
    propOnRemoveMeasurement?.(id);
  };

  // Get clearance issues from the store
  const clearanceIssues: ClearanceIssue[] =
    floorPlanStore.getClearanceIssues?.() || [];

  const tools = [
    {
      id: "linear",
      name: "Linear Measurement",
      icon: Ruler,
      description: "Measure distance between two points",
    },
    {
      id: "area",
      name: "Area Measurement",
      icon: Square,
      description: "Measure area of a region",
    },
    {
      id: "angle",
      name: "Angle Measurement",
      icon: Target,
      description: "Measure angles between lines",
    },
  ];

  const formatDistance = (distance: number): string => {
    switch (preferredUnit) {
      case "ft":
        return `${distance.toFixed(2)} ft`;
      case "m":
        return `${distance.toFixed(2)} m`;
      default:
        return `${distance.toFixed(0)} px`;
    }
  };

  const formatArea = (area: number): string => {
    switch (preferredUnit) {
      case "ft":
        return `${area.toFixed(2)} sq ft`;
      case "m":
        return `${area.toFixed(2)} sq m`;
      default:
        return `${area.toFixed(0)} px²`;
    }
  };

  const getTotalArea = (): number => {
    return measurements
      .filter((m: Measurement) => m.type === "area")
      .reduce((total: number, m: Measurement) => total + m.distance, 0);
  };

  const clearAllMeasurements = () => {
    measurements.forEach((m: Measurement) => onRemoveMeasurement?.(m.id));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Measurement Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tools</h4>
          <div className="grid grid-cols-1 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto p-3"
                  onClick={() => setActiveTool(isActive ? null : tool.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {tool.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Current Measurements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Measurements ({measurements.length})
            </h4>
            {measurements.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllMeasurements}>
                Clear All
              </Button>
            )}
          </div>

          {measurements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No measurements yet. Select a tool and click on the canvas to
              start measuring.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {measurements.map((measurement: Measurement) => (
                <div
                  key={measurement.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {measurement.type}
                    </Badge>
                    <span className="text-sm">
                      {measurement.type === "area"
                        ? formatArea(measurement.distance)
                        : formatDistance(measurement.distance)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMeasurement?.(measurement.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {measurements.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Manual Measurements:
                  </span>
                  <div className="font-medium">
                    {formatArea(getTotalArea())}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Floor Plan Area:
                  </span>
                  <div className="font-medium">
                    {formatArea(calculateTotalArea())}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Unit:</span>
                  <div className="font-medium">{preferredUnit}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Measurements:</span>
                  <div className="font-medium">{measurements.length}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Automatic Annotations */}
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Display Options</h4>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="auto-annotations" className="text-sm">
                Automatic Annotations
              </Label>
              <p className="text-xs text-muted-foreground">
                Show room areas and dimensions automatically
              </p>
            </div>
            <Switch
              id="auto-annotations"
              checked={showAutomaticAnnotations}
              onCheckedChange={setShowAutomaticAnnotations}
            />
          </div>
        </div>

        {/* Instructions */}
        {activeTool && (
          <>
            <Separator />
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                {activeTool === "linear" &&
                  "Click two points to measure distance"}
                {activeTool === "area" &&
                  "Click points to define an area boundary"}
                {activeTool === "angle" &&
                  "Click three points to measure angle"}
              </p>
            </div>
          </>
        )}
        {/* Virtual Tape Measure and Clearance Detection */}
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Advanced Measurement</h4>
          </div>

          <div className="space-y-4">
            {/* Virtual Tape Measure */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="virtual-tape" className="text-sm">
                  Virtual Tape Measure
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable drag-and-drop measuring tape
                </p>
              </div>
              <Switch
                id="virtual-tape"
                checked={virtualTapeMeasure !== null}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    // Create a default virtual tape measure that would be draggable in a real implementation
                    setVirtualTapeMeasure({
                      id: "virtual-tape-1",
                      start: { x: 100, y: 100, id: "p1" },
                      end: { x: 200, y: 200, id: "p2" },
                      distance: 141.42, // sqrt(100^2 + 100^2)
                      type: "linear",
                      label: "Virtual Tape",
                    });
                  } else {
                    setVirtualTapeMeasure(null);
                  }
                }}
              />
            </div>

            {/* Clearance Detection */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="clearance" className="text-sm">
                  Clearance Detection
                </Label>
                <p className="text-xs text-muted-foreground">
                  Detect potential collisions and clearance issues
                </p>
              </div>
              <Switch
                id="clearance"
                checked={clearanceDetection}
                onCheckedChange={setClearanceDetection}
              />
            </div>

            {/* Unit Selection */}
            <div className="grid grid-cols-3 gap-2">
              <Label htmlFor="unit-select" className="text-sm">
                Measurement Unit
              </Label>
              <Select
                value={preferredUnit}
                onValueChange={(value: string) =>
                  setPreferredUnit(value as "ft" | "m" | "px")
                }
              >
                <SelectTrigger id="unit-select">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ft">Feet (ft)</SelectItem>
                  <SelectItem value="m">Meters (m)</SelectItem>
                  <SelectItem value="px">Pixels (px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Clearance Issues */}
        {clearanceDetection && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Clearance Issues</h4>
              {clearanceIssues.length > 0 ? (
                <div className="space-y-2">
                  {clearanceIssues.map((issue: ClearanceIssue) => (
                    <Alert
                      key={issue.id}
                      className={
                        issue.severity === "error"
                          ? "bg-red-50 border-red-200"
                          : ""
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>
                        {issue.elementType} Clearance Issue
                      </AlertTitle>
                      <AlertDescription>{issue.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No clearance issues detected.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Tip: All measurements automatically update when elements are moved or
          resized.
        </p>
      </CardFooter>
    </Card>
  );
};

export default MeasurementTools;
