import React, { useEffect, useState } from "react";
import useFloorPlanStore from "../stores/floorPlanStore";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge.tsx";
import { Calculator, AlertTriangle, CheckCircle } from "lucide-react";

interface MeasurementValidatorProps {
  showFloatingFeedback?: boolean;
}

const MeasurementValidator: React.FC<MeasurementValidatorProps> = ({
  showFloatingFeedback = true,
}) => {
  const [measurements, setMeasurements] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<any[]>([]);

  const rooms = useFloorPlanStore((state) => state.rooms);
  const walls = useFloorPlanStore((state) => state.walls);
  const furniture = useFloorPlanStore((state) => state.furniture);
  const clearanceIssues = useFloorPlanStore((state) =>
    state.getClearanceIssues()
  );
  const calculateTotalArea = useFloorPlanStore(
    (state) => state.calculateTotalArea
  );
  const measurementUnit = useFloorPlanStore((state) => state.measurementUnit);

  useEffect(() => {
    // Recalculate measurements whenever elements change
    const totalArea = useFloorPlanStore.getState().calculateTotalArea();
    const roomCount = rooms.length;
    const furnitureCount = furniture.length;
    const wallCount = walls.length;

    const newMeasurements = {
      totalArea,
      roomCount,
      furnitureCount,
      wallCount,
      averageRoomSize: roomCount > 0 ? totalArea / roomCount : 0,
      clearanceIssueCount: clearanceIssues.length,
      unit: measurementUnit,
    };

    setMeasurements(newMeasurements);

    // Validate design constraints
    const validations = [];

    // Check minimum room sizes
    rooms.forEach((room) => {
      const {
        calculateAutomaticRoomMeasurements,
      } = require("../utils/geometry");
      const roomMeasurements = calculateAutomaticRoomMeasurements(
        room,
        measurementUnit
      );

      if (roomMeasurements.area < 9) {
        // 9 sq meters minimum
        validations.push({
          type: "warning",
          category: "room_size",
          message: `Room "${room.label || room.id}" is very small (${
            roomMeasurements.formatted.area
          })`,
          elementId: room.id,
        });
      }

      if (roomMeasurements.width < 2.4 || roomMeasurements.height < 2.4) {
        // 2.4m minimum dimension
        validations.push({
          type: "warning",
          category: "room_dimension",
          message: `Room "${room.label || room.id}" has narrow dimensions`,
          elementId: room.id,
        });
      }
    });

    // Check clearance issues
    clearanceIssues.forEach((issue) => {
      validations.push({
        type: issue.severity,
        category: "clearance",
        message: issue.description,
        elementId: issue.elementId,
      });
    });

    // Check total area reasonableness
    if (totalArea > 500) {
      validations.push({
        type: "info",
        category: "area",
        message: `Large floor plan detected (${totalArea.toFixed(
          1
        )} ${measurementUnit}²)`,
        elementId: null,
      });
    }

    setValidationResults(validations);
  }, [
    rooms,
    walls,
    furniture,
    clearanceIssues,
    calculateTotalArea,
    measurementUnit,
  ]);

  if (!showFloatingFeedback || !measurements) return null;

  const errorCount = validationResults.filter((v) => v.type === "error").length;
  const warningCount = validationResults.filter(
    (v) => v.type === "warning"
  ).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Measurement Summary */}
      <div className="bg-white/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm">Design Metrics</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Total Area:</span>
            <div className="font-medium">
              {measurements.totalArea.toFixed(1)} {measurements.unit}²
            </div>
          </div>
          <div>
            <span className="text-gray-600">Rooms:</span>
            <div className="font-medium">{measurements.roomCount}</div>
          </div>
          <div>
            <span className="text-gray-600">Furniture:</span>
            <div className="font-medium">{measurements.furnitureCount}</div>
          </div>
          <div>
            <span className="text-gray-600">Avg Room:</span>
            <div className="font-medium">
              {measurements.averageRoomSize.toFixed(1)} {measurements.unit}²
            </div>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <div className="bg-white/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          {errorCount > 0 || warningCount > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <span className="font-medium text-sm">Validation Status</span>
        </div>

        <div className="flex gap-2 mb-2">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} Error{errorCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {warningCount} Warning{warningCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <Badge
              variant="default"
              className="text-xs bg-green-100 text-green-800"
            >
              All Good
            </Badge>
          )}
        </div>

        {/* Show recent validation messages */}
        {validationResults.slice(0, 2).map((validation, index) => (
          <Alert
            key={index}
            className={`mb-1 py-1 px-2 text-xs ${
              validation.type === "error"
                ? "border-red-200 bg-red-50"
                : validation.type === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <AlertDescription className="text-xs">
              {validation.message}
            </AlertDescription>
          </Alert>
        ))}

        {validationResults.length > 2 && (
          <div className="text-xs text-gray-500 mt-1">
            +{validationResults.length - 2} more issues
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementValidator;
