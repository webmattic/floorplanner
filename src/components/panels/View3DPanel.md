# View3D Panel

The View3D Panel is a floating, repositionable panel that provides comprehensive 3D visualization capabilities with real-time synchronization between 2D and 3D views in the FloorPlanner application.

## Features

### Real-time 3D Visualization

- **Live Canvas**: Interactive 3D canvas using React Three Fiber
- **Real-time Sync**: Automatic updates when 2D floor plan changes
- **High Performance**: Optimized rendering with configurable quality settings
- **Responsive Design**: Adapts to different panel sizes and screen orientations

### Camera System

- **6 Camera Presets**: Default, Top, Front, Side, Isometric, Corner views
- **Auto-framing**: Intelligent scene framing with optimal camera positioning
- **Orbit Controls**: Smooth pan, zoom, and rotate interactions
- **Auto-rotation**: Optional automatic scene rotation for presentations

### Advanced Lighting

- **Scene Lighting Controls**: Adjustable main light, ambient light, and color temperature
- **Real-time Updates**: Lighting changes reflect immediately in 3D view
- **Environment Presets**: Studio, Sunset, Dawn, Night, Warehouse environments
- **Shadow System**: Configurable contact shadows and directional shadows

### Rendering Options

- **Quality Presets**: Low, Medium, High, Ultra quality settings
- **Visual Effects**: Grid overlay, shadows, environment lighting
- **Export Capabilities**: 3D view export and sharing functionality
- **Fullscreen Mode**: Expanded view for detailed inspection

## Usage

### Basic Navigation

1. **View Tab**: Main 3D visualization with quick controls
2. **Camera Tab**: Camera presets and lighting controls
3. **Render Tab**: Quality settings and export options

### Camera Controls

1. **Mouse Controls**:
   - Left drag: Rotate camera
   - Right drag: Pan view
   - Scroll: Zoom in/out
2. **Presets**: One-click camera positioning
3. **Auto-frame**: Automatically fit scene in view

### Lighting Adjustment

1. Switch to Camera tab
2. Use sliders to adjust main light, ambient light, and temperature
3. Changes apply in real-time to both 2D and 3D views

### Quality & Rendering

1. Switch to Render tab
2. Select quality preset based on performance needs
3. Choose environment for realistic lighting
4. Export or share 3D views

## Technical Implementation

### Component Architecture

```
View3DPanel
├── View Tab
│   ├── 3D Canvas (React Three Fiber)
│   ├── Scene3D Component
│   │   ├── Wall3D Components
│   │   ├── Room3D Components
│   │   ├── Furniture3D Components
│   │   └── Lighting & Environment
│   └── Quick Controls
├── Camera Tab
│   ├── Camera Presets Grid
│   └── Lighting Controls
└── Render Tab
    ├── Quality Settings
    ├── Environment Selection
    └── Export Options
```

### 3D Scene Components

#### Wall3D Component

- Converts 2D wall points to 3D extruded geometry
- Configurable thickness and height
- Material support with colors and textures
- Shadow casting and receiving

#### Room3D Component

- Floor plane representation of rooms
- Transparent colored overlays
- Proper positioning and scaling
- Shadow receiving surfaces

#### Furniture3D Component

- Box geometry for furniture items
- Realistic proportions and positioning
- Material and color support
- Shadow casting capabilities

### Real-time Synchronization

- Automatic updates when FloorPlan store changes
- Efficient re-rendering of only changed objects
- State preservation during view mode switching
- Seamless 2D-to-3D data conversion

### Camera Presets

```typescript
const CAMERA_PRESETS = [
  { id: "default", position: [15, 15, 15] },
  { id: "top", position: [0, 30, 0] },
  { id: "front", position: [0, 5, 25] },
  { id: "side", position: [25, 5, 0] },
  { id: "isometric", position: [20, 20, 20] },
  { id: "corner", position: [12, 8, 12] },
];
```

### Quality Settings

- **Low**: Fast rendering, basic shadows, low resolution
- **Medium**: Balanced quality and performance
- **High**: Enhanced shadows, better materials
- **Ultra**: Maximum quality, high-resolution shadows

## Requirements Fulfilled

This implementation fulfills the following requirements from task 8:

1. **✅ Create floating 3D View Panel using shadcn Button, Select, and Slider**

   - Uses FloatingPanel with shadcn UI components throughout
   - Button, Select, Slider, Switch, and Tabs components integrated

2. **✅ Implement Three.js integration with React Three Fiber for real-time 3D preview**

   - Full React Three Fiber implementation with Canvas component
   - Three.js geometries and materials for 3D objects
   - Real-time rendering with optimized performance

3. **✅ Add seamless 2D-to-3D view toggling with state preservation**

   - Toggle button for instant view mode switching
   - State preservation across view changes
   - Synchronized camera and lighting settings

4. **✅ Create auto-camera angles with optimal scene framing algorithms**

   - Auto-frame functionality with intelligent positioning
   - Bounding box calculation for optimal framing
   - Automatic camera distance and angle adjustment

5. **✅ Implement camera presets (top, front, side, isometric, corner) with one-click switching**

   - 6 predefined camera presets with distinct positions
   - One-click preset selection with visual feedback
   - Smooth camera transitions between presets

6. **✅ Ensure real-time synchronization between 2D changes and 3D view updates**
   - Automatic updates when FloorPlan store changes
   - Real-time object creation, modification, and deletion
   - Synchronized lighting and material changes

## Integration

The View3D Panel integrates with:

- **FloorPlanStore**: For 3D object data and real-time updates
- **PanelStore**: For floating panel behavior and state management
- **FloatingPanel**: For drag, resize, and minimize functionality
- **React Three Fiber**: For 3D rendering and scene management
- **Three.js**: For 3D geometries, materials, and lighting

## Performance Optimizations

- **Quality-based Rendering**: Adjustable quality settings for performance
- **Efficient Updates**: Only re-render changed objects
- **Shadow Optimization**: Configurable shadow quality and resolution
- **Memory Management**: Proper cleanup of 3D resources
- **Responsive Canvas**: Automatic resize handling

## Testing

The component includes comprehensive tests covering:

- 3D canvas rendering and scene setup
- Camera preset functionality and switching
- Lighting controls and real-time updates
- Quality settings and environment changes
- View mode toggling and state preservation
- Export and sharing capabilities
- Real-time synchronization with 2D changes

## Future Enhancements

Potential improvements:

- **VR/AR Support**: Virtual and augmented reality viewing
- **Advanced Materials**: PBR materials and texture mapping
- **Animation System**: Walkthrough animations and camera paths
- **Measurement Tools**: 3D measurement and annotation tools
- **Advanced Lighting**: HDR environments and global illumination
- **Performance Profiling**: Built-in performance monitoring
- **Collaborative 3D**: Multi-user 3D viewing and interaction

## Accessibility

The component includes:

- Proper ARIA labels and roles for 3D controls
- Keyboard navigation for camera presets
- Screen reader descriptions for 3D scene elements
- High contrast support for UI elements
- Focus management in tabbed interface
- Tooltip descriptions for all 3D controls

## Browser Compatibility

- **WebGL Support**: Requires WebGL-enabled browsers
- **Performance**: Optimized for modern browsers
- **Fallbacks**: Graceful degradation for older browsers
- **Mobile Support**: Touch-optimized 3D controls
- **Cross-platform**: Works on desktop, tablet, and mobile devices
