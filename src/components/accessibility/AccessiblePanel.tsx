import React, { useEffect, useRef, useState } from "react";
import { announceToScreenReader } from "./AccessibilityProvider";

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Accessible Panel Component
 * Enhanced floating panel with comprehensive accessibility features
 */
interface AccessiblePanelProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  isMinimized?: boolean;
  onMinimize?: () => void;
  isDraggable?: boolean;
  isResizable?: boolean;
  keyboardShortcut?: string;
}

export const AccessiblePanel: React.FC<AccessiblePanelProps> = ({
  id,
  title,
  isOpen,
  onClose,
  children,
  className,
  position = { x: 100, y: 100 },
  size = { width: 300, height: 400 },
  isMinimized = false,
  onMinimize,
  isDraggable = true,
  isResizable = true,
  keyboardShortcut,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        announceToScreenReader(`${title} panel closed`);
        return;
      }

      // Minimize on F9
      if (event.key === "F9" && onMinimize) {
        event.preventDefault();
        onMinimize();
        announceToScreenReader(
          `${title} panel ${isMinimized ? "restored" : "minimized"}`
        );
        return;
      }

      // Move panel with arrow keys (when header is focused)
      if (document.activeElement === headerRef.current && isDraggable) {
        const moveDistance = event.shiftKey ? 10 : 1;
        let newX = position.x;
        let newY = position.y;

        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            newX = Math.max(0, position.x - moveDistance);
            break;
          case "ArrowRight":
            event.preventDefault();
            newX = Math.min(
              window.innerWidth - size.width,
              position.x + moveDistance
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            newY = Math.max(0, position.y - moveDistance);
            break;
          case "ArrowDown":
            event.preventDefault();
            newY = Math.min(
              window.innerHeight - size.height,
              position.y + moveDistance
            );
            break;
        }

        if (newX !== position.x || newY !== position.y) {
          // Update position (would need to be handled by parent component)
          announceToScreenReader(`Panel moved to ${newX}, ${newY}`);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    title,
    position,
    size,
    isMinimized,
    onClose,
    onMinimize,
    isDraggable,
  ]);

  // Focus management
  useEffect(() => {
    if (isOpen && !isMinimized && panelRef.current) {
      // Store current focus
      setFocusedElement(document.activeElement as HTMLElement);

      // Focus the panel header for keyboard navigation
      if (headerRef.current) {
        headerRef.current.focus();
      }
    }

    return () => {
      // Restore focus when panel closes
      if (!isOpen && focusedElement) {
        focusedElement.focus();
      }
    };
  }, [isOpen, isMinimized]);

  // Announce panel state changes
  useEffect(() => {
    if (isOpen) {
      announceToScreenReader(
        `${title} panel opened${
          keyboardShortcut ? `, keyboard shortcut ${keyboardShortcut}` : ""
        }`
      );
    }
  }, [isOpen, title, keyboardShortcut]);

  if (!isOpen) return null;

  const panelStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: size.width,
    height: isMinimized ? "auto" : size.height,
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
        "shadow-lg rounded-lg overflow-hidden",
        "focus-within:ring-2 focus-within:ring-blue-500",
        className
      )}
      style={panelStyle}
      role="dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      aria-modal="true"
      data-testid="accessible-panel"
    >
      {/* Panel Header */}
      <div
        ref={headerRef}
        className={cn(
          "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700",
          "border-b border-gray-200 dark:border-gray-600",
          isDraggable && "cursor-move",
          "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600"
        )}
        tabIndex={0}
        role="banner"
        aria-label={`${title} panel header. Press arrow keys to move, F9 to minimize, Escape to close`}
        onMouseDown={(e) => {
          if (isDraggable) {
            // Handle drag start
            e.preventDefault();
          }
        }}
      >
        <h2
          id={`${id}-title`}
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          {title}
          {keyboardShortcut && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({keyboardShortcut})
            </span>
          )}
        </h2>

        <div className="flex items-center space-x-2">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className={cn(
                "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600",
                "focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              aria-label={`${
                isMinimized ? "Restore" : "Minimize"
              } ${title} panel`}
              title={`${isMinimized ? "Restore" : "Minimize"} (F9)`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                {isMinimized ? (
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                ) : (
                  <path d="M19 13H5v-2h14v2z" />
                )}
              </svg>
            </button>
          )}

          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded hover:bg-red-100 dark:hover:bg-red-900",
              "text-red-600 dark:text-red-400",
              "focus:outline-none focus:ring-2 focus:ring-red-500"
            )}
            aria-label={`Close ${title} panel`}
            title="Close (Escape)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {!isMinimized && (
        <div
          id={`${id}-description`}
          className="p-4 overflow-auto flex-1"
          role="main"
          aria-label={`${title} panel content`}
        >
          {children}
        </div>
      )}

      {/* Resize Handle */}
      {isResizable && !isMinimized && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize",
            "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          tabIndex={0}
          role="button"
          aria-label={`Resize ${title} panel`}
          title="Drag to resize"
          onMouseDown={(e) => {
            // Handle resize start
            e.preventDefault();
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full p-1"
            aria-hidden="true"
          >
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

/**
 * Accessible Panel Manager
 * Manages multiple accessible panels with proper focus and z-index handling
 */
interface Panel {
  id: string;
  component: React.ReactNode;
  isOpen: boolean;
  zIndex: number;
}

interface AccessiblePanelManagerProps {
  panels: Panel[];
  onPanelFocus: (panelId: string) => void;
  onPanelClose: (panelId: string) => void;
}

export const AccessiblePanelManager: React.FC<AccessiblePanelManagerProps> = ({
  panels,
  onPanelFocus,
  onPanelClose,
}) => {
  const [focusedPanelId, setFocusedPanelId] = useState<string | null>(null);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cycle through panels with Ctrl+Tab
      if (event.ctrlKey && event.key === "Tab") {
        event.preventDefault();

        const openPanels = panels.filter((panel) => panel.isOpen);
        if (openPanels.length === 0) return;

        const currentIndex = openPanels.findIndex(
          (panel) => panel.id === focusedPanelId
        );
        const nextIndex = (currentIndex + 1) % openPanels.length;
        const nextPanel = openPanels[nextIndex];

        setFocusedPanelId(nextPanel.id);
        onPanelFocus(nextPanel.id);
        announceToScreenReader(`Focused ${nextPanel.id} panel`);
      }

      // Close all panels with Ctrl+Shift+Escape
      if (event.ctrlKey && event.shiftKey && event.key === "Escape") {
        event.preventDefault();
        panels.forEach((panel) => {
          if (panel.isOpen) {
            onPanelClose(panel.id);
          }
        });
        announceToScreenReader("All panels closed");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [panels, focusedPanelId, onPanelFocus, onPanelClose]);

  return (
    <div role="group" aria-label="Floating panels">
      {panels.map((panel) => (
        <div
          key={panel.id}
          style={{ zIndex: panel.zIndex }}
          onFocus={() => {
            setFocusedPanelId(panel.id);
            onPanelFocus(panel.id);
          }}
        >
          {panel.component}
        </div>
      ))}

      {/* Panel navigation hints */}
      <div className="sr-only" role="region" aria-label="Panel navigation help">
        Press Ctrl+Tab to cycle through open panels. Press Ctrl+Shift+Escape to
        close all panels. Use arrow keys when panel header is focused to move
        panels. Press F9 to minimize/restore panels. Press Escape to close
        individual panels.
      </div>
    </div>
  );
};

/**
 * Accessible Button Component
 * Enhanced button with accessibility features
 */
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  icon?: React.ReactNode;
  keyboardShortcut?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "medium",
  ariaLabel,
  ariaDescribedBy,
  className,
  icon,
  keyboardShortcut,
}) => {
  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-md font-medium",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "transition-colors duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",

    // Variant styles
    variant === "primary" &&
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    variant === "secondary" &&
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    variant === "danger" &&
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

    // Size styles
    size === "small" && "px-3 py-1.5 text-sm",
    size === "medium" && "px-4 py-2 text-base",
    size === "large" && "px-6 py-3 text-lg",

    className
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      title={
        keyboardShortcut
          ? `${ariaLabel || children} (${keyboardShortcut})`
          : undefined
      }
    >
      {icon && (
        <span className="mr-2" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {keyboardShortcut && (
        <span className="ml-2 text-xs opacity-75" aria-hidden="true">
          ({keyboardShortcut})
        </span>
      )}
    </button>
  );
};

export default AccessiblePanel;
