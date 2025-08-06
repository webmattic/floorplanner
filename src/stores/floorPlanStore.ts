import { create } from "zustand";
import {
  calculateAutomaticRoomMeasurements,
  calculateWallLength,
  convertUnit,
  checkClearance,
  checkDoorSwingClearance,
  calculateWalkingClearance,
  calculateRealTimeDimensions,
  getMeasurementAnnotations,
} from "../utils/geometry";

// Type definitions
export interface Wall {
  id: string;
  points: number[];
  thickness: number;
  color: string;
}

export interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
}

export interface Furniture {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
}

export interface FloorPlanElement {
  id: string;
  type: "wall" | "room" | "furniture";
}

export interface MeasurementPoint {
  x: number;
  y: number;
  id: string;
}

export interface Measurement {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  distance: number;
  type: "linear" | "area" | "angle";
  label?: string;
}

export interface ClearanceIssue {
  id: string;
  elementType: string;
  elementId: string;
  description: string;
  severity: "warning" | "error";
}

export interface ApiConfig {
  baseUrl: string;
  wsUrl: string;
  userId: string | undefined;
  isAuthenticated: boolean;
}

export interface FloorPlan {
  id?: number;
  title: string;
  data: any;
  is_public: boolean;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FloorPlanData {
  walls: Wall[];
  rooms: Room[];
  furniture: Furniture[];
  settings: {
    gridSize: number;
    showGrid: boolean;
  };
}

export interface FloorPlanStore {
  // Undo/redo stacks for rooms
  _undoStack: Room[][];
  _redoStack: Room[][];
  undo: () => void;
  redo: () => void;

  // Auto-save state getter
  getAutoSaveState: () => string[];

  // Error setter
  setError: (err: string) => void;

  // Layer management (placeholder for future implementation)
  layers?: any[];

  // Revision history (placeholder for future implementation)
  revisionHistory?: any[];
  currentRevision?: any;
  // Current tool selection
  currentTool: string;

  // View mode (2D or 3D)
  viewMode: "2d" | "3d";

  // Camera view preset
  cameraView: string;
  setCameraView: (view: string) => void;

  // API configuration
  apiConfig: ApiConfig | null;

  // Canvas settings
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;

  // Drawing settings
  wallThickness: number;
  snapToGrid: boolean;
  showClearanceWarnings: boolean;

  // Measurement system
  measurements: Measurement[];
  measurementUnit: "ft" | "m" | "px";
  clearanceDetection: boolean;

  // Floor plan data
  walls: Wall[];
  rooms: Room[];
  furniture: Furniture[];
  selectedElements: FloorPlanElement[];
  selectedElement?: FloorPlanElement; // Single selected element

  // Current floor plan
  currentFloorPlan: FloorPlan | null;
  floorPlans: FloorPlan[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Collaboration state
  collaborators: any[];
  isCollaborating: boolean;

  // WebSocket
  ws: WebSocket | null;
  isConnected: boolean;

  // 3D scene lighting state and updater
  lighting: {
    mainLight: number;
    ambientLight: number;
    temperature: number;
  };

  updateSceneLighting: (params: {
    mainLight: number;
    ambientLight: number;
    temperature: number;
  }) => void;

  // Material updates
  updateElement?: (params: {
    material?: string;
    color?: string;
    [key: string]: any;
  }) => void;

  // Actions
  setCurrentTool: (tool: string) => void;
  setViewMode: (mode: "2d" | "3d") => void;
  setApiConfig: (config: ApiConfig) => void;
  initializeApp: () => Promise<void>;
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;

  // Drawing settings actions
  setWallThickness: (thickness: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowClearanceWarnings: (show: boolean) => void;

  addWall: (wall: Omit<Wall, "id">) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;

  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  addFurniture: (item: Omit<Furniture, "id">) => void;
  updateFurniture: (id: string, updates: Partial<Furniture>) => void;
  removeFurniture: (id: string) => void;

  setSelectedElements: (elements: FloorPlanElement[]) => void;
  clearSelection: () => void;

  // Measurement actions
  addMeasurement: (measurement: Omit<Measurement, "id">) => void;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
  setMeasurementUnit: (unit: "ft" | "m" | "px") => void;
  toggleClearanceDetection: () => void;
  getClearanceIssues: () => ClearanceIssue[];

  // Enhanced measurement actions
  calculateTotalArea: () => number;
  calculateElementMeasurements: (elementId: string) => any;
  updateRealTimeMeasurements: (startPoint: any, currentPoint: any) => any;
  getAutomaticAnnotations: () => any[];
  triggerMeasurementUpdate: () => void;

  // Floor plan actions
  createFloorPlan: (title: string) => Promise<void>;
  saveFloorPlan: () => Promise<void>;
  loadFloorPlan: (id: number) => Promise<void>;
  loadFloorPlans: () => Promise<void>;

  getAllElements: () => (
    | (Wall & { type: "wall" })
    | (Room & { type: "room" })
    | (Furniture & { type: "furniture" })
  )[];
  exportFloorPlan: () => FloorPlanData;
  importFloorPlan: (data: FloorPlanData) => void;

  // WebSocket actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  sendMessage: (message: any) => void;
}

// Helper function to get CSRF token
const getCsrfToken = (): string => {
  const element = document.querySelector(
    "[name=csrfmiddlewaretoken]"
  ) as HTMLInputElement;
  return element?.value || "";
};

const useFloorPlanStore = create<FloorPlanStore>((set, get) => ({
  // Current tool selection
  currentTool: "select",

  // View mode (2D or 3D)
  viewMode: "2d",

  // Camera view preset
  cameraView: "default",
  setCameraView: (view: string) => set({ cameraView: view }),

  // API configuration
  apiConfig: null,

  // Canvas settings
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 50, // pixels per meter
  showGrid: true,

  // Drawing settings
  wallThickness: 8,
  snapToGrid: true,
  showClearanceWarnings: true,

  // Measurement system
  measurements: [],
  measurementUnit: "ft",
  clearanceDetection: true,

  // Floor plan data
  walls: [],
  rooms: [],
  furniture: [],
  selectedElements: [],

  // Current floor plan
  currentFloorPlan: null,
  floorPlans: [],

  // UI state
  isLoading: false,
  error: null,

  // Collaboration state
  collaborators: [],
  isCollaborating: false,

  // WebSocket
  ws: null,
  isConnected: false,

  // 3D scene lighting
  lighting: { mainLight: 1, ambientLight: 0.5, temperature: 6500 },

  // Layer management (placeholder)
  layers: [],

  // Revision history (placeholder)
  revisionHistory: [],
  currentRevision: null,

  // Actions
  setCurrentTool: (tool: string) => set({ currentTool: tool }),

  setViewMode: (mode: "2d" | "3d") => set({ viewMode: mode }),

  setApiConfig: (config: ApiConfig) => set({ apiConfig: config }),

  initializeApp: async () => {
    const { loadFloorPlans, connectWebSocket } = get();
    set({ isLoading: true });

    try {
      await loadFloorPlans();
      connectWebSocket();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to initialize app",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setZoom: (zoom: number) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (panX: number, panY: number) => set({ panX, panY }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setGridSize: (size: number) =>
    set({ gridSize: Math.max(10, Math.min(100, size)) }),

  // Drawing settings actions
  setWallThickness: (thickness: number) => set({ wallThickness: thickness }),
  setSnapToGrid: (snap: boolean) => set({ snapToGrid: snap }),
  setShowClearanceWarnings: (show: boolean) =>
    set({ showClearanceWarnings: show }),

  addWall: (wall: Omit<Wall, "id">) =>
    set((state) => ({
      walls: [...state.walls, { ...wall, id: `wall_${Date.now()}` }],
    })),

  updateWall: (id: string, updates: Partial<Wall>) =>
    set((state) => ({
      walls: state.walls.map((wall) =>
        wall.id === id ? { ...wall, ...updates } : wall
      ),
    })),

  removeWall: (id: string) =>
    set((state) => ({
      walls: state.walls.filter((wall) => wall.id !== id),
    })),

  addRoom: (room: Room) => {
    set((state) => {
      // For undo/redo
      const prevRooms = [...state.rooms];
      const newRooms = [...state.rooms, room];
      return {
        rooms: newRooms,
        _undoStack: [...(state._undoStack || []), prevRooms],
        _redoStack: [],
      };
    });
  },

  updateRoom: (id: string, updates: Partial<Room>) => {
    set((state) => {
      const prevRooms = [...state.rooms];
      const newRooms = state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      );
      return {
        rooms: newRooms,
        _undoStack: [...(state._undoStack || []), prevRooms],
        _redoStack: [],
      };
    });
  },

  removeRoom: (id: string) => {
    set((state) => {
      const prevRooms = [...state.rooms];
      const newRooms = state.rooms.filter((room) => room.id !== id);
      return {
        rooms: newRooms,
        _undoStack: [...(state._undoStack || []), prevRooms],
        _redoStack: [],
      };
    });
  },
  // Undo/redo stacks
  _undoStack: [],
  _redoStack: [],

  undo: () => {
    set((state) => {
      if (!state._undoStack || state._undoStack.length === 0) return {};
      const prevRooms = state._undoStack[state._undoStack.length - 1];
      const newUndoStack = state._undoStack.slice(0, -1);
      return {
        rooms: prevRooms,
        _undoStack: newUndoStack,
        _redoStack: [...(state._redoStack || []), state.rooms],
      };
    });
  },
  redo: () => {
    set((state) => {
      if (!state._redoStack || state._redoStack.length === 0) return {};
      const nextRooms = state._redoStack[state._redoStack.length - 1];
      const newRedoStack = state._redoStack.slice(0, -1);
      return {
        rooms: nextRooms,
        _redoStack: newRedoStack,
        _undoStack: [...(state._undoStack || []), state.rooms],
      };
    });
  },
  getAutoSaveState: () => {
    const state = get();
    return state.rooms.map((room) => room.id);
  },
  setError: (err: string) => set({ error: err }),

  addFurniture: (item: Omit<Furniture, "id">) =>
    set((state) => ({
      furniture: [
        ...state.furniture,
        { ...item, id: `furniture_${Date.now()}` },
      ],
    })),

  updateFurniture: (id: string, updates: Partial<Furniture>) =>
    set((state) => ({
      furniture: state.furniture.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeFurniture: (id: string) =>
    set((state) => ({
      furniture: state.furniture.filter((item) => item.id !== id),
    })),

  setSelectedElements: (elements: FloorPlanElement[]) =>
    set({ selectedElements: elements }),

  clearSelection: () => set({ selectedElements: [] }),

  // Measurement actions
  addMeasurement: (measurement: Omit<Measurement, "id">) =>
    set((state) => ({
      measurements: [
        ...state.measurements,
        { ...measurement, id: `measurement_${Date.now()}` },
      ],
    })),

  removeMeasurement: (id: string) =>
    set((state) => ({
      measurements: state.measurements.filter((m) => m.id !== id),
    })),

  clearMeasurements: () => set({ measurements: [] }),

  setMeasurementUnit: (unit: "ft" | "m" | "px") =>
    set({ measurementUnit: unit }),

  toggleClearanceDetection: () =>
    set((state) => ({ clearanceDetection: !state.clearanceDetection })),

  getClearanceIssues: (): ClearanceIssue[] => {
    const { clearanceDetection, walls, furniture } = get();
    if (!clearanceDetection) return [];

    const issues: ClearanceIssue[] = [];

    // Use imported clearance checking functions

    // Check furniture-to-furniture clearance
    furniture.forEach((item, index) => {
      furniture.slice(index + 1).forEach((otherItem) => {
        const clearanceResult = checkClearance(item, otherItem, 30); // 30px minimum clearance
        if (clearanceResult.hasIssue) {
          issues.push({
            id: `furniture_clearance_${item.id}_${otherItem.id}`,
            elementType: "furniture",
            elementId: item.id,
            description:
              clearanceResult.type === "overlap"
                ? `${item.label || "Furniture"} overlaps with ${otherItem.label || "furniture"
                }`
                : `Insufficient clearance between ${item.label || "furniture"
                } items (${clearanceResult.distance.toFixed(1)}px)`,
            severity: clearanceResult.type === "overlap" ? "error" : "warning",
          });
        }
      });
    });

    // Check furniture-to-wall clearance
    furniture.forEach((item) => {
      walls.forEach((wall) => {
        // Simplified wall-furniture clearance check
        if (wall.points && wall.points.length >= 4) {
          const wallStart = {
            x: wall.points[0],
            y: wall.points[1],
            width: 5,
            height: 5,
          };
          const clearanceResult = checkClearance(item, wallStart, 20);
          if (clearanceResult.hasIssue) {
            issues.push({
              id: `wall_furniture_clearance_${item.id}_${wall.id}`,
              elementType: "furniture",
              elementId: item.id,
              description: `${item.label || "Furniture"
                } may be too close to wall`,
              severity: "warning",
            });
          }
        }
      });
    });

    // Check for doors and door swing clearance
    const doors = furniture.filter(
      (item) => item.label?.toLowerCase().includes("door")
    );

    doors.forEach((door) => {
      const doorIssues = checkDoorSwingClearance(
        door,
        furniture.filter((f) => f.id !== door.id),
        walls
      );
      issues.push(...doorIssues);
    });

    // Check walking clearance
    furniture.forEach((item) => {
      const walkingIssues = calculateWalkingClearance(
        item,
        furniture.filter((f) => f.id !== item.id)
      );
      issues.push(...walkingIssues);
    });

    return issues;
  },

  // Floor plan API actions
  createFloorPlan: async (title: string) => {
    const { apiConfig } = get();
    if (!apiConfig) return;

    set({ isLoading: true });
    try {
      const response = await fetch(`${apiConfig.baseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({
          title,
          data: { walls: [], rooms: [], furniture: [] },
          is_public: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to create floor plan");

      const floorPlan = await response.json();
      set((state) => ({
        currentFloorPlan: floorPlan,
        floorPlans: [floorPlan, ...state.floorPlans],
        walls: floorPlan.data?.walls || [],
        rooms: floorPlan.data?.rooms || [],
        furniture: floorPlan.data?.furniture || [],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create floor plan",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  saveFloorPlan: async () => {
    const { apiConfig, currentFloorPlan, walls, rooms, furniture } = get();
    if (!apiConfig || !currentFloorPlan) return;

    set({ isLoading: true });
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}${currentFloorPlan.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
          body: JSON.stringify({
            data: { walls, rooms, furniture },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save floor plan");

      const updatedFloorPlan = await response.json();
      set((state) => ({
        currentFloorPlan: updatedFloorPlan,
        floorPlans: state.floorPlans.map((fp) =>
          fp.id === updatedFloorPlan.id ? updatedFloorPlan : fp
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to save floor plan",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadFloorPlan: async (id: number) => {
    const { apiConfig } = get();
    if (!apiConfig) return;

    set({ isLoading: true });
    try {
      const response = await fetch(`${apiConfig.baseUrl}${id}/`);
      if (!response.ok) throw new Error("Failed to load floor plan");

      const floorPlan = await response.json();
      set({
        currentFloorPlan: floorPlan,
        walls: floorPlan.data?.walls || [],
        rooms: floorPlan.data?.rooms || [],
        furniture: floorPlan.data?.furniture || [],
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load floor plan",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadFloorPlans: async () => {
    const { apiConfig } = get();
    if (!apiConfig) return;

    try {
      const response = await fetch(`${apiConfig.baseUrl}`);
      if (!response.ok) throw new Error("Failed to load floor plans");

      const floorPlans = await response.json();
      set({ floorPlans: floorPlans.results || floorPlans });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load floor plans",
      });
    }
  },

  // Get all elements for rendering
  getAllElements: () => {
    const state = get();
    return [
      ...state.walls.map((w) => ({ ...w, type: "wall" as const })),
      ...state.rooms.map((r) => ({ ...r, type: "room" as const })),
      ...state.furniture.map((f) => ({ ...f, type: "furniture" as const })),
    ];
  },

  // Export floor plan data
  exportFloorPlan: () => {
    const state = get();
    return {
      walls: state.walls,
      rooms: state.rooms,
      furniture: state.furniture,
      settings: {
        gridSize: state.gridSize,
        showGrid: state.showGrid,
      },
    };
  },

  // Import floor plan data
  importFloorPlan: (data: FloorPlanData) =>
    set({
      walls: data.walls || [],
      rooms: data.rooms || [],
      furniture: data.furniture || [],
      gridSize: data.settings?.gridSize || 50,
      showGrid: data.settings?.showGrid !== false,
    }),

  // WebSocket actions
  connectWebSocket: () => {
    const { apiConfig } = get();
    if (!apiConfig?.userId) return;

    try {
      const ws = new WebSocket(`${apiConfig.wsUrl}${apiConfig.userId}/`);

      ws.onopen = () => set({ isConnected: true });
      ws.onclose = () => set({ isConnected: false });
      ws.onerror = () => set({ error: "WebSocket connection failed" });

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Handle real-time collaboration messages
        console.log("WebSocket message:", data);
      };

      set({ ws });
    } catch (error) {
      set({ error: "Failed to connect WebSocket" });
    }
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  sendMessage: (message) => {
    const { ws, isConnected } = get();
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    }
  },

  // Update 3D scene lighting
  updateSceneLighting: (params: {
    mainLight: number;
    ambientLight: number;
    temperature: number;
  }) => {
    // This function will be implemented by the 3D renderer component
    // when it mounts. Until then, it will just log the values.
    console.log("Scene lighting update:", params);
    set({ lighting: params });
  },

  // Get the first selected element for simpler usage
  get selectedElement() {
    const store = get();
    return store.selectedElements.length > 0
      ? store.selectedElements[0]
      : undefined;
  },

  // Update an element with new properties
  updateElement: (params) => {
    const store = get();
    const { selectedElements } = store;

    if (selectedElements.length === 0) {
      console.warn("No element selected to update");
      return;
    }

    const element = selectedElements[0];

    switch (element.type) {
      case "wall":
        const updatedWalls = store.walls.map((wall) =>
          wall.id === element.id ? { ...wall, ...params } : wall
        );
        set({ walls: updatedWalls });
        break;
      case "room":
        const updatedRooms = store.rooms.map((room) =>
          room.id === element.id ? { ...room, ...params } : room
        );
        set({ rooms: updatedRooms });
        break;
      case "furniture":
        const updatedFurniture = store.furniture.map((item) =>
          item.id === element.id ? { ...item, ...params } : item
        );
        set({ furniture: updatedFurniture });
        break;
      default:
        console.warn(`Unknown element type: ${element.type}`);
    }
  },

  // Enhanced measurement functions
  calculateTotalArea: () => {
    try {
      const { rooms, measurementUnit } = get();

      if (!rooms || !Array.isArray(rooms)) {
        console.warn('calculateTotalArea: rooms is not an array', rooms);
        return 0;
      }

      return rooms.reduce((total, room) => {
        if (!room || typeof room.width !== 'number' || typeof room.height !== 'number') {
          console.warn('calculateTotalArea: invalid room data', room);
          return total;
        }

        const measurements = calculateAutomaticRoomMeasurements(
          room,
          measurementUnit || 'ft'
        );
        return total + (measurements?.area || 0);
      }, 0);
    } catch (error) {
      console.error('calculateTotalArea error:', error);
      return 0;
    }
  },

  calculateElementMeasurements: (elementId: string) => {
    const { rooms, walls, measurementUnit } = get();

    // Find the element
    const room = rooms.find((r) => r.id === elementId);
    if (room) {
      return calculateAutomaticRoomMeasurements(room, measurementUnit);
    }

    const wall = walls.find((w) => w.id === elementId);
    if (wall && wall.points) {
      const length = calculateWallLength(wall.points);
      const convertedLength = convertUnit(length, "px", measurementUnit);
      return { length: convertedLength };
    }

    return null;
  },

  updateRealTimeMeasurements: (startPoint: any, currentPoint: any) => {
    const { measurementUnit } = get();

    return calculateRealTimeDimensions(
      startPoint,
      currentPoint,
      measurementUnit
    );
  },

  getAutomaticAnnotations: () => {
    const { rooms, walls, measurementUnit } = get();

    const allElements = [
      ...rooms.map((r) => ({ ...r, type: "room" })),
      ...walls.map((w) => ({ ...w, type: "wall" })),
    ];

    return getMeasurementAnnotations(allElements, measurementUnit);
  },

  // Trigger measurement recalculation when elements change
  triggerMeasurementUpdate: () => {
    const { clearanceDetection } = get();
    if (clearanceDetection) {
      // Trigger clearance recalculation by getting fresh clearance issues
      get().getClearanceIssues();
    }
  },
}));

export default useFloorPlanStore;
