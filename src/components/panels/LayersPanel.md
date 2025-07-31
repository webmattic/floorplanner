# Layers Panel

The Layers Panel is a floating, repositionable panel that provides comprehensive layer management functionality for organizing floor plan elements in the FloorPlanner application.

## Features

### Layer Management

- **Default Layers**: 6 predefined layers (Walls, Rooms, Furniture, Doors & Windows, Dimensions, Text & Labels)
- **Custom Layers**: Create unlimited custom layers with user-defined names and colors
- **Layer Organization**: Drag-and-drop reordering with visual feedback
- **Object Counting**: Real-time display of object count per layer

### Layer Controls

- **Visibility Toggle**: Show/hide layers with eye/eye-off icons
- **Lock/Unlock**: Prevent accidental editing with lock controls
- **Color Coding**: Each layer has a distinct color for easy identification
- **Layer Icons**: Type-specific icons for different layer categories

### Layer Creation & Editing

- **Create Dialog**: Modal dialog for creating new layers with name and color selection
- **Edit Dialog**: Modify existing custom layer properties
- **Delete Dialog**: Remove custom layers with confirmation
- **Color Palette**: 15 predefined colors plus custom color picker

### Drag & Drop Reordering

- **Visual Feedback**: Drag indicators and drop zones
- **Smooth Animations**: Transition effects during reordering
- **Order Persistence**: Layer order is maintained across sessions
- **Grip Handles**: Clear drag handles for intuitive interaction

## Usage

### Managing Layers

1. **View Layers**: All layers are displayed in order with their properties
2. **Toggle Visibility**: Click the eye icon to show/hide layer contents
3. **Lock Layers**: Click the lock icon to prevent editing
4. **Reorder Layers**: Drag layers by their grip handle to reorder

### Creating Custom Layers

1. Click the "Add Layer" button
2. Enter a layer name in the dialog
3. Choose a color from the palette or use the color picker
4. Click "Create Layer" to add the new layer

### Editing Layers

1. Click the edit icon on a custom layer
2. Modify the name and/or color
3. Click "Save Changes" to apply modifications

### Deleting Layers

1. Click the delete icon on a custom layer
2. Confirm deletion in the dialog
3. Layer and its assignments are removed

## Technical Implementation

### State Management

- Local state for layer management using React useState
- Integration with FloorPlan store for object counting
- Real-time updates when objects are added/removed

### Component Structure

```
LayersPanel
├── Header (title + Add Layer button)
├── Layers List (scrollable)
│   ├── Layer Cards (draggable)
│   │   ├── Drag Handle
│   │   ├── Color Indicator & Icon
│   │   ├── Layer Info (name, object count)
│   │   └── Controls (visibility, lock, edit, delete)
│   └── Drag & Drop Handlers
├── Layer Statistics (totals)
├── Help Information
└── Dialogs
    ├── Create Layer Dialog
    ├── Edit Layer Dialog
    └── Delete Layer Dialog
```

### Layer Data Structure

```typescript
interface Layer {
  id: string; // Unique identifier
  name: string; // Display name
  color: string; // Hex color code
  visible: boolean; // Visibility state
  locked: boolean; // Lock state
  order: number; // Display order
  objectCount: number; // Number of objects
  type: "default" | "custom"; // Layer type
}
```

### Default Layers

1. **Walls** (#8B4513) - Wall elements
2. **Rooms** (#90EE90) - Room boundaries
3. **Furniture** (#4169E1) - Furniture items
4. **Doors & Windows** (#FF6347) - Openings
5. **Dimensions** (#FFD700) - Measurements
6. **Text & Labels** (#9370DB) - Annotations

### Drag & Drop Implementation

- Uses HTML5 drag and drop API
- Visual feedback with drag states
- Automatic order recalculation
- Smooth animations and transitions

## Requirements Fulfilled

This implementation fulfills the following requirements from task 7:

1. **✅ Create floating Layers Panel using shadcn Button, Switch, and drag-drop components**

   - Uses FloatingPanel with shadcn UI components
   - Button, Switch, Dialog, Input, and other shadcn components integrated

2. **✅ Add layer creation, deletion, and renaming with dialog modals**

   - Create Layer dialog with name and color inputs
   - Edit Layer dialog for modifying properties
   - Delete Layer dialog with confirmation

3. **✅ Implement visibility toggle with switch components and lock/unlock functionality**

   - Eye/eye-off icons for visibility toggle
   - Lock/unlock icons for editing protection
   - Real-time state updates

4. **✅ Create drag-and-drop layer reordering with visual feedback**

   - Drag handles with grip vertical icons
   - Visual feedback during drag operations
   - Smooth reordering with animations

5. **✅ Add layer-based object organization and management**
   - Object counting per layer
   - Layer statistics display
   - Integration with floor plan objects

## Integration

The Layers Panel integrates with:

- **FloorPlanStore**: For object counting and layer assignments
- **PanelStore**: For floating panel behavior
- **FloatingPanel**: For drag, resize, and minimize functionality
- **Main App**: Automatically shows/hides based on panel store state

## Layer Assignment

Objects can be assigned to layers through:

- Properties Panel layer dropdown
- Default layer assignments based on object type
- Programmatic assignment through store actions

## Testing

The component includes comprehensive tests covering:

- Layer creation, editing, and deletion
- Visibility and lock toggles
- Drag and drop reordering
- Object count updates
- Dialog interactions
- Default layer behavior

## Future Enhancements

Potential improvements:

- Layer groups and hierarchies
- Layer-based filtering and search
- Layer templates and presets
- Bulk layer operations
- Layer import/export
- Advanced layer properties (opacity, blend modes)
- Layer-based permissions in collaboration mode

## Accessibility

The component includes:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast color support
- Focus management in dialogs
- Tooltip descriptions for all controls
