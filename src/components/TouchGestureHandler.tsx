import React, { useRef, useEffect } from "react";

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onPinch?: (scale: number, x: number, y: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onTap?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  className?: string;
}

export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onPinch,
  onPan,
  onTap,
  onDoubleTap,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<TouchList | null>(null);
  const lastTouchRef = useRef<TouchList | null>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let initialDistance = 0;
    let lastPanX = 0;
    let lastPanY = 0;

    const getTouchDistance = (touches: TouchList): number => {
      if (touches.length < 2) return 0;
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
      if (touches.length === 1) {
        return { x: touches[0].clientX, y: touches[0].clientY };
      }
      const touch1 = touches[0];
      const touch2 = touches[1];
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchStartRef.current = e.touches;
      lastTouchRef.current = e.touches;

      if (e.touches.length === 2) {
        // Start pinch gesture
        initialDistance = getTouchDistance(e.touches);
      } else if (e.touches.length === 1) {
        // Start pan gesture or tap
        const touch = e.touches[0];
        lastPanX = touch.clientX;
        lastPanY = touch.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2 && onPinch) {
        // Handle pinch gesture
        const currentDistance = getTouchDistance(e.touches);
        if (initialDistance > 0) {
          const scale = currentDistance / initialDistance;
          const center = getTouchCenter(e.touches);
          onPinch(scale, center.x, center.y);
        }
      } else if (e.touches.length === 1 && onPan) {
        // Handle pan gesture
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastPanX;
        const deltaY = touch.clientY - lastPanY;

        onPan(deltaX, deltaY);

        lastPanX = touch.clientX;
        lastPanY = touch.clientY;
      }

      lastTouchRef.current = e.touches;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();

      if (
        touchStartRef.current &&
        touchStartRef.current.length === 1 &&
        lastTouchRef.current &&
        lastTouchRef.current.length === 1
      ) {
        // Handle tap or double tap
        const startTouch = touchStartRef.current[0];
        const endTouch = lastTouchRef.current[0];

        // Check if it's a tap (minimal movement)
        const dx = Math.abs(endTouch.clientX - startTouch.clientX);
        const dy = Math.abs(endTouch.clientY - startTouch.clientY);

        if (dx < 10 && dy < 10) {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTimeRef.current;

          if (timeSinceLastTap < 300 && onDoubleTap) {
            // Double tap
            if (tapTimeoutRef.current) {
              clearTimeout(tapTimeoutRef.current);
              tapTimeoutRef.current = null;
            }
            onDoubleTap(endTouch.clientX, endTouch.clientY);
            lastTapTimeRef.current = 0;
          } else if (onTap) {
            // Single tap (with delay to detect double tap)
            tapTimeoutRef.current = setTimeout(() => {
              onTap(endTouch.clientX, endTouch.clientY);
              tapTimeoutRef.current = null;
            }, 300);
            lastTapTimeRef.current = now;
          }
        }
      }

      touchStartRef.current = null;
      lastTouchRef.current = null;
      initialDistance = 0;
    };

    // Add touch event listeners
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);

      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, [onPinch, onPan, onTap, onDoubleTap]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
};
