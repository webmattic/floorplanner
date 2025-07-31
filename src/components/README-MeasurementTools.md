# Measurement Tools

The Measurement Tools component provides a set of tools for measuring distances, areas, and angles in the FloorPlanner application. It also includes features for detecting clearance issues and using virtual tape measures.

## Features

### Measurement Types

- Linear Measurement: Measures the distance between two points
- Area Measurement: Measures the area of a region
- Angle Measurement: Measures angles between lines

### Virtual Tape Measure

A draggable measuring tool that can be moved around the canvas to check distances between objects without creating permanent measurements.

### Clearance Detection

Automatically detects potential clearance issues in the design, such as:

- Door swing areas obstructed by furniture
- Furniture placed too close to wall outlets
- Insufficient walking space between furniture items

### Customizable Units

Supports multiple measurement units:

- Feet (ft)
- Meters (m)
- Pixels (px)

## How to Use

1. Select a measurement tool type (Linear, Area, or Angle)
2. Click on the canvas to place measurement points
3. View measurements in the list
4. Toggle the Virtual Tape Measure to check distances on-the-fly
5. Enable Clearance Detection to see potential issues
6. Change the measurement unit as needed

## Implementation

The Measurement Tools component integrates with the floorPlanStore to:

- Store and retrieve measurements
- Toggle clearance detection
- Change measurement units
- Get clearance issues

The store provides methods for adding and removing measurements, which are automatically updated when elements in the floor plan are moved or resized.

## Testing

Tests for the Measurement Tools component can be run using Jest:

```bash
npm test
```
