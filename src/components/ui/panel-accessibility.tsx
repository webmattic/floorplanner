import React, { useEffect, useCallback, useRef } from "react";
import { usePanelStore } from "../../stores/panelStore";

interface AccessibilityAnnouncementProps {
  message: string;
  priority?: "polite" | "assertive";
}

export const AccessibilityAnnouncement: React.FC<
  AccessibilityAnnouncementProps
> = ({ message, priority = "polite" }) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

interface PanelAccessibilityProviderProps {
  children: React.ReactNode;
}

export const PanelAccessibilityProvider: React.FC<
  PanelAccessibilityProviderProps
> = ({ children }) => {
  const {
    panels,
    keyboardShortcutsEnabled,
    focusPanel,
    togglePanel,
    minimizeAllPanels,
    restoreAllPanels,
  } = usePanelStore();

  const announcementRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = React.useState("");

  // Announce panel state changes
  const announceChange = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear announcement after a delay to allow screen readers to process it
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  // Monitor panel visibility changes for announcements
  useEffect(() => {
    const visiblePanels = Object.entries(panels)
      .filter(([_, panel]) => panel.isVisible)
      .map(([id, _]) => id);

    if (visiblePanels.length > 0) {
      const panelNames = visiblePanels
        .map((id) =>
          id
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .trim()
        )
        .join(", ");

      if (visiblePanels.length === 1) {
        announceChange(`${panelNames} panel is now visible`);
      } else {
        announceChange(
          `${visiblePanels.length} panels are now visible: ${panelNames}`
        );
      }
    }
  }, [panels, announceChange]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Skip if user is typing in an input field
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).contentEditable === "true")
      ) {
        return;
      }

      // Accessibility-specific shortcuts
      if (isModifierPressed && altKey) {
        switch (key.toLowerCase()) {
          case "h":
            // Help/shortcuts dialog
            event.preventDefault();
            announceChange("Keyboard shortcuts help would open here");
            break;
          case "l":
            // List all visible panels
            event.preventDefault();
            const visiblePanels = Object.entries(panels)
              .filter(([_, panel]) => panel.isVisible)
              .map(([id, _]) =>
                id
                  .replace(/([A-Z])/g, " $1")
                  .toLowerCase()
                  .trim()
              );

            if (visiblePanels.length === 0) {
              announceChange("No panels are currently visible");
            } else {
              announceChange(`Visible panels: ${visiblePanels.join(", ")}`);
            }
            break;
          case "m":
            // Minimize all panels
            event.preventDefault();
            minimizeAllPanels();
            announceChange("All panels minimized");
            break;
          case "r":
            // Restore all panels
            event.preventDefault();
            restoreAllPanels();
            announceChange("All panels restored");
            break;
        }
      }

      // Tab navigation between panels
      if (key === "Tab" && !isModifierPressed && !altKey) {
        const visiblePanelIds = Object.entries(panels)
          .filter(([_, panel]) => panel.isVisible)
          .map(([id, _]) => id)
          .sort((a, b) => panels[a].zIndex - panels[b].zIndex);

        if (visiblePanelIds.length > 0) {
          const currentFocused =
            document.activeElement?.closest("[data-panel-id]");
          const currentPanelId = currentFocused?.getAttribute("data-panel-id");

          if (currentPanelId) {
            const currentIndex = visiblePanelIds.indexOf(currentPanelId);
            const nextIndex = shiftKey
              ? (currentIndex - 1 + visiblePanelIds.length) %
                visiblePanelIds.length
              : (currentIndex + 1) % visiblePanelIds.length;

            const nextPanelId = visiblePanelIds[nextIndex];
            focusPanel(nextPanelId);

            const panelName = nextPanelId
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()
              .trim();
            announceChange(`Focused on ${panelName} panel`);

            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    keyboardShortcutsEnabled,
    panels,
    focusPanel,
    minimizeAllPanels,
    restoreAllPanels,
    announceChange,
  ]);

  return (
    <>
      {children}
      <AccessibilityAnnouncement message={announcement} />

      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Landmark for screen readers */}
      <div role="region" aria-label="Panel management area" className="sr-only">
        <p>
          Use Ctrl+Alt+H for keyboard shortcuts help. Use Ctrl+Alt+L to list
          visible panels. Use Tab to navigate between panels.
        </p>
      </div>
    </>
  );
};

// Hook for panel-specific accessibility features
export const usePanelAccessibility = (panelId: string) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { panels, focusPanel: storeFocusPanel } = usePanelStore();
  const panelState = panels[panelId];

  // Focus management
  const focusPanelElement = useCallback(() => {
    if (panelRef.current) {
      // Focus the first focusable element in the panel
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0] as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        // If no focusable elements, focus the panel itself
        panelRef.current.focus();
      }
    }
  }, []);

  // Trap focus within panel when it's modal-like
  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (!panelRef.current || event.key !== "Tab") return;

    const focusableElements = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus();
        event.preventDefault();
      }
    }
  }, []);

  // Set up accessibility attributes
  useEffect(() => {
    if (panelRef.current) {
      const panel = panelRef.current;

      // Set ARIA attributes
      panel.setAttribute("role", "dialog");
      panel.setAttribute(
        "aria-label",
        `${panelId
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()
          .trim()} panel`
      );
      panel.setAttribute("data-panel-id", panelId);

      if (panelState?.isMinimized) {
        panel.setAttribute("aria-expanded", "false");
      } else {
        panel.setAttribute("aria-expanded", "true");
      }

      // Make panel focusable
      if (!panel.hasAttribute("tabindex")) {
        panel.setAttribute("tabindex", "-1");
      }
    }
  }, [panelId, panelState?.isMinimized]);

  return {
    panelRef,
    focusPanel: focusPanelElement,
    trapFocus,
  };
};
