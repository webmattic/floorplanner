// Geometry and measurement utilities for the FloorPlanner

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Convert pixels to meters based on grid scale
 */
export const pixelsToMeters = (pixels, gridSize = 50) => {
  return pixels / gridSize;
};

/**
 * Convert meters to pixels based on grid scale
 */
export const metersToPixels = (meters, gridSize = 50) => {
  return meters * gridSize;
};

/**
 * Snap point to grid
 */
export const snapToGrid = (x, y, gridSize = 50) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
};

/**
 * Calculate wall length from points array
 */
export const calculateWallLength = (points) => {
  if (points.length < 4) return 0;

  let length = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    length += calculateDistance(
      points[i],
      points[i + 1],
      points[i + 2],
      points[i + 3]
    );
  }
  return length;
};

/**
 * Calculate room area
 */
export const calculateRoomArea = (width, height) => {
  return width * height;
};

/**
 * Calculate polygon area using shoelace formula
 */
export const calculatePolygonArea = (points) => {
  if (points.length < 6) return 0; // Need at least 3 points (6 coordinates)

  let area = 0;
  const n = points.length / 2;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i * 2] * points[j * 2 + 1];
    area -= points[j * 2] * points[i * 2 + 1];
  }

  return Math.abs(area) / 2;
};

/**
 * Calculate perimeter of a polygon
 */
export const calculatePolygonPerimeter = (points) => {
  if (points.length < 4) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length - 2; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[i + 2] || points[0];
    const y2 = points[i + 3] || points[1];
    perimeter += calculateDistance(x1, y1, x2, y2);
  }

  return perimeter;
};

/**
 * Convert between measurement units
 */
export const convertUnit = (value, fromUnit, toUnit, gridSize = 50) => {
  // First convert to pixels as base unit
  let pixels = value;

  if (fromUnit === "m") {
    pixels = metersToPixels(value, gridSize);
  } else if (fromUnit === "ft") {
    pixels = value * gridSize * 0.3048; // feet to meters to pixels
  }

  // Then convert from pixels to target unit
  if (toUnit === "m") {
    return pixelsToMeters(pixels, gridSize);
  } else if (toUnit === "ft") {
    return pixelsToMeters(pixels, gridSize) / 0.3048; // meters to feet
  }

  return pixels; // return as pixels
};

/**
 * Format measurement for display with unit conversion
 */
export const formatMeasurement = (value, unit = "m", precision = 2) => {
  const unitLabels = {
    m: "m",
    ft: "ft",
    px: "px",
  };

  return `${value.toFixed(precision)} ${unitLabels[unit] || unit}`;
};

/**
 * Format area measurement for display
 */
export const formatAreaMeasurement = (value, unit = "m", precision = 2) => {
  const unitLabels = {
    m: "m²",
    ft: "ft²",
    px: "px²",
  };

  return `${value.toFixed(precision)} ${unitLabels[unit] || unit}²`;
};

/**
 * Check if point is inside rectangle
 */
export const isPointInRect = (
  pointX,
  pointY,
  rectX,
  rectY,
  rectWidth,
  rectHeight
) => {
  return (
    pointX >= rectX &&
    pointX <= rectX + rectWidth &&
    pointY >= rectY &&
    pointY <= rectY + rectHeight
  );
};

/**
 * Get bounding box for a set of points
 */
export const getBoundingBox = (points) => {
  if (points.length < 2) return null;

  let minX = points[0];
  let maxX = points[0];
  let minY = points[1];
  let maxY = points[1];

  for (let i = 2; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]);
    maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]);
    maxY = Math.max(maxY, points[i + 1]);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Generate unique ID
 */
export const generateId = (prefix = "element") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check clearance between elements
 */
export const checkClearance = (element1, element2, minClearance = 30) => {
  // Calculate minimum distance between two rectangular elements
  const e1 = element1;
  const e2 = element2;

  const e1Right = e1.x + e1.width;
  const e1Bottom = e1.y + e1.height;
  const e2Right = e2.x + e2.width;
  const e2Bottom = e2.y + e2.height;

  // Check if elements overlap
  if (e1.x < e2Right && e1Right > e2.x && e1.y < e2Bottom && e1Bottom > e2.y) {
    return { hasIssue: true, distance: 0, type: "overlap" };
  }

  // Calculate distances
  let distance = Infinity;

  // Horizontal distance
  if (e1Right < e2.x) {
    distance = Math.min(distance, e2.x - e1Right);
  } else if (e2Right < e1.x) {
    distance = Math.min(distance, e1.x - e2Right);
  }

  // Vertical distance
  if (e1Bottom < e2.y) {
    distance = Math.min(distance, e2.y - e1Bottom);
  } else if (e2Bottom < e1.y) {
    distance = Math.min(distance, e1.y - e2Bottom);
  }

  if (distance === Infinity) {
    distance = 0; // Elements are aligned but not overlapping
  }

  return {
    hasIssue: distance < minClearance,
    distance,
    type: distance < minClearance ? "insufficient_clearance" : "adequate",
  };
};

/**
 * Check door swing clearance
 */
export const checkDoorSwingClearance = (door, furniture, walls = []) => {
  const issues = [];
  const doorWidth = door.width || 80; // Standard door width
  const swingRadius = doorWidth * 1.2; // Door swing requires 120% of door width

  // Create door swing arc points
  const swingCenter = { x: door.x, y: door.y };
  const swingArc = [];

  for (let angle = 0; angle <= 90; angle += 10) {
    const radians = (angle * Math.PI) / 180;
    swingArc.push({
      x: swingCenter.x + Math.cos(radians) * swingRadius,
      y: swingCenter.y + Math.sin(radians) * swingRadius,
    });
  }

  // Check if furniture interferes with door swing
  furniture.forEach((item) => {
    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;
    const distanceToCenter = calculateDistance(
      swingCenter.x,
      swingCenter.y,
      itemCenterX,
      itemCenterY
    );

    if (distanceToCenter < swingRadius) {
      // Check if the furniture is in the swing path
      const angle =
        (Math.atan2(itemCenterY - swingCenter.y, itemCenterX - swingCenter.x) *
          180) /
        Math.PI;
      if (angle >= 0 && angle <= 90) {
        issues.push({
          id: `door_clearance_${door.id}_${item.id}`,
          elementType: "door",
          elementId: door.id,
          description: `Door cannot swing open - ${
            item.label || "furniture"
          } is blocking the path`,
          severity: "error",
          affectedElement: item,
        });
      }
    }
  });

  return issues;
};

/**
 * Calculate minimum walking clearance
 */
export const calculateWalkingClearance = (element, adjacentElements) => {
  const minWalkingSpace = 90; // 36 inches in pixels
  const issues = [];

  adjacentElements.forEach((adjacent) => {
    const clearance = checkClearance(element, adjacent);
    if (clearance.hasIssue && clearance.distance < minWalkingSpace) {
      issues.push({
        id: `walking_clearance_${element.id}_${adjacent.id}`,
        elementType: element.type || "element",
        elementId: element.id,
        description: `Insufficient walking space between ${
          element.label || "element"
        } and ${adjacent.label || "adjacent element"}`,
        severity: "warning",
        affectedElement: adjacent,
      });
    }
  });

  return issues;
};

/**
 * Calculate real-time dimensions during drawing
 */
export const calculateRealTimeDimensions = (
  startPoint,
  currentPoint,
  unit = "m",
  gridSize = 50
) => {
  const width = Math.abs(currentPoint.x - startPoint.x);
  const height = Math.abs(currentPoint.y - startPoint.y);
  const diagonal = calculateDistance(
    startPoint.x,
    startPoint.y,
    currentPoint.x,
    currentPoint.y
  );

  // Convert to desired unit
  const convertedWidth = convertUnit(width, "px", unit, gridSize);
  const convertedHeight = convertUnit(height, "px", unit, gridSize);
  const convertedDiagonal = convertUnit(diagonal, "px", unit, gridSize);

  return {
    width: convertedWidth,
    height: convertedHeight,
    diagonal: convertedDiagonal,
    area: convertedWidth * convertedHeight,
    formatted: {
      width: formatMeasurement(convertedWidth, unit),
      height: formatMeasurement(convertedHeight, unit),
      diagonal: formatMeasurement(convertedDiagonal, unit),
      area: formatAreaMeasurement(convertedWidth * convertedHeight, unit),
    },
  };
};

/**
 * Calculate automatic room measurements
 */
export const calculateAutomaticRoomMeasurements = (
  room,
  unit = "m",
  gridSize = 50
) => {
  const width = convertUnit(room.width, "px", unit, gridSize);
  const height = convertUnit(room.height, "px", unit, gridSize);
  const area = width * height;
  const perimeter = 2 * (width + height);

  return {
    width,
    height,
    area,
    perimeter,
    formatted: {
      width: formatMeasurement(width, unit),
      height: formatMeasurement(height, unit),
      area: formatAreaMeasurement(area, unit),
      perimeter: formatMeasurement(perimeter, unit),
    },
  };
};

/**
 * Get measurement annotations for elements
 */
export const getMeasurementAnnotations = (
  elements,
  unit = "m",
  gridSize = 50
) => {
  return elements.map((element) => {
    if (element.type === "room" || (element.width && element.height)) {
      const measurements = calculateAutomaticRoomMeasurements(
        element,
        unit,
        gridSize
      );
      return {
        ...element,
        measurements,
        annotations: [
          {
            type: "dimension",
            position: "top",
            value: measurements.formatted.width,
          },
          {
            type: "dimension",
            position: "right",
            value: measurements.formatted.height,
          },
          {
            type: "area",
            position: "center",
            value: measurements.formatted.area,
          },
        ],
      };
    } else if (element.type === "wall" && element.points) {
      const length = calculateWallLength(element.points);
      const convertedLength = convertUnit(length, "px", unit, gridSize);
      return {
        ...element,
        measurements: { length: convertedLength },
        annotations: [
          {
            type: "length",
            position: "center",
            value: formatMeasurement(convertedLength, unit),
          },
        ],
      };
    }
    return element;
  });
};

/**
 * Validate floor plan data
 */
export const validateFloorPlan = (data) => {
  const errors = [];

  if (!data.walls || !Array.isArray(data.walls)) {
    errors.push("Walls data is invalid");
  }

  if (!data.rooms || !Array.isArray(data.rooms)) {
    errors.push("Rooms data is invalid");
  }

  if (!data.furniture || !Array.isArray(data.furniture)) {
    errors.push("Furniture data is invalid");
  }

  // Validate walls
  data.walls?.forEach((wall, index) => {
    if (!wall.points || wall.points.length < 4) {
      errors.push(`Wall ${index} has invalid points`);
    }
  });

  // Validate rooms
  data.rooms?.forEach((room, index) => {
    if (!room.x || !room.y || !room.width || !room.height) {
      errors.push(`Room ${index} is missing required dimensions`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Export floor plan as SVG
 */
export const exportAsSVG = (floorPlanData, options = {}) => {
  const { width = 800, height = 600, scale = 1 } = options;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Add background
  svg += `<rect width="100%" height="100%" fill="white"/>`;

  // Add walls
  floorPlanData.walls?.forEach((wall) => {
    if (wall.points && wall.points.length >= 4) {
      svg += `<polyline points="${wall.points.join(" ")}" 
                stroke="${wall.color || "#374151"}" 
                stroke-width="${(wall.thickness || 8) * scale}" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>`;
    }
  });

  // Add rooms
  floorPlanData.rooms?.forEach((room) => {
    svg += `<rect x="${room.x * scale}" 
                  y="${room.y * scale}" 
                  width="${room.width * scale}" 
                  height="${room.height * scale}" 
                  fill="${room.color || "rgba(59, 130, 246, 0.1)"}" 
                  stroke="#9ca3af" 
                  stroke-width="${1 * scale}"/>`;

    if (room.label) {
      svg += `<text x="${(room.x + 5) * scale}" 
                    y="${(room.y + 20) * scale}" 
                    font-family="Arial, sans-serif" 
                    font-size="${12 * scale}" 
                    fill="#374151">${room.label}</text>`;
    }
  });

  // Add furniture
  floorPlanData.furniture?.forEach((item) => {
    svg += `<rect x="${item.x * scale}" 
                  y="${item.y * scale}" 
                  width="${item.width * scale}" 
                  height="${item.height * scale}" 
                  fill="${item.color || "#8b5cf6"}" 
                  stroke="#6b7280" 
                  stroke-width="${1 * scale}"/>`;

    if (item.label) {
      svg += `<text x="${(item.x + 5) * scale}" 
                    y="${(item.y + 15) * scale}" 
                    font-family="Arial, sans-serif" 
                    font-size="${10 * scale}" 
                    fill="white">${item.label}</text>`;
    }
  });

  svg += "</svg>";
  return svg;
};
