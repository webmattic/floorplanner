import { useEffect } from "react";
import { usePanelStore, PANEL_SHORTCUTS } from "../../stores/panelStore";

interface KeyboardShortcutsProps {
  enabled?: boolean;
}

export const PanelKeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  enabled = true,
}) => {
  const {
    togglePanel,
    resetPanelLayout,
    getVisiblePanels,
    snapPanelsToGrid,
    distributeHorizontally,
    distributeVertically,
    cascadePanels,
    createPreset,
    applyPreset,
    workspacePresets,
  } = usePanelStore();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modKey = ctrlKey || metaKey; // Support both Ctrl and Cmd

      // Panel toggle shortcuts (1-9, 0, m, s, e, p)
      if (!modKey && !shiftKey && !altKey) {
        const panelId = PANEL_SHORTCUTS[key.toLowerCase()];
        if (panelId) {
          event.preventDefault();
          togglePanel(panelId);
          return;
        }
      }

      // Enhanced shortcuts with modifiers
      if (modKey && !shiftKey && !altKey) {
        switch (key.toLowerCase()) {
          case "r":
            event.preventDefault();
            resetPanelLayout();
            break;
          case "g":
            event.preventDefault();
            snapPanelsToGrid();
            break;
          case "h":
            event.preventDefault();
            const visiblePanels = getVisiblePanels();
            distributeHorizontally(visiblePanels);
            break;
          case "j":
            event.preventDefault();
            const visiblePanelsV = getVisiblePanels();
            distributeVertically(visiblePanelsV);
            break;
          case "k":
            event.preventDefault();
            const visiblePanelsC = getVisiblePanels();
            cascadePanels(visiblePanelsC);
            break;
          case "s":
            if (shiftKey) {
              event.preventDefault();
              const presetName = `Workspace ${
                Object.keys(workspacePresets).length + 1
              }`;
              createPreset(
                presetName,
                `Saved at ${new Date().toLocaleString()}`
              );
            }
            break;
        }
      }

      // Workspace preset shortcuts (Ctrl/Cmd + Shift + 1-9)
      if (modKey && shiftKey && !altKey) {
        const presetNumber = parseInt(key);
        if (presetNumber >= 1 && presetNumber <= 9) {
          event.preventDefault();
          const presetIds = Object.keys(workspacePresets);
          const presetId = presetIds[presetNumber - 1];
          if (presetId) {
            applyPreset(presetId);
          }
        }
      }

      // Quick panel management shortcuts
      if (altKey && !modKey && !shiftKey) {
        switch (key.toLowerCase()) {
          case "h":
            event.preventDefault();
            // Hide all panels
            getVisiblePanels().forEach((panelId) => togglePanel(panelId));
            break;
          case "a":
            event.preventDefault();
            // Show all panels
            Object.keys(PANEL_SHORTCUTS).forEach((shortcut) => {
              const panelId = PANEL_SHORTCUTS[shortcut];
              if (
                panelId &&
                !usePanelStore.getState().isPanelVisible(panelId)
              ) {
                togglePanel(panelId);
              }
            });
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    enabled,
    togglePanel,
    resetPanelLayout,
    getVisiblePanels,
    snapPanelsToGrid,
    distributeHorizontally,
    distributeVertically,
    cascadePanels,
    createPreset,
    applyPreset,
    workspacePresets,
  ]);

  return null; // This component doesn't render anything
};

export default PanelKeyboardShortcuts;
