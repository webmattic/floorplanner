# FloorPlanner Panel Integration Guide

## Overview

The FloorPlanner application uses a sophisticated floating panel system built with React, shadcn/ui components, and Zustand state management. This guide covers the integration architecture, usage patterns, and best practices for working with the panel system.

## Architecture

### Core Components

1. **Panel Integration Manager** (`PanelIntegrationManager`)

   - Central orchestration of all panel functionality
   - Error boundary management
   - Performance monitoring
   - Auto-save functionality
   - Keyboard shortcuts handling

2. **Error Boundaries** (`ErrorBoundary`, `PanelErrorBoundary`)

   - Graceful error handling for panel failures
   - Recovery mechanisms
   - Development debugging features

3. **Performance Monitor** (`PerformanceMonitor`)

   - Real-time FPS monitoring
   - Memory usage tracking
   - Panel operation benchmarking

4. **Panel Store** (`usePanelStore`)
   - Centralized state management
   - Panel positioning and sizing
   - Visibility and z-index management
   - Workspace presets and grouping

### Panel Types

1. **Drawing Tools Panel** - Wall, room, door, and window tools
2. **Furniture Library Panel** - Drag-and-drop furniture placement
3. **Material Palette Panel** - Material and color application
4. **Properties Panel** - Object property editing
5. **Layers Panel** - Layer management and organization
6. **3D View Panel** - Real-time 3D visualization
7. **Measurement Panel** - Automated measurement tools
8. **Collaboration Panel** - Real-time collaboration features
9. **Sharing Panel** - Social sharing and export features

## Usage Guide

### Basic Panel Operations

```typescript
import { usePanelStore } from "../stores/panelStore";

const MyComponent = () => {
  const { showPanel, hidePanel, togglePanel } = usePanelStore();

  // Show a panel
  const openDrawingTools = () => showPanel("drawingTools");

  // Hide a panel
  const closeProperties = () => hidePanel("properties");

  // Toggle panel visibility
  const toggleFurniture = () => togglePanel("furnitureLibrary");
};
```

### Advanced Panel Management

```typescript
import { usePanelStore } from "../stores/panelStore";

const AdvancedPanelOperations = () => {
  const store = usePanelStore();

  // Position a panel
  const movePanel = () => {
    store.updatePanelPosition("materialPalette", { x: 100, y: 200 });
  };

  // Resize a panel
  const resizePanel = () => {
    store.updatePanelSize("view3D", { width: 500, height: 400 });
  };

  // Dock a panel
  const dockPanel = () => {
    store.dockPanel("properties", "right");
  };

  // Create panel group
  const groupPanels = () => {
    const groupId = store.createGroup("Design Tools", [
      "drawingTools",
      "materialPalette",
      "properties",
    ]);
  };

  // Create workspace preset
  const saveWorkspace = () => {
    const presetId = store.createPreset(
      "My Custom Layout",
      "Custom workspace for design tasks"
    );
  };
};
```

### Panel Synchronization

```typescript
import { usePanelSync } from "../components/ui/panel-integration-manager";

const SynchronizedPanel = ({ panelId }: { panelId: string }) => {
  const { updateData, subscribe, getData } = usePanelSync(panelId);

  useEffect(() => {
    // Subscribe to data changes from other panels
    const unsubscribe = subscribe((data) => {
      console.log("Received data:", data);
      // Update panel based on received data
    });

    return unsubscribe;
  }, [subscribe]);

  const handleDataChange = (newData: any) => {
    // Broadcast data to other panels
    updateData(newData);
  };
};
```

## Keyboard Shortcuts

### Global Shortcuts

- `Ctrl/Cmd + 1-9`: Toggle panels 1-9
- `Ctrl/Cmd + Shift + 1-9`: Hide panels 1-9
- `Ctrl/Cmd + H`: Hide all panels
- `Ctrl/Cmd + R`: Reset panel layout

### Panel-Specific Shortcuts

- `1`: Drawing Tools Panel
- `2`: Furniture Library Panel
- `3`: Material Palette Panel
- `4`: Properties Panel
- `5`: Layers Panel
- `6`: 3D View Panel
- `7`: Measurement Panel
- `8`: Collaboration Panel
- `9`: Sharing Panel

## Error Handling

### Panel Error Boundaries

All panels are wrapped in error boundaries that:

1. **Catch JavaScript errors** in panel components
2. **Display fallback UI** with recovery options
3. **Log errors** for debugging and monitoring
4. **Provide recovery actions** (retry, reload)

```typescript
import { PanelErrorBoundary } from "../components/ui/error-boundary";

const MyPanel = () => (
  <PanelErrorBoundary panelId="myPanel" panelTitle="My Panel">
    <MyPanelContent />
  </PanelErrorBoundary>
);
```

### Error Recovery

- **Automatic retry**: Some errors trigger automatic recovery
- **Manual retry**: Users can click "Try Again" button
- **Full reload**: Users can reload the entire application
- **Panel isolation**: Errors in one panel don't affect others

## Performance Optimization

### Automatic Optimizations

1. **Render optimization**: Panels use React.memo for performance
2. **Update throttling**: High-frequency updates are throttled
3. **Hardware acceleration**: CSS transforms use GPU acceleration
4. **Lazy loading**: Panel content is loaded on demand

### Performance Monitoring

```typescript
import { usePerformanceMonitor } from "../components/ui/performance-monitor";

const MonitoredComponent = () => {
  const metrics = usePerformanceMonitor(true);

  console.log("FPS:", metrics.fps);
  console.log("Memory:", metrics.memoryUsage);
  console.log("Panel count:", metrics.panelCount);
};
```

### Performance Best Practices

1. **Minimize panel updates**: Use debounced/throttled updates
2. **Optimize panel content**: Use virtualization for large lists
3. **Cleanup on unmount**: Remove event listeners and timers
4. **Use efficient rendering**: Avoid unnecessary re-renders

## Testing

### Unit Tests

```typescript
import { PanelTestHelper } from "../components/__tests__/panel-integration.test";

// Test panel visibility
await PanelTestHelper.testPanelVisibility("drawingTools");

// Test panel positioning
await PanelTestHelper.testPanelPositioning("furnitureLibrary");

// Test panel resizing
await PanelTestHelper.testPanelResizing("materialPalette");
```

### Integration Tests

```typescript
import { runPanelIntegrationTests } from "../components/__tests__/panel-integration.test";

// Run comprehensive integration tests
await runPanelIntegrationTests();
```

### Performance Benchmarks

```typescript
import { PanelPerformanceBenchmark } from "../components/__tests__/panel-integration.test";

// Benchmark panel operations
const benchmarks = await PanelPerformanceBenchmark.benchmarkPanelOperations();

// Stress test with multiple panels
const stressResults = await PanelPerformanceBenchmark.stressTestPanels(20);
```

## Mobile Responsiveness

### Responsive Behavior

1. **Automatic layout adjustment**: Panels adapt to screen size
2. **Touch-friendly controls**: Optimized for touch input
3. **Gesture support**: Pan, zoom, and drag gestures
4. **Collapsible panels**: Panels can be collapsed on small screens

### Mobile-Specific Features

```typescript
import { useDeviceDetection } from "../components/mobile/ResponsivePanelManager";

const ResponsivePanel = () => {
  const deviceInfo = useDeviceDetection();

  if (deviceInfo.isMobile) {
    return <MobilePanelLayout />;
  }

  return <DesktopPanelLayout />;
};
```

## Data Persistence

### Auto-Save

- **Automatic saving**: Panel states saved every 30 seconds
- **Before unload**: Data saved when user leaves the page
- **Recovery**: Auto-saved data restored on page reload

### Local Storage

Panel states are persisted to localStorage:

```typescript
// Panel states are automatically saved
const panelStates = localStorage.getItem("floorplanner-panels");

// Auto-save data includes floor plan and panel states
const autoSaveData = localStorage.getItem("floorplanner-autosave");
```

## Customization

### Custom Panels

```typescript
import { PANEL_CONFIGS } from "../stores/panelStore";

// Add custom panel configuration
PANEL_CONFIGS.myCustomPanel = {
  id: "myCustomPanel",
  title: "My Custom Panel",
  icon: "Custom",
  defaultPosition: { x: 20, y: 80 },
  defaultSize: { width: 300, height: 400 },
  minSize: { width: 250, height: 300 },
  resizable: true,
  minimizable: true,
  closable: true,
  keyboardShortcut: "c",
  category: "custom",
  dockable: true,
  groupable: true,
};
```

### Custom Workspace Presets

```typescript
const customPresets = {
  designer: {
    id: "designer",
    name: "Designer Workspace",
    description: "Optimized for design work",
    panelStates: {
      drawingTools: { isVisible: true, position: { x: 20, y: 80 } },
      materialPalette: { isVisible: true, position: { x: 320, y: 80 } },
      view3D: { isVisible: true, position: { x: 640, y: 80 } },
    },
  },
};
```

## Troubleshooting

### Common Issues

1. **Panel not showing**: Check if panel is enabled in configuration
2. **Performance issues**: Monitor FPS and memory usage
3. **State not persisting**: Verify localStorage is available
4. **Keyboard shortcuts not working**: Check for input focus conflicts

### Debug Mode

Enable debug mode for additional logging:

```typescript
// Enable performance monitoring in development
const config = {
  enablePerformanceMonitoring: process.env.NODE_ENV === "development",
  enableErrorBoundaries: true,
};
```

### Error Reporting

Errors are automatically logged in development. In production, integrate with error tracking services:

```typescript
// In error boundary
const reportError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Send to error tracking service
  errorTrackingService.captureException(error, {
    extra: errorInfo,
    tags: { component: "FloorPlannerPanel" },
  });
};
```

## Migration Guide

### From Legacy Panel System

1. **Update imports**: Replace old panel imports with new ones
2. **Wrap with error boundaries**: Add error boundary wrappers
3. **Update state management**: Use new panel store hooks
4. **Test thoroughly**: Run integration tests to verify functionality

### Breaking Changes

- Panel IDs are now required to be unique
- Panel positioning uses absolute coordinates
- State management moved to Zustand
- Error boundaries are now required for panel components

## Contributing

### Adding New Panels

1. Create panel component in `components/panels/`
2. Add panel configuration to `PANEL_CONFIGS`
3. Register panel in `FloorPlannerApp.tsx`
4. Add tests in `__tests__/` directory
5. Update documentation

### Code Standards

- Use TypeScript for all new code
- Follow React hooks patterns
- Implement proper error handling
- Add comprehensive tests
- Document public APIs

## Support

For issues and questions:

1. Check this documentation first
2. Review existing tests for examples
3. Check the error logs for debugging information
4. Create an issue with reproduction steps

---

_This documentation is part of the FloorPlanner project. Last updated: Task 17 Integration._
