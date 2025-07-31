// Geometry and measurement utilities for the FloorPlanner

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Convert pixels to meters based on grid scale
 */
export const pixelsToMeters = (pixels, gridSize = 50) => {
  return pixels / gridSize
}

/**
 * Convert meters to pixels based on grid scale
 */
export const metersToPixels = (meters, gridSize = 50) => {
  return meters * gridSize
}

/**
 * Snap point to grid
 */
export const snapToGrid = (x, y, gridSize = 50) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  }
}

/**
 * Calculate wall length from points array
 */
export const calculateWallLength = (points) => {
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
export const calculateRoomArea = (width, height) => {
  return width * height
}

/**
 * Format measurement for display
 */
export const formatMeasurement = (value, unit = 'm', precision = 2) => {
  return `${value.toFixed(precision)} ${unit}`
}

/**
 * Check if point is inside rectangle
 */
export const isPointInRect = (pointX, pointY, rectX, rectY, rectWidth, rectHeight) => {
  return pointX >= rectX && 
         pointX <= rectX + rectWidth && 
         pointY >= rectY && 
         pointY <= rectY + rectHeight
}

/**
 * Get bounding box for a set of points
 */
export const getBoundingBox = (points) => {
  if (points.length < 2) return null
  
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
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
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
export const validateFloorPlan = (data) => {
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
  data.walls?.forEach((wall, index) => {
    if (!wall.points || wall.points.length < 4) {
      errors.push(`Wall ${index} has invalid points`)
    }
  })
  
  // Validate rooms
  data.rooms?.forEach((room, index) => {
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
export const exportAsSVG = (floorPlanData, options = {}) => {
  const { width = 800, height = 600, scale = 1 } = options
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  
  // Add background
  svg += `<rect width="100%" height="100%" fill="white"/>`
  
  // Add walls
  floorPlanData.walls?.forEach(wall => {
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
  floorPlanData.rooms?.forEach(room => {
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
  floorPlanData.furniture?.forEach(item => {
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
