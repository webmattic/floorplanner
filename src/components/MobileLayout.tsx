import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  Menu,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Grid3X3,
  Settings,
} from "lucide-react";
import { cn } from "../lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  rightPanel: React.ReactNode;
  toolbar: React.ReactNode;
}

export function MobileLayout({
  children,
  rightPanel,
  toolbar,
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [panelLayout, setPanelLayout] = useState<
    "drawer" | "bottom" | "overlay"
  >("drawer");
  const [touchInteractionEnabled, setTouchInteractionEnabled] = useState(true);

  // Enhanced mobile detection with device capabilities
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width <= 768;
      const pixelRatio = window.devicePixelRatio || 1;

      setIsMobile(mobile);

      const currentOrientation =
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      setOrientation(currentOrientation);

      // Adjust panel layout based on orientation and screen size
      if (mobile) {
        if (currentOrientation === "landscape" && height < 500) {
          setPanelLayout("overlay"); // Minimal UI for small landscape
        } else if (currentOrientation === "portrait") {
          setPanelLayout("bottom");
        } else {
          setPanelLayout("drawer");
        }
      }

      // Optimize for high-DPI displays
      if (pixelRatio > 1) {
        document.documentElement.style.setProperty(
          "--pixel-ratio",
          pixelRatio.toString()
        );
      }
    };

    checkMobile();

    // Listen for orientation changes with debouncing
    let orientationTimer: NodeJS.Timeout;
    const handleOrientationChange = () => {
      clearTimeout(orientationTimer);
      orientationTimer = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", handleOrientationChange);
    screen.orientation?.addEventListener("change", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", handleOrientationChange);
      screen.orientation?.removeEventListener(
        "change",
        handleOrientationChange
      );
      clearTimeout(orientationTimer);
    };
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error entering fullscreen:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
    }
  }, []);

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    // Modern browsers don't support orientation lock for security reasons
    // This is mainly for demonstration and older browsers
    try {
      if ("orientation" in screen && "lock" in (screen as any).orientation) {
        const currentOrientation =
          orientation === "portrait" ? "landscape" : "portrait";
        (screen as any).orientation
          .lock(currentOrientation)
          .catch((err: Error) => {
            console.error("Error locking orientation:", err);
          });
      }
    } catch (err) {
      console.error("Orientation lock not supported:", err);
    }
  }, [orientation]);

  // PWA installation prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallApp = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  }, [deferredPrompt]);

  if (!isMobile) {
    // Desktop layout
    return (
      <div className="floorplanner-app flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="floorplanner-toolbar border-b bg-white p-2">
            {toolbar}
          </div>
          <div className="floorplanner-canvas flex-1">{children}</div>
        </div>
        <div className="floorplanner-right-panel w-80 border-l bg-gray-50">
          {rightPanel}
        </div>
      </div>
    );
  }

  // Mobile layout with enhanced responsiveness
  return (
    <div
      className={cn(
        "floorplanner-app flex flex-col h-screen overflow-hidden",
        `orientation-${orientation}`,
        `layout-${panelLayout}`,
        touchInteractionEnabled && "touch-enabled"
      )}
    >
      {/* Enhanced mobile header with adaptive controls */}
      <div className="flex items-center justify-between p-2 bg-gray-900 text-white safe-area-top">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDrawerOpen(true)}
          className="text-white touch-target min-h-[44px] min-w-[44px]"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        <h1 className="text-lg font-semibold truncate px-2">FloorPlanner</h1>

        <div className="flex items-center space-x-1">
          {/* Quick Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTouchInteractionEnabled(!touchInteractionEnabled)}
            className={cn(
              "text-white touch-target min-h-[44px] min-w-[44px]",
              touchInteractionEnabled && "bg-blue-600"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="sr-only">Toggle touch interactions</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOrientationChange}
            className="text-white touch-target min-h-[44px] min-w-[44px]"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Rotate screen</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white touch-target min-h-[44px] min-w-[44px]"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </Button>
        </div>
      </div>

      {/* Enhanced mobile drawer with gesture support */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 touch-target"
            onClick={() => setIsDrawerOpen(false)}
            onTouchStart={(e) => {
              // Add swipe-to-close gesture
              const startX = e.touches[0].clientX;
              const handleSwipe = (moveE: TouchEvent) => {
                const deltaX = moveE.touches[0].clientX - startX;
                if (deltaX < -100) {
                  // Swipe left to close
                  setIsDrawerOpen(false);
                  document.removeEventListener("touchmove", handleSwipe);
                }
              };
              document.addEventListener("touchmove", handleSwipe, {
                passive: true,
              });
              document.addEventListener(
                "touchend",
                () => {
                  document.removeEventListener("touchmove", handleSwipe);
                },
                { once: true }
              );
            }}
          />
          <div
            className={cn(
              "fixed top-0 left-0 h-full bg-white z-50 transform transition-transform duration-300 overflow-y-auto safe-area-left safe-area-right",
              orientation === "landscape" ? "w-80" : "w-full max-w-sm"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Tools & Panels</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
                className="touch-target min-h-[44px] min-w-[44px]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 safe-area-bottom">{rightPanel}</div>
          </div>
        </>
      )}

      {/* PWA install prompt with enhanced styling */}
      {showInstallPrompt && (
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between safe-area-left safe-area-right">
          <div className="flex-1">
            <p className="text-sm font-medium">
              Install FloorPlanner for the best mobile experience
            </p>
            <p className="text-xs opacity-90 mt-1">
              Works offline and provides better performance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstallApp}
              className="text-white border-white touch-target"
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstallPrompt(false)}
              className="text-white touch-target"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced mobile toolbar with gesture hints */}
      <div
        className={cn(
          "floorplanner-toolbar bg-white border-b safe-area-left safe-area-right",
          orientation === "landscape" ? "p-1" : "p-2",
          "overflow-x-auto scrollbar-hide"
        )}
      >
        <div className="min-w-max">{toolbar}</div>
        {/* Scroll indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="w-2 h-8 bg-gradient-to-l from-white via-transparent to-transparent" />
        </div>
      </div>

      {/* Main canvas area with touch optimization */}
      <div
        className={cn(
          "floorplanner-canvas flex-1 relative overflow-hidden",
          touchInteractionEnabled && "touch-action-none",
          "safe-area-left safe-area-right"
        )}
      >
        {children}

        {/* Touch interaction overlay for gestures */}
        {touchInteractionEnabled && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Gesture hints for first-time users */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded opacity-50">
              Pinch to zoom • Two fingers to pan
            </div>
          </div>
        )}
      </div>

      {/* Adaptive bottom panel based on layout mode */}
      {panelLayout === "bottom" && orientation === "portrait" && (
        <div
          className={cn(
            "floorplanner-bottom-panel bg-gray-50 border-t overflow-y-auto safe-area-left safe-area-right safe-area-bottom",
            "h-64 md:h-48"
          )}
        >
          <div className="p-3">{rightPanel}</div>
        </div>
      )}

      {/* Landscape mode side panel */}
      {panelLayout === "drawer" &&
        orientation === "landscape" &&
        !isDrawerOpen && (
          <div className="fixed right-0 top-16 bottom-0 w-64 bg-gray-50 border-l overflow-y-auto z-30 safe-area-right safe-area-bottom">
            <div className="p-3">{rightPanel}</div>
          </div>
        )}
    </div>
  );
}

// Touch gesture handler for canvas interactions
export function useTouchGestures() {
  const [touchState, setTouchState] = useState({
    isPanning: false,
    isZooming: false,
    lastTouches: [] as Touch[],
    initialDistance: 0,
    panStart: { x: 0, y: 0 },
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);

    if (touches.length === 1) {
      // Single touch - pan
      setTouchState((prev) => ({
        ...prev,
        isPanning: true,
        panStart: { x: touches[0].clientX, y: touches[0].clientY },
        lastTouches: touches,
      }));
    } else if (touches.length === 2) {
      // Two finger touch - zoom
      const distance = Math.sqrt(
        Math.pow(touches[1].clientX - touches[0].clientX, 2) +
          Math.pow(touches[1].clientY - touches[0].clientY, 2)
      );

      setTouchState((prev) => ({
        ...prev,
        isZooming: true,
        isPanning: false,
        initialDistance: distance,
        lastTouches: touches,
      }));
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault(); // Prevent default scrolling

      const touches = Array.from(e.touches);

      if (touchState.isPanning && touches.length === 1) {
        const deltaX = touches[0].clientX - touchState.panStart.x;
        const deltaY = touches[0].clientY - touchState.panStart.y;

        // Emit pan event
        window.dispatchEvent(
          new CustomEvent("canvas-pan", {
            detail: { deltaX, deltaY },
          })
        );
      } else if (touchState.isZooming && touches.length === 2) {
        const distance = Math.sqrt(
          Math.pow(touches[1].clientX - touches[0].clientX, 2) +
            Math.pow(touches[1].clientY - touches[0].clientY, 2)
        );

        const scale = distance / touchState.initialDistance;

        // Emit zoom event
        window.dispatchEvent(
          new CustomEvent("canvas-zoom", {
            detail: { scale },
          })
        );
      }
    },
    [touchState]
  );

  const handleTouchEnd = useCallback(() => {
    setTouchState({
      isPanning: false,
      isZooming: false,
      lastTouches: [],
      initialDistance: 0,
      panStart: { x: 0, y: 0 },
    });
  }, []);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return touchState;
}

// Mobile-specific utilities
export const mobileUtils = {
  // Prevent zoom on double tap
  preventDoubleZoom: () => {
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );
  },

  // Handle viewport meta tag for better mobile experience
  setViewportMeta: () => {
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    }
  },

  // Handle safe area insets for notched devices
  handleSafeArea: () => {
    document.documentElement.style.setProperty(
      "--safe-area-inset-top",
      "env(safe-area-inset-top)"
    );
    document.documentElement.style.setProperty(
      "--safe-area-inset-bottom",
      "env(safe-area-inset-bottom)"
    );
    document.documentElement.style.setProperty(
      "--safe-area-inset-left",
      "env(safe-area-inset-left)"
    );
    document.documentElement.style.setProperty(
      "--safe-area-inset-right",
      "env(safe-area-inset-right)"
    );
  },

  // Register service worker
  registerServiceWorker: async () => {
    // Skip service worker registration in development
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("Service Worker registration skipped in development");
      return;
    }

    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/static/floorplanner/sw.js"
        );
        console.log("Service Worker registered successfully:", registration);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New update available
                if (confirm("A new version is available. Reload to update?")) {
                  window.location.reload();
                }
              }
            });
          }
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  },

  // Enable background sync for offline functionality
  enableBackgroundSync: () => {
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register sync events (type assertion for browsers that support it)
        const syncRegistration = registration as any;
        if (syncRegistration.sync) {
          syncRegistration.sync.register("floorplan-save");
          syncRegistration.sync.register("collaboration-message");
        }
      });
    }
  },
};
