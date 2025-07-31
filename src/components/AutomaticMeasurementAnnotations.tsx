import React from "react";
import { Text, Group, Rect } from "react-konva";
import useFloorPlanStore from "../stores/floorPlanStore";

interface AutomaticMeasurementAnnotationsProps {
  showDimensions?: boolean;
  showAreas?: boolean;
  showWallLengths?: boolean;
}

const AutomaticMeasurementAnnotations: React.FC<
  AutomaticMeasurementAnnotationsProps
> = ({ showDimensions = true, showAreas = true, showWallLengths = true }) => {
  const rooms = useFloorPlanStore((state) => state.rooms);
  const walls = useFloorPlanStore((state) => state.walls);
  const measurementUnit = useFloorPlanStore((state) => state.measurementUnit);
  const calculateElementMeasurements = useFloorPlanStore(
    (state) => state.calculateElementMeasurements
  );

  const renderRoomAnnotations = (room: any) => {
    const measurements = calculateElementMeasurements(room.id);
    if (!measurements) return null;

    const annotations = [];

    // Width dimension (top)
    if (showDimensions) {
      annotations.push(
        <Group key={`${room.id}-width`}>
          <Rect
            x={room.x + room.width / 2 - 25}
            y={room.y - 25}
            width={50}
            height={16}
            fill="rgba(255, 255, 255, 0.9)"
            stroke="#6B7280"
            strokeWidth={0.5}
            cornerRadius={3}
          />
          <Text
            x={room.x + room.width / 2}
            y={room.y - 20}
            text={measurements.formatted.width}
            fontSize={10}
            fill="#374151"
            fontFamily="Arial, sans-serif"
            align="center"
            offsetX={25}
          />
        </Group>
      );

      // Height dimension (right)
      annotations.push(
        <Group key={`${room.id}-height`}>
          <Rect
            x={room.x + room.width + 5}
            y={room.y + room.height / 2 - 8}
            width={50}
            height={16}
            fill="rgba(255, 255, 255, 0.9)"
            stroke="#6B7280"
            strokeWidth={0.5}
            cornerRadius={3}
          />
          <Text
            x={room.x + room.width + 30}
            y={room.y + room.height / 2 - 3}
            text={measurements.formatted.height}
            fontSize={10}
            fill="#374151"
            fontFamily="Arial, sans-serif"
            align="center"
            offsetX={25}
          />
        </Group>
      );
    }

    // Area (center)
    if (showAreas) {
      annotations.push(
        <Group key={`${room.id}-area`}>
          <Rect
            x={room.x + room.width / 2 - 35}
            y={room.y + room.height / 2 - 12}
            width={70}
            height={24}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3B82F6"
            strokeWidth={1}
            cornerRadius={6}
          />
          <Text
            x={room.x + room.width / 2}
            y={room.y + room.height / 2 - 6}
            text={measurements.formatted.area}
            fontSize={12}
            fill="#1E40AF"
            fontFamily="Arial, sans-serif"
            fontStyle="bold"
            align="center"
            offsetX={35}
          />
          <Text
            x={room.x + room.width / 2}
            y={room.y + room.height / 2 + 6}
            text={room.label || `Room ${room.id.slice(-3)}`}
            fontSize={9}
            fill="#6B7280"
            fontFamily="Arial, sans-serif"
            align="center"
            offsetX={35}
          />
        </Group>
      );
    }

    return annotations;
  };

  const renderWallAnnotations = (wall: any) => {
    if (!showWallLengths || !wall.points || wall.points.length < 4) return null;

    const measurements = calculateElementMeasurements(wall.id);
    if (!measurements) return null;

    // Calculate wall midpoint
    const startX = wall.points[0];
    const startY = wall.points[1];
    const endX = wall.points[2] || wall.points[0];
    const endY = wall.points[3] || wall.points[1];
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Calculate angle for text rotation
    const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;
    const shouldRotate = Math.abs(angle) > 45 && Math.abs(angle) < 135;

    return (
      <Group key={`${wall.id}-length`}>
        <Rect
          x={midX - 20}
          y={midY - 8}
          width={40}
          height={16}
          fill="rgba(34, 197, 94, 0.1)"
          stroke="#22C55E"
          strokeWidth={0.5}
          cornerRadius={3}
          rotation={shouldRotate ? angle : 0}
          offsetX={20}
          offsetY={8}
        />
        <Text
          x={midX}
          y={midY - 2}
          text={`${measurements.length.toFixed(2)} ${measurementUnit}`}
          fontSize={9}
          fill="#15803D"
          fontFamily="Arial, sans-serif"
          align="center"
          rotation={shouldRotate ? angle : 0}
          offsetX={20}
          offsetY={4}
        />
      </Group>
    );
  };

  return (
    <Group>
      {/* Room annotations */}
      {rooms.map((room) => renderRoomAnnotations(room))}

      {/* Wall annotations */}
      {walls.map((wall) => renderWallAnnotations(wall))}
    </Group>
  );
};

export default AutomaticMeasurementAnnotations;
