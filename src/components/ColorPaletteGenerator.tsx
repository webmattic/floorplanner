import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button";
import { Palette } from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore";

interface ColorScheme {
  name: string;
  colors: string[];
}

const ColorPaletteGenerator: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>("#6366f1");
  const [activeScheme, setActiveScheme] = useState<string>("analogous");

  // Pre-defined color schemes
  const predefinedSchemes: ColorScheme[] = [
    {
      name: "Modern Minimalist",
      colors: ["#F5F5F5", "#EEEEEE", "#E0E0E0", "#212121", "#616161"],
    },
    {
      name: "Warm Natural",
      colors: ["#E6D2AA", "#D5B892", "#C49A6C", "#8B7355", "#5D4E33"],
    },
    {
      name: "Cool Elegant",
      colors: ["#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1", "#006064"],
    },
    {
      name: "Vibrant Pop",
      colors: ["#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE"],
    },
    {
      name: "Scandinavian",
      colors: ["#FFFFFF", "#F5F5F5", "#ECEFF1", "#B0BEC5", "#37474F"],
    },
  ];

  // Generate color schemes based on color theory
  const generateColorScheme = (base: string, scheme: string): string[] => {
    // Parse the hex color
    const r = parseInt(base.substring(1, 3), 16);
    const g = parseInt(base.substring(3, 5), 16);
    const b = parseInt(base.substring(5, 7), 16);

    // Convert to HSL
    const hsl = rgbToHsl(r, g, b);
    let h = hsl[0];
    let s = hsl[1];
    let l = hsl[2];

    switch (scheme) {
      case "analogous":
        return [
          hslToHex(h, s, l),
          hslToHex((h + 30) % 360, s, l),
          hslToHex((h + 60) % 360, s, l),
          hslToHex((h - 30 + 360) % 360, s, l),
          hslToHex((h - 60 + 360) % 360, s, l),
        ];
      case "complementary":
        return [
          hslToHex(h, s, l),
          hslToHex(h, s * 0.8, l * 1.1),
          hslToHex(h, s * 0.5, l * 1.2),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 180) % 360, s * 0.8, l * 1.1),
        ];
      case "triadic":
        return [
          hslToHex(h, s, l),
          hslToHex((h + 120) % 360, s, l),
          hslToHex((h + 240) % 360, s, l),
          hslToHex(h, s * 0.7, l * 1.2),
          hslToHex(h, s * 0.5, l * 1.4),
        ];
      case "monochromatic":
        return [
          hslToHex(h, s, l * 0.6),
          hslToHex(h, s, l * 0.8),
          hslToHex(h, s, l),
          hslToHex(h, s, l * 1.2),
          hslToHex(h, s * 0.8, l * 1.3),
        ];
      default:
        return [base, base, base, base, base];
    }
  };

  // Helper: RGB to HSL conversion
  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [Math.round(h * 360), s, l];
  };

  // Helper: HSL to Hex conversion
  const hslToHex = (h: number, s: number, l: number): string => {
    l = Math.min(Math.max(0, l), 1);
    s = Math.min(Math.max(0, s), 1);

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const rHex = Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, "0");
    const gHex = Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, "0");
    const bHex = Math.round((b + m) * 255)
      .toString(16)
      .padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  // Get color schemes
  const currentColorScheme = generateColorScheme(baseColor, activeScheme);

  const handleApplyColor = (color: string) => {
    // Get the store state
    const store = useFloorPlanStore.getState();

    const selectedElement = store.selectedElements?.[0];

    if (!selectedElement) {
      alert("Please select an element to apply color");
      return;
    }

    // Use TypeScript with casting to work around type issues
    // The store functions exist at runtime but TypeScript doesn't see them properly
    const storeAny = store as any;

    // Get the element type and ID
    const { type, id } = selectedElement;

    // Update the element based on its type
    if (type === "wall") {
      storeAny.updateWall(id, { color });
    } else if (type === "room") {
      storeAny.updateRoom(id, { color });
    } else if (type === "furniture") {
      storeAny.updateFurniture(id, { color });
    } else {
      console.warn(`Unknown element type: ${type}`);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Palettes
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Base color picker */}
        <div>
          <label className="block text-sm font-medium mb-2">Base Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{baseColor.toUpperCase()}</p>
              <p className="text-xs text-gray-500">
                Click to select a base color
              </p>
            </div>
          </div>
        </div>

        {/* Color scheme selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Color Theory</label>
          <div className="grid grid-cols-2 gap-2">
            {["analogous", "complementary", "triadic", "monochromatic"].map(
              (scheme) => (
                <Button
                  key={scheme}
                  variant={activeScheme === scheme ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveScheme(scheme)}
                  className="capitalize"
                >
                  {scheme}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Generated color scheme */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Generated Palette
          </label>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {currentColorScheme.map((color, index) => (
              <Button
                key={index}
                className="h-12 w-full p-0"
                style={{ backgroundColor: color }}
                onClick={() => handleApplyColor(color)}
              >
                <span className="sr-only">Select color {color}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Predefined schemes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Designer Palettes
            </label>
            <Badge variant="outline">{predefinedSchemes.length}</Badge>
          </div>

          {predefinedSchemes.map((scheme, schemeIndex) => (
            <div key={scheme.name} className="mb-4">
              <p className="text-xs font-medium mb-1">{scheme.name}</p>
              <div className="grid grid-cols-5 gap-1">
                {scheme.colors.map((color, index) => (
                  <Button
                    key={`${schemeIndex}-${index}`}
                    className="h-8 w-full p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => handleApplyColor(color)}
                  >
                    <span className="sr-only">
                      Select {scheme.name} color {index + 1}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPaletteGenerator;
