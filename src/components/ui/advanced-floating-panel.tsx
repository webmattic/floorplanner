import React, { useState, useEffect, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "../../lib/utils";
import {
  Move,
  X,
  Minimize2,
  Maximize2,
  Package,
  Palette,
  Settings,
  Layers,
  Box,
  Users,
  Download,
  History,
  Upload,
  Share2,
  Share,
  Eye,
  EyeOff,
  Ruler,
  Link,
  Unlink,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";

// Magnetic snapping configuration
const SNAP_THRESHOLD = 20; // pixels
const SNAP_ZONES = {
  TOP: 10,
  BOTTOM: 10,
  LEFT: 10,
  RIGHT: 10,
};

interface SnapGuide {
  type: "horizontal" | "vertical";
  position: number;
  panelIds: string[];
}

interface FloatingPanelProps {
  panelId: string;
  children: React.ReactNode;
  className?: string;
}

// interface PanelGroup {
//   id: string;
//   panelIds: string[];
//   docked: boolean;
//   position: "left" | "right" | "top" | "bottom" | "floating";
// }

export const AdvancedFloatingPanel: React.FC<FloatingPanelProps> = ({
  panelId,
  children,
  className,
}) => {
  const {
    panels,
    hidePanel,
    toggleMinimize,
    bringToFront,
    updatePanelPosition,
    updatePanelSize,
    updatePanelState,
  } = usePanelStore();

  const panelState = panels[panelId];
  const panelConfig = PANEL_CONFIGS[panelId];

  // Advanced panel state
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [isGrouped, setIsGrouped] = useState(false);
  // const [groupId, setGroupId] = useState<string | null>(null);
  const [isDocked, setIsDocked] = useState(false);
  const [dockPosition, setDockPosition] = useState<
    "left" | "right" | "top" | "bottom" | null
  >(null);

  const rndRef = useRef<Rnd>(null);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!panelState || !panelConfig || !panelState.isVisible) {
    return null;
  }

  // Get icon component based on config
  const getIcon = () => {
    const iconMap: Record<string, any> = {
      Move,
      Package,
      Palette,
      Settings,
      Layers,
      Box,
      Users,
      Download,
      History,
      Upload,
      Share2,
      Share,
      Eye,
      EyeOff,
      Ruler,
    };
    return iconMap[panelConfig.icon] || Settings;
  };

  const IconComponent = getIcon();

  // Magnetic snapping logic
  const calculateSnapPosition = useCallback(
    (newPosition: { x: number; y: number }) => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let snappedX = newPosition.x;
      let snappedY = newPosition.y;
      const guides: SnapGuide[] = [];

      // Snap to screen edges
      if (newPosition.x <= SNAP_ZONES.LEFT) {
        snappedX = 0;
        guides.push({
          type: "vertical",
          position: 0,
          panelIds: [panelId],
        });
      } else if (
        newPosition.x + panelState.size.width >=
        viewport.width - SNAP_ZONES.RIGHT
      ) {
        snappedX = viewport.width - panelState.size.width;
        guides.push({
          type: "vertical",
          position: viewport.width,
          panelIds: [panelId],
        });
      }

      if (newPosition.y <= SNAP_ZONES.TOP) {
        snappedY = 0;
        guides.push({
          type: "horizontal",
          position: 0,
          panelIds: [panelId],
        });
      } else if (
        newPosition.y + panelState.size.height >=
        viewport.height - SNAP_ZONES.BOTTOM
      ) {
        snappedY = viewport.height - panelState.size.height;
        guides.push({
          type: "horizontal",
          position: viewport.height,
          panelIds: [panelId],
        });
      }

      // Snap to other panels
      Object.entries(panels).forEach(([otherPanelId, otherPanel]) => {
        if (otherPanelId === panelId || !otherPanel.isVisible) return;

        const otherRight = otherPanel.position.x + otherPanel.size.width;
        const otherBottom = otherPanel.position.y + otherPanel.size.height;
        const currentRight = newPosition.x + panelState.size.width;
        const currentBottom = newPosition.y + panelState.size.height;

        // Horizontal alignment
        if (
          Math.abs(newPosition.y - otherPanel.position.y) <= SNAP_THRESHOLD ||
          Math.abs(currentBottom - otherBottom) <= SNAP_THRESHOLD ||
          Math.abs(newPosition.y - otherBottom) <= SNAP_THRESHOLD ||
          Math.abs(currentBottom - otherPanel.position.y) <= SNAP_THRESHOLD
        ) {
          // Vertical snapping (side by side)
          if (
            Math.abs(currentRight - otherPanel.position.x) <= SNAP_THRESHOLD
          ) {
            snappedX = otherPanel.position.x - panelState.size.width;
            guides.push({
              type: "vertical",
              position: otherPanel.position.x,
              panelIds: [panelId, otherPanelId],
            });
          } else if (Math.abs(newPosition.x - otherRight) <= SNAP_THRESHOLD) {
            snappedX = otherRight;
            guides.push({
              type: "vertical",
              position: otherRight,
              panelIds: [panelId, otherPanelId],
            });
          }
        }

        // Vertical alignment
        if (
          Math.abs(newPosition.x - otherPanel.position.x) <= SNAP_THRESHOLD ||
          Math.abs(currentRight - otherRight) <= SNAP_THRESHOLD ||
          Math.abs(newPosition.x - otherRight) <= SNAP_THRESHOLD ||
          Math.abs(currentRight - otherPanel.position.x) <= SNAP_THRESHOLD
        ) {
          // Horizontal snapping (stack vertically)
          if (
            Math.abs(currentBottom - otherPanel.position.y) <= SNAP_THRESHOLD
          ) {
            snappedY = otherPanel.position.y - panelState.size.height;
            guides.push({
              type: "horizontal",
              position: otherPanel.position.y,
              panelIds: [panelId, otherPanelId],
            });
          } else if (Math.abs(newPosition.y - otherBottom) <= SNAP_THRESHOLD) {
            snappedY = otherBottom;
            guides.push({
              type: "horizontal",
              position: otherBottom,
              panelIds: [panelId, otherPanelId],
            });
          }
        }
      });

      setSnapGuides(guides);
      return { x: snappedX, y: snappedY };
    },
    [panelId, panelState.size, panels]
  );

  // Enhanced drag handlers
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    bringToFront(panelId);
  }, [panelId, bringToFront]);

  const handleDrag = useCallback(
    (_e: any, data: { x: number; y: number }) => {
      const snappedPosition = calculateSnapPosition(data);

      // Show snap guides if position changed due to snapping
      if (snappedPosition.x !== data.x || snappedPosition.y !== data.y) {
        setIsSnapping(true);
        if (snapTimeoutRef.current) {
          clearTimeout(snapTimeoutRef.current);
        }
        snapTimeoutRef.current = setTimeout(() => setIsSnapping(false), 2000);
      }
    },
    [calculateSnapPosition]
  );

  const handleDragStop = useCallback(
    (_e: any, data: { x: number; y: number }) => {
      setIsDragging(false);
      setIsSnapping(false);
      setSnapGuides([]);

      const finalPosition = calculateSnapPosition(data);
      updatePanelPosition(panelId, finalPosition);
    },
    [panelId, updatePanelPosition, calculateSnapPosition]
  );

  // Docking functionality
  const toggleDock = useCallback(() => {
    if (isDocked) {
      // Undock panel
      setIsDocked(false);
      setDockPosition(null);
      updatePanelState(panelId, {
        position: { x: 20, y: 80 }, // Reset to default position
      });
    } else {
      // Dock to nearest edge
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const centerX = panelState.position.x + panelState.size.width / 2;
      const centerY = panelState.position.y + panelState.size.height / 2;

      let newDockPosition: "left" | "right" | "top" | "bottom";
      let newPosition: { x: number; y: number };

      if (centerX < viewport.width / 4) {
        newDockPosition = "left";
        newPosition = { x: 0, y: panelState.position.y };
      } else if (centerX > (viewport.width * 3) / 4) {
        newDockPosition = "right";
        newPosition = {
          x: viewport.width - panelState.size.width,
          y: panelState.position.y,
        };
      } else if (centerY < viewport.height / 4) {
        newDockPosition = "top";
        newPosition = { x: panelState.position.x, y: 0 };
      } else {
        newDockPosition = "bottom";
        newPosition = {
          x: panelState.position.x,
          y: viewport.height - panelState.size.height,
        };
      }

      setIsDocked(true);
      setDockPosition(newDockPosition);
      updatePanelPosition(panelId, newPosition);
    }
  }, [
    isDocked,
    panelId,
    panelState.position,
    panelState.size,
    updatePanelPosition,
    updatePanelState,
    setDockPosition,
  ]);

  // Group functionality
  const toggleGroup = useCallback(() => {
    if (isGrouped) {
      setIsGrouped(false);
      // setGroupId(null);
    } else {
      // const newGroupId = `group_${Date.now()}`;
      setIsGrouped(true);
      // setGroupId(newGroupId);
    }
  }, [isGrouped]);

  const handleClose = () => {
    hidePanel(panelId);
  };

  const handleToggleMinimize = () => {
    toggleMinimize(panelId);
  };

  const handleMouseDown = () => {
    bringToFront(panelId);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let newPosition = { ...panelState.position };

      // Adjust position if panel goes out of bounds
      if (panelState.position.x + panelState.size.width > viewport.width) {
        newPosition.x = Math.max(0, viewport.width - panelState.size.width);
      }
      if (panelState.position.y + panelState.size.height > viewport.height) {
        newPosition.y = Math.max(0, viewport.height - panelState.size.height);
      }

      if (
        newPosition.x !== panelState.position.x ||
        newPosition.y !== panelState.position.y
      ) {
        updatePanelPosition(panelId, newPosition);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [panelState.position, panelState.size, panelId, updatePanelPosition]);

  return (
    <>
      {/* Snap guides overlay */}
      {isSnapping && snapGuides.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {snapGuides.map((guide, index) => (
            <div
              key={index}
              className={cn(
                "absolute bg-blue-500/30 border border-blue-500",
                guide.type === "horizontal" ? "w-full h-0.5" : "h-full w-0.5"
              )}
              style={{
                [guide.type === "horizontal" ? "top" : "left"]: guide.position,
                [guide.type === "horizontal" ? "left" : "top"]: 0,
              }}
            />
          ))}
        </div>
      )}

      <Rnd
        ref={rndRef}
        position={panelState.position}
        size={panelState.size}
        minWidth={panelConfig.minSize.width}
        minHeight={panelState.isMinimized ? 40 : panelConfig.minSize.height}
        maxWidth={panelConfig.maxSize?.width}
        maxHeight={panelConfig.maxSize?.height}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={(
          _e: any,
          _direction: string,
          ref: HTMLElement,
          _delta: { width: number; height: number },
          position: { x: number; y: number }
        ) => {
          updatePanelSize(panelId, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          updatePanelPosition(panelId, position);
        }}
        disableDragging={isDocked}
        enableResizing={
          panelConfig.resizable && !panelState.isMinimized && !isDocked
        }
        className={cn(
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "shadow-lg rounded-lg border border-border/40 overflow-hidden",
          isDragging && "shadow-2xl",
          isSnapping && "border-blue-500/50",
          isDocked && "border-orange-500/50",
          isGrouped && "border-green-500/50",
          className
        )}
        style={{ zIndex: panelState.zIndex }}
        dragHandleClassName="drag-handle"
        onMouseDown={handleMouseDown}
      >
        {/* Enhanced Header */}
        <div
          className={cn(
            "flex items-center justify-between p-2 bg-muted/50 border-b border-border/40",
            "drag-handle cursor-move"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            <IconComponent className="h-4 w-4" />
            <span className="text-sm font-medium">{panelConfig.title}</span>

            {/* Status indicators */}
            <div className="flex gap-1">
              {isDocked && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  Docked
                </Badge>
              )}
              {isGrouped && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  Grouped
                </Badge>
              )}
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex items-center gap-1">
            {/* Group toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={toggleGroup}
                >
                  {isGrouped ? (
                    <Unlink className="h-3 w-3" />
                  ) : (
                    <Link className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isGrouped ? "Ungroup Panel" : "Group Panel"}
              </TooltipContent>
            </Tooltip>

            {/* Dock toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={toggleDock}
                >
                  {isDocked ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Move className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDocked ? "Undock Panel" : "Dock Panel"}
              </TooltipContent>
            </Tooltip>

            {/* Minimize */}
            {panelConfig.minimizable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleToggleMinimize}
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {panelState.isMinimized ? "Maximize" : "Minimize"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Close */}
            {panelConfig.closable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleClose}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close Panel</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Content */}
        {!panelState.isMinimized && (
          <div className="overflow-auto h-full">{children}</div>
        )}
      </Rnd>
    </>
  );
};

export default AdvancedFloatingPanel;
