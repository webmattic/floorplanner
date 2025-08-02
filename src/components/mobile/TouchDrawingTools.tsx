import React, { useState, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Move,
  Square,
  Circle,
  Pen,
  Undo,
  Redo,
  Grid3X3,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Hand,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";
import { useDeviceDetection } from "./ResponsivePanelManager";
import { cn } from "../../lib/utils";

interface TouchDrawingToolsProps {
  className?: string;
}

interface TouchGestureState {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentPath: number[];
  tool: string;
  pressure: number;
}

export const TouchDrawingTools: React.FC<TouchDrawingToolsProps> = ({
  className,
}) => {
  const deviceInfo = useDeviceDetection();
  const {
    currentTool,
    setCurrentTool,
    snapToGrid,
    setSnapToGrid,
    zoom,
    setZoom,
    panX,
    panY,
    setPan,
    addWall,
    addRoom,
    addFurniture,
    undo,
    redo,
    _undoStack,
    _redoStack,
  } = useFloorPlanStore();

  // Derived state for undo/redo availability
  const canUndo = _undoStack && _undoStack.length > 0;
  const canRedo = _redoStack && _redoStack.length > 0;

  // Helper function for toggling snap to grid
  const toggleSnapToGrid = () => setSnapToGrid(!snapToGrid);

  const [gestureState, setGestureState] = useState<TouchGestureState>({
    isDrawing: false,
    startPoint: null,
    currentPath: [],
    tool: currentTool,
    pressure: 1,
  });

  const [isToolbarExpanded, setIsToolbarExpanded] = useState(
    !deviceInfo.isMobile
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Touch-friendly tool definitions
  const tools = [
    {
      id: "select",
      icon: Move,
      label: "Select",
      shortcut: "V",
      category: "selection",
    },
    {
      id: "wall",
      icon: Square,
      label: "Wall",
      shortcut: "W",
      category: "drawing",
    },
    {
      id: "room",
      icon: Circle,
      label: "Room",
      shortcut: "R",
      category: "drawing",
    },
    {
      id: "door",
      icon: Pen,
      label: "Door",
      shortcut: "D",
      category: "drawing",
    },
    {
      id: "window",
      icon: Pen,
      label: "Window",
      shortcut: "Shift+W",
      category: "drawing",
    },
    {
      id: "furniture",
      icon: Square,
      label: "Furniture",
      shortcut: "F",
      category: "objects",
    },
    {
      id: "measure",
      icon: Move,
      label: "Measure",
      shortcut: "M",
      category: "tools",
    },
    {
      id: "pan",
      icon: Hand,
      label: "Pan",
      shortcut: "H",
      category: "navigation",
    },
  ];

  // Enhanced touch event handlers with pressure sensitivity
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!canvasRef.current) return;

      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left - panX) / zoom;
      const y = (touch.clientY - rect.top - panY) / zoom;

      // Get pressure if available (newer devices)
      const pressure = (touch as any).force || 1;

      setGestureState({
        isDrawing: true,
        startPoint: { x, y },
        currentPath: [x, y],
        tool: currentTool,
        pressure,
      });

      // Provide haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [canvasRef, panX, panY, zoom, currentTool]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!gestureState.isDrawing || !canvasRef.current) return;

      e.preventDefault(); // Prevent scrolling

      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left - panX) / zoom;
      const y = (touch.clientY - rect.top - panY) / zoom;
      const pressure = (touch as any).force || 1;

      setGestureState((prev) => ({
        ...prev,
        currentPath: [...prev.currentPath, x, y],
        pressure,
      }));

      // Real-time preview for touch drawing
      if (currentTool === "wall") {
        // Show preview line
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && gestureState.startPoint) {
          ctx.strokeStyle = `rgba(59, 130, 246, ${pressure})`;
          ctx.lineWidth = Math.max(2, pressure * 8);
          ctx.beginPath();
          ctx.moveTo(
            gestureState.startPoint.x * zoom + panX,
            gestureState.startPoint.y * zoom + panY
          );
          ctx.lineTo(x * zoom + panX, y * zoom + panY);
          ctx.stroke();
        }
      }
    },
    [gestureState, canvasRef, panX, panY, zoom, currentTool]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!gestureState.isDrawing || !gestureState.startPoint) return;

      const touch = e.changedTouches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const endX = (touch.clientX - rect.left - panX) / zoom;
      const endY = (touch.clientY - rect.top - panY) / zoom;

      // Snap to grid if enabled
      const finalStart = snapToGrid
        ? {
            x: Math.round(gestureState.startPoint.x / 20) * 20,
            y: Math.round(gestureState.startPoint.y / 20) * 20,
          }
        : gestureState.startPoint;

      const finalEnd = snapToGrid
        ? {
            x: Math.round(endX / 20) * 20,
            y: Math.round(endY / 20) * 20,
          }
        : { x: endX, y: endY };

      // Create objects based on current tool
      switch (currentTool) {
        case "wall":
          addWall({
            points: [finalStart.x, finalStart.y, finalEnd.x, finalEnd.y],
            thickness: Math.max(4, gestureState.pressure * 12),
            color: "#374151",
          });
          break;

        case "room":
          const width = Math.abs(finalEnd.x - finalStart.x);
          const height = Math.abs(finalEnd.y - finalStart.y);
          if (width > 20 && height > 20) {
            addRoom({
              id: `room_${Date.now()}`,
              x: Math.min(finalStart.x, finalEnd.x),
              y: Math.min(finalStart.y, finalEnd.y),
              width,
              height,
              color: "rgba(59, 130, 246, 0.1)",
              label: "New Room",
            });
          }
          break;

        case "furniture":
          addFurniture({
            x: finalStart.x,
            y: finalStart.y,
            width: 60,
            height: 30,
            color: "#8b5cf6",
            label: "Furniture",
          });
          break;
      }

      // Haptic feedback for completion
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }

      setGestureState({
        isDrawing: false,
        startPoint: null,
        currentPath: [],
        tool: currentTool,
        pressure: 1,
      });
    },
    [
      gestureState,
      canvasRef,
      panX,
      panY,
      zoom,
      snapToGrid,
      currentTool,
      addWall,
      addRoom,
      addFurniture,
    ]
  );

  // Zoom controls with touch-friendly sizing
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.1));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan(0, 0);
  };

  // Touch-friendly tool button size
  const buttonSize = deviceInfo.isMobile ? "lg" : "default";
  const iconSize = deviceInfo.isMobile ? "h-6 w-6" : "h-4 w-4";

  if (deviceInfo.isMobile && !isToolbarExpanded) {
    // Compact mobile toolbar
    return (
      <div className={cn("touch-drawing-tools-compact", className)}>
        <div className="flex items-center justify-between p-2 bg-white border-b">
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => setIsToolbarExpanded(true)}
            className="touch-target"
          >
            <Grid3X3 className={iconSize} />
            <span className="sr-only">Expand tools</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant={currentTool === "select" ? "default" : "outline"}
              size={buttonSize}
              onClick={() => setCurrentTool("select")}
              className="touch-target"
            >
              <Move className={iconSize} />
            </Button>

            <Button
              variant={currentTool === "wall" ? "default" : "outline"}
              size={buttonSize}
              onClick={() => setCurrentTool("wall")}
              className="touch-target"
            >
              <Square className={iconSize} />
            </Button>

            <Button
              variant={currentTool === "room" ? "default" : "outline"}
              size={buttonSize}
              onClick={() => setCurrentTool("room")}
              className="touch-target"
            >
              <Circle className={iconSize} />
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size={buttonSize}
              onClick={handleZoomOut}
              className="touch-target"
            >
              <ZoomOut className={iconSize} />
            </Button>
            <Button
              variant="outline"
              size={buttonSize}
              onClick={handleZoomIn}
              className="touch-target"
            >
              <ZoomIn className={iconSize} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full toolbar (desktop or expanded mobile)
  return (
    <div className={cn("touch-drawing-tools", className)}>
      {/* Hidden canvas for touch drawing preview */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ zIndex: 1000 }}
      />

      <div className="flex flex-col space-y-2 p-3 bg-white border rounded-lg shadow-sm">
        {deviceInfo.isMobile && (
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Drawing Tools</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsToolbarExpanded(false)}
              className="p-1"
            >
              ×
            </Button>
          </div>
        )}

        {/* Drawing Tools */}
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-1">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? "default" : "outline"}
                    size={buttonSize}
                    onClick={() => setCurrentTool(tool.id)}
                    className={cn(
                      "touch-target",
                      deviceInfo.isMobile && "min-h-[48px] min-w-[48px]"
                    )}
                  >
                    <IconComponent className={iconSize} />
                    {deviceInfo.isMobile && (
                      <span className="ml-2 text-xs">{tool.label}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {tool.label} ({tool.shortcut})
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <Separator />

        {/* Action Tools */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={buttonSize}
                  onClick={undo}
                  disabled={!canUndo}
                  className="touch-target"
                >
                  <Undo className={iconSize} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={buttonSize}
                  onClick={redo}
                  disabled={!canRedo}
                  className="touch-target"
                >
                  <Redo className={iconSize} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={snapToGrid ? "default" : "outline"}
                  size={buttonSize}
                  onClick={toggleSnapToGrid}
                  className="touch-target"
                >
                  <Grid3X3 className={iconSize} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Snap to Grid</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={buttonSize}
                  onClick={handleResetView}
                  className="touch-target"
                >
                  <RotateCcw className={iconSize} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset View</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size={buttonSize}
            onClick={handleZoomOut}
            className="touch-target"
          >
            <ZoomOut className={iconSize} />
          </Button>

          <span className="text-sm font-mono px-2">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="outline"
            size={buttonSize}
            onClick={handleZoomIn}
            className="touch-target"
          >
            <ZoomIn className={iconSize} />
          </Button>
        </div>
      </div>

      {/* Touch drawing overlay */}
      {gestureState.isDrawing && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 999 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </div>
  );
};
