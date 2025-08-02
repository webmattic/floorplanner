import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Line, Rect, Text, Circle, Group } from "react-konva";
import useFloorPlanStore from "../stores/floorPlanStore";
import ThreeScene from "./ThreeScene";
import { TouchGestureHandler } from "./TouchGestureHandler";
import {
  useViewTransition,
  getTransitionStyles,
} from "../hooks/useViewTransition";
import {
  snapToGrid as snapPointToGrid,
  calculateDistance,
  formatMeasurement,
  pixelsToMeters,
} from "../utils/geometry";
import RealTimeMeasurements from "./RealTimeMeasurements";
import AutomaticMeasurementAnnotations from "./AutomaticMeasurementAnnotations";

interface WallProps {
  points: number[];
  thickness?: number;
  color?: string;
}

interface RoomProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
}

interface FurnitureProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
}

const CanvasEditor = () => {
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [snapIndicator, setSnapIndicator] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<
    { x?: number; y?: number }[]
  >([]);
  const [measurementLine, setMeasurementLine] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const [, setIsDragging] = useState(false);
  const [drawingStartPoint, setDrawingStartPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    currentTool,
    zoom,
    panX,
    panY,
    setPan,
    walls,
    rooms,
    furniture,
    addWall,
    addFurniture,
    updateWall,
    updateRoom,
    updateFurniture,
    showGrid,
    gridSize,
    selectedElements,
    setSelectedElements,
    wallThickness,
    snapToGrid,
  } = useFloorPlanStore();

  // Touch gesture handlers for mobile
  const handlePinch = useCallback(
    (scale: number, _x: number, _y: number) => {
      const stage = stageRef.current;
      if (!stage) return;

      const newZoom = Math.max(0.1, Math.min(5, zoom * scale));
      useFloorPlanStore.getState().setZoom(newZoom);
    },
    [zoom]
  );

  const handlePan = useCallback(
    (deltaX: number, deltaY: number) => {
      useFloorPlanStore.getState().setPan(panX + deltaX, panY + deltaY);
    },
    [panX, panY]
  );

  const handleTap = useCallback(
    (x: number, y: number) => {
      if (currentTool === "select") {
        // Handle tap selection on mobile
        const stage = stageRef.current;
        if (stage) {
          const pointerPosition = stage.getPointerPosition();
          if (pointerPosition) {
            handleStageClick({
              target: stage,
              evt: { clientX: x, clientY: y },
            });
          }
        }
      }
    },
    [currentTool]
  );

  const handleDoubleTap = useCallback((_x: number, _y: number) => {
    // Double tap to reset zoom/pan
    useFloorPlanStore.getState().setZoom(1);
    useFloorPlanStore.getState().setPan(0, 0);
  }, []);

  // Handle stage resize
  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container()?.parentElement;
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            // TODO: Implement undo
            console.log("Undo");
            break;
          case "y":
            e.preventDefault();
            // TODO: Implement redo
            console.log("Redo");
            break;
          case "0":
            e.preventDefault();
            // Reset zoom and pan
            useFloorPlanStore.getState().setZoom(1);
            useFloorPlanStore.getState().setPan(0, 0);
            break;
        }
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "v":
          useFloorPlanStore.getState().setCurrentTool("select");
          break;
        case "w":
          useFloorPlanStore.getState().setCurrentTool("wall");
          break;
        case "r":
          useFloorPlanStore.getState().setCurrentTool("room");
          break;
        case "d":
          useFloorPlanStore.getState().setCurrentTool("door");
          break;
        case "m":
          useFloorPlanStore.getState().setCurrentTool("dimension");
          break;
        case "t":
          useFloorPlanStore.getState().setCurrentTool("text");
          break;
        case "h":
          useFloorPlanStore.getState().setCurrentTool("hand");
          break;
        case "g":
          useFloorPlanStore.getState().toggleGrid();
          break;
        case "Escape":
          // Cancel current operation
          setIsDrawing(false);
          setCurrentPath([]);
          setMeasurementLine(null);
          useFloorPlanStore.getState().clearSelection();
          break;
        case "Delete":
        case "Backspace":
          // Delete selected elements
          const { selectedElements } = useFloorPlanStore.getState();
          selectedElements.forEach((element) => {
            switch (element.type) {
              case "wall":
                useFloorPlanStore.getState().removeWall(element.id);
                break;
              case "room":
                useFloorPlanStore.getState().removeRoom(element.id);
                break;
              case "furniture":
                useFloorPlanStore.getState().removeFurniture(element.id);
                break;
            }
          });
          useFloorPlanStore.getState().clearSelection();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Enhanced Grid component with better visual feedback
  const GridLayer = () => {
    if (!showGrid) return null;

    const lines = [];
    const gridSpacing = gridSize * zoom;
    const majorGridSpacing = gridSpacing * 5; // Major grid lines every 5 units

    // Calculate visible grid range for performance
    const startX = Math.floor(-panX / gridSpacing) * gridSpacing;
    const endX =
      Math.ceil((stageSize.width - panX) / gridSpacing) * gridSpacing;
    const startY = Math.floor(-panY / gridSpacing) * gridSpacing;
    const endY =
      Math.ceil((stageSize.height - panY) / gridSpacing) * gridSpacing;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSpacing) {
      const isMajor = x % majorGridSpacing === 0;
      lines.push(
        <Line
          key={`v${x}`}
          points={[x, startY, x, endY]}
          stroke={isMajor ? "#d1d5db" : "#f3f4f6"}
          strokeWidth={isMajor ? 1 : 0.5}
          opacity={zoom < 0.5 ? 0.3 : 1}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSpacing) {
      const isMajor = y % majorGridSpacing === 0;
      lines.push(
        <Line
          key={`h${y}`}
          points={[startX, y, endX, y]}
          stroke={isMajor ? "#d1d5db" : "#f3f4f6"}
          strokeWidth={isMajor ? 1 : 0.5}
          opacity={zoom < 0.5 ? 0.3 : 1}
        />
      );
    }

    return lines;
  };

  // Snap indicator component
  const SnapIndicator = () => {
    if (!snapIndicator) return null;

    return (
      <Circle
        x={snapIndicator.x}
        y={snapIndicator.y}
        radius={4}
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth={2}
        opacity={0.8}
      />
    );
  };

  // Alignment guides component
  const AlignmentGuides = () => {
    return alignmentGuides.map((guide, index) => (
      <Group key={index}>
        {guide.x !== undefined && (
          <Line
            points={[guide.x, 0, guide.x, stageSize.height]}
            stroke="#ef4444"
            strokeWidth={1}
            dash={[5, 5]}
            opacity={0.7}
          />
        )}
        {guide.y !== undefined && (
          <Line
            points={[0, guide.y, stageSize.width, guide.y]}
            stroke="#ef4444"
            strokeWidth={1}
            dash={[5, 5]}
            opacity={0.7}
          />
        )}
      </Group>
    ));
  };

  // Measurement line component
  const MeasurementLine = () => {
    if (!measurementLine) return null;

    const { start, end } = measurementLine;
    const distance = calculateDistance(start.x, start.y, end.x, end.y);
    const meters = pixelsToMeters(distance, gridSize);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    return (
      <Group>
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke="#10b981"
          strokeWidth={2}
          dash={[3, 3]}
        />
        <Circle x={start.x} y={start.y} radius={3} fill="#10b981" />
        <Circle x={end.x} y={end.y} radius={3} fill="#10b981" />
        <Text
          x={midX}
          y={midY - 15}
          text={formatMeasurement(meters)}
          fontSize={12}
          fill="#10b981"
          fontStyle="bold"
          align="center"
          offsetX={20}
        />
      </Group>
    );
  };

  // Wall component
  const Wall = ({
    wall,
    isSelected,
    onClick,
  }: {
    wall: WallProps;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <Line
      points={wall.points}
      stroke={isSelected ? "#3b82f6" : "#374151"}
      strokeWidth={wall.thickness || 8}
      lineCap="round"
      lineJoin="round"
      onClick={onClick}
    />
  );

  // Enhanced Room component with auto-calculated dimensions
  const Room = ({
    room,
    isSelected,
    onClick,
  }: {
    room: RoomProps;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const widthInMeters = pixelsToMeters(room.width, gridSize);
    const heightInMeters = pixelsToMeters(room.height, gridSize);
    const areaInMeters = widthInMeters * heightInMeters;

    return (
      <Group>
        <Rect
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          fill={room.color || "rgba(59, 130, 246, 0.1)"}
          stroke={isSelected ? "#3b82f6" : "#9ca3af"}
          strokeWidth={isSelected ? 2 : 1}
          onClick={onClick}
          draggable={isSelected}
          onDragEnd={(e) => {
            const snappedPos = snapPointToGrid(
              e.target.x(),
              e.target.y(),
              gridSize
            );
            const store = useFloorPlanStore.getState();
            store.updateRoom(room.id, {
              x: snappedPos.x,
              y: snappedPos.y,
            });
            // Trigger measurement update
            store.triggerMeasurementUpdate();
          }}
        />

        {/* Room label */}
        <Text
          x={room.x + 5}
          y={room.y + 5}
          text={room.label || "Room"}
          fontSize={14}
          fill="#374151"
          fontStyle="bold"
        />

        {/* Auto-calculated dimensions */}
        <Text
          x={room.x + 5}
          y={room.y + 25}
          text={`${formatMeasurement(widthInMeters)} × ${formatMeasurement(
            heightInMeters
          )}`}
          fontSize={11}
          fill="#6b7280"
        />

        {/* Area calculation */}
        <Text
          x={room.x + 5}
          y={room.y + 40}
          text={`Area: ${formatMeasurement(areaInMeters)} m²`}
          fontSize={11}
          fill="#6b7280"
        />

        {/* Selection handles */}
        {isSelected && (
          <Group>
            {/* Corner handles for resizing */}
            <Circle
              x={room.x + room.width}
              y={room.y + room.height}
              radius={4}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                const newWidth = e.target.x() - room.x;
                const newHeight = e.target.y() - room.y;
                const store = useFloorPlanStore.getState();
                store.updateRoom(room.id, {
                  width: Math.max(gridSize, newWidth),
                  height: Math.max(gridSize, newHeight),
                });
                // Trigger measurement update
                store.triggerMeasurementUpdate();
              }}
            />
          </Group>
        )}
      </Group>
    );
  };

  // Enhanced Furniture component with resize handles
  const Furniture = ({
    item,
    isSelected,
    onClick,
  }: {
    item: FurnitureProps;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <Group>
      <Rect
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        fill={item.color || "#8b5cf6"}
        stroke={isSelected ? "#3b82f6" : "#6b7280"}
        strokeWidth={isSelected ? 2 : 1}
        onClick={onClick}
        draggable={isSelected}
        onDragEnd={(e) => {
          const snappedPos = snapPointToGrid(
            e.target.x(),
            e.target.y(),
            gridSize
          );
          const store = useFloorPlanStore.getState();
          store.updateFurniture(item.id, {
            x: snappedPos.x,
            y: snappedPos.y,
          });
          // Trigger measurement update for clearance checking
          store.triggerMeasurementUpdate();
        }}
      />
      <Text
        x={item.x + 5}
        y={item.y + 5}
        text={item.label || "Furniture"}
        fontSize={12}
        fill="white"
      />

      {/* Simple resize handles when selected */}
      {isSelected && (
        <Group>
          {/* Bottom-right corner handle */}
          <Rect
            x={item.x + item.width - 4}
            y={item.y + item.height - 4}
            width={8}
            height={8}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            draggable
            onDragMove={(e) => {
              const newWidth = e.target.x() - item.x + 4;
              const newHeight = e.target.y() - item.y + 4;
              const store = useFloorPlanStore.getState();
              store.updateFurniture(item.id, {
                width: Math.max(20, newWidth),
                height: Math.max(20, newHeight),
              });
              // Trigger measurement update
              store.triggerMeasurementUpdate();
            }}
          />
        </Group>
      )}
    </Group>
  );

  // Enhanced mouse event handling with snap-to-grid and visual feedback
  const getSnappedPosition = useCallback(
    (rawPos: { x: number; y: number }) => {
      const stagePos = {
        x: (rawPos.x - panX) / zoom,
        y: (rawPos.y - panY) / zoom,
      };
      // Use snapToGrid setting from store
      return snapToGrid
        ? snapPointToGrid(stagePos.x, stagePos.y, gridSize)
        : stagePos;
    },
    [panX, panY, zoom, gridSize, snapToGrid]
  );

  const updateSnapIndicator = useCallback(
    (pos: { x: number; y: number }) => {
      const snapped = getSnappedPosition(pos);
      setSnapIndicator({
        x: snapped.x * zoom + panX,
        y: snapped.y * zoom + panY,
      });
    },
    [getSnappedPosition, zoom, panX, panY]
  );

  const findAlignmentGuides = useCallback(
    (currentPos: { x: number; y: number }) => {
      const guides: { x?: number; y?: number }[] = [];
      const threshold = 5 / zoom; // Snap threshold in canvas units

      // Check alignment with existing elements
      [...walls, ...rooms, ...furniture].forEach((element) => {
        if ("x" in element && Math.abs(element.x - currentPos.x) < threshold) {
          guides.push({ x: element.x * zoom + panX });
        }
        if ("y" in element && Math.abs(element.y - currentPos.y) < threshold) {
          guides.push({ y: element.y * zoom + panY });
        }
      });

      setAlignmentGuides(guides);
    },
    [walls, rooms, furniture, zoom, panX, panY]
  );

  const handleMouseDown = (e: any) => {
    const rawPos = e.target.getStage().getPointerPosition();
    const snappedPos = getSnappedPosition(rawPos);

    if (currentTool === "wall" || currentTool === "room") {
      setIsDrawing(true);
      setDrawingStartPoint(snappedPos);
      setCurrentMousePos(snappedPos);
      if (currentTool === "wall") {
        setCurrentPath([snappedPos.x, snappedPos.y]);
      }
    } else if (currentTool === "dimension") {
      if (!measurementLine) {
        setMeasurementLine({
          start: snappedPos,
          end: snappedPos,
        });
      } else {
        setMeasurementLine(null);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    const rawPos = e.target.getStage().getPointerPosition();
    const snappedPos = getSnappedPosition(rawPos);

    // Always update current mouse position for real-time measurements
    setCurrentMousePos(snappedPos);

    // Update snap indicator for all tools
    updateSnapIndicator(rawPos);
    findAlignmentGuides(snappedPos);

    if (isDrawing && currentTool === "wall") {
      setCurrentPath((prev) => {
        const newPath = [...prev];
        // Replace the last two coordinates with snapped position
        if (newPath.length >= 2) {
          newPath[newPath.length - 2] = snappedPos.x;
          newPath[newPath.length - 1] = snappedPos.y;
        }
        return newPath;
      });
    } else if (measurementLine && currentTool === "dimension") {
      setMeasurementLine((prev) =>
        prev
          ? {
              ...prev,
              end: snappedPos,
            }
          : null
      );
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length >= 4) {
      // Smooth the path for better wall drawing
      const smoothedPath = smoothPath(currentPath);
      addWall({
        points: smoothedPath,
        thickness: wallThickness,
        color: "#374151",
      });
    }
    setIsDrawing(false);
    setCurrentPath([]);
    setDrawingStartPoint(null);
    setCurrentMousePos(null);
    setSnapIndicator(null);
    setAlignmentGuides([]);
  };

  // Path smoothing function for better wall drawing
  const smoothPath = (path: number[]): number[] => {
    if (path.length < 6) return path; // Need at least 3 points

    const smoothed = [path[0], path[1]]; // Keep first point

    for (let i = 2; i < path.length - 2; i += 2) {
      const prevX = path[i - 2];
      const prevY = path[i - 1];
      const currX = path[i];
      const currY = path[i + 1];
      const nextX = path[i + 2];
      const nextY = path[i + 3];

      // Check if points form a straight line (within threshold)
      const angle1 = Math.atan2(currY - prevY, currX - prevX);
      const angle2 = Math.atan2(nextY - currY, nextX - currX);
      const angleDiff = Math.abs(angle1 - angle2);

      if (angleDiff < 0.1 || angleDiff > Math.PI - 0.1) {
        // Points are roughly in a line, skip the middle point
        continue;
      }

      smoothed.push(currX, currY);
    }

    // Keep last point
    smoothed.push(path[path.length - 2], path[path.length - 1]);
    return smoothed;
  };

  const handleElementClick = (element: any, type: string) => {
    if (currentTool === "select") {
      setSelectedElements([{ ...element, type }]);
    }
  };

  const handleStageClick = (e: any) => {
    // If clicked on empty area, clear selection
    if (e.target === e.target.getStage()) {
      setSelectedElements([]);

      const rawPos = e.target.getStage().getPointerPosition();
      const snappedPos = getSnappedPosition(rawPos);

      // Handle room creation with auto-calculated dimensions
      if (currentTool === "room") {
        useFloorPlanStore.getState().addRoom({
          id: `room_${Date.now()}`,
          x: snappedPos.x,
          y: snappedPos.y,
          width: gridSize * 4, // 4 grid units wide
          height: gridSize * 3, // 3 grid units tall
          color: "rgba(59, 130, 246, 0.1)",
          label: `Room ${rooms.length + 1}`,
        });
      }

      // Handle furniture placement
      if (currentTool === "furniture") {
        useFloorPlanStore.getState().addFurniture({
          x: snappedPos.x,
          y: snappedPos.y,
          width: gridSize * 1.2, // 1.2 grid units wide
          height: gridSize * 0.6, // 0.6 grid units tall
          color: "#8b5cf6",
          label: "Furniture",
        });
      }
    }
  };

  // Enhanced zoom handling with smooth zoom and limits
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Apply zoom limits
    newScale = Math.max(0.1, Math.min(5, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);

    // Update store
    useFloorPlanStore.getState().setZoom(newScale);
    useFloorPlanStore.getState().setPan(newPos.x, newPos.y);
  }, []);

  // Handle drag for panning
  const handleStageDragEnd = useCallback(
    (e: any) => {
      setPan(e.target.x(), e.target.y());
      setIsDragging(false);
    },
    [setPan]
  );

  const handleStageDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag and drop from furniture library
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));

        if (data.type === "furniture") {
          // Get drop position relative to canvas
          const rect = e.currentTarget.getBoundingClientRect();
          const canvasX = e.clientX - rect.left;
          const canvasY = e.clientY - rect.top;

          // Convert to floor plan coordinates
          const floorPlanX = (canvasX - panX) / zoom;
          const floorPlanY = (canvasY - panY) / zoom;

          // Snap to grid if enabled
          const finalPos = snapToGrid
            ? snapPointToGrid(floorPlanX, floorPlanY, gridSize)
            : { x: floorPlanX, y: floorPlanY };

          // Add furniture to the floor plan
          addFurniture({
            x: finalPos.x,
            y: finalPos.y,
            width: data.width,
            height: data.height,
            color: data.color,
            label: data.name,
          });
        } else if (data.type === "material" || data.type === "color") {
          // Handle material/color application to selected elements
          if (selectedElements.length > 0) {
            selectedElements.forEach((element) => {
              const updates: any = {};

              if (data.type === "material") {
                updates.color = data.color;
                if (data.texture) {
                  updates.material = data.texture;
                }
              } else if (data.type === "color") {
                updates.color = data.color;
              }

              // Apply updates based on element type
              switch (element.type) {
                case "wall":
                  updateWall(element.id, updates);
                  break;
                case "room":
                  updateRoom(element.id, updates);
                  break;
                case "furniture":
                  updateFurniture(element.id, updates);
                  break;
              }
            });
          } else {
            // If no elements selected, show a helpful message
            console.log("Select an element first to apply materials/colors");
            // TODO: Show toast notification
          }
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }
    },
    [
      panX,
      panY,
      zoom,
      snapToGrid,
      gridSize,
      addFurniture,
      selectedElements,
      updateWall,
      updateRoom,
      updateFurniture,
    ]
  );

  // Use the view transition hook for smooth transitions
  const transitionState = useViewTransition();
  const { viewMode } = useFloorPlanStore();

  return (
    <div className="relative w-full h-full">
      {/* 2D Canvas */}
      <div
        style={{
          ...getTransitionStyles(transitionState, "2d"),
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: viewMode === "2d" ? "auto" : "none",
          zIndex: viewMode === "2d" ? 10 : 5,
        }}
      >
        <TouchGestureHandler
          onPinch={handlePinch}
          onPan={handlePan}
          onTap={handleTap}
          onDoubleTap={handleDoubleTap}
          className="w-full h-full"
        >
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full h-full"
          >
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={zoom}
              scaleY={zoom}
              x={panX}
              y={panY}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={handleStageClick}
              onWheel={handleWheel}
              draggable={currentTool === "select" || currentTool === "hand"}
              onDragStart={handleStageDragStart}
              onDragEnd={handleStageDragEnd}
            >
              {/* Grid Layer */}
              <Layer>
                <GridLayer />
              </Layer>

              {/* Content Layer */}
              <Layer>
                {/* Render walls */}
                {walls.map((wall) => (
                  <Wall
                    key={wall.id}
                    wall={wall}
                    isSelected={selectedElements.some(
                      (el) => el.id === wall.id
                    )}
                    onClick={() => handleElementClick(wall, "wall")}
                  />
                ))}

                {/* Render rooms */}
                {rooms.map((room) => (
                  <Room
                    key={room.id}
                    room={room}
                    isSelected={selectedElements.some(
                      (el) => el.id === room.id
                    )}
                    onClick={() => handleElementClick(room, "room")}
                  />
                ))}

                {/* Render furniture */}
                {furniture.map((item) => (
                  <Furniture
                    key={item.id}
                    item={item}
                    isSelected={selectedElements.some(
                      (el) => el.id === item.id
                    )}
                    onClick={() => handleElementClick(item, "furniture")}
                  />
                ))}

                {/* Current drawing path */}
                {isDrawing && currentPath.length >= 4 && (
                  <Line
                    points={currentPath}
                    stroke="#3b82f6"
                    strokeWidth={8}
                    lineCap="round"
                    lineJoin="round"
                    opacity={0.7}
                  />
                )}
              </Layer>

              {/* UI Layer - Always on top */}
              <Layer>
                <AlignmentGuides />
                <MeasurementLine />
                <SnapIndicator />

                {/* Automatic Measurement Annotations */}
                <AutomaticMeasurementAnnotations
                  showDimensions={true}
                  showAreas={true}
                  showWallLengths={true}
                />

                {/* Real-time Measurements during drawing */}
                <RealTimeMeasurements
                  isDrawing={isDrawing}
                  startPoint={drawingStartPoint}
                  currentPoint={currentMousePos}
                  tool={currentTool}
                />
              </Layer>
            </Stage>
          </div>
        </TouchGestureHandler>
      </div>

      {/* 3D Scene */}
      <div
        style={{
          ...getTransitionStyles(transitionState, "3d"),
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: viewMode === "3d" ? "auto" : "none",
          zIndex: viewMode === "3d" ? 10 : 5,
        }}
      >
        <ThreeScene />
      </div>
    </div>
  );
};

export default CanvasEditor;
