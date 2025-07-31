import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useFloorPlanStore = create(
  immer((set, get) => ({
    // State
    currentTool: "wall",
    viewMode: "2d",
    zoom: 1,
    pan: { x: 0, y: 0 },
    walls: [],
    rooms: [],
    furniture: [],
    selectedElement: null,
    lighting: {
      mainLight: 0.75, // Main directional light intensity
      ambientLight: 0.3, // Ambient light intensity
      temperature: 6500, // Color temperature in Kelvin
    },
    measurements: [],
    clearanceDetection: true,
    measurementUnit: "ft",
    cameraView: "default", // Default camera view for 3D mode
    comments: [], // Store comments with their positions and replies
    activeComment: null, // Currently active comment for viewing/replying

    // API and floor plan data
    currentFloorPlan: null, // Current floor plan object with id
    apiConfig: {
      baseUrl: window.floorplannerConfig?.apiUrl || "/api/floorplanner",
      wsUrl: window.floorplannerConfig?.wsUrl || "/ws/floorplanner",
    },

    // Sharing state
    currentShareableLink: null,
    shareSettings: {
      privacy: "view-only",
      expirationDays: 30,
      requiresLogin: false,
      created: null,
    },

    // Revision history
    revisionHistory: [
      {
        id: "rev-1689247200000",
        timestamp: 1689247200000,
        name: "Initial Design",
        description: "First floor plan layout",
        thumbnail:
          "https://via.placeholder.com/100x100/e2e8f0/475569?text=Rev+1",
        changes: { added: ["wall-1", "wall-2"], modified: [], deleted: [] },
      },
      {
        id: "rev-1689333600000",
        timestamp: 1689333600000,
        name: "Added Bedroom",
        description: "Extended layout with additional bedroom",
        thumbnail:
          "https://via.placeholder.com/100x100/e2e8f0/475569?text=Rev+2",
        changes: { added: ["room-1"], modified: ["wall-2"], deleted: [] },
      },
      {
        id: "rev-1689420000000",
        timestamp: 1689420000000,
        name: "Furniture Layout",
        description: "Added furniture to living room and bedroom",
        thumbnail:
          "https://via.placeholder.com/100x100/e2e8f0/475569?text=Rev+3",
        changes: {
          added: ["furniture-1", "furniture-2"],
          modified: [],
          deleted: [],
        },
      },
    ],
    currentRevision: "rev-1689420000000",

    // Actions
    setCurrentTool: (tool) => set({ currentTool: tool }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(5, zoom)) }),
    setPan: (pan) => set({ pan }),

    // API configuration
    setApiConfig: (config) => set((state) => {
      state.apiConfig = { ...state.apiConfig, ...config };
    }),

    // Initialize app
    initializeApp: () => {
      console.log("FloorPlanner app initialized");
      // Any initialization logic can go here
    },

    addWall: (wall) =>
      set((state) => {
        state.walls.push({ id: `wall-${Date.now()}`, type: "wall", ...wall });
      }),

    addFurniture: (furniture) =>
      set((state) => {
        state.furniture.push({
          id: `furniture-${Date.now()}`,
          type: "furniture",
          ...furniture,
        });
      }),

    setSelectedElement: (element) => set({ selectedElement: element }),

    // Floor plan management
    setCurrentFloorPlan: (floorPlan) => set({ currentFloorPlan: floorPlan }),

    loadFloorPlan: async (floorPlanId) => {
      const state = get();
      try {
        const response = await fetch(
          `${state.apiConfig.baseUrl}/floorplans/${floorPlanId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const floorPlan = await response.json();
          set({ currentFloorPlan: floorPlan });

          // Load the floor plan data into the store
          if (floorPlan.data) {
            const { walls, rooms, furniture, measurements } = floorPlan.data;
            set((state) => {
              state.walls = walls || [];
              state.rooms = rooms || [];
              state.furniture = furniture || [];
              state.measurements = measurements || [];
            });
          }

          return floorPlan;
        }
      } catch (error) {
        console.error("Failed to load floor plan:", error);
        return null;
      }
    },

    saveFloorPlan: async () => {
      const state = get();
      if (!state.currentFloorPlan) return null;

      const floorPlanData = {
        walls: state.walls,
        rooms: state.rooms,
        furniture: state.furniture,
        measurements: state.measurements,
        lighting: state.lighting,
        viewMode: state.viewMode,
        zoom: state.zoom,
        pan: state.pan,
      };

      try {
        const response = await fetch(
          `${state.apiConfig.baseUrl}/floorplans/${state.currentFloorPlan.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "X-CSRFToken":
                document.querySelector("[name=csrfmiddlewaretoken]")?.value ||
                "",
            },
            body: JSON.stringify({
              ...state.currentFloorPlan,
              data: floorPlanData,
            }),
          }
        );

        if (response.ok) {
          const updatedFloorPlan = await response.json();
          set({ currentFloorPlan: updatedFloorPlan });
          return updatedFloorPlan;
        }
      } catch (error) {
        console.error("Failed to save floor plan:", error);
        return null;
      }
    },

    // New methods for materials and lighting
    updateSceneLighting: (lightingSettings) =>
      set((state) => {
        state.lighting = { ...state.lighting, ...lightingSettings };
      }),

    updateElement: (updates) =>
      set((state) => {
        if (state.selectedElement) {
          // Handle special cases for materials
          if (updates.material) {
            console.log(
              `Applying material: ${updates.material} to ${state.selectedElement.type}`
            );
          }

          // Apply all updates to the element
          Object.assign(state.selectedElement, updates);
        }
      }),

    // Measurement tools
    addMeasurement: (measurement) =>
      set((state) => {
        state.measurements.push({
          ...measurement,
          id: measurement.id || `measurement-${Date.now()}`,
        });
      }),

    removeMeasurement: (id) =>
      set((state) => {
        state.measurements = state.measurements.filter((m) => m.id !== id);
      }),

    setMeasurementUnit: (unit) => set({ measurementUnit: unit }),

    toggleClearanceDetection: () =>
      set((state) => {
        state.clearanceDetection = !state.clearanceDetection;
      }),

    getClearanceIssues: () => {
      const state = get();
      // In a real app, this would analyze elements and detect real issues
      // Here we'll return mock data for demonstration
      if (!state.clearanceDetection) return [];

      return [
        {
          id: "issue-1",
          elementType: "door",
          elementId: "door-1",
          description: "Door swing area obstructed by furniture",
          severity: "error",
        },
        {
          id: "issue-2",
          elementType: "furniture",
          elementId: "furniture-3",
          description: "Furniture too close to wall outlet",
          severity: "warning",
        },
      ];
    },

    // Camera view controls for 3D mode
    setCameraView: (view) => set({ cameraView: view }),

    // Comments functionality
    addComment: (comment) =>
      set((state) => {
        state.comments.push(comment);
        // Automatically set it as the active comment
        state.activeComment = comment.id;
      }),

    removeComment: (commentId) =>
      set((state) => {
        state.comments = state.comments.filter(
          (comment) => comment.id !== commentId
        );
        // Clear active comment if it was removed
        if (state.activeComment === commentId) {
          state.activeComment = null;
        }
      }),

    addCommentReply: (commentId, reply) =>
      set((state) => {
        const comment = state.comments.find(
          (comment) => comment.id === commentId
        );
        if (comment) {
          if (!comment.replies) comment.replies = [];
          comment.replies.push({
            id: `reply-${Date.now()}`,
            text: reply,
            author: "Current User", // This would come from auth
            createdAt: new Date().toISOString(),
            ...(typeof reply === "object" ? reply : {}),
          });
        }
      }),

    setActiveComment: (commentId) =>
      set((state) => {
        state.activeComment = commentId;
      }),

    // Sharing functionality
    createShareableLink: (settings = {}) =>
      set((state) => {
        // Generate a unique ID for the link
        const linkId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        // In a real implementation, this would make an API call to create a server-side record
        // For now, we'll just store it client-side
        const baseUrl = window.location.origin;
        const shareableUrl = `${baseUrl}/floorplanner/preview/${linkId}`;

        state.currentShareableLink = shareableUrl;
        state.shareSettings = {
          ...state.shareSettings,
          ...settings,
          created: new Date().toISOString(),
        };

        console.log(
          "Created shareable link:",
          shareableUrl,
          "with settings:",
          state.shareSettings
        );

        // In a real implementation, this would return the created link from an API
        return shareableUrl;
      }),

    updateShareSettings: (settings) =>
      set((state) => {
        state.shareSettings = {
          ...state.shareSettings,
          ...settings,
        };

        // In a real implementation, this would update the link settings via API
        console.log("Updated share settings:", state.shareSettings);
      }),

    getSharedPlanData: (linkId) => {
      // In a real implementation, this would fetch the shared floor plan data from an API
      console.log("Fetching shared plan data for link:", linkId);

      // For now, return the current plan data
      const { walls, rooms, furniture, measurements } = get();
      return { walls, rooms, furniture, measurements };
    },

    // Add comment as an anonymous or logged-in viewer
    addViewerComment: (comment) =>
      set((state) => {
        state.comments.push({
          ...comment,
          id: `comment-${Date.now()}`,
          createdAt: new Date().toISOString(),
          // In a real implementation, this would come from the user session or anonymous identifier
          author: comment.author || "Anonymous Viewer",
        });

        // Automatically set it as the active comment
        state.activeComment = comment.id;
      }),

    // Revision history management
    createRevision: (name = "", description = "") =>
      set((state) => {
        const timestamp = Date.now();
        const id = `rev-${timestamp}`;
        const newRevision = {
          id,
          timestamp,
          name: name || `Revision ${state.revisionHistory.length + 1}`,
          description,
          thumbnail:
            "https://via.placeholder.com/100x100/e2e8f0/475569?text=New+Rev",
          changes: { added: [], modified: [], deleted: [] },
        };

        state.revisionHistory.push(newRevision);
        state.currentRevision = id;

        // In a real implementation, we would capture actual changes here
        console.log("Created new revision:", newRevision);
      }),

    setCurrentRevision: (revisionId) =>
      set((state) => {
        // In a real implementation, this would restore the floor plan to this revision state
        state.currentRevision = revisionId;
        console.log("Restored to revision:", revisionId);
      }),

    compareRevisions: (revisionId1, revisionId2) => {
      const { revisionHistory } = get();
      const rev1 = revisionHistory.find((rev) => rev.id === revisionId1);
      const rev2 = revisionHistory.find((rev) => rev.id === revisionId2);

      if (rev1 && rev2) {
        console.log("Comparing revisions:", rev1.id, "and", rev2.id);
        // In a real implementation, this would calculate and visualize differences
        return {
          added: rev2.changes.added,
          removed: rev1.changes.added.filter(
            (id) => !rev2.changes.added.includes(id)
          ),
          modified: rev2.changes.modified,
        };
      }

      return null;
    },

    // Auto-save functionality
    autoSave: () => {
      const { createRevision } = get();
      createRevision("Auto-save", "Automatic periodic save");
      // In a real implementation, this would sync with the cloud
      console.log("Auto-saved to cloud");
    },

    // CAD Import functionality
    importCADFile: (file, layers) => {
      console.log("Importing CAD file:", file.name, "with layers:", layers);

      // In a real implementation, this would process the CAD file and convert
      // its entities to our internal model
      set((state) => {
        // For demonstration, we'll add some mock elements based on the layers
        layers.forEach((layer) => {
          if (layer.importable) {
            if (layer.name === "Walls") {
              // Add mock walls
              state.walls.push({
                id: `wall-import-${Date.now()}-1`,
                type: "wall",
                start: { x: 100, y: 100 },
                end: { x: 300, y: 100 },
                thickness: 10,
                color: "#333333",
              });
              state.walls.push({
                id: `wall-import-${Date.now()}-2`,
                type: "wall",
                start: { x: 300, y: 100 },
                end: { x: 300, y: 300 },
                thickness: 10,
                color: "#333333",
              });
            }

            if (layer.name === "Doors") {
              // Add mock door
              state.furniture.push({
                id: `door-import-${Date.now()}`,
                type: "door",
                x: 200,
                y: 95,
                width: 80,
                height: 10,
                rotation: 0,
                color: "#8b4513",
              });
            }

            if (layer.name === "Windows") {
              // Add mock window
              state.furniture.push({
                id: `window-import-${Date.now()}`,
                type: "window",
                x: 300,
                y: 200,
                width: 10,
                height: 60,
                rotation: 0,
                color: "#add8e6",
              });
            }

            if (layer.name === "Furniture") {
              // Add mock furniture
              state.furniture.push({
                id: `furniture-import-${Date.now()}-1`,
                type: "furniture",
                x: 150,
                y: 150,
                width: 80,
                height: 40,
                rotation: 0,
                color: "#8b5cf6",
              });
              state.furniture.push({
                id: `furniture-import-${Date.now()}-2`,
                type: "furniture",
                x: 250,
                y: 200,
                width: 40,
                height: 40,
                rotation: 0,
                color: "#8b5cf6",
              });
            }
          }
        });

        // Create a revision for this import
        const timestamp = Date.now();
        const id = `rev-${timestamp}`;
        const newRevision = {
          id,
          timestamp,
          name: `Imported ${file.name}`,
          description: `Imported ${
            layers.filter((l) => l.importable).length
          } layers from CAD file`,
          thumbnail:
            "https://via.placeholder.com/100x100/e2e8f0/475569?text=Import",
          changes: {
            added: [
              ...state.walls.slice(-2).map((w) => w.id),
              ...state.furniture.slice(-3).map((f) => f.id),
            ],
            modified: [],
            deleted: [],
          },
        };

        state.revisionHistory.push(newRevision);
        state.currentRevision = id;
      });

      return true;
    },

    // Serializing state for saving
    saveFloorPlan: () => {
      const { walls, rooms, furniture, measurements, createRevision } = get();
      // Create a revision when manually saving
      createRevision("Manual Save", "User-initiated save");
      return { walls, rooms, furniture, measurements };
    },
  }))
);

export default useFloorPlanStore;
