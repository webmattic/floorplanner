# Project Details: FloorPlanner Standalone React Application

## Overview

The **FloorPlanner Standalone React Application** is a professional-grade floor planning tool designed for architects, designers, and professionals. It provides advanced features for 2D/3D visualization, real-time collaboration, and CAD integration. The application has been decoupled from its previous Django backend dependency and now operates as a fully independent React application.

---

## Key Features

### 1. Drag-and-Drop Interface

- Intuitive tools for placing walls, rooms, and furniture.
- Automatic alignment for seamless design.

### 2. Real-Time 3D Visualization

- Instant synchronization between 2D and 3D views.
- Powered by Three.js for high-quality rendering.

### 3. Floating Panel System

- Repositionable, resizable panels for a customizable workspace.
- Includes panels for tools, properties, collaboration, and more.

### 4. Collaboration

- Multi-user editing with shared cursors.
- Real-time updates using WebSocket integration.

### 5. Automated Measurements

- Tools for calculating dimensions, areas, and clearance validation.
- Real-time measurement updates and annotations.

### 6. Advanced Export

- Supports 8K renders, PDFs, and virtual walkthroughs.

### 7. Mobile Optimization

- Responsive design with touch controls for mobile devices.

### 8. CAD Import

- Compatibility with DXF, DWG, IFC, and Revit formats.

---

## Architecture

### 1. Frontend

- Built with **React** and **TypeScript**.
- Uses **Zustand** for state management.
- Incorporates libraries like **Konva.js** for 2D canvas and **Three.js** for 3D rendering.

### 2. Backend

- Decoupled from Django; uses a mock API for standalone functionality.
- WebSocket integration for real-time collaboration.

### 3. Build System

- Powered by **Vite** for fast builds and development.

### 4. State Management

- Centralized in `floorPlanStore.ts` using Zustand.
- Manages tools, canvas settings, floor plan data, and collaboration state.

---

## Deployment

### 1. Standalone Setup

- Fully independent React application with no Django dependencies.
- Environment variables managed via `.env` files.

### 2. Progressive Web App (PWA)

- Installable as a desktop or mobile app.
- Offline support with a service worker.

### 3. Dockerized Deployment

- Includes Dockerfile and `docker-compose.yml` for containerization.

---

## Development Workflow

### Scripts

- `npm run dev:standalone`: Start standalone development server.
- `npm run build:standalone`: Build for standalone deployment.

### Testing

- **Jest** is used for unit testing.
- Tests are located in the `__tests__/` folder.

---

## Detailed Codebase Analysis

### 1. Project Structure

```
src/
├── components/          # React components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── services/           # API services
├── store/              # Legacy state files
├── stores/             # Zustand state management
├── styles/             # CSS styling
├── utils/              # Utility functions
├── main.tsx            # Application entry point
├── setupTests.ts       # Test configuration
└── index.css           # Global styles
```

### 2. Core Components Analysis

- **`FloorPlannerApp.tsx`**: Main application orchestrator
- **`CanvasEditor.tsx`**: 2D canvas editor using Konva.js
- **`ThreeScene.tsx`**: 3D visualization using Three.js
- **`MeasurementTools.tsx`**: Automated measurement system
- **`CollaborationPanel.tsx`**: Real-time collaboration features
- **Panel Components**: Modular floating panels for different functionalities

### 3. Configuration System (`app.config.ts`)

```typescript
interface AppConfig {
  app: { title: string; version: string };
  api: { baseUrl: string; wsUrl: string; timeout: number };
  auth: { enabled: boolean; provider: string; mockUser?: object };
  features: {
    collaboration: boolean;
    view3D: boolean;
    export: boolean;
    cadImport: boolean;
  };
  storage: { type: string; autoSaveInterval: number };
  development: { debugMode: boolean; mockApi: boolean };
}
```

### 4. Zustand Store (`floorPlanStore.ts`) - 825 Lines

#### State Properties:

- **Canvas Settings**: `zoom`, `panX`, `panY`, `gridSize`, `showGrid`
- **Drawing Settings**: `wallThickness`, `snapToGrid`, `showClearanceWarnings`
- **Floor Plan Data**: `walls[]`, `rooms[]`, `furniture[]`, `selectedElements[]`
- **Measurements**: `measurements[]`, `measurementUnit`, `clearanceDetection`
- **Collaboration**: `collaborators[]`, `isCollaborating`, `ws`, `isConnected`
- **3D Lighting**: `lighting: { mainLight, ambientLight, temperature }`

#### Key Actions:

- **Element Management**: `addWall()`, `updateWall()`, `removeWall()` (similar for rooms/furniture)
- **Canvas Operations**: `setZoom()`, `setPan()`, `toggleGrid()`
- **Measurements**: `addMeasurement()`, `calculateTotalArea()`, `getClearanceIssues()`
- **Floor Plan CRUD**: `createFloorPlan()`, `saveFloorPlan()`, `loadFloorPlan()`
- **WebSocket**: `connectWebSocket()`, `disconnectWebSocket()`, `sendMessage()`
- **Real-time**: `updateRealTimeMeasurements()`, `getAutomaticAnnotations()`

#### Advanced Features:

- **Clearance Detection**: Checks furniture-to-furniture, furniture-to-wall, and door swing clearances
- **Geometry Utilities**: Uses external geometry module for calculations
- **Unit Conversion**: Supports feet, meters, and pixels
- **Error Handling**: Comprehensive error states and recovery

---

## Key Panels

### 1. Drawing Tools Panel (`drawingTools`)

- Wall, room, door, and window creation tools
- Measurement and annotation tools
- Grid and snap settings
- Automatic alignment features

### 2. Furniture Library Panel (`furnitureLibrary`)

- Categorized furniture browser with search and filtering
- Drag-and-drop placement functionality
- Furniture rotation and scaling
- Custom furniture import capabilities

### 3. Material Palette Panel (`materialPalette`)

- Material and color swatches
- Smart color palette generator using color theory
- Lighting controls for ambient and directional lighting
- Real-time material preview

### 4. Properties Panel (`properties`)

- Object property editing (dimensions, materials, colors)
- Layer management and organization
- Element-specific settings
- Bulk edit operations

### 5. Layers Panel (`layers`)

- Layer visibility controls
- Layer organization and grouping
- Export settings per layer

### 6. 3D View Panel (`view3D`)

- Real-time 3D visualization with Three.js
- Camera controls and preset views
- Lighting adjustments
- 8K rendering capabilities

### 7. Measurement Panel (`measurement`)

- Automated measurement tools
- Real-time dimension display
- Area calculations
- Clearance validation with warnings/errors

### 8. Collaboration Panel (`collaboration`)

- Real-time multi-user editing
- Shared cursors and selection indicators
- Comment system with pins
- User presence indicators

### 9. Sharing Panel (`sharing`)

- Social media integration with branded content
- Export to multiple formats (PDF, PNG, 8K renders)
- Virtual walkthrough generation
- Public/private sharing options

### 10. Additional Specialized Panels

- **CAD Import Panel**: DXF, DWG, IFC, Revit file import
- **Export Panel**: Advanced export options and settings
- **Revision History Panel**: Version control and change tracking
- **File Manager Panel**: Project management and organization
- **Professional Suggestions Panel**: AI-powered design recommendations

---

## Technical Implementation Details

### 1. Dependencies and Libraries

- **React 18+**: Core framework with modern hooks and concurrent features
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Zustand**: Lightweight state management (preferred over Redux)
- **Vite**: Fast build tool and development server
- **Three.js**: 3D graphics and WebGL rendering
- **Konva.js**: 2D canvas manipulation and drawing
- **shadcn/ui**: Modern UI component library
- **Jest**: Unit testing framework

### 2. Development Environment

- **Node.js 18+**: Required runtime environment
- **Package Manager**: npm or pnpm support
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Strict Mode**: Enhanced type checking

### 3. Build Configuration

- **Vite Configuration**: Optimized for both development and production
- **Environment Variables**: `.env` and `.env.example` for configuration
- **Dual Build Mode**: Supports both standalone and Django integration
- **PostCSS**: CSS processing and optimization

### 4. Testing Strategy

- **Unit Tests**: Located in `__tests__/` directories
- **Component Testing**: React component testing with Jest
- **Integration Tests**: Panel integration and workflow testing
- **Performance Tests**: Real-time measurement and rendering performance

### 5. Error Handling and Monitoring

- **Error Boundaries**: Graceful error recovery at component level
- **Performance Monitoring**: Real-time FPS and memory usage tracking
- **Debug Mode**: Development logging and debugging features
- **Auto-save**: Configurable auto-save intervals to prevent data loss

### 6. Accessibility Features

- **Screen Reader Support**: Full ARIA compliance
- **Keyboard Navigation**: Comprehensive keyboard shortcuts
- **High Contrast Mode**: Accessibility-friendly color schemes
- **Touch Controls**: Mobile-optimized touch gestures

### 7. Performance Optimizations

- **Virtual Scrolling**: Efficient rendering of large datasets
- **Lazy Loading**: On-demand component and resource loading
- **Memory Management**: Automatic cleanup and garbage collection
- **Canvas Optimization**: Efficient 2D rendering with Konva.js
- **3D Optimization**: LOD (Level of Detail) for Three.js scenes

---

## Data Models and Types

### Floor Plan Elements

```typescript
interface Wall {
  id: string;
  points: number[];
  thickness: number;
  color: string;
}

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
}

interface Furniture {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
}

interface Measurement {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  distance: number;
  type: "linear" | "area" | "angle";
  label?: string;
}
```

### Collaboration Types

```typescript
interface Collaborator {
  id: string;
  name: string;
  cursor: { x: number; y: number };
  selection: string[];
}

interface ClearanceIssue {
  id: string;
  elementType: string;
  elementId: string;
  description: string;
  severity: "warning" | "error";
}
```

---

## Conclusion

The FloorPlanner Standalone React Application represents a sophisticated, enterprise-grade floor planning solution with comprehensive features for professional architects and designers. Key technical achievements include:

### Technical Excellence

- **Modular Architecture**: Clean separation of concerns with 825-line Zustand store managing complex state
- **Real-time Capabilities**: WebSocket integration for seamless collaboration
- **Performance Optimized**: Efficient 2D/3D rendering with Konva.js and Three.js
- **Type Safety**: Comprehensive TypeScript implementation with strict type checking

### Professional Features

- **Advanced Measurements**: Automated calculations with clearance detection
- **CAD Integration**: Support for industry-standard file formats
- **Export Capabilities**: 8K rendering and multiple output formats
- **Accessibility Compliant**: Full ARIA support and keyboard navigation

### Deployment Ready

- **Standalone Independence**: No external dependencies beyond Node.js
- **PWA Capabilities**: Installable with offline support
- **Docker Containerized**: Production-ready deployment configuration
- **Multi-platform**: Supports desktop, mobile, and tablet devices

### Development Workflow

- **Modern Toolchain**: Vite, TypeScript, Jest for optimal developer experience
- **Comprehensive Testing**: Unit, integration, and performance tests
- **Error Resilience**: Robust error boundaries and recovery mechanisms
- **Documentation**: Thorough code documentation and architectural guides

This application demonstrates modern React development best practices while delivering professional-grade functionality suitable for commercial use in architecture, interior design, and space planning industries. The decoupling from Django and adoption of contemporary frontend technologies ensures long-term maintainability and scalability.
