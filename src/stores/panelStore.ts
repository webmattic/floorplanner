import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PanelConfig {
  id: string;
  title: string;
  icon: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize?: { width: number; height: number };
  resizable: boolean;
  minimizable: boolean;
  closable: boolean;
  keyboardShortcut?: string;
  category?: string;
  dockable?: boolean;
  groupable?: boolean;
}

export interface PanelState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isVisible: boolean;
  zIndex: number;
  isDocked: boolean;
  dockPosition?: "left" | "right" | "top" | "bottom";
  groupId?: string;
  isSnapped: boolean;
}

export interface SnapGuide {
  type: "horizontal" | "vertical";
  position: number;
  panelIds: string[];
}

export interface PanelGroup {
  id: string;
  name: string;
  panelIds: string[];
  docked: boolean;
  position?: "left" | "right" | "top" | "bottom" | "floating";
  createdAt: number;
}

export interface WorkspacePreset {
  id: string;
  name: string;
  description?: string;
  panelStates: Record<string, Partial<PanelState>>;
  createdAt: number;
  isDefault?: boolean;
}

export interface PanelStore {
  panels: Record<string, PanelState>;
  panelGroups: Record<string, PanelGroup>;
  workspacePresets: Record<string, WorkspacePreset>;
  activePresetId?: string;
  maxZIndex: number;
  
  // Advanced panel management
  snapToEdges: boolean;
  magneticBoundaries: boolean;
  snapThreshold: number;
  keyboardShortcutsEnabled: boolean;
  panelAnimations: boolean;

  // Panel management
  showPanel: (panelId: string) => void;
  hidePanel: (panelId: string) => void;
  togglePanel: (panelId: string) => void;
  minimizePanel: (panelId: string) => void;
  maximizePanel: (panelId: string) => void;
  toggleMinimize: (panelId: string) => void;
  bringToFront: (panelId: string) => void;

  // Panel state updates
  updatePanelPosition: (
    panelId: string,
    position: { x: number; y: number }
  ) => void;
  updatePanelSize: (
    panelId: string,
    size: { width: number; height: number }
  ) => void;
  updatePanelState: (panelId: string, updates: Partial<PanelState>) => void;

  // Advanced panel features
  dockPanel: (
    panelId: string,
    position: "left" | "right" | "top" | "bottom"
  ) => void;
  undockPanel: (panelId: string) => void;
  toggleDock: (panelId: string) => void;

  // Panel grouping
  createGroup: (name: string, panelIds: string[]) => string;
  removeGroup: (groupId: string) => void;
  addPanelToGroup: (panelId: string, groupId: string) => void;
  removePanelFromGroup: (panelId: string) => void;
  moveGroup: (groupId: string, position: { x: number; y: number }) => void;

  // Workspace presets
  createPreset: (name: string, description?: string) => string;
  applyPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  setActivePreset: (presetId: string) => void;

  // Utility functions
  resetPanelLayout: () => void;
  getVisiblePanels: () => string[];
  isPanelVisible: (panelId: string) => boolean;
  isPanelMinimized: (panelId: string) => boolean;
  snapPanelsToGrid: (gridSize?: number) => void;
  distributeHorizontally: (panelIds: string[]) => void;
  distributeVertically: (panelIds: string[]) => void;
  cascadePanels: (panelIds: string[]) => void;
  
  // Advanced panel management functions
  snapPanelToEdges: (panelId: string) => void;
  enableMagneticBoundaries: (enabled: boolean) => void;
  setSnapThreshold: (threshold: number) => void;
  toggleKeyboardShortcuts: (enabled: boolean) => void;
  togglePanelAnimations: (enabled: boolean) => void;
  createWorkspaceLayout: (name: string, description?: string) => string;
  switchWorkspace: (presetId: string) => void;
  exportPanelLayout: () => string;
  importPanelLayout: (layoutData: string) => void;
  focusPanel: (panelId: string) => void;
  minimizeAllPanels: () => void;
  restoreAllPanels: () => void;
  alignPanelsToGrid: (gridSize: number) => void;
}

// Default panel configurations
export const PANEL_CONFIGS: Record<string, PanelConfig> = {
  drawingTools: {
    id: "drawingTools",
    title: "Drawing Tools",
    icon: "Move",
    defaultPosition: { x: 20, y: 80 },
    defaultSize: { width: 280, height: 400 },
    minSize: { width: 250, height: 300 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "1",
    category: "tools",
    dockable: true,
    groupable: true,
  },
  furnitureLibrary: {
    id: "furnitureLibrary",
    title: "Furniture Library",
    icon: "Package",
    defaultPosition: { x: 320, y: 80 },
    defaultSize: { width: 320, height: 450 },
    minSize: { width: 280, height: 350 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "2",
    category: "content",
    dockable: true,
    groupable: true,
  },
  materialPalette: {
    id: "materialPalette",
    title: "Materials & Colors",
    icon: "Palette",
    defaultPosition: { x: 660, y: 80 },
    defaultSize: { width: 300, height: 400 },
    minSize: { width: 280, height: 350 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "3",
    category: "content",
    dockable: true,
    groupable: true,
  },
  properties: {
    id: "properties",
    title: "Properties",
    icon: "Settings",
    defaultPosition: { x: 980, y: 80 },
    defaultSize: { width: 300, height: 450 },
    minSize: { width: 280, height: 350 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "4",
    category: "editing",
    dockable: true,
    groupable: true,
  },
  layers: {
    id: "layers",
    title: "Layers",
    icon: "Layers",
    defaultPosition: { x: 20, y: 500 },
    defaultSize: { width: 280, height: 300 },
    minSize: { width: 250, height: 200 },
    resizable: true,
    minimizable: true,
    closable: true,
  },
  view3D: {
    id: "view3D",
    title: "3D View",
    icon: "Box",
    defaultPosition: { x: 320, y: 550 },
    defaultSize: { width: 400, height: 300 },
    minSize: { width: 350, height: 250 },
    resizable: true,
    minimizable: true,
    closable: true,
  },
  collaboration: {
    id: "collaboration",
    title: "Collaboration",
    icon: "Users",
    defaultPosition: { x: 740, y: 500 },
    defaultSize: { width: 320, height: 350 },
    minSize: { width: 300, height: 300 },
    resizable: true,
    minimizable: true,
    closable: true,
  },

  measurements: {
    id: "measurements",
    title: "Measurements",
    icon: "Ruler",
    defaultPosition: { x: 20, y: 820 },
    defaultSize: { width: 280, height: 200 },
    minSize: { width: 250, height: 150 },
    resizable: true,
    minimizable: true,
    closable: true,
  },
  socialShare: {
    id: "socialShare",
    title: "Share & Collaborate",
    icon: "Share2",
    defaultPosition: { x: 320, y: 820 },
    defaultSize: { width: 300, height: 400 },
    minSize: { width: 280, height: 350 },
    resizable: true,
    minimizable: true,
    closable: true,
  },
  enhancedSharing: {
    id: "enhancedSharing",
    title: "Advanced Sharing",
    icon: "Share",
    defaultPosition: { x: 640, y: 820 },
    defaultSize: { width: 400, height: 500 },
    minSize: { width: 350, height: 400 },
    resizable: true,
    minimizable: true,
    closable: true,
  },
  advancedPanelManager: {
    id: "advancedPanelManager",
    title: "Panel Manager",
    icon: "Settings",
    defaultPosition: { x: 640, y: 820 },
    defaultSize: { width: 400, height: 500 },
    minSize: { width: 350, height: 400 },
    resizable: true,
    minimizable: true,
    closable: true,
  },
  export: {
    id: "export",
    title: "Export & Share",
    icon: "Download",
    defaultPosition: { x: 1080, y: 550 },
    defaultSize: { width: 350, height: 500 },
    minSize: { width: 320, height: 400 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "e",
    category: "tools",
    dockable: true,
    groupable: true,
  },
  revisionHistory: {
    id: "revisionHistory",
    title: "Revision History",
    icon: "History",
    defaultPosition: { x: 1400, y: 80 },
    defaultSize: { width: 350, height: 500 },
    minSize: { width: 320, height: 400 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "h",
    category: "tools",
    dockable: true,
    groupable: true,
  },
  cadImport: {
    id: "cadImport",
    title: "CAD Import",
    icon: "Upload",
    defaultPosition: { x: 1400, y: 600 },
    defaultSize: { width: 350, height: 500 },
    minSize: { width: 320, height: 400 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "i",
    category: "tools",
    dockable: true,
    groupable: true,
  },
};

// Create default panel states
const createDefaultPanelStates = (): Record<string, PanelState> => {
  const states: Record<string, PanelState> = {};

  Object.values(PANEL_CONFIGS).forEach((config, index) => {
    states[config.id] = {
      position: config.defaultPosition,
      size: config.defaultSize,
      isMinimized: false,
      isVisible: false, // Start with panels hidden
      zIndex: 100 + index,
      isDocked: false,
      isSnapped: false,
    };
  });

  // Show some panels by default
  states.drawingTools.isVisible = true;
  states.properties.isVisible = true;
  states.furnitureLibrary.isVisible = true;
  
  // Initialize new panels as hidden by default
  states.export.isVisible = false;
  states.revisionHistory.isVisible = false;
  states.cadImport.isVisible = false;

  return states;
};

// Panel shortcuts mapping
export const PANEL_SHORTCUTS: Record<string, string> = {
  "1": "drawingTools",
  "2": "furnitureLibrary",
  "3": "materialPalette",
  "4": "properties",
  "5": "layers",
  "6": "view3D",
  "7": "collaboration",
  "8": "measurements",
  "9": "socialShare",
  "0": "enhancedSharing",
  e: "export",
  h: "revisionHistory",
  i: "cadImport",
  p: "advancedPanelManager",
};

export const usePanelStore = create<PanelStore>()(
  persist(
    (set, get) => ({
      panels: createDefaultPanelStates(),
      panelGroups: {},
      workspacePresets: {},
      activePresetId: undefined,
      maxZIndex: 200,
      
      // Advanced panel management defaults
      snapToEdges: true,
      magneticBoundaries: true,
      snapThreshold: 20,
      keyboardShortcutsEnabled: true,
      panelAnimations: true,

      showPanel: (panelId: string) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              isVisible: true,
              zIndex: state.maxZIndex + 1,
            },
          },
          maxZIndex: state.maxZIndex + 1,
        }));
      },

      hidePanel: (panelId: string) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              isVisible: false,
            },
          },
        }));
      },

      togglePanel: (panelId: string) => {
        const { panels } = get();
        const panel = panels[panelId];
        if (panel?.isVisible) {
          get().hidePanel(panelId);
        } else {
          get().showPanel(panelId);
        }
      },

      minimizePanel: (panelId: string) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              isMinimized: true,
            },
          },
        }));
      },

      maximizePanel: (panelId: string) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              isMinimized: false,
            },
          },
        }));
      },

      toggleMinimize: (panelId: string) => {
        const { panels } = get();
        const panel = panels[panelId];
        if (panel?.isMinimized) {
          get().maximizePanel(panelId);
        } else {
          get().minimizePanel(panelId);
        }
      },

      bringToFront: (panelId: string) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              zIndex: state.maxZIndex + 1,
            },
          },
          maxZIndex: state.maxZIndex + 1,
        }));
      },

      updatePanelPosition: (
        panelId: string,
        position: { x: number; y: number }
      ) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              position,
            },
          },
        }));
      },

      updatePanelSize: (
        panelId: string,
        size: { width: number; height: number }
      ) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              size,
            },
          },
        }));
      },

      updatePanelState: (panelId: string, updates: Partial<PanelState>) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              ...updates,
            },
          },
        }));
      },

      resetPanelLayout: () => {
        set({
          panels: createDefaultPanelStates(),
          maxZIndex: 200,
        });
      },

      getVisiblePanels: () => {
        const { panels } = get();
        return Object.keys(panels).filter(
          (panelId) => panels[panelId]?.isVisible
        );
      },

      isPanelVisible: (panelId: string) => {
        const { panels } = get();
        return panels[panelId]?.isVisible || false;
      },

      isPanelMinimized: (panelId: string) => {
        const { panels } = get();
        return panels[panelId]?.isMinimized || false;
      },

      // Advanced panel features
      dockPanel: (
        panelId: string,
        position: "left" | "right" | "top" | "bottom"
      ) => {
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        let newPosition: { x: number; y: number };
        const panel = get().panels[panelId];

        if (!panel) return;

        switch (position) {
          case "left":
            newPosition = { x: 0, y: panel.position.y };
            break;
          case "right":
            newPosition = {
              x: viewport.width - panel.size.width,
              y: panel.position.y,
            };
            break;
          case "top":
            newPosition = { x: panel.position.x, y: 0 };
            break;
          case "bottom":
            newPosition = {
              x: panel.position.x,
              y: viewport.height - panel.size.height,
            };
            break;
        }

        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              isDocked: true,
              dockPosition: position,
              position: newPosition,
            },
          },
        }));
      },

      undockPanel: (panelId: string) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              isDocked: false,
              dockPosition: undefined,
            },
          },
        }));
      },

      toggleDock: (panelId: string) => {
        const { panels } = get();
        const panel = panels[panelId];
        if (panel?.isDocked) {
          get().undockPanel(panelId);
        } else {
          // Dock to the nearest edge
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
          };

          const centerX = panel.position.x + panel.size.width / 2;
          const centerY = panel.position.y + panel.size.height / 2;

          let dockPosition: "left" | "right" | "top" | "bottom";

          if (centerX < viewport.width / 4) {
            dockPosition = "left";
          } else if (centerX > (viewport.width * 3) / 4) {
            dockPosition = "right";
          } else if (centerY < viewport.height / 4) {
            dockPosition = "top";
          } else {
            dockPosition = "bottom";
          }

          get().dockPanel(panelId, dockPosition);
        }
      },

      // Panel grouping
      createGroup: (name: string, panelIds: string[]) => {
        const groupId = `group_${Date.now()}`;
        const group: PanelGroup = {
          id: groupId,
          name,
          panelIds,
          docked: false,
          createdAt: Date.now(),
        };

        set((state) => ({
          panelGroups: {
            ...state.panelGroups,
            [groupId]: group,
          },
          panels: {
            ...state.panels,
            ...panelIds.reduce((acc, panelId) => {
              if (state.panels[panelId]) {
                acc[panelId] = {
                  ...state.panels[panelId],
                  groupId,
                };
              }
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));

        return groupId;
      },

      removeGroup: (groupId: string) => {
        const { panelGroups, panels } = get();
        const group = panelGroups[groupId];

        if (!group) return;

        set((state) => ({
          panelGroups: Object.fromEntries(
            Object.entries(state.panelGroups).filter(([id]) => id !== groupId)
          ),
          panels: {
            ...state.panels,
            ...group.panelIds.reduce((acc, panelId) => {
              if (state.panels[panelId]) {
                acc[panelId] = {
                  ...state.panels[panelId],
                  groupId: undefined,
                };
              }
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },

      addPanelToGroup: (panelId: string, groupId: string) => {
        const { panelGroups, panels } = get();
        const group = panelGroups[groupId];
        const panel = panels[panelId];

        if (!group || !panel) return;

        set((state) => ({
          panelGroups: {
            ...state.panelGroups,
            [groupId]: {
              ...group,
              panelIds: [...group.panelIds, panelId],
            },
          },
          panels: {
            ...state.panels,
            [panelId]: {
              ...panel,
              groupId,
            },
          },
        }));
      },

      removePanelFromGroup: (panelId: string) => {
        const { panels } = get();
        const panel = panels[panelId];

        if (!panel?.groupId) return;

        const groupId = panel.groupId;

        set((state) => {
          const group = state.panelGroups[groupId];
          if (!group) return state;

          const updatedPanelIds = group.panelIds.filter((id) => id !== panelId);

          return {
            ...state,
            panelGroups:
              updatedPanelIds.length > 0
                ? {
                    ...state.panelGroups,
                    [groupId]: {
                      ...group,
                      panelIds: updatedPanelIds,
                    },
                  }
                : Object.fromEntries(
                    Object.entries(state.panelGroups).filter(
                      ([id]) => id !== groupId
                    )
                  ),
            panels: {
              ...state.panels,
              [panelId]: {
                ...state.panels[panelId],
                groupId: undefined,
              },
            },
          };
        });
      },

      moveGroup: (groupId: string, position: { x: number; y: number }) => {
        const { panelGroups, panels } = get();
        const group = panelGroups[groupId];

        if (!group) return;

        // Calculate the offset from the first panel's current position
        const firstPanelId = group.panelIds[0];
        const firstPanel = panels[firstPanelId];

        if (!firstPanel) return;

        const offsetX = position.x - firstPanel.position.x;
        const offsetY = position.y - firstPanel.position.y;

        set((state) => ({
          panels: {
            ...state.panels,
            ...group.panelIds.reduce((acc, panelId) => {
              const panel = state.panels[panelId];
              if (panel) {
                acc[panelId] = {
                  ...panel,
                  position: {
                    x: panel.position.x + offsetX,
                    y: panel.position.y + offsetY,
                  },
                };
              }
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },

      // Workspace presets
      createPreset: (name: string, description?: string) => {
        const presetId = `preset_${Date.now()}`;
        const { panels } = get();

        const preset: WorkspacePreset = {
          id: presetId,
          name,
          description,
          panelStates: Object.fromEntries(
            Object.entries(panels).map(([id, state]) => [
              id,
              {
                position: state.position,
                size: state.size,
                isVisible: state.isVisible,
                isMinimized: state.isMinimized,
                isDocked: state.isDocked,
                dockPosition: state.dockPosition,
              },
            ])
          ),
          createdAt: Date.now(),
        };

        set((state) => ({
          workspacePresets: {
            ...state.workspacePresets,
            [presetId]: preset,
          },
        }));

        return presetId;
      },

      applyPreset: (presetId: string) => {
        const { workspacePresets } = get();
        const preset = workspacePresets[presetId];

        if (!preset) return;

        set((state) => ({
          panels: {
            ...state.panels,
            ...Object.fromEntries(
              Object.entries(preset.panelStates).map(
                ([panelId, presetState]) => [
                  panelId,
                  {
                    ...state.panels[panelId],
                    ...presetState,
                  },
                ]
              )
            ),
          },
          activePresetId: presetId,
        }));
      },

      deletePreset: (presetId: string) => {
        set((state) => ({
          workspacePresets: Object.fromEntries(
            Object.entries(state.workspacePresets).filter(
              ([id]) => id !== presetId
            )
          ),
          activePresetId:
            state.activePresetId === presetId
              ? undefined
              : state.activePresetId,
        }));
      },

      setActivePreset: (presetId: string) => {
        set({ activePresetId: presetId });
      },

      // Enhanced utility functions
      snapPanelsToGrid: (gridSize = 20) => {
        set((state) => ({
          panels: Object.fromEntries(
            Object.entries(state.panels).map(([panelId, panel]) => [
              panelId,
              {
                ...panel,
                position: {
                  x: Math.round(panel.position.x / gridSize) * gridSize,
                  y: Math.round(panel.position.y / gridSize) * gridSize,
                },
                isSnapped: true,
              },
            ])
          ),
        }));

        // Reset snap state after a delay
        setTimeout(() => {
          set((state) => ({
            panels: Object.fromEntries(
              Object.entries(state.panels).map(([panelId, panel]) => [
                panelId,
                { ...panel, isSnapped: false },
              ])
            ),
          }));
        }, 1000);
      },

      distributeHorizontally: (panelIds: string[]) => {
        const { panels } = get();
        const visiblePanels = panelIds.filter((id) => panels[id]?.isVisible);

        if (visiblePanels.length < 2) return;

        const viewport = { width: window.innerWidth };
        const totalWidth = visiblePanels.reduce(
          (sum, id) => sum + panels[id].size.width,
          0
        );
        const spacing = Math.max(
          20,
          (viewport.width - totalWidth) / (visiblePanels.length + 1)
        );

        let currentX = spacing;

        set((state) => ({
          panels: {
            ...state.panels,
            ...visiblePanels.reduce((acc, panelId) => {
              const panel = state.panels[panelId];
              acc[panelId] = {
                ...panel,
                position: { x: currentX, y: panel.position.y },
              };
              currentX += panel.size.width + spacing;
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },

      distributeVertically: (panelIds: string[]) => {
        const { panels } = get();
        const visiblePanels = panelIds.filter((id) => panels[id]?.isVisible);

        if (visiblePanels.length < 2) return;

        const viewport = { height: window.innerHeight };
        const totalHeight = visiblePanels.reduce(
          (sum, id) => sum + panels[id].size.height,
          0
        );
        const spacing = Math.max(
          20,
          (viewport.height - totalHeight) / (visiblePanels.length + 1)
        );

        let currentY = spacing;

        set((state) => ({
          panels: {
            ...state.panels,
            ...visiblePanels.reduce((acc, panelId) => {
              const panel = state.panels[panelId];
              acc[panelId] = {
                ...panel,
                position: { x: panel.position.x, y: currentY },
              };
              currentY += panel.size.height + spacing;
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },

      cascadePanels: (panelIds: string[]) => {
        const { panels } = get();
        const visiblePanels = panelIds.filter((id) => panels[id]?.isVisible);

        if (visiblePanels.length < 2) return;

        const cascade = { x: 30, y: 30 };
        const startPosition = { x: 50, y: 50 };

        set((state) => ({
          panels: {
            ...state.panels,
            ...visiblePanels.reduce((acc, panelId, index) => {
              const panel = state.panels[panelId];
              acc[panelId] = {
                ...panel,
                position: {
                  x: startPosition.x + index * cascade.x,
                  y: startPosition.y + index * cascade.y,
                },
                zIndex: state.maxZIndex + index + 1,
              };
              return acc;
            }, {} as Record<string, PanelState>),
          },
          maxZIndex: state.maxZIndex + visiblePanels.length,
        }));
      },

      // Advanced panel management implementations
      snapPanelToEdges: (panelId: string) => {
        const { panels, snapThreshold } = get();
        const panel = panels[panelId];
        if (!panel) return;

        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        let newPosition = { ...panel.position };
        
        // Snap to left edge
        if (panel.position.x < snapThreshold) {
          newPosition.x = 0;
        }
        // Snap to right edge
        else if (panel.position.x + panel.size.width > viewport.width - snapThreshold) {
          newPosition.x = viewport.width - panel.size.width;
        }
        
        // Snap to top edge
        if (panel.position.y < snapThreshold) {
          newPosition.y = 0;
        }
        // Snap to bottom edge
        else if (panel.position.y + panel.size.height > viewport.height - snapThreshold) {
          newPosition.y = viewport.height - panel.size.height;
        }

        if (newPosition.x !== panel.position.x || newPosition.y !== panel.position.y) {
          get().updatePanelPosition(panelId, newPosition);
        }
      },

      enableMagneticBoundaries: (enabled: boolean) => {
        set({ magneticBoundaries: enabled });
      },

      setSnapThreshold: (threshold: number) => {
        set({ snapThreshold: Math.max(5, Math.min(50, threshold)) });
      },

      toggleKeyboardShortcuts: (enabled: boolean) => {
        set({ keyboardShortcutsEnabled: enabled });
      },

      togglePanelAnimations: (enabled: boolean) => {
        set({ panelAnimations: enabled });
      },

      createWorkspaceLayout: (name: string, description?: string) => {
        const presetId = `workspace_${Date.now()}`;
        const { panels } = get();

        const preset: WorkspacePreset = {
          id: presetId,
          name,
          description,
          panelStates: Object.fromEntries(
            Object.entries(panels).map(([id, state]) => [
              id,
              {
                position: state.position,
                size: state.size,
                isVisible: state.isVisible,
                isMinimized: state.isMinimized,
                isDocked: state.isDocked,
                dockPosition: state.dockPosition,
                groupId: state.groupId,
              },
            ])
          ),
          createdAt: Date.now(),
        };

        set((state) => ({
          workspacePresets: {
            ...state.workspacePresets,
            [presetId]: preset,
          },
        }));

        return presetId;
      },

      switchWorkspace: (presetId: string) => {
        get().applyPreset(presetId);
      },

      exportPanelLayout: () => {
        const { panels, panelGroups, workspacePresets } = get();
        const layoutData = {
          panels,
          panelGroups,
          workspacePresets,
          exportedAt: new Date().toISOString(),
          version: "1.0",
        };
        return JSON.stringify(layoutData, null, 2);
      },

      importPanelLayout: (layoutData: string) => {
        try {
          const data = JSON.parse(layoutData);
          if (data.version === "1.0") {
            set({
              panels: { ...get().panels, ...data.panels },
              panelGroups: { ...get().panelGroups, ...data.panelGroups },
              workspacePresets: { ...get().workspacePresets, ...data.workspacePresets },
            });
          }
        } catch (error) {
          console.error("Failed to import panel layout:", error);
        }
      },

      focusPanel: (panelId: string) => {
        const { panels } = get();
        if (!panels[panelId]) return;

        // Bring to front and ensure visible
        get().bringToFront(panelId);
        get().showPanel(panelId);
        
        // If minimized, restore it
        if (panels[panelId].isMinimized) {
          get().maximizePanel(panelId);
        }
      },

      minimizeAllPanels: () => {
        const { panels } = get();
        const visiblePanels = Object.keys(panels).filter(id => panels[id].isVisible);
        
        set((state) => ({
          panels: {
            ...state.panels,
            ...visiblePanels.reduce((acc, panelId) => {
              acc[panelId] = {
                ...state.panels[panelId],
                isMinimized: true,
              };
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },

      restoreAllPanels: () => {
        const { panels } = get();
        const minimizedPanels = Object.keys(panels).filter(id => panels[id].isMinimized);
        
        set((state) => ({
          panels: {
            ...state.panels,
            ...minimizedPanels.reduce((acc, panelId) => {
              acc[panelId] = {
                ...state.panels[panelId],
                isMinimized: false,
              };
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },

      alignPanelsToGrid: (gridSize: number) => {
        const { panels } = get();
        const visiblePanels = Object.keys(panels).filter(id => panels[id].isVisible);
        
        set((state) => ({
          panels: {
            ...state.panels,
            ...visiblePanels.reduce((acc, panelId) => {
              const panel = state.panels[panelId];
              acc[panelId] = {
                ...panel,
                position: {
                  x: Math.round(panel.position.x / gridSize) * gridSize,
                  y: Math.round(panel.position.y / gridSize) * gridSize,
                },
              };
              return acc;
            }, {} as Record<string, PanelState>),
          },
        }));
      },
    }),
    {
      name: "floorplanner-panels",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        panels: state.panels,
        panelGroups: state.panelGroups,
        workspacePresets: state.workspacePresets,
        activePresetId: state.activePresetId,
      }),
    }
  )
);
