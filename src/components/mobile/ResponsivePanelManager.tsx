import React, { useState, useEffect, useCallback } from "react";
import { usePanelStore } from "../../stores/panelStore";
import { cn } from "@/lib/utils";

interface ResponsivePanelManagerProps {
  children: React.ReactNode;
}

export interface DeviceType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: "portrait" | "landscape";
  screenSize: "sm" | "md" | "lg" | "xl";
}

export const useDeviceDetection = (): DeviceType => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: "portrait",
    screenSize: "lg",
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      const orientation = width > height ? "landscape" : "portrait";

      let screenSize: "sm" | "md" | "lg" | "xl" = "lg";
      if (width <= 640) screenSize = "sm";
      else if (width <= 768) screenSize = "md";
      else if (width <= 1024) screenSize = "lg";
      else screenSize = "xl";

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        screenSize,
      });
    };

    updateDeviceInfo();

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100); // Small delay for orientation change
    };

    window.addEventListener("resize", updateDeviceInfo);
    mediaQuery.addEventListener("change", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      mediaQuery.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

export const ResponsivePanelManager: React.FC<ResponsivePanelManagerProps> = ({
  children,
}) => {
  const deviceInfo = useDeviceDetection();
  const { panels, updatePanelPosition, updatePanelSize, getVisiblePanels } =
    usePanelStore();

  // Auto-adapt panel layouts based on device
  useEffect(() => {
    const visiblePanels = getVisiblePanels();

    if (deviceInfo.isMobile) {
      // Stack panels vertically on mobile
      visiblePanels.forEach((panelId, index) => {
        const panel = panels[panelId];
        if (panel) {
          updatePanelPosition(panelId, {
            x: 10,
            y: 60 + index * 40, // Minimize stacking
          });
          updatePanelSize(panelId, {
            width: Math.min(panel.size.width, window.innerWidth - 20),
            height: Math.min(panel.size.height, 200), // Compact height
          });
        }
      });
    } else if (deviceInfo.isTablet) {
      // Arrange panels in grid on tablet
      const panelsPerRow = deviceInfo.orientation === "landscape" ? 3 : 2;
      visiblePanels.forEach((panelId, index) => {
        const row = Math.floor(index / panelsPerRow);
        const col = index % panelsPerRow;
        const panelWidth = Math.floor((window.innerWidth - 60) / panelsPerRow);

        updatePanelPosition(panelId, {
          x: 20 + col * (panelWidth + 20),
          y: 80 + row * 320,
        });
        updatePanelSize(panelId, {
          width: panelWidth,
          height: 300,
        });
      });
    }
  }, [
    deviceInfo,
    panels,
    updatePanelPosition,
    updatePanelSize,
    getVisiblePanels,
  ]);

  return (
    <div
      className={cn(
        "responsive-panel-container",
        deviceInfo.isMobile && "mobile-layout",
        deviceInfo.isTablet && "tablet-layout",
        deviceInfo.orientation === "landscape" && "landscape-mode"
      )}
    >
      {children}
    </div>
  );
};

// Enhanced touch gesture handler
export const useTouchGestures = () => {
  const [touchState, setTouchState] = useState({
    isPanning: false,
    isZooming: false,
    isRotating: false,
    startTouches: [] as Touch[],
    lastTouches: [] as Touch[],
    initialDistance: 0,
    initialAngle: 0,
    panStart: { x: 0, y: 0 },
    gestureStart: Date.now(),
  });

  const calculateDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const calculateAngle = (touch1: Touch, touch2: Touch): number => {
    return (
      (Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) *
        180) /
      Math.PI
    );
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    const now = Date.now();

    if (touches.length === 1) {
      // Single touch - potential pan
      setTouchState((prev) => ({
        ...prev,
        isPanning: true,
        startTouches: touches,
        lastTouches: touches,
        panStart: { x: touches[0].clientX, y: touches[0].clientY },
        gestureStart: now,
      }));
    } else if (touches.length === 2) {
      // Two finger touch - zoom and rotate
      const distance = calculateDistance(touches[0], touches[1]);
      const angle = calculateAngle(touches[0], touches[1]);

      setTouchState((prev) => ({
        ...prev,
        isZooming: true,
        isRotating: true,
        isPanning: false,
        startTouches: touches,
        lastTouches: touches,
        initialDistance: distance,
        initialAngle: angle,
        gestureStart: now,
      }));
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault(); // Prevent default scrolling/zooming

      const touches = Array.from(e.touches);
      const now = Date.now();

      if (touchState.isPanning && touches.length === 1) {
        const deltaX = touches[0].clientX - touchState.panStart.x;
        const deltaY = touches[0].clientY - touchState.panStart.y;
        const velocity =
          Math.sqrt(deltaX * deltaX + deltaY * deltaY) /
          (now - touchState.gestureStart);

        // Emit enhanced pan event with velocity
        window.dispatchEvent(
          new CustomEvent("canvas-pan", {
            detail: {
              deltaX,
              deltaY,
              velocity,
              isGesture: true,
            },
          })
        );
      } else if (
        (touchState.isZooming || touchState.isRotating) &&
        touches.length === 2
      ) {
        const distance = calculateDistance(touches[0], touches[1]);
        const angle = calculateAngle(touches[0], touches[1]);

        if (touchState.isZooming) {
          const scale = distance / touchState.initialDistance;
          const centerX = (touches[0].clientX + touches[1].clientX) / 2;
          const centerY = (touches[0].clientY + touches[1].clientY) / 2;

          // Emit zoom event with center point
          window.dispatchEvent(
            new CustomEvent("canvas-zoom", {
              detail: {
                scale,
                centerX,
                centerY,
                isGesture: true,
              },
            })
          );
        }

        if (touchState.isRotating) {
          const rotation = angle - touchState.initialAngle;
          const centerX = (touches[0].clientX + touches[1].clientX) / 2;
          const centerY = (touches[0].clientY + touches[1].clientY) / 2;

          // Emit rotation event
          window.dispatchEvent(
            new CustomEvent("canvas-rotate", {
              detail: {
                rotation,
                centerX,
                centerY,
                isGesture: true,
              },
            })
          );
        }
      }

      setTouchState((prev) => ({ ...prev, lastTouches: touches }));
    },
    [touchState]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const touches = Array.from(e.touches);
      const now = Date.now();
      const gestureTime = now - touchState.gestureStart;

      // Handle tap gestures
      if (touches.length === 0 && gestureTime < 300) {
        const lastTouch = touchState.lastTouches[0];
        if (lastTouch) {
          const startTouch = touchState.startTouches[0];
          const distance = Math.sqrt(
            Math.pow(lastTouch.clientX - startTouch.clientX, 2) +
              Math.pow(lastTouch.clientY - startTouch.clientY, 2)
          );

          if (distance < 10) {
            // Emit tap event
            window.dispatchEvent(
              new CustomEvent("canvas-tap", {
                detail: {
                  x: lastTouch.clientX,
                  y: lastTouch.clientY,
                  gestureTime,
                },
              })
            );
          }
        }
      }

      setTouchState({
        isPanning: false,
        isZooming: false,
        isRotating: false,
        startTouches: [],
        lastTouches: [],
        initialDistance: 0,
        initialAngle: 0,
        panStart: { x: 0, y: 0 },
        gestureStart: now,
      });
    },
    [touchState]
  );

  useEffect(() => {
    const options = { passive: false };

    document.addEventListener("touchstart", handleTouchStart, options);
    document.addEventListener("touchmove", handleTouchMove, options);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return touchState;
};

// Mobile-optimized panel wrapper
export const MobilePanelWrapper: React.FC<{
  children: React.ReactNode;
  panelId: string;
}> = ({ children, panelId }) => {
  const deviceInfo = useDeviceDetection();
  const { panels, updatePanelState } = usePanelStore();
  const panel = panels[panelId];

  // Auto-minimize panels on mobile when not actively used
  useEffect(() => {
    if (deviceInfo.isMobile && panel) {
      const handleAutoMinimize = () => {
        const visiblePanels = Object.values(panels).filter(
          (p) => p.isVisible && !p.isMinimized
        );
        if (visiblePanels.length > 2) {
          // Minimize older panels
          updatePanelState(panelId, { isMinimized: true });
        }
      };

      const timer = setTimeout(handleAutoMinimize, 10000); // Auto-minimize after 10s
      return () => clearTimeout(timer);
    }
  }, [deviceInfo.isMobile, panel, panels, panelId, updatePanelState]);

  if (!panel || !deviceInfo.isMobile) {
    return <>{children}</>;
  }

  return <div className="mobile-panel-wrapper touch-friendly">{children}</div>;
};
