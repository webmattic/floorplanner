import React, { useState, useCallback, useMemo } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Slider } from "../ui/slider.tsx";
import { Label } from "../ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Palette,
  Sun,
  Moon,
  Lightbulb,
  Sunrise,
  Sunset,
  RefreshCw,
  Wand2,
  Eye,
  Droplets,
  Sparkles,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";
import { generateSmartPalette, ColorPalette } from "../../utils/colorTheory";

const MATERIAL_CATEGORIES = [
  { id: "walls", label: "Walls" },
  { id: "floors", label: "Floors" },
  { id: "fabrics", label: "Fabrics" },
];

const MATERIALS = {
  walls: [
    {
      id: "wall-white",
      name: "White Paint",
      color: "#FFFFFF",
      texture: "solid",
    },
    {
      id: "wall-beige",
      name: "Beige Paint",
      color: "#F5F5DC",
      texture: "solid",
    },
    { id: "wall-gray", name: "Gray Paint", color: "#808080", texture: "solid" },
    { id: "wall-brick", name: "Red Brick", color: "#B22222", texture: "brick" },
    {
      id: "wall-wood",
      name: "Wood Paneling",
      color: "#8B4513",
      texture: "wood",
    },
    { id: "wall-stone", name: "Stone", color: "#696969", texture: "stone" },
  ],
  floors: [
    {
      id: "floor-hardwood",
      name: "Hardwood",
      color: "#8B4513",
      texture: "wood",
    },
    {
      id: "floor-tile",
      name: "Ceramic Tile",
      color: "#F0F0F0",
      texture: "tile",
    },
    { id: "floor-marble", name: "Marble", color: "#FFFAFA", texture: "marble" },
    { id: "floor-carpet", name: "Carpet", color: "#D2B48C", texture: "carpet" },
    {
      id: "floor-concrete",
      name: "Concrete",
      color: "#808080",
      texture: "concrete",
    },
    { id: "floor-bamboo", name: "Bamboo", color: "#DEB887", texture: "wood" },
  ],
  fabrics: [
    {
      id: "fabric-cotton",
      name: "Cotton",
      color: "#FFFAF0",
      texture: "fabric",
    },
    { id: "fabric-linen", name: "Linen", color: "#FAF0E6", texture: "fabric" },
    {
      id: "fabric-velvet",
      name: "Velvet",
      color: "#8B008B",
      texture: "fabric",
    },
    {
      id: "fabric-leather",
      name: "Leather",
      color: "#8B4513",
      texture: "leather",
    },
    { id: "fabric-silk", name: "Silk", color: "#FFF8DC", texture: "fabric" },
    { id: "fabric-wool", name: "Wool", color: "#F5DEB3", texture: "fabric" },
  ],
};

const PRESET_COLOR_PALETTES: ColorPalette[] = [
  {
    id: "modern",
    name: "Modern Minimalist",
    colors: ["#FFFFFF", "#F5F5F5", "#E0E0E0", "#BDBDBD", "#757575"],
    type: "monochromatic",
    description: "Clean, minimal palette for contemporary spaces",
  },
  {
    id: "warm",
    name: "Warm Comfort",
    colors: ["#FFF8DC", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F"],
    type: "analogous",
    description: "Cozy, inviting colors for comfortable living",
  },
  {
    id: "cool",
    name: "Cool Serenity",
    colors: ["#E0F6FF", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6"],
    type: "analogous",
    description: "Calming blues for peaceful environments",
  },
  {
    id: "earth",
    name: "Natural Earth",
    colors: ["#8D6E63", "#A1887F", "#BCAAA4", "#D7CCC8", "#EFEBE9"],
    type: "monochromatic",
    description: "Grounded, natural tones inspired by earth",
  },
  {
    id: "vibrant",
    name: "Vibrant Energy",
    colors: ["#FF5722", "#FF9800", "#FFC107", "#8BC34A", "#2196F3"],
    type: "complementary",
    description: "Bold, energetic colors for dynamic spaces",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    colors: ["#FAFAFA", "#E8E8E8", "#D0D0D0", "#A0A0A0", "#606060"],
    type: "monochromatic",
    description: "Nordic-inspired neutral palette",
  },
  {
    id: "tropical",
    name: "Tropical Paradise",
    colors: ["#00BCD4", "#4CAF50", "#FFEB3B", "#FF9800", "#E91E63"],
    type: "triadic",
    description: "Vibrant tropical colors for exotic feel",
  },
];

export const MaterialPalettePanel: React.FC = () => {
  // Controlled state for main tab (materials/colors/lighting)
  const [mainTab, setMainTab] = useState<string>("materials");
  const [selectedCategory, setSelectedCategory] = useState("walls");
  const [customBaseColor, setCustomBaseColor] = useState("#3B82F6");
  const [generatedPalettes, setGeneratedPalettes] = useState<ColorPalette[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const { lighting, updateSceneLighting } = useFloorPlanStore();
  const [lightingSettings, setLightingSettings] = useState(lighting);

  // Update store when lighting settings change
  const handleLightingChange = useCallback(
    (newSettings: typeof lightingSettings) => {
      setLightingSettings(newSettings);
      updateSceneLighting(newSettings);
    },
    [updateSceneLighting]
  );

  // Generate smart palettes based on base color
  const generateSmartPalettes = useCallback(() => {
    setIsGenerating(true);

    setTimeout(() => {
      const paletteTypes: ColorPalette["type"][] = [
        "monochromatic",
        "analogous",
        "complementary",
        "triadic",
        "split-complementary",
      ];

      const newPalettes = paletteTypes.map((type) =>
        generateSmartPalette(customBaseColor, type)
      );

      setGeneratedPalettes(newPalettes);
      setIsGenerating(false);
    }, 500);
  }, [customBaseColor]);

  // Generate initial palettes
  React.useEffect(() => {
    generateSmartPalettes();
  }, [generateSmartPalettes]);

  // All palettes (preset + generated)
  const allPalettes = useMemo(
    () => [...PRESET_COLOR_PALETTES, ...generatedPalettes],
    [generatedPalettes]
  );

  const handleDragStart = useCallback((e: React.DragEvent, material: any) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "material",
        ...material,
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  }, []);

  const handleColorDragStart = useCallback(
    (e: React.DragEvent, color: string) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "color",
          color,
        })
      );
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  return (
    <FloatingPanel panelId="materialPalette">
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="materials"
            data-testid="material-panel-tab-materials"
          >
            Materials
          </TabsTrigger>
          <TabsTrigger value="colors" data-testid="material-panel-tab-colors">
            Colors
          </TabsTrigger>
          <TabsTrigger
            value="lighting"
            data-testid="material-panel-tab-lighting"
          >
            Lighting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4" forceMount>
          {/* Controlled Tabs for material categories - always render all TabsContent, only show active */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {MATERIAL_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-xs"
                  data-testid={`material-panel-category-${category.id}`}
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {MATERIAL_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} forceMount>
                <ScrollArea className="h-[350px] mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {MATERIALS[category.id as keyof typeof MATERIALS]?.map(
                      (material) => (
                        <Tooltip key={material.id}>
                          <TooltipTrigger asChild>
                            <Card
                              className="cursor-move hover:shadow-md transition-all duration-200 hover:scale-105 group"
                              draggable
                              onDragStart={(e) => handleDragStart(e, material)}
                              data-testid={`material-texture-${material.name
                                .replace(/\s+/g, "-")
                                .replace(/[^a-zA-Z0-9-]/g, "")
                                .toLowerCase()}`}
                            >
                              <CardContent className="p-3">
                                <div
                                  className="w-full h-12 rounded mb-2 relative overflow-hidden border border-border/20"
                                  style={{ backgroundColor: material.color }}
                                >
                                  {/* Texture pattern overlay */}
                                  <div className="absolute inset-0 opacity-20">
                                    {material.texture === "brick" && (
                                      <div
                                        className="w-full h-full bg-gradient-to-br from-transparent via-black/10 to-transparent"
                                        style={{
                                          backgroundImage: `repeating-linear-gradient(
                                               0deg,
                                               transparent,
                                               transparent 3px,
                                               rgba(0,0,0,0.1) 3px,
                                               rgba(0,0,0,0.1) 4px
                                             ),
                                             repeating-linear-gradient(
                                               90deg,
                                               transparent,
                                               transparent 8px,
                                               rgba(0,0,0,0.1) 8px,
                                               rgba(0,0,0,0.1) 9px
                                             )`,
                                        }}
                                      />
                                    )}
                                    {material.texture === "wood" && (
                                      <div
                                        className="w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent"
                                        style={{
                                          backgroundImage: `repeating-linear-gradient(
                                               90deg,
                                               transparent,
                                               transparent 2px,
                                               rgba(0,0,0,0.05) 2px,
                                               rgba(0,0,0,0.05) 3px
                                             )`,
                                        }}
                                      />
                                    )}
                                    {material.texture === "tile" && (
                                      <div
                                        className="w-full h-full"
                                        style={{
                                          backgroundImage: `repeating-linear-gradient(
                                               0deg,
                                               rgba(0,0,0,0.1),
                                               rgba(0,0,0,0.1) 1px,
                                               transparent 1px,
                                               transparent 6px
                                             ),
                                             repeating-linear-gradient(
                                               90deg,
                                               rgba(0,0,0,0.1),
                                               rgba(0,0,0,0.1) 1px,
                                               transparent 1px,
                                               transparent 6px
                                             )`,
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20" />
                                </div>
                                <div className="text-xs font-medium truncate">
                                  {material.name}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                  <span>{material.texture}</span>
                                  <span className="text-xs">•</span>
                                  <span>{material.color}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <div className="text-xs">
                              <div className="font-medium">{material.name}</div>
                              <div className="text-muted-foreground">
                                {material.texture} texture
                              </div>
                              <div className="text-muted-foreground">
                                Drag to apply to selected elements
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4" forceMount>
          {/* Smart Palette Generator */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm flex items-center gap-2"
                data-testid="smart-palette-generator-title"
              >
                <Wand2 className="h-4 w-4" />
                Smart Palette Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label
                    className="text-xs"
                    htmlFor="base-color-input"
                    data-testid="base-color-label"
                  >
                    Base Color
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="base-color-input"
                      type="color"
                      value={customBaseColor}
                      onChange={(e) => setCustomBaseColor(e.target.value)}
                      className="w-12 h-8 p-1 border rounded"
                      data-testid="base-color-input"
                    />
                    <Input
                      id="base-color-text"
                      type="text"
                      value={customBaseColor}
                      onChange={(e) => setCustomBaseColor(e.target.value)}
                      className="flex-1 h-8 text-xs"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    onClick={generateSmartPalettes}
                    disabled={isGenerating}
                    className="h-8"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palettes */}
          <div>
            <h4 className="text-sm font-medium mb-3">Color Palettes</h4>
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {allPalettes.map((palette) => (
                  <Card
                    key={palette.id}
                    className="transition-shadow hover:shadow-md"
                    data-testid={
                      generatedPalettes.includes(palette)
                        ? `generated-palette-title`
                        : palette.id
                        ? `preset-palette-${palette.id}`
                        : undefined
                    }
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {palette.name}
                          </span>
                          {generatedPalettes.includes(palette) && (
                            <Badge variant="secondary" className="text-xs">
                              Generated
                            </Badge>
                          )}
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {palette.type}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs">
                              {palette.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {palette.colors.map((color, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div
                                className="flex-1 h-8 rounded cursor-move transition-transform hover:scale-105 border border-border/20"
                                style={{ backgroundColor: color }}
                                draggable
                                onDragStart={(e) =>
                                  handleColorDragStart(e, color)
                                }
                                title={color}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium">{color}</div>
                                <div className="text-muted-foreground">
                                  Click to copy, drag to apply
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                      {palette.description && (
                        <p className="text-xs text-muted-foreground">
                          {palette.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="lighting" className="space-y-4" forceMount>
          <div>
            <h4
              className="text-sm font-medium mb-3 flex items-center gap-2"
              data-testid="scene-lighting-controls-title"
            >
              <Lightbulb className="h-4 w-4" />
              Scene Lighting Controls
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label
                    className="text-sm"
                    htmlFor="main-light-slider"
                    data-testid="main-light-intensity-label"
                  >
                    Main Light Intensity
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {lightingSettings.mainLight.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="main-light-slider"
                  value={[lightingSettings.mainLight]}
                  onValueChange={([value]) => {
                    const newSettings = {
                      ...lightingSettings,
                      mainLight: value,
                    };
                    handleLightingChange(newSettings);
                  }}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-2"
                  aria-label="Main Light Intensity"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label
                    className="text-sm"
                    htmlFor="ambient-light-slider"
                    data-testid="ambient-light-label"
                  >
                    Ambient Light
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {lightingSettings.ambientLight.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="ambient-light-slider"
                  value={[lightingSettings.ambientLight]}
                  onValueChange={([value]) => {
                    const newSettings = {
                      ...lightingSettings,
                      ambientLight: value,
                    };
                    handleLightingChange(newSettings);
                  }}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label
                    className="text-sm"
                    htmlFor="color-temperature-slider"
                    data-testid="color-temperature-label"
                  >
                    Color Temperature
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {lightingSettings.temperature}K
                  </span>
                </div>
                <Slider
                  id="color-temperature-slider"
                  value={[lightingSettings.temperature]}
                  onValueChange={([value]) => {
                    const newSettings = {
                      ...lightingSettings,
                      temperature: value,
                    };
                    handleLightingChange(newSettings);
                  }}
                  min={2700}
                  max={6500}
                  step={100}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Warm</span>
                  <span>Cool</span>
                </div>
              </div>

              {/* Time of Day Presets */}
              <div>
                <Label className="text-sm mb-3 block">
                  Time of Day Ambiance
                </Label>

                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settings = {
                            mainLight: 0.2,
                            ambientLight: 0.1,
                            temperature: 2700,
                          };
                          handleLightingChange(settings);
                        }}
                        className="flex items-center gap-2"
                        data-testid="time-preset-night"
                      >
                        <Moon className="h-4 w-4" />
                        Night
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Soft, warm lighting for evening</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settings = {
                            mainLight: 0.6,
                            ambientLight: 0.3,
                            temperature: 3200,
                          };
                          handleLightingChange(settings);
                        }}
                        className="flex items-center gap-2"
                        data-testid="time-preset-dawn"
                      >
                        <Sunrise className="h-4 w-4" />
                        Dawn
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Gentle morning light</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settings = {
                            mainLight: 1.2,
                            ambientLight: 0.6,
                            temperature: 6500,
                          };
                          handleLightingChange(settings);
                        }}
                        className="flex items-center gap-2"
                        data-testid="time-preset-midday"
                      >
                        <Sun className="h-4 w-4" />
                        Midday
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Bright, natural daylight</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settings = {
                            mainLight: 0.8,
                            ambientLight: 0.4,
                            temperature: 3800,
                          };
                          handleLightingChange(settings);
                        }}
                        className="flex items-center gap-2"
                        data-testid="time-preset-sunset"
                      >
                        <Sunset className="h-4 w-4" />
                        Sunset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Warm, golden hour lighting</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settings = {
                            mainLight: 1.0,
                            ambientLight: 0.5,
                            temperature: 5000,
                          };
                          handleLightingChange(settings);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Focus
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Optimal lighting for work</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settings = {
                            mainLight: 0.4,
                            ambientLight: 0.3,
                            temperature: 2900,
                          };
                          handleLightingChange(settings);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Droplets className="h-4 w-4" />
                        Cozy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Intimate, relaxing atmosphere</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Real-time Preview */}
              <Card className="bg-gradient-to-r from-yellow-100 to-blue-100 border-dashed">
                <CardContent className="p-3">
                  <div className="text-xs text-center text-muted-foreground">
                    <Lightbulb className="h-4 w-4 mx-auto mb-1" />
                    Lighting changes apply to 3D view in real-time
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-2 mt-4">
        <div
          className="flex items-center gap-2"
          data-testid="material-panel-instruction-select-elements"
        >
          <Palette className="h-3 w-3" />
          <span>
            Select elements first, then drag materials/colors to apply
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          data-testid="material-panel-instruction-smart-palette"
        >
          <Wand2 className="h-3 w-3" />
          <span>Use smart palette generator for harmonious color schemes</span>
        </div>
        <div
          className="flex items-center gap-2"
          data-testid="material-panel-instruction-lighting-changes"
        >
          <Lightbulb className="h-3 w-3" />
          <span>Lighting changes reflect in 3D view instantly</span>
        </div>
      </div>
    </FloatingPanel>
  );
};
