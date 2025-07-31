# FloorPlanner UI Overhaul Design Document

## Overview

This design document outlines the complete overhaul of the FloorPlanner application to create a modern, functional, and user-friendly interface with floating, repositionable panels. The design incorporates all Phase-1 features from the floorplanner-features.md specification, using shadcn UI components for a consistent, professional interface. The focus is on fixing existing functionality while implementing an intuitive drag-and-drop system, real-time 3D visualization, social collaboration, and advanced export capabilities.

## Architecture

### Frontend Architecture

```
FloorPlanner App
├── Core Canvas (Konva.js)
│   ├── 2D Drawing Engine
│   ├── Object Management
│   └── Interaction Handlers
├── Floating Panel System
│   ├── Panel Manager
│   ├── Drag & Drop System
│   └── State Persistence
├── Tool Panels
│   ├── Drawing Tools Panel
│   ├── Furniture Library Panel
│   ├── Properties Panel
│   └── Layers Panel
├── 3D Visualization (Three.js)
├── Real-time Collaboration (WebSocket)
└── State Management (Zustand)
```

### Backend Integration

- Existing Django REST API endpoints
- WebSocket consumers for real-time features
- File upload and processing services
- User preference storage for panel positions

## Components and Interfaces

### 1. Floating Panel System

#### Panel Manager Component

```typescript
interface PanelConfig {
  id: string;
  title: string;
  icon: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize?: { width: number; height: number };
  resizable: boolean;
  minimizable: boolean;
}

interface PanelState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
  isVisible: boolean;
}
```

#### Draggable Panel Component

```typescript
interface DraggablePanelProps {
  config: PanelConfig;
  state: PanelState;
  onStateChange: (state: PanelState) => void;
  children: React.ReactNode;
}
```

### 2. Tool Panels

#### Drawing Tools Panel

```typescript
// Using shadcn Button, Toggle, Separator components
interface DrawingToolsPanel {
  tools: {
    wall: { icon: "Move"; active: boolean };
    room: { icon: "Square"; active: boolean };
    door: { icon: "DoorOpen"; active: boolean };
    window: { icon: "RectangleHorizontal"; active: boolean };
    dimension: { icon: "Ruler"; active: boolean };
    text: { icon: "Type"; active: boolean };
  };
  snapToGrid: boolean;
  gridSize: number;
}
```

- **Wall Tool**: One-click placement with automatic alignment (snap-to-grid)
- **Room Tool**: Auto-calculated dimensions as walls are drawn
- **Door/Window Tools**: Error alerts for clearance issues ("Door won't open!")
- **Virtual Tape Measure**: Interactive spacing checks between objects
- **Text Tool**: Add labels and annotations with auto-sizing

#### Furniture Library Panel

```typescript
// Using shadcn Input, Select, ScrollArea, Card components
interface FurnitureLibraryPanel {
  categories: FurnitureCategory[];
  searchQuery: string;
  selectedCategory: string;
  draggedItem: FurnitureItem | null;
}
```

- **Drag-and-Drop Interface**: One-click furniture placement with automatic alignment
- **Category Browser**: Organized with shadcn Tabs and ScrollArea
- **Search Functionality**: Real-time filtering with shadcn Input
- **Mobile-Optimized**: Touch controls for on-the-go designing
- **Simple Resizing**: Via handles (no manual dimension input)

#### Material Palette Panel

```typescript
// Using shadcn Tabs, Button, Slider components
interface MaterialPalettePanel {
  categories: "walls" | "floors" | "fabrics";
  swatches: MaterialSwatch[];
  colorPalettes: ColorPalette[];
  lightingControls: LightingSettings;
}
```

- **Material Swatches**: Drag-to-apply textures (walls, floors, fabrics)
- **Smart Color Palettes**: Harmonized schemes (analogous, complementary, triadic)
- **Lighting Sliders**: Time-of-day ambiance adjustment
- **One-Click Personalization**: Instant material application

#### Properties Panel

```typescript
// Using shadcn Label, Input, Select, Slider components
interface PropertiesPanel {
  selectedObject: FloorPlanObject | null;
  properties: ObjectProperty[];
  materialSettings: MaterialSettings;
  dimensions: ObjectDimensions;
}
```

- **Object Properties**: Edit selected object attributes with shadcn form components
- **Material Settings**: Change colors, textures with visual swatches
- **Dimensions**: Precise size adjustments with shadcn Input and Slider
- **Layer Assignment**: Move objects between layers with shadcn Select

#### Layers Panel

```typescript
// Using shadcn Button, Switch, DragDropContext components
interface LayersPanel {
  layers: Layer[];
  activeLayer: string;
  draggedLayer: string | null;
}
```

- **Layer Management**: Create, delete, rename with shadcn Dialog and Input
- **Visibility Toggle**: Show/hide with shadcn Switch components
- **Lock/Unlock**: Prevent edits with shadcn Toggle
- **Reorder**: Drag-and-drop layer reordering

#### 3D View Panel

```typescript
// Using shadcn Button, Select, Slider components
interface View3DPanel {
  isActive: boolean;
  cameraPresets: CameraPreset[];
  renderQuality: "low" | "medium" | "high" | "8k";
  autoFraming: boolean;
}
```

- **Real-time 3D Preview**: Live sync while drawing in 2D
- **Seamless View Toggling**: Single-click switching between 2D/3D
- **Auto-Camera Angles**: Optimal 3D scene framing
- **Camera Presets**: Top, front, side, isometric, corner views

#### Collaboration Panel

```typescript
// Using shadcn Avatar, Button, Input, Popover components
interface CollaborationPanel {
  collaborators: Collaborator[];
  comments: Comment[];
  shareSettings: ShareSettings;
  cursors: CollaboratorCursor[];
}
```

- **Real-time Co-editing**: Shared cursor visibility with user avatars
- **Comment Pins**: Specific design area comments ("Try blue here?")
- **Public Preview Links**: Sharing with comment capability
- **Social Sharing**: Instagram/Facebook integration (UI ready)

#### Export Panel

```typescript
// Using shadcn Button, Select, Progress, Dialog components
interface ExportPanel {
  exportType: "image" | "video" | "pdf";
  quality: "standard" | "high" | "8k";
  progress: number;
  downloadUrl: string | null;
}
```

- **One-click Renders**: Photorealistic 8K resolution support
- **Virtual Walkthrough**: Auto-navigated tour videos
- **Printable PDFs**: Scale accuracy for contractors
- **Progress Indicators**: Real-time export status

#### Revision History Panel

```typescript
// Using shadcn Slider, Button, Card, Badge components
interface RevisionHistoryPanel {
  versions: FloorPlanVersion[];
  currentVersion: number;
  comparisonMode: boolean;
  autoSaveEnabled: boolean;
}
```

- **Visual History Slider**: Unlimited undo/redo with thumbnails
- **Version Comparison**: Overlay highlighting changes between saves
- **Cloud Auto-save**: Cross-device sync with shadcn Badge status indicators
- **Timeline Interface**: Visual version navigation

#### CAD Import Panel

```typescript
// Using shadcn Input, Progress, Checkbox, Select components
interface CadImportPanel {
  supportedFormats: ["dxf", "dwg", "ifc", "revit"];
  uploadProgress: number;
  layers: CadLayer[];
  scaleSettings: ScaleSettings;
}
```

- **File Upload**: DXF, DWG, IFC, Revit support with progress indicator
- **Layer Management**: Visibility toggling and selective import
- **Scale Adjustment**: Alignment with existing plans
- **Format Conversion**: 2D rendering from construction documents

### 3. Canvas System

#### 2D Canvas (Konva.js)

```typescript
interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  gridVisible: boolean;
  snapToGrid: boolean;
  selectedObjects: string[];
  activeLayer: string;
}

interface DrawingTool {
  type: "wall" | "room" | "door" | "window" | "dimension" | "text";
  cursor: string;
  onMouseDown: (event: KonvaEventObject) => void;
  onMouseMove: (event: KonvaEventObject) => void;
  onMouseUp: (event: KonvaEventObject) => void;
}
```

#### 3D Visualization (Three.js)

```typescript
interface Scene3D {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}
```

### 4. Real-time Collaboration

#### Collaboration Manager

```typescript
interface CollaborationState {
  isConnected: boolean;
  collaborators: Collaborator[];
  cursors: { [userId: string]: { x: number; y: number } };
  comments: Comment[];
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  activeTool: string;
}
```

## shadcn UI Component Integration

### Core Components Used

```typescript
// Primary shadcn components for FloorPlanner UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
```

### Lucide Icons Used

```typescript
// Icons for FloorPlanner tools and UI elements
import {
  Move,
  Square,
  DoorOpen,
  RectangleHorizontal,
  Ruler,
  Type,
  Search,
  Filter,
  Grid3x3,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Palette,
  Sun,
  Moon,
  Lightbulb,
  Camera,
  Download,
  Share2,
  Undo2,
  Redo2,
  History,
  Save,
  Upload,
  FileImage,
  FileVideo,
  FilePdf,
  Users,
  MessageSquare,
  Pin,
  Settings,
  Maximize2,
  Minimize2,
  X,
  GripVertical,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from "lucide-react";
```

### Panel Theme Configuration

```typescript
interface PanelTheme {
  background: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60";
  border: "border border-border/40";
  shadow: "shadow-lg";
  header: "bg-muted/50 border-b border-border/40";
  content: "p-4";
  scrollArea: "max-h-[400px]";
}
```

## Data Models

### Panel Preferences

```typescript
interface UserPanelPreferences {
  userId: string;
  panels: {
    [panelId: string]: {
      position: { x: number; y: number };
      size: { width: number; height: number };
      isMinimized: boolean;
      isVisible: boolean;
    };
  };
  lastUpdated: Date;
}
```

### Floor Plan Data Structure

```typescript
interface FloorPlanData {
  version: string;
  canvas: {
    width: number;
    height: number;
    scale: number;
  };
  layers: Layer[];
  objects: FloorPlanObject[];
  metadata: {
    units: "metric" | "imperial";
    gridSize: number;
    created: Date;
    modified: Date;
  };
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  order: number;
}

interface FloorPlanObject {
  id: string;
  type:
    | "wall"
    | "room"
    | "furniture"
    | "door"
    | "window"
    | "dimension"
    | "text";
  layerId: string;
  position: { x: number; y: number };
  rotation: number;
  properties: { [key: string]: any };
  style: ObjectStyle;
}
```

## Error Handling

### Canvas Error Recovery

- **Auto-save**: Periodic saving of work progress
- **Undo/Redo System**: Comprehensive action history
- **Error Boundaries**: Graceful handling of component failures
- **Connection Recovery**: Automatic reconnection for collaboration

### Panel System Error Handling

- **Position Validation**: Ensure panels stay within screen bounds
- **State Recovery**: Restore panel positions from localStorage
- **Fallback Layouts**: Default panel arrangement if preferences fail

## Testing Strategy

### Unit Testing

- Panel drag and drop functionality
- Canvas drawing operations
- State management operations
- API integration points

### Integration Testing

- Real-time collaboration synchronization
- File upload and processing
- 3D visualization rendering
- Cross-browser compatibility

### User Experience Testing

- Panel positioning and resizing
- Tool responsiveness and accuracy
- Mobile and tablet interactions
- Performance under load

### Performance Testing

- Canvas rendering with complex floor plans
- Memory usage with multiple panels
- WebSocket connection stability
- 3D rendering performance

## Security Considerations

### Client-Side Security

- Input validation for all user interactions
- Sanitization of uploaded files
- Protection against XSS in user-generated content

### Collaboration Security

- User authentication for real-time features
- Permission validation for edit operations
- Rate limiting for WebSocket messages

## Accessibility

### Keyboard Navigation

- Tab order for all interactive elements
- Keyboard shortcuts for common operations
- Focus indicators for all controls

### Screen Reader Support

- ARIA labels for all panels and tools
- Descriptive text for canvas operations
- Alternative text for visual elements

### Visual Accessibility

- High contrast mode support
- Scalable UI elements
- Color-blind friendly color schemes

## Performance Optimization

### Canvas Performance

- Object pooling for frequently created/destroyed objects
- Efficient rendering with dirty region updates
- Level-of-detail for complex objects at different zoom levels

### Panel System Performance

- Virtual scrolling for large furniture libraries
- Debounced position updates during dragging
- Efficient z-index management

### Memory Management

- Cleanup of event listeners on component unmount
- Efficient state updates to prevent unnecessary re-renders
- Garbage collection of unused objects

## Mobile and Responsive Design

### Adaptive Panel Layout

- Collapsible panels on smaller screens
- Touch-friendly panel controls
- Responsive panel sizing

### Touch Interactions

- Multi-touch support for zoom and pan
- Touch-optimized drawing tools
- Gesture recognition for common operations

### Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced features for capable devices
- Graceful degradation for older browsers
