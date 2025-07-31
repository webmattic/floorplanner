/**
 * Application Configuration
 * Centralized configuration management for standalone FloorPlanner
 */

export interface AppConfig {
  app: {
    title: string;
    version: string;
  };
  api: {
    baseUrl: string;
    wsUrl: string;
    timeout: number;
  };
  auth: {
    enabled: boolean;
    provider: 'local' | 'firebase' | 'auth0';
    mockUser?: {
      id: string;
      name: string;
      email: string;
    };
  };
  features: {
    collaboration: boolean;
    view3D: boolean;
    export: boolean;
    cadImport: boolean;
  };
  storage: {
    type: 'localStorage' | 'indexedDB' | 'memory';
    autoSaveInterval: number;
  };
  development: {
    debugMode: boolean;
    mockApi: boolean;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  app: {
    title: 'FloorPlanner',
    version: '1.0.0',
  },
  api: {
    baseUrl: 'http://localhost:3001/api',
    wsUrl: 'ws://localhost:3001/ws',
    timeout: 10000,
  },
  auth: {
    enabled: false,
    provider: 'local',
    mockUser: {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@floorplanner.com',
    },
  },
  features: {
    collaboration: true,
    view3D: true,
    export: true,
    cadImport: true,
  },
  storage: {
    type: 'localStorage',
    autoSaveInterval: 30000,
  },
  development: {
    debugMode: true,
    mockApi: true,
  },
};

// Load configuration from environment variables
export const appConfig: AppConfig = {
  app: {
    title: import.meta.env.VITE_APP_TITLE || defaultConfig.app.title,
    version: import.meta.env.VITE_APP_VERSION || defaultConfig.app.version,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || defaultConfig.api.baseUrl,
    wsUrl: import.meta.env.VITE_WS_URL || defaultConfig.api.wsUrl,
    timeout: defaultConfig.api.timeout,
  },
  auth: {
    enabled: import.meta.env.VITE_ENABLE_AUTH === 'true',
    provider: (import.meta.env.VITE_AUTH_PROVIDER as AppConfig['auth']['provider']) || defaultConfig.auth.provider,
    mockUser: defaultConfig.auth.mockUser,
  },
  features: {
    collaboration: import.meta.env.VITE_ENABLE_COLLABORATION !== 'false',
    view3D: import.meta.env.VITE_ENABLE_3D_VIEW !== 'false',
    export: import.meta.env.VITE_ENABLE_EXPORT !== 'false',
    cadImport: import.meta.env.VITE_ENABLE_CAD_IMPORT !== 'false',
  },
  storage: {
    type: (import.meta.env.VITE_STORAGE_TYPE as AppConfig['storage']['type']) || defaultConfig.storage.type,
    autoSaveInterval: parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL || '30000'),
  },
  development: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
  },
};

// Export individual config sections for convenience
export const { app, api, auth, features, storage, development } = appConfig;

// Configuration validation
export const validateConfig = (): boolean => {
  try {
    // Validate required fields
    if (!app.title || !app.version) {
      console.error('App configuration is incomplete');
      return false;
    }

    if (!api.baseUrl || !api.wsUrl) {
      console.error('API configuration is incomplete');
      return false;
    }

    // Validate URLs
    try {
      new URL(api.baseUrl);
      new URL(api.wsUrl.replace('ws://', 'http://').replace('wss://', 'https://'));
    } catch {
      console.error('Invalid API URLs in configuration');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

// Debug logging in development
if (development.debugMode) {
  console.log('FloorPlanner Configuration:', appConfig);
  console.log('Configuration valid:', validateConfig());
}