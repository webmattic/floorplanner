import React, { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { X, Minimize2, Maximize2, Move } from "lucide-react";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";
import { useDeviceDetection } from "./ResponsivePanelManager";
import { cn } from "@/lib/utils";

interface ResponsiveFloatingPanelProps {
  panelId: string;
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveFloatingPanel: React.FC<
  ResponsiveFloatingPanelProps
> = ({ panelId, children, className }) => {
  const deviceInfo = useDeviceDetection();
  const {
    panels,
    hidePanel,
    toggleMinimize,
    bringToFront,
    updatePanelPosition,
    updatePanelSize,
  } = usePanelStore();

  const panelState = panels[panelId];
  const panelConfig = PANEL_CONFIGS[panelId];
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  if (!panelState || !panelConfig || !panelState.isVisible) {
    return null;
  }

  // Auto-adapt panel size for mobile
  const getResponsiveSize = useCallback(() => {
    if (deviceInfo.isMobile) {
      const maxWidth = window.innerWidth - 20;
      const maxHeight = window.innerHeight - 120; // Account for header/toolbar

      if (panelState.isMinimized) {
        return {
          width: Math.min(panelState.size.width, maxWidth),
          height: 40,
        };
      }

      // Mobile: use most of screen width, limited height
      return {
        width: Math.min(panelState.size.width, maxWidth),
        height: Math.min(panelState.size.height, maxHeight * 0.6),
      };
    }

    if (deviceInfo.isTablet) {
      const maxWidth = window.innerWidth - 40;
      const maxHeight = window.innerHeight - 100;

      return {
        width: Math.min(panelState.size.width, maxWidth * 0.7),
        height: Math.min(panelState.size.height, maxHeight * 0.8),
      };
    }

    return panelState.size;
  }, [deviceInfo, panelState.size, panelState.isMinimized]);

  // Auto-position panels for mobile
  const getResponsivePosition = useCallback(() => {
    if (deviceInfo.isMobile) {
      // Stack panels vertically on mobile
      const visiblePanels = Object.keys(panels).filter(
        (id) => panels[id].isVisible && id !== panelId
      );
      const index = visiblePanels.indexOf(panelId);

      return {
        x: 10,
        y: 60 + index * (panelState.isMinimized ? 50 : 200),
      };
    }

    if (deviceInfo.isTablet && deviceInfo.orientation === "portrait") {
      // Grid layout for tablet portrait
      const visiblePanels = Object.keys(panels).filter(
        (id) => panels[id].isVisible
      );
      const index = visiblePanels.indexOf(panelId);
      const cols = 2;
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        x: 20 + col * (window.innerWidth / cols),
        y: 80 + row * 300,
      };
    }

    return panelState.position;
  }, [
    deviceInfo,
    panels,
    panelId,
    panelState.position,
    panelState.isMinimized,
  ]);

  const responsiveSize = getResponsiveSize();
  const responsivePosition = getResponsivePosition();

  // Handle mobile-specific gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    bringToFront(panelId);

    if (e.touches.length === 2) {
      // Two-finger gesture for resize on mobile
      setIsResizing(true);
    }
  };

  const handleClose = () => {
    hidePanel(panelId);
  };

  const handleToggleMinimize = () => {
    toggleMinimize(panelId);
  };

  const handleMouseDown = () => {
    bringToFront(panelId);
  };

  // Responsive drag and resize handlers
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    setIsDragging(false);

    // Snap to edges on mobile
    if (deviceInfo.isMobile) {
      const snapThreshold = 20;
      let newX = d.x;
      let newY = d.y;

      // Snap to left edge
      if (d.x < snapThreshold) {
        newX = 10;
      }
      // Snap to right edge
      else if (d.x + responsiveSize.width > window.innerWidth - snapThreshold) {
        newX = window.innerWidth - responsiveSize.width - 10;
      }

      // Snap to top
      if (d.y < 60 + snapThreshold) {
        newY = 60;
      }

      updatePanelPosition(panelId, { x: newX, y: newY });
    } else {
      updatePanelPosition(panelId, { x: d.x, y: d.y });
    }
  };

  const handleResizeStop = (
    _e: any,
    _direction: string,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    setIsResizing(false);

    updatePanelSize(panelId, {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
    });
    updatePanelPosition(panelId, position);
  };

  // Disable dragging and resizing on mobile when minimized
  const disableDragging = deviceInfo.isMobile && panelState.isMinimized;
  const enableResizing = !deviceInfo.isMobile && !panelState.isMinimized;

  return (
    <Rnd
      position={responsivePosition}
      size={responsiveSize}
      minWidth={deviceInfo.isMobile ? 280 : panelConfig.minSize.width}
      minHeight={
        panelState.isMinimized
          ? 40
          : deviceInfo.isMobile
          ? 200
          : panelConfig.minSize.height
      }
      maxWidth={
        deviceInfo.isMobile
          ? window.innerWidth - 20
          : panelConfig.maxSize?.width
      }
      maxHeight={
        deviceInfo.isMobile
          ? window.innerHeight - 120
          : panelConfig.maxSize?.height
      }
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={handleResizeStop}
      disableDragging={disableDragging}
      enableResizing={
        enableResizing
          ? {
              top: false,
              right: true,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: true,
              bottomLeft: false,
              topLeft: false,
            }
          : false
      }
      className={cn(
        "bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden",
        deviceInfo.isMobile && "shadow-xl border-gray-300",
        isDragging && "shadow-2xl",
        isResizing && "resize-active",
        className
      )}
      style={{
        zIndex: panelState.zIndex,
        touchAction: deviceInfo.isMobile ? "none" : "auto",
      }}
      dragHandleClassName="drag-handle"
      onTouchStart={handleTouchStart}
    >
      {/* Enhanced header with mobile optimizations */}
      <div
        className={cn(
          "drag-handle flex items-center justify-between bg-gray-50 border-b border-gray-200 cursor-move",
          deviceInfo.isMobile ? "px-4 py-3" : "px-3 py-2"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Move
            className={cn(
              "text-gray-400 flex-shrink-0",
              deviceInfo.isMobile ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <h3
            className={cn(
              "font-medium text-gray-700 truncate",
              deviceInfo.isMobile ? "text-base" : "text-sm"
            )}
          >
            {panelConfig.title}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          {panelConfig.minimizable && (
            <button
              onClick={handleToggleMinimize}
              className={cn(
                "rounded-md hover:bg-gray-200 transition-colors flex-shrink-0",
                deviceInfo.isMobile
                  ? "p-2 touch-target min-h-[44px] min-w-[44px]"
                  : "p-1"
              )}
            >
              {panelState.isMinimized ? (
                <Maximize2
                  className={deviceInfo.isMobile ? "h-5 w-5" : "h-4 w-4"}
                />
              ) : (
                <Minimize2
                  className={deviceInfo.isMobile ? "h-5 w-5" : "h-4 w-4"}
                />
              )}
            </button>
          )}

          {panelConfig.closable && (
            <button
              onClick={handleClose}
              className={cn(
                "rounded-md hover:bg-gray-200 transition-colors flex-shrink-0",
                deviceInfo.isMobile
                  ? "p-2 touch-target min-h-[44px] min-w-[44px]"
                  : "p-1"
              )}
            >
              <X className={deviceInfo.isMobile ? "h-5 w-5" : "h-4 w-4"} />
            </button>
          )}
        </div>
      </div>

      {/* Content with responsive padding */}
      {!panelState.isMinimized && (
        <div
          className={cn("overflow-auto", deviceInfo.isMobile ? "p-4" : "p-3")}
          style={{
            height: `calc(100% - ${deviceInfo.isMobile ? "56px" : "40px"})`,
            touchAction: "pan-y",
          }}
          onMouseDown={handleMouseDown}
        >
          {children}
        </div>
      )}

      {/* Mobile resize handle */}
      {deviceInfo.isMobile && !panelState.isMinimized && (
        <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize">
          <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-gray-400 opacity-50" />
        </div>
      )}
    </Rnd>
  );
};

// Auto-layout hook for managing multiple panels
export const useResponsivePanelLayout = () => {
  const deviceInfo = useDeviceDetection();
  const { panels, updatePanelPosition, updatePanelSize, getVisiblePanels } =
    usePanelStore();

  const reorganizePanels = useCallback(() => {
    const visiblePanels = getVisiblePanels();

    if (deviceInfo.isMobile) {
      // Stack panels vertically on mobile
      visiblePanels.forEach((panelId, index) => {
        const panel = panels[panelId];
        if (panel && !panel.isMinimized) {
          updatePanelPosition(panelId, {
            x: 10,
            y: 60 + index * 220,
          });
          updatePanelSize(panelId, {
            width: Math.min(panel.size.width, window.innerWidth - 20),
            height: Math.min(panel.size.height, 200),
          });
        }
      });
    } else if (deviceInfo.isTablet) {
      // Grid layout for tablets
      const cols = deviceInfo.orientation === "landscape" ? 3 : 2;
      visiblePanels.forEach((panelId, index) => {
        const panel = panels[panelId];
        if (panel) {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const panelWidth = Math.floor((window.innerWidth - 60) / cols);

          updatePanelPosition(panelId, {
            x: 20 + col * (panelWidth + 20),
            y: 80 + row * 350,
          });
          updatePanelSize(panelId, {
            width: panelWidth,
            height: Math.min(panel.size.height, 300),
          });
        }
      });
    }
  }, [
    deviceInfo,
    panels,
    updatePanelPosition,
    updatePanelSize,
    getVisiblePanels,
  ]);

  // Auto-reorganize on device changes
  useEffect(() => {
    const timer = setTimeout(reorganizePanels, 100);
    return () => clearTimeout(timer);
  }, [
    deviceInfo.isMobile,
    deviceInfo.isTablet,
    deviceInfo.orientation,
    reorganizePanels,
  ]);

  return { reorganizePanels };
};
