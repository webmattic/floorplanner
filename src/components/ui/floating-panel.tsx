import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { cn } from "../../lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Move,
  X,
  Minimize2,
  Maximize2,
  GripVertical,
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
  // Eye,
  // EyeOff,
  Ruler,
} from "lucide-react";
import { Button } from "./button";
// import { Badge } from "@/components/ui/badge.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";
import { PanelErrorBoundary } from "./panel-error-boundary.tsx";

interface LegacyFloatingPanelProps {
  title: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
  children: React.ReactNode;
  resizable?: boolean;
  collapsible?: boolean;
}

interface LegacyFloatingPanelProps {
  title: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
  children: React.ReactNode;
  resizable?: boolean;
  collapsible?: boolean;
}

interface FloatingPanelProps {
  panelId: string;
  children: React.ReactNode;
  className?: string;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
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
    // snapToEdges,
    // magneticBoundaries,
    // snapThreshold,
    // panelAnimations,
    // snapPanelToEdges,
  } = usePanelStore();

  // const { measurePanelRender } = usePanelPerformance();
  const panelState = panels[panelId];
  const panelConfig = PANEL_CONFIGS[panelId];

  if (!panelState || !panelConfig || !panelState.isVisible) {
    return null;
  }

  const handleClose = () => {
    hidePanel(panelId);
  };

  const handleToggleMinimize = () => {
    toggleMinimize(panelId);
  };

  const handleMouseDown = () => {
    bringToFront(panelId);
  };

  // Removed unused handleDragStop

  // Handle window resize to ensure the panel stays within viewport
  useEffect(() => {
    const handleResize = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let newPosition = { ...panelState.position };

      // Adjust x position if panel goes out of viewport width
      if (panelState.position.x + panelState.size.width > viewport.width) {
        newPosition.x = Math.max(0, viewport.width - panelState.size.width);
      }

      // Adjust y position if panel goes out of viewport height
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
    <Rnd
      position={panelState.position}
      size={panelState.size}
      minWidth={panelConfig.minSize.width}
      minHeight={panelState.isMinimized ? 40 : panelConfig.minSize.height}
      maxWidth={panelConfig.maxSize?.width}
      maxHeight={panelConfig.maxSize?.height}
      onDragStop={(_e: any, d: { x: number; y: number }) => {
        updatePanelPosition(panelId, { x: d.x, y: d.y });
      }}
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
      disableDragging={false}
      enableResizing={panelConfig.resizable && !panelState.isMinimized}
      className={cn(
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "shadow-lg rounded-lg border border-border/40 overflow-hidden",
        className
      )}
      style={{ zIndex: panelState.zIndex }}
      dragHandleClassName="drag-handle"
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border/40 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm text-foreground truncate">
            {panelConfig.title}
          </h3>
        </div>

        <div className="flex items-center">
          {panelConfig.minimizable && (
            <button
              onClick={handleToggleMinimize}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              title={panelState.isMinimized ? "Maximize Panel" : "Minimize Panel"}
            >
              {panelState.isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
          )}

          {panelConfig.closable && (
            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-muted transition-colors ml-1"
              title="Close Panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!panelState.isMinimized && (
        <div
          className="p-3 overflow-auto panel-content"
        >
          <PanelErrorBoundary panelId={panelId}>
            {children}
          </PanelErrorBoundary>
        </div>
      )}
    </Rnd>
  );
};

export const LegacyFloatingPanel: React.FC<LegacyFloatingPanelProps> = ({
  title,
  defaultPosition = { x: 20, y: 20 },
  defaultSize = { width: 300, height: 400 },
  minWidth = 200,
  minHeight = 150,
  isOpen = true,
  onClose,
  onToggle,
  className,
  children,
  resizable = true,
  collapsible = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);

  const handleToggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onToggle) onToggle(!newCollapsedState);
  };

  // Handle window resize to ensure the panel stays within viewport
  useEffect(() => {
    const handleResize = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let newPosition = { ...position };

      // Adjust x position if panel goes out of viewport width
      if (position.x + size.width > viewport.width) {
        newPosition.x = Math.max(0, viewport.width - size.width);
      }

      // Adjust y position if panel goes out of viewport height
      if (position.y + size.height > viewport.height) {
        newPosition.y = Math.max(0, viewport.height - size.height);
      }

      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        setPosition(newPosition);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, size]);

  if (!isOpen) {
    return null;
  }

  return (
    <Rnd
      default={{
        ...defaultPosition,
        ...defaultSize,
      }}
      minWidth={minWidth}
      minHeight={collapsed ? 40 : minHeight}
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: collapsed ? 40 : size.height }}
      onDragStop={(_e: any, d: { x: number; y: number }) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(
        _e: any,
        _direction: string,
        ref: HTMLElement,
        _delta: { width: number; height: number },
        position: { x: number; y: number }
      ) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
      }}
      disableDragging={false}
      enableResizing={resizable && !collapsed}
      className={cn(
        "bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden z-50",
        className
      )}
      dragHandleClassName="drag-handle"
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-move">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-gray-400" />
          <h3 className="font-medium text-sm text-gray-700 truncate">
            {title}
          </h3>
        </div>

        <div className="flex items-center">
          {collapsible && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              {collapsed ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors ml-1"
              title="Close Panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div
          className="p-3 overflow-auto panel-content"
        >
          {children}
        </div>
      )}
    </Rnd>
  );
};

export const CollapsibleSidebar: React.FC<{
  children: React.ReactNode;
  side?: "left" | "right";
  width?: number;
  defaultCollapsed?: boolean;
  className?: string;
}> = ({
  children,
  side = "left",
  width = 300,
  defaultCollapsed = false,
  className,
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    return (
      <div
        className={cn(
          "h-full bg-white border-gray-200 transition-all duration-300 flex flex-col",
          side === "left" ? "border-r" : "border-l",
          collapsed ? "w-10" : `w-[${width}px]`,
          className
        )}
      >
        <button
          className={cn(
            "p-2 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors",
            side === "left" ? "border-r border-b" : "border-l border-b"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {side === "left" ? (
            collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )
          ) : collapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className={cn("flex-1 overflow-hidden", collapsed ? "hidden" : "")}>
          {children}
        </div>
      </div>
    );
  };

// Icon mapping for panels
const PANEL_ICONS = {
  drawingTools: Move,
  furnitureLibrary: Package,
  materialPalette: Palette,
  properties: Settings,
  layers: Layers,
  view3D: Box,
  collaboration: Users,
  export: Download,
  revisionHistory: History,
  cadImport: Upload,
  measurements: Ruler,
  socialShare: Share2,
  enhancedSharing: Share,
  advancedPanelManager: Settings,
};

export const PanelManager: React.FC = () => {
  const { togglePanel, isPanelVisible, resetPanelLayout } = usePanelStore();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/40 rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-1">
          {Object.values(PANEL_CONFIGS).map((config) => {
            const IconComponent =
              PANEL_ICONS[config.id as keyof typeof PANEL_ICONS];
            const isVisible = isPanelVisible(config.id);

            return (
              <Tooltip key={config.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isVisible ? "default" : "ghost"}
                    size="sm"
                    onClick={() => togglePanel(config.id)}
                    className="h-8 w-8 p-0"
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPanelLayout}
                className="h-8 w-8 p-0"
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Layout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
