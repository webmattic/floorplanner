# FloorPlanner Panel System Documentation

## Overview

The FloorPlanner Panel System is a comprehensive, floating panel interface built with React, TypeScript, and shadcn/ui components. It provides a flexible, customizable workspace for floor plan design with advanced features like panel grouping, workspace presets, keyboard shortcuts, and accessibility support.

## Features

### ✨ Core Features

- **Floating Panels**: Draggable, resizable panels that can be positioned anywhere
- **Panel Management**: Show, hide, minimize, maximize, and organize panels
- **Workspace Presets**: Save and restore custom panel layouts
- **Panel Grouping**: Group related panels for better organization
- **Keyboard Shortcuts**: Comprehensive keyboard navigation and shortcuts
- **Mobile Support**: Touch-friendly controls and responsive layouts
- **Accessibility**: Full screen reader support and keyboard navigation
- **Performance Monitoring**: Real-time performance metrics and optimization
- **Error Boundaries**: Robust error handling with recovery options
- **Social Sharing**: Advanced social media integration with branded content

### 🎨 Available Panels

1. **Drawing Tools Panel** (`drawingTools`)

   - Wall, room, door, and window tools
   - Measurement and annotation tools
   - Grid and snap settings

2. **Furniture Library Panel** (`furnitureLibrary`)

   - Categorized furniture browser
   - Drag-and-drop placement
   - Search and filtering

3. **Material Palette Panel** (`materialPalette`)

   - Material and color swatches
   - Smart color palette generator
   - Lighting controls

4. **Properties Panel** (`properties`)

   - Object property editing
   - Dimension adjustments
   - Layer management

5. **Layers Panel** (`layers`)

   - Layer visibility controls
   - Layer organization
   - Drag-and-drop reordering

6. **3D View Panel** (`view3D`)

   - Real-time 3D preview
   - Camera presets
   - Lighting controls

7. **Collaboration Panel** (`collaboration`)

   - Real-time co-editing
   - Comment system
   - User presence

8. **Export Panel** (`export`)

   - Multiple export formats
   - Quality settings
   - Batch processing

9. **Revision History Panel** (`revisionHistory`)

   - Version control
   - Comparison tools
   - Auto-save settings

10. **CAD Import Panel** (`cadImport`)

    - File format support
    - Layer mapping
    - Import processing

11. **Social Share Panel** (`socialShare`)

    - Social media integration
    - Branded content generation
    - Analytics tracking

12. **Advanced Panel Manager** (`advancedPanelManager`)
    - Panel organization tools
    - Performance monitoring
    - Workspace management

## Usage

### Basic Panel Operations

```typescript
import { usePanelStore } from "../stores/panelStore";

const { showPanel, hidePanel, togglePanel, focusPanel } = usePanelStore();

// Show a panel
showPanel("drawingTools");

// Hide a panel
hidePanel("drawingTools");

// Toggle panel visibility
togglePanel("drawingTools");

// Focus a panel (bring to front and ensure visible)
focusPanel("drawingTools");
```

### Keyboard Shortcuts

| Shortcut             | Action                   |
| -------------------- | ------------------------ |
| `Ctrl/Cmd + 1`       | Toggle Drawing Tools     |
| `Ctrl/Cmd + 2`       | Toggle Furniture Library |
| `Ctrl/Cmd + 3`       | Toggle Material Palette  |
| `Ctrl/Cmd + 4`       | Toggle Properties        |
| `Ctrl/Cmd + 5`       | Toggle Layers            |
| `Ctrl/Cmd + 6`       | Toggle 3D View           |
| `Ctrl/Cmd + 0`       | Reset Panel Layout       |
| `Alt + 1-9`          | Focus Specific Panel     |
| `Ctrl/Cmd + Alt + M` | Minimize All Panels      |
| `Ctrl/Cmd + Alt + R` | Restore All Panels       |
| `Escape`             | Minimize All Panels      |

### Creating Custom Panels

```typescript
import React from "react";
import { FloatingPanel } from "../ui/floating-panel";

export const MyCustomPanel: React.FC = () => {
  return (
    <FloatingPanel panelId="myCustomPanel">
      <div className="space-y-4">
        <h3 className="font-semibold">My Custom Panel</h3>
        {/* Panel content */}
      </div>
    </FloatingPanel>
  );
};
```

### Panel Configuration

Add your panel to the panel store configuration:

```typescript
// In stores/panelStore.ts
export const PANEL_CONFIGS: Record<string, PanelConfig> = {
  myCustomPanel: {
    id: "myCustomPanel",
    title: "My Custom Panel",
    icon: "Settings",
    defaultPosition: { x: 100, y: 100 },
    defaultSize: { width: 300, height: 400 },
    minSize: { width: 250, height: 300 },
    resizable: true,
    minimizable: true,
    closable: true,
    keyboardShortcut: "c",
    category: "tools",
    dockable: true,
    groupable: true,
  },
};
```

### Workspace Management

```typescript
const {
  createWorkspaceLayout,
  switchWorkspace,
  exportPanelLayout,
  importPanelLayout,
} = usePanelStore();

// Save current layout as workspace
const workspaceId = createWorkspaceLayout("My Workspace", "Description");

// Switch to a workspace
switchWorkspace(workspaceId);

// Export layout to JSON
const layoutData = exportPanelLayout();

// Import layout from JSON
importPanelLayout(layoutData);
```

### Panel Grouping

```typescript
const { createGroup, removeGroup, addPanelToGroup } = usePanelStore();

// Create a group
const groupId = createGroup("Design Tools", ["drawingTools", "properties"]);

// Add panel to existing group
addPanelToGroup("furnitureLibrary", groupId);

// Remove group
removeGroup(groupId);
```

## Architecture

### Store Structure

The panel system uses Zustand for state management with the following structure:

```typescript
interface PanelStore {
  panels: Record<string, PanelState>;
  panelGroups: Record<string, PanelGroup>;
  workspacePresets: Record<string, WorkspacePreset>;
  // ... methods
}
```

### Component Hierarchy

```
FloorPlannerApp
├── PanelAccessibilityProvider
├── ErrorBoundary
├── TooltipProvider
├── ResponsivePanelManager
├── DragDropProvider
├── PanelOnboarding
└── IntegratedFloatingPanel (for each panel)
    └── FloatingPanel
        └── PanelErrorBoundary
            └── Panel Content
```

### Performance Optimization

The system includes several performance optimizations:

- **Lazy Loading**: Panels are only rendered when visible
- **Error Boundaries**: Isolated error handling prevents system crashes
- **Performance Monitoring**: Real-time metrics and optimization suggestions
- **Memory Management**: Automatic cleanup and garbage collection
- **Virtualization**: Large lists are virtualized for better performance

## Accessibility

### Screen Reader Support

- All panels have proper ARIA labels and roles
- Live regions announce panel state changes
- Keyboard navigation between panels
- Focus management and trapping

### Keyboard Navigation

- Tab navigation between panels
- Arrow key navigation within panels
- Escape key to close/minimize panels
- Custom shortcuts for power users

### Mobile Accessibility

- Touch-friendly controls
- Gesture support
- Responsive layouts
- Voice control compatibility

## Testing

### Integration Tests

The system includes comprehensive integration tests:

```typescript
import { PanelIntegrationTest } from "../ui/panel-integration-test";

// Run all tests
<PanelIntegrationTest />;
```

Test categories:

- Basic panel operations
- Panel positioning and resizing
- Panel grouping and workspace management
- Performance and stress testing
- Integration with main application

### Manual Testing Checklist

- [ ] All panels can be shown/hidden
- [ ] Panels can be moved and resized
- [ ] Keyboard shortcuts work correctly
- [ ] Mobile touch controls function properly
- [ ] Error boundaries catch and handle errors
- [ ] Performance remains smooth with multiple panels
- [ ] Accessibility features work with screen readers

## Troubleshooting

### Common Issues

1. **Panel Not Showing**

   - Check if panel is registered in PANEL_CONFIGS
   - Verify panel state in store
   - Check for JavaScript errors in console

2. **Performance Issues**

   - Use Performance Monitor in Advanced Panel Manager
   - Hide unused panels
   - Check for memory leaks
   - Reduce number of visible panels

3. **Keyboard Shortcuts Not Working**

   - Verify keyboardShortcutsEnabled is true
   - Check for conflicting shortcuts
   - Ensure focus is not in input fields

4. **Mobile Issues**
   - Test touch gestures
   - Check responsive breakpoints
   - Verify mobile-specific components

### Debug Tools

- **Performance Monitor**: Real-time metrics and recommendations
- **Panel Integration Tests**: Comprehensive test suite
- **Error Boundaries**: Detailed error reporting
- **Console Logging**: Detailed debug information in development

## Contributing

### Adding New Panels

1. Create panel component extending FloatingPanel
2. Add configuration to PANEL_CONFIGS
3. Register in main application
4. Add keyboard shortcut if needed
5. Write tests
6. Update documentation

### Best Practices

- Use TypeScript for type safety
- Follow accessibility guidelines
- Include error boundaries
- Write comprehensive tests
- Document all features
- Optimize for performance

## API Reference

### Panel Store Methods

#### Basic Operations

- `showPanel(panelId: string)`: Show a panel
- `hidePanel(panelId: string)`: Hide a panel
- `togglePanel(panelId: string)`: Toggle panel visibility
- `focusPanel(panelId: string)`: Focus a panel
- `minimizePanel(panelId: string)`: Minimize a panel
- `maximizePanel(panelId: string)`: Maximize a panel

#### Advanced Operations

- `createGroup(name: string, panelIds: string[])`: Create panel group
- `createWorkspaceLayout(name: string, description?: string)`: Save workspace
- `exportPanelLayout()`: Export layout to JSON
- `importPanelLayout(data: string)`: Import layout from JSON
- `resetPanelLayout()`: Reset to default layout

#### Utility Methods

- `getVisiblePanels()`: Get list of visible panels
- `isPanelVisible(panelId: string)`: Check if panel is visible
- `snapPanelToEdges(panelId: string)`: Snap panel to screen edges
- `alignPanelsToGrid(gridSize: number)`: Align panels to grid

## License

This panel system is part of the FloorPlanner application and follows the same licensing terms.
