// Geometry and measurement utilities for the FloorPlanner

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Convert pixels to meters based on grid scale
 */
export const pixelsToMeters = (pixels: number, gridSize: number = 50): number => {
  return pixels / gridSize
}

/**
 * Convert meters to pixels based on grid scale
 */
export const metersToPixels = (meters: number, gridSize: number = 50): number => {
  return meters * gridSize
}

/**
 * Snap point to grid
 */
export const snapToGrid = (x: number, y: number, gridSize: number = 50): { x: number; y: number } => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  }
}

/**
 * Calculate wall length from points array
 */
export const calculateWallLength = (points: number[]): number => {
  if (points.length < 4) return 0
  
  let length = 0
  for (let i = 0; i < points.length - 2; i += 2) {
    length += calculateDistance(
      points[i], points[i + 1],
      points[i + 2], points[i + 3]
    )
  }
  return length
}

/**
 * Calculate room area
 */
export const calculateRoomArea = (width: number, height: number): number => {
  return width * height
}

/**
 * Format measurement for display
 */
export const formatMeasurement = (value: number, unit: string = 'm', precision: number = 2): string => {
  return `${value.toFixed(precision)} ${unit}`
}

/**
 * Check if point is inside rectangle
 */
export const isPointInRect = (pointX: number, pointY: number, rectX: number, rectY: number, rectWidth: number, rectHeight: number): boolean => {
  return pointX >= rectX && 
         pointX <= rectX + rectWidth && 
         pointY >= rectY && 
         pointY <= rectY + rectHeight
}

/**
 * Get bounding box for a set of points
 */
export const getBoundingBox = (points: number[]): { minX: number; minY: number; maxX: number; maxY: number } => {
  if (points.length < 2) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  
  let minX = points[0]
  let maxX = points[0]
  let minY = points[1]
  let maxY = points[1]
  
  for (let i = 2; i < points.length; i += 2) {
    minX = Math.min(minX, points[i])
    maxX = Math.max(maxX, points[i])
    minY = Math.min(minY, points[i + 1])
    maxY = Math.max(maxY, points[i + 1])
  }
  
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  }
}

/**
 * Generate unique ID
 */
export const generateId = (prefix = 'element') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate floor plan data
 */
export const validateFloorPlan = (data: any): { isValid: boolean; errors: string[] } => {
  const errors = []
  
  if (!data.walls || !Array.isArray(data.walls)) {
    errors.push('Walls data is invalid')
  }
  
  if (!data.rooms || !Array.isArray(data.rooms)) {
    errors.push('Rooms data is invalid')
  }
  
  if (!data.furniture || !Array.isArray(data.furniture)) {
    errors.push('Furniture data is invalid')
  }
  
  // Validate walls
  data.walls?.forEach((wall: any, index: number) => {
    if (!wall.points || wall.points.length < 4) {
      errors.push(`Wall ${index} has invalid points`)
    }
  })
  
  // Validate rooms
  data.rooms?.forEach((room: any, index: number) => {
    if (!room.x || !room.y || !room.width || !room.height) {
      errors.push(`Room ${index} is missing required dimensions`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Export floor plan as SVG
 */
export const exportAsSVG = (floorPlanData: any, options: { width?: number; height?: number; scale?: number } = {}): string => {
  const { width = 800, height = 600, scale = 1 } = options
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  
  // Add background
  svg += `<rect width="100%" height="100%" fill="white"/>`
  
  // Add walls
  floorPlanData.walls?.forEach((wall: any) => {
    if (wall.points && wall.points.length >= 4) {
      svg += `<polyline points="${wall.points.join(' ')}" 
                stroke="${wall.color || '#374151'}" 
                stroke-width="${(wall.thickness || 8) * scale}" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>`
    }
  })
  
  // Add rooms
  floorPlanData.rooms?.forEach((room: any) => {
    svg += `<rect x="${room.x * scale}" 
                  y="${room.y * scale}" 
                  width="${room.width * scale}" 
                  height="${room.height * scale}" 
                  fill="${room.color || 'rgba(59, 130, 246, 0.1)'}" 
                  stroke="#9ca3af" 
                  stroke-width="${1 * scale}"/>`
    
    if (room.label) {
      svg += `<text x="${(room.x + 5) * scale}" 
                    y="${(room.y + 20) * scale}" 
                    font-family="Arial, sans-serif" 
                    font-size="${12 * scale}" 
                    fill="#374151">${room.label}</text>`
    }
  })
  
  // Add furniture
  floorPlanData.furniture?.forEach((item: any) => {
    svg += `<rect x="${item.x * scale}" 
                  y="${item.y * scale}" 
                  width="${item.width * scale}" 
                  height="${item.height * scale}" 
                  fill="${item.color || '#8b5cf6'}" 
                  stroke="#6b7280" 
                  stroke-width="${1 * scale}"/>`
    
    if (item.label) {
      svg += `<text x="${(item.x + 5) * scale}" 
                    y="${(item.y + 15) * scale}" 
                    font-family="Arial, sans-serif" 
                    font-size="${10 * scale}" 
                    fill="white">${item.label}</text>`
    }
  })
  
  svg += '</svg>'
  return svg
}

/**
 * Check clearance between two objects
 */
export const checkClearance = (obj1: any, obj2: any, minClearance: number) => {
  const distance = calculateDistance(
    obj1.x + obj1.width / 2,
    obj1.y + obj1.height / 2,
    obj2.x + obj2.width / 2,
    obj2.y + obj2.height / 2
  );
  
  const requiredDistance = minClearance + (obj1.width + obj1.height + obj2.width + obj2.height) / 4;
  
  return {
    hasIssue: distance < requiredDistance,
    distance: distance,
    type: distance < requiredDistance / 2 ? 'overlap' : 'insufficient'
  };
};

/**
 * Check door swing clearance
 */
export const checkDoorSwingClearance = (door: any, furniture: any[], walls: any[]) => {
  const issues: any[] = [];
  
  // Simplified door swing check - in a real implementation this would be more complex
  furniture.forEach(item => {
    const distance = calculateDistance(door.x, door.y, item.x, item.y);
    if (distance < 100) { // 100px door swing clearance
      issues.push({
        id: `door_swing_${door.id}_${item.id}`,
        elementType: 'furniture',
        elementId: item.id,
        description: `${item.label || 'Furniture'} may block door swing`,
        severity: 'warning'
      });
    }
  });
  
  return issues;
};

/**
 * Calculate walking clearance
 */
export const calculateWalkingClearance = (item: any, otherFurniture: any[]) => {
  const issues: any[] = [];
  
  // Check if there's enough walking space around furniture
  otherFurniture.forEach(other => {
    const distance = calculateDistance(item.x, item.y, other.x, other.y);
    if (distance < 80) { // 80px minimum walking clearance
      issues.push({
        id: `walking_clearance_${item.id}_${other.id}`,
        elementType: 'furniture',
        elementId: item.id,
        description: `Insufficient walking space between furniture items`,
        severity: 'warning'
      });
    }
  });
  
  return issues;
};

/**
 * Calculate automatic room measurements
 */
export const calculateAutomaticRoomMeasurements = (room: any, unit: string) => {
  const area = calculateRoomArea(room.width, room.height);
  const perimeter = 2 * (room.width + room.height);
  
  return {
    area: area,
    perimeter: perimeter,
    width: room.width,
    height: room.height,
    unit: unit
  };
};

/**
 * Convert units
 */
export const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
  // Simplified unit conversion - in a real app this would be more comprehensive
  const pixelsPerMeter = 50; // Assuming 50 pixels = 1 meter
  const pixelsPerFoot = 16.67; // Assuming 16.67 pixels = 1 foot
  
  let valueInPixels = value;
  
  // Convert from source unit to pixels
  if (fromUnit === 'm') {
    valueInPixels = value * pixelsPerMeter;
  } else if (fromUnit === 'ft') {
    valueInPixels = value * pixelsPerFoot;
  }
  
  // Convert from pixels to target unit
  if (toUnit === 'm') {
    return valueInPixels / pixelsPerMeter;
  } else if (toUnit === 'ft') {
    return valueInPixels / pixelsPerFoot;
  }
  
  return valueInPixels; // Return pixels if no conversion needed
};

/**
 * Calculate real-time dimensions
 */
export const calculateRealTimeDimensions = (startPoint: any, currentPoint: any, unit: string) => {
  const distance = calculateDistance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);
  const width = Math.abs(currentPoint.x - startPoint.x);
  const height = Math.abs(currentPoint.y - startPoint.y);
  
  return {
    distance: convertUnit(distance, 'px', unit),
    width: convertUnit(width, 'px', unit),
    height: convertUnit(height, 'px', unit),
    unit: unit
  };
};

/**
 * Get measurement annotations
 */
export const getMeasurementAnnotations = (elements: any[], unit: string) => {
  const annotations: any[] = [];
  
  elements.forEach(element => {
    if (element.type === 'room') {
      annotations.push({
        id: `annotation_${element.id}`,
        x: element.x + element.width / 2,
        y: element.y + element.height / 2,
        text: `${convertUnit(element.width, 'px', unit).toFixed(1)} × ${convertUnit(element.height, 'px', unit).toFixed(1)} ${unit}`,
        type: 'dimension'
      });
    }
  });
  
  return annotations;
};