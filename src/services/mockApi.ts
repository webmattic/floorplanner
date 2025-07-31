/**
 * Mock API Service
 * Provides local data storage and API simulation for standalone operation
 */

import { appConfig } from '../config/app.config';

// Mock data types
export interface MockFloorPlan {
  id: string;
  name: string;
  data: any;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MockProject {
  id: string;
  name: string;
  description?: string;
  floorPlans: MockFloorPlan[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Local storage keys
const STORAGE_KEYS = {
  FLOOR_PLANS: 'floorplanner_floor_plans',
  PROJECTS: 'floorplanner_projects',
  USER_PREFERENCES: 'floorplanner_user_preferences',
  PANEL_POSITIONS: 'floorplanner_panel_positions',
} as const;

class MockApiService {
  private storage: Storage;

  constructor() {
    this.storage = appConfig.storage.type === 'localStorage' ? localStorage : sessionStorage;
    this.initializeDefaultData();
  }

  // Initialize with sample data
  private initializeDefaultData(): void {
    if (!this.getFloorPlans().length) {
      const sampleFloorPlan: MockFloorPlan = {
        id: 'sample-1',
        name: 'Sample Floor Plan',
        data: {
          version: '1.0',
          canvas: { width: 800, height: 600, scale: 1 },
          layers: [
            { id: 'layer-1', name: 'Walls', visible: true, locked: false, color: '#000000', order: 0 }
          ],
          objects: [],
          metadata: {
            units: 'metric',
            gridSize: 20,
            created: new Date(),
            modified: new Date(),
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: appConfig.auth.mockUser?.id || 'user-1',
      };

      this.saveFloorPlan(sampleFloorPlan);
    }
  }

  // Floor Plans API
  getFloorPlans(): MockFloorPlan[] {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.FLOOR_PLANS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading floor plans:', error);
      return [];
    }
  }

  getFloorPlan(id: string): MockFloorPlan | null {
    const floorPlans = this.getFloorPlans();
    return floorPlans.find(plan => plan.id === id) || null;
  }

  saveFloorPlan(floorPlan: MockFloorPlan): MockFloorPlan {
    const floorPlans = this.getFloorPlans();
    const existingIndex = floorPlans.findIndex(plan => plan.id === floorPlan.id);
    
    const updatedFloorPlan = {
      ...floorPlan,
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      floorPlans[existingIndex] = updatedFloorPlan;
    } else {
      floorPlans.push(updatedFloorPlan);
    }

    this.storage.setItem(STORAGE_KEYS.FLOOR_PLANS, JSON.stringify(floorPlans));
    return updatedFloorPlan;
  }

  deleteFloorPlan(id: string): boolean {
    try {
      const floorPlans = this.getFloorPlans();
      const filteredPlans = floorPlans.filter(plan => plan.id !== id);
      this.storage.setItem(STORAGE_KEYS.FLOOR_PLANS, JSON.stringify(filteredPlans));
      return true;
    } catch (error) {
      console.error('Error deleting floor plan:', error);
      return false;
    }
  }

  // Projects API
  getProjects(): MockProject[] {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  saveProject(project: MockProject): MockProject {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    const updatedProject = {
      ...project,
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = updatedProject;
    } else {
      projects.push(updatedProject);
    }

    this.storage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return updatedProject;
  }

  // User Preferences API
  getUserPreferences(): any {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {};
    }
  }

  saveUserPreferences(preferences: any): void {
    try {
      this.storage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  // Panel Positions API
  getPanelPositions(): any {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.PANEL_POSITIONS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading panel positions:', error);
      return {};
    }
  }

  savePanelPositions(positions: any): void {
    try {
      this.storage.setItem(STORAGE_KEYS.PANEL_POSITIONS, JSON.stringify(positions));
    } catch (error) {
      console.error('Error saving panel positions:', error);
    }
  }

  // Auto-save functionality
  enableAutoSave(callback: () => void): () => void {
    const interval = setInterval(callback, appConfig.storage.autoSaveInterval);
    return () => clearInterval(interval);
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      floorPlans: this.getFloorPlans(),
      projects: this.getProjects(),
      userPreferences: this.getUserPreferences(),
      panelPositions: this.getPanelPositions(),
      exportedAt: new Date(),
      version: appConfig.app.version,
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.floorPlans) {
        this.storage.setItem(STORAGE_KEYS.FLOOR_PLANS, JSON.stringify(data.floorPlans));
      }
      if (data.projects) {
        this.storage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      }
      if (data.userPreferences) {
        this.storage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.userPreferences));
      }
      if (data.panelPositions) {
        this.storage.setItem(STORAGE_KEYS.PANEL_POSITIONS, JSON.stringify(data.panelPositions));
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.storage.removeItem(key);
    });
    this.initializeDefaultData();
  }
}

// Create singleton instance
export const mockApi = new MockApiService();

// Mock API endpoints that simulate HTTP requests
export const mockApiEndpoints = {
  // Floor Plans
  async getFloorPlans(): Promise<MockFloorPlan[]> {
    await this.delay(100); // Simulate network delay
    return mockApi.getFloorPlans();
  },

  async getFloorPlan(id: string): Promise<MockFloorPlan | null> {
    await this.delay(100);
    return mockApi.getFloorPlan(id);
  },

  async saveFloorPlan(floorPlan: MockFloorPlan): Promise<MockFloorPlan> {
    await this.delay(200);
    return mockApi.saveFloorPlan(floorPlan);
  },

  async deleteFloorPlan(id: string): Promise<boolean> {
    await this.delay(100);
    return mockApi.deleteFloorPlan(id);
  },

  // Projects
  async getProjects(): Promise<MockProject[]> {
    await this.delay(100);
    return mockApi.getProjects();
  },

  async saveProject(project: MockProject): Promise<MockProject> {
    await this.delay(200);
    return mockApi.saveProject(project);
  },

  // User
  async getCurrentUser(): Promise<MockUser> {
    await this.delay(50);
    return appConfig.auth.mockUser || {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@floorplanner.com',
    };
  },

  // Utility
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

export default mockApi;