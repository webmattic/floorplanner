# Properties Panel

The Properties Panel is a floating, repositionable panel that allows users to edit properties of selected objects in the FloorPlanner application.

## Features

### Object Property Editing

- **Basic Properties**: Edit position (x, y), dimensions (width, height), and labels for rooms and furniture
- **Wall Properties**: Adjust wall thickness with a slider control
- **Real-time Updates**: Changes are applied immediately to the selected objects

### Material Settings

- **Color Picker**: Choose colors using a color input or hex value input
- **Quick Color Swatches**: 12 predefined material colors for quick selection
- **Texture Selection**: Choose from various texture patterns (solid, brick, wood, stone, tile, marble, fabric, leather, carpet, concrete)
- **Visual Feedback**: Material swatches show texture patterns and colors

### Layer Assignment

- **Layer Management**: Assign objects to different layers for organization
- **Layer Visibility**: Toggle layer visibility with eye/eye-off icons
- **Layer Locking**: Lock/unlock layers to prevent accidental edits
- **Color-coded Layers**: Each layer has a distinct color for easy identification

### Precise Dimension Controls

- **Input Validation**: Numeric inputs with minimum value constraints
- **Unit Display**: Clear labeling of measurement units
- **Slider Controls**: For properties like wall thickness with visual feedback

### Object Actions

- **Duplicate**: Create a copy of the selected object with offset positioning
- **Delete**: Remove selected objects with confirmation
- **Selection Management**: Clear selection and view selection status

## Usage

### Selecting Objects

1. Click on objects in the canvas to select them
2. The Properties Panel will automatically display the properties of the selected object
3. Multiple selection shows count but edits apply to the first selected object

### Editing Properties

1. **Basic Properties**: Use input fields to change position, dimensions, and labels
2. **Colors**: Click the color picker or use quick color swatches
3. **Textures**: Select from the texture dropdown menu
4. **Layers**: Choose a layer from the layer assignment dropdown

### Layer Management

1. Switch to the "Layers" tab to manage layers
2. Toggle visibility with the eye icon
3. Lock/unlock layers with the lock icon
4. Add new layers with the "Add Layer" button

## Technical Implementation

### State Management

- Uses Zustand store for floor plan data
- Integrates with panel store for floating panel behavior
- Real-time updates through store subscriptions

### Component Structure

```
PropertiesPanel
├── Properties Tab
│   ├── Element Header (type, ID, selection count)
│   ├── Basic Properties (position, dimensions, label)
│   ├── Material & Color (color picker, swatches, texture)
│   ├── Layer Assignment (dropdown selection)
│   └── Actions (duplicate, delete)
└── Layers Tab
    ├── Layer Management (add layer button)
    ├── Layer List (visibility, lock controls)
    └── Layer Tips (help information)
```

### Supported Object Types

- **Walls**: thickness, color, texture
- **Rooms**: position, dimensions, label, color, texture, layer
- **Furniture**: position, dimensions, label, color, texture, layer

### Validation

- Minimum dimension constraints (width/height >= 1)
- Numeric input validation
- Color format validation (hex codes)

## Requirements Fulfilled

This implementation fulfills the following requirements from the task:

1. **✅ Create floating Properties Panel using shadcn Label, Input, Select, and Slider**

   - Uses FloatingPanel component with shadcn UI components
   - Label, Input, Select, and Slider components integrated throughout

2. **✅ Implement object property editing with form components for selected objects**

   - Form inputs for position, dimensions, labels
   - Real-time updates to selected objects
   - Support for walls, rooms, and furniture

3. **✅ Add material settings with visual swatches and texture controls**

   - Color picker with hex input
   - 12 quick color swatches with tooltips
   - Texture dropdown with visual icons
   - Material preview with texture patterns

4. **✅ Create precise dimension adjustment tools with input validation**

   - Numeric inputs with min/max constraints
   - Slider for wall thickness with visual feedback
   - Input validation and error handling
   - Unit display and formatting

5. **✅ Add layer assignment functionality with dropdown selection**
   - Layer dropdown with color-coded options
   - Layer management interface
   - Visibility and lock controls
   - Default layer system with 6 predefined layers

## Integration

The Properties Panel integrates with:

- **FloorPlanStore**: For object data and updates
- **PanelStore**: For floating panel behavior
- **FloatingPanel**: For drag, resize, and minimize functionality
- **Main App**: Automatically shows/hides based on panel store state

## Testing

The component includes comprehensive tests covering:

- Rendering without crashes
- Property display for different object types
- Property updates and validation
- Layer management functionality
- Material and color selection
- Object actions (duplicate, delete)

## Future Enhancements

Potential improvements:

- Undo/redo integration
- Batch editing for multiple selections
- Custom layer creation and management
- Advanced material properties
- Property presets and templates
- Keyboard shortcuts for common actions
