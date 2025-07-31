import React from "react";
import { Text, Group, Line } from "react-konva";
import useFloorPlanStore from "../stores/floorPlanStore";

interface RealTimeMeasurementsProps {
  isDrawing: boolean;
  startPoint?: { x: number; y: number };
  currentPoint?: { x: number; y: number };
  tool?: string;
}

const RealTimeMeasurements: React.FC<RealTimeMeasurementsProps> = ({
  isDrawing,
  startPoint,
  currentPoint,
  tool,
}) => {
  const updateRealTimeMeasurements = useFloorPlanStore(
    (state) => state.updateRealTimeMeasurements
  );

  if (!isDrawing || !startPoint || !currentPoint || !tool) {
    return null;
  }

  const measurements = updateRealTimeMeasurements(startPoint, currentPoint);

  const renderDimensionLine = (
    start: any,
    end: any,
    label: string,
    offset: number = 20
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const isHorizontal = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);

    if (isHorizontal) {
      // Horizontal dimension line
      return (
        <Group key={`dim-h-${label}`}>
          {/* Dimension line */}
          <Line
            points={[start.x, start.y - offset, end.x, end.y - offset]}
            stroke="#FF6B35"
            strokeWidth={1}
            dash={[5, 5]}
          />
          {/* Extension lines */}
          <Line
            points={[start.x, start.y, start.x, start.y - offset - 5]}
            stroke="#FF6B35"
            strokeWidth={1}
          />
          <Line
            points={[end.x, end.y, end.x, end.y - offset - 5]}
            stroke="#FF6B35"
            strokeWidth={1}
          />
          {/* Label */}
          <Text
            x={midX - 20}
            y={midY - offset - 15}
            text={label}
            fontSize={12}
            fill="#FF6B35"
            fontFamily="Arial, sans-serif"
            align="center"
          />
        </Group>
      );
    } else {
      // Vertical dimension line
      return (
        <Group key={`dim-v-${label}`}>
          {/* Dimension line */}
          <Line
            points={[start.x + offset, start.y, end.x + offset, end.y]}
            stroke="#FF6B35"
            strokeWidth={1}
            dash={[5, 5]}
          />
          {/* Extension lines */}
          <Line
            points={[start.x, start.y, start.x + offset + 5, start.y]}
            stroke="#FF6B35"
            strokeWidth={1}
          />
          <Line
            points={[end.x, end.y, end.x + offset + 5, end.y]}
            stroke="#FF6B35"
            strokeWidth={1}
          />
          {/* Label */}
          <Text
            x={midX + offset + 10}
            y={midY - 6}
            text={label}
            fontSize={12}
            fill="#FF6B35"
            fontFamily="Arial, sans-serif"
            align="left"
          />
        </Group>
      );
    }
  };

  const renderAreaIndicator = () => {
    if (tool !== "room" && tool !== "area") return null;

    const centerX = (startPoint.x + currentPoint.x) / 2;
    const centerY = (startPoint.y + currentPoint.y) / 2;

    return (
      <Group key="area-indicator">
        {/* Area background highlight */}
        <Line
          points={[
            startPoint.x,
            startPoint.y,
            currentPoint.x,
            startPoint.y,
            currentPoint.x,
            currentPoint.y,
            startPoint.x,
            currentPoint.y,
            startPoint.x,
            startPoint.y,
          ]}
          stroke="#4F46E5"
          strokeWidth={2}
          fill="rgba(79, 70, 229, 0.1)"
          closed={true}
        />
        {/* Area label */}
        <Text
          x={centerX - 30}
          y={centerY - 6}
          text={measurements.formatted.area}
          fontSize={14}
          fill="#4F46E5"
          fontFamily="Arial, sans-serif"
          fontStyle="bold"
          align="center"
        />
      </Group>
    );
  };

  return (
    <Group>
      {/* Width dimension */}
      {renderDimensionLine(
        { x: startPoint.x, y: startPoint.y },
        { x: currentPoint.x, y: startPoint.y },
        measurements.formatted.width,
        20
      )}

      {/* Height dimension */}
      {renderDimensionLine(
        { x: currentPoint.x, y: startPoint.y },
        { x: currentPoint.x, y: currentPoint.y },
        measurements.formatted.height,
        20
      )}

      {/* Diagonal measurement for linear tools */}
      {(tool === "wall" || tool === "linear") && (
        <Group key="diagonal-measurement">
          <Text
            x={(startPoint.x + currentPoint.x) / 2 - 25}
            y={(startPoint.y + currentPoint.y) / 2 - 25}
            text={measurements.formatted.diagonal}
            fontSize={12}
            fill="#10B981"
            fontFamily="Arial, sans-serif"
            fontStyle="bold"
            align="center"
          />
        </Group>
      )}

      {/* Area indicator for room/area tools */}
      {renderAreaIndicator()}

      {/* Live measurement tooltip */}
      <Group key="measurement-tooltip">
        <Text
          x={currentPoint.x + 10}
          y={currentPoint.y - 40}
          text={`W: ${measurements.formatted.width}\nH: ${measurements.formatted.height}`}
          fontSize={11}
          fill="#374151"
          fontFamily="monospace"
          padding={4}
          cornerRadius={4}
        />
      </Group>
    </Group>
  );
};

export default RealTimeMeasurements;
