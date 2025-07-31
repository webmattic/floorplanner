import { useEffect, useCallback } from "react";
import { usePanelStore, PANEL_SHORTCUTS } from "../stores/panelStore";

export const useKeyboardShortcuts = () => {
  const {
    keyboardShortcutsEnabled,
    togglePanel,
    focusPanel,
    minimizeAllPanels,
    restoreAllPanels,
    resetPanelLayout,
    createWorkspaceLayout,
    exportPanelLayout,
  } = usePanelStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!keyboardShortcutsEnabled) return;

      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Prevent default for our shortcuts
      let shouldPreventDefault = false;

      // Panel shortcuts (Ctrl/Cmd + number/letter)
      if (isModifierPressed && !altKey && !shiftKey) {
        const panelId = PANEL_SHORTCUTS[key.toLowerCase()];
        if (panelId) {
          togglePanel(panelId);
          shouldPreventDefault = true;
        }

        // Additional shortcuts
        switch (key.toLowerCase()) {
          case "m":
            // Minimize all panels
            if (altKey) {
              minimizeAllPanels();
              shouldPreventDefault = true;
            }
            break;
          case "r":
            // Restore all panels
            if (altKey) {
              restoreAllPanels();
              shouldPreventDefault = true;
            }
            break;
          case "0":
            // Reset panel layout
            resetPanelLayout();
            shouldPreventDefault = true;
            break;
          case "s":
            // Save workspace (Ctrl+Shift+S)
            if (shiftKey) {
              const workspaceName = `Workspace ${new Date().toLocaleTimeString()}`;
              createWorkspaceLayout(workspaceName);
              shouldPreventDefault = true;
            }
            break;
          case "e":
            // Export layout (Ctrl+Shift+E)
            if (shiftKey) {
              const layoutData = exportPanelLayout();
              console.log("Exported layout:", layoutData);
              shouldPreventDefault = true;
            }
            break;
        }
      }

      // Focus shortcuts (Alt + number/letter)
      if (altKey && !isModifierPressed && !shiftKey) {
        const panelId = PANEL_SHORTCUTS[key.toLowerCase()];
        if (panelId) {
          focusPanel(panelId);
          shouldPreventDefault = true;
        }
      }

      // Global shortcuts (no modifiers)
      if (!isModifierPressed && !altKey && !shiftKey) {
        switch (key) {
          case "Escape":
            // Close all panels or minimize all
            minimizeAllPanels();
            shouldPreventDefault = true;
            break;
          case "F11":
            // Toggle fullscreen mode (browser handles this, but we can prepare)
            shouldPreventDefault = false; // Let browser handle
            break;
        }
      }

      if (shouldPreventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [
      keyboardShortcutsEnabled,
      togglePanel,
      focusPanel,
      minimizeAllPanels,
      restoreAllPanels,
      resetPanelLayout,
      createWorkspaceLayout,
      exportPanelLayout,
    ]
  );

  useEffect(() => {
    if (keyboardShortcutsEnabled) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [keyboardShortcutsEnabled, handleKeyDown]);

  // Return available shortcuts for help display
  const getAvailableShortcuts = useCallback(() => {
    return [
      {
        category: "Panel Management",
        shortcuts: [
          { key: "Ctrl/Cmd + 1-9, 0", description: "Toggle specific panels" },
          { key: "Alt + 1-9, 0", description: "Focus specific panels" },
          { key: "Ctrl/Cmd + Alt + M", description: "Minimize all panels" },
          { key: "Ctrl/Cmd + Alt + R", description: "Restore all panels" },
          { key: "Ctrl/Cmd + 0", description: "Reset panel layout" },
          { key: "Escape", description: "Minimize all panels" },
        ],
      },
      {
        category: "Workspace Management",
        shortcuts: [
          { key: "Ctrl/Cmd + Shift + S", description: "Save current workspace" },
          { key: "Ctrl/Cmd + Shift + E", description: "Export panel layout" },
        ],
      },
      {
        category: "Panel Shortcuts",
        shortcuts: Object.entries(PANEL_SHORTCUTS).map(([key, panelId]) => ({
          key: `Ctrl/Cmd + ${key.toUpperCase()}`,
          description: `Toggle ${panelId.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        })),
      },
    ];
  }, []);

  return {
    keyboardShortcutsEnabled,
    getAvailableShortcuts,
  };
};