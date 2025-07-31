import { useState, useEffect } from "react";
import useFloorPlanStore from "../stores/floorPlanStore";

export interface TransitionState {
  transitioning: boolean;
  progress: number;
  previousMode: "2d" | "3d" | null;
}

/**
 * A custom hook for handling smooth transitions between 2D and 3D views
 * @param transitionDuration - Duration of the transition in milliseconds
 */
export const useViewTransition = (transitionDuration = 800) => {
  const { viewMode } = useFloorPlanStore();
  const [transitionState, setTransitionState] = useState<TransitionState>({
    transitioning: false,
    progress: 0,
    previousMode: null,
  });

  // Set up transition when viewMode changes
  useEffect(() => {
    if (
      transitionState.previousMode !== null &&
      transitionState.previousMode !== viewMode
    ) {
      // Start the transition
      setTransitionState((prev) => ({
        ...prev,
        transitioning: true,
        progress: 0,
      }));

      // Set up animation using requestAnimationFrame for smoother transitions
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / transitionDuration, 1);

        setTransitionState((prev) => ({
          ...prev,
          progress: progress,
          transitioning: progress < 1,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }

    // Always update the previous mode
    setTransitionState((prev) => ({
      ...prev,
      previousMode: viewMode,
    }));
  }, [viewMode, transitionDuration]);

  return transitionState;
};

/**
 * Generate CSS transform styles for transition effects
 * @param transitionState - Current transition state
 * @param targetMode - The target view mode ('2d' or '3d')
 */
export const getTransitionStyles = (
  transitionState: TransitionState,
  targetMode: "2d" | "3d"
): React.CSSProperties => {
  const { transitioning, progress, previousMode } = transitionState;

  if (!transitioning || !previousMode) return {};

  // If we're transitioning to this mode
  const isTargetMode = previousMode !== targetMode;

  if (isTargetMode) {
    // Fade in from transparent to opaque
    return {
      opacity: progress,
      transform: `scale(${0.9 + progress * 0.1})`,
      transition: "opacity ease-in-out, transform ease-in-out",
    };
  } else {
    // Fade out from opaque to transparent
    return {
      opacity: 1 - progress,
      transform: `scale(${1 - progress * 0.1})`,
      transition: "opacity ease-in-out, transform ease-in-out",
    };
  }
};
