import React, { useEffect, useRef, useState } from "react";

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Screen Reader Announcements Component
 * Provides live region for screen reader announcements
 */
export const ScreenReaderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string>("");

  useEffect(() => {
    // Listen for custom announcement events
    const handleAnnouncement = (event: CustomEvent) => {
      setAnnouncements(event.detail.message);

      // Clear after announcement to allow repeated announcements
      setTimeout(() => setAnnouncements(""), 100);
    };

    window.addEventListener(
      "floorplanner:announce",
      handleAnnouncement as EventListener
    );

    return () => {
      window.removeEventListener(
        "floorplanner:announce",
        handleAnnouncement as EventListener
      );
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      aria-label="Screen reader announcements"
    >
      {announcements}
    </div>
  );
};

/**
 * Utility function to announce messages to screen readers
 */
export const announceToScreenReader = (message: string) => {
  const event = new CustomEvent("floorplanner:announce", {
    detail: { message },
  });
  window.dispatchEvent(event);
};

/**
 * Skip to Content Link Component
 * Allows keyboard users to skip navigation and go directly to main content
 */
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className={cn(
        "absolute top-0 left-0 z-[9999] p-4 bg-blue-600 text-white font-medium",
        "transform -translate-y-full focus:translate-y-0",
        "transition-transform duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-blue-300"
      )}
      onFocus={() =>
        announceToScreenReader("Skip to main content link focused")
      }
    >
      Skip to main content
    </a>
  );
};

/**
 * Focus Trap Component
 * Traps keyboard focus within a container (for modals, panels, etc.)
 */
interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  isActive,
  autoFocus = true,
  restoreFocus = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store previous focus
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Focus first focusable element
    if (autoFocus) {
      const firstFocusable = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);

      // Restore previous focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, autoFocus, restoreFocus]);

  if (!isActive) return <>{children}</>;

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Keyboard Navigation Helper Component
 * Provides visual indicators and helpers for keyboard navigation
 */
export const KeyboardNavigationHelper = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        setIsKeyboardUser(true);
        clearTimeout(timeoutId);

        // Reset after 5 seconds of no keyboard activity
        timeoutId = setTimeout(() => {
          setIsKeyboardUser(false);
        }, 5000);
      }

      // Show hints on F1 key
      if (event.key === "F1") {
        event.preventDefault();
        setShowHints((prev) => !prev);
        announceToScreenReader(
          showHints ? "Keyboard hints hidden" : "Keyboard hints shown"
        );
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      clearTimeout(timeoutId);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      clearTimeout(timeoutId);
    };
  }, [showHints]);

  if (!isKeyboardUser && !showHints) return null;

  return (
    <>
      {/* Enhanced focus styles for keyboard users */}
      <style>{`
        .keyboard-user *:focus-visible {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          border-radius: 4px !important;
        }
        
        .keyboard-user button:focus-visible,
        .keyboard-user [role="button"]:focus-visible {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
        }
      `}</style>

      <div className={isKeyboardUser ? "keyboard-user" : ""}>
        {showHints && (
          <div
            className={cn(
              "fixed top-4 right-4 z-[9999] p-4 bg-gray-900 text-white rounded-lg shadow-lg",
              "max-w-md text-sm space-y-2"
            )}
          >
            <h3 className="font-semibold text-blue-300">Keyboard Shortcuts</h3>
            <ul className="space-y-1 text-gray-300">
              <li>
                <kbd>Tab</kbd> - Navigate between elements
              </li>
              <li>
                <kbd>Shift+Tab</kbd> - Navigate backwards
              </li>
              <li>
                <kbd>Enter/Space</kbd> - Activate buttons
              </li>
              <li>
                <kbd>Escape</kbd> - Close panels/modals
              </li>
              <li>
                <kbd>Arrow Keys</kbd> - Navigate within components
              </li>
              <li>
                <kbd>1-9</kbd> - Toggle panels
              </li>
              <li>
                <kbd>F1</kbd> - Toggle this help
              </li>
            </ul>
            <button
              onClick={() => setShowHints(false)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Close (F1)
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/**
 * High Contrast Mode Toggle
 * Allows users to enable high contrast mode for better visibility
 */
export const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("floorplanner-high-contrast") === "true";
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isHighContrast) {
      root.classList.add("high-contrast");
      localStorage.setItem("floorplanner-high-contrast", "true");
    } else {
      root.classList.remove("high-contrast");
      localStorage.setItem("floorplanner-high-contrast", "false");
    }
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      const newValue = !prev;
      announceToScreenReader(
        newValue ? "High contrast mode enabled" : "High contrast mode disabled"
      );
      return newValue;
    });
  };

  return (
    <>
      <button
        onClick={toggleHighContrast}
        className={cn(
          "fixed bottom-4 right-4 z-[9998] p-3 rounded-full shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-300",
          isHighContrast
            ? "bg-yellow-400 text-black hover:bg-yellow-500"
            : "bg-gray-800 text-white hover:bg-gray-700"
        )}
        aria-label={`${
          isHighContrast ? "Disable" : "Enable"
        } high contrast mode`}
        title={`${isHighContrast ? "Disable" : "Enable"} high contrast mode`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8c.34 0 .67.03 1 .07v15.86c-.33.04-.66.07-1 .07z" />
        </svg>
      </button>

      {/* High contrast styles */}
      <style>{`
        .high-contrast {
          filter: contrast(150%) brightness(110%);
        }
        
        .high-contrast button {
          border: 2px solid currentColor !important;
        }
        
        .high-contrast [data-floating-panel] {
          border: 3px solid #000 !important;
          background: #fff !important;
          color: #000 !important;
        }
        
        .high-contrast .dark [data-floating-panel] {
          border: 3px solid #fff !important;
          background: #000 !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
};

/**
 * Reduced Motion Preference Handler
 * Respects user's preference for reduced motion
 */
export const ReducedMotionHandler = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (prefersReducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [prefersReducedMotion]);

  return (
    <style>{`
      .reduce-motion * {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        transition-delay: 0ms !important;
      }
      
      .reduce-motion [data-floating-panel] {
        transform: none !important;
        transition: none !important;
      }
    `}</style>
  );
};

/**
 * ARIA Live Region for Dynamic Content Updates
 * Announces dynamic content changes to screen readers
 */
interface AriaLiveRegionProps {
  politeness?: "polite" | "assertive";
  atomic?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  politeness = "polite",
  atomic = true,
  children,
  className,
}) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
};

/**
 * Accessibility Landmark Component
 * Provides semantic landmarks for better navigation
 */
interface LandmarkProps {
  role:
    | "main"
    | "navigation"
    | "banner"
    | "contentinfo"
    | "complementary"
    | "search"
    | "form";
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const Landmark: React.FC<LandmarkProps> = ({
  role,
  label,
  children,
  className,
}) => {
  return (
    <div role={role} aria-label={label} className={className}>
      {children}
    </div>
  );
};

/**
 * Complete Accessibility Provider
 * Wraps the entire application with accessibility features
 */
interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  return (
    <>
      <SkipToContent />
      <ScreenReaderAnnouncements />
      <KeyboardNavigationHelper />
      <HighContrastToggle />
      <ReducedMotionHandler />
      {children}
    </>
  );
};

export default AccessibilityProvider;
