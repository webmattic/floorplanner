import React, { useState, useCallback, useMemo } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Slider } from "../ui/slider.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { Separator } from "../ui/separator.tsx";

import { ScrollArea } from "../ui/scroll-area.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Settings,
  Palette,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Move,
  Square,
  Package,
  DoorOpen,
  RectangleHorizontal,
  Type,
  Info,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

// Layer definitions - in a real app, this would come from a layer store
const DEFAULT_LAYERS = [
  {
    id: "walls",
    name: "Walls",
    color: "#8B4513",
    visible: true,
    locked: false,
  },
  {
    id: "rooms",
    name: "Rooms",
    color: "#90EE90",
    visible: true,
    locked: false,
  },
  {
    id: "furniture",
    name: "Furniture",
    color: "#4169E1",
    visible: true,
    locked: false,
  },
  {
    id: "doors",
    name: "Doors & Windows",
    color: "#FF6347",
    visible: true,
    locked: false,
  },
  {
    id: "dimensions",
    name: "Dimensions",
    color: "#FFD700",
    visible: true,
    locked: false,
  },
  {
    id: "annotations",
    name: "Text & Labels",
    color: "#9370DB",
    visible: true,
    locked: false,
  },
];

// Material swatches for quick selection
const MATERIAL_SWATCHES = [
  { id: "white", name: "White", color: "#FFFFFF", texture: "solid" },
  { id: "beige", name: "Beige", color: "#F5F5DC", texture: "solid" },
  { id: "gray", name: "Gray", color: "#808080", texture: "solid" },
  { id: "brown", name: "Brown", color: "#8B4513", texture: "solid" },
  { id: "red", name: "Red", color: "#DC143C", texture: "solid" },
  { id: "blue", name: "Blue", color: "#4169E1", texture: "solid" },
  { id: "green", name: "Green", color: "#228B22", texture: "solid" },
  { id: "yellow", name: "Yellow", color: "#FFD700", texture: "solid" },
  { id: "brick", name: "Brick", color: "#B22222", texture: "brick" },
  { id: "wood", name: "Wood", color: "#8B4513", texture: "wood" },
  { id: "stone", name: "Stone", color: "#696969", texture: "stone" },
  { id: "marble", name: "Marble", color: "#FFFAFA", texture: "marble" },
];

// Texture patterns
const TEXTURE_PATTERNS = [
  { id: "solid", name: "Solid", icon: "⬜" },
  { id: "brick", name: "Brick", icon: "🧱" },
  { id: "wood", name: "Wood", icon: "🪵" },
  { id: "stone", name: "Stone", icon: "🪨" },
  { id: "tile", name: "Tile", icon: "⬛" },
  { id: "marble", name: "Marble", icon: "💎" },
  { id: "fabric", name: "Fabric", icon: "🧵" },
  { id: "leather", name: "Leather", icon: "🦬" },
  { id: "carpet", name: "Carpet", icon: "🟫" },
  { id: "concrete", name: "Concrete", icon: "⬜" },
];

export const PropertiesPanel: React.FC = () => {
  const {
    selectedElements,
    walls,
    rooms,
    furniture,
    updateWall,
    updateRoom,
    updateFurniture,
    removeWall,
    removeRoom,
    removeFurniture,
    clearSelection,
  } = useFloorPlanStore();

  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [activeTab, setActiveTab] = useState("properties");

  // Get the selected element data
  const selectedElement = useMemo(() => {
    if (selectedElements.length === 0) return null;

    const element = selectedElements[0];
    switch (element.type) {
      case "wall":
        return walls.find((w) => w.id === element.id);
      case "room":
        return rooms.find((r) => r.id === element.id);
      case "furniture":
        return furniture.find((f) => f.id === element.id);
      default:
        return null;
    }
  }, [selectedElements, walls, rooms, furniture]);

  const selectedElementType =
    selectedElements.length > 0 ? selectedElements[0].type : null;

  // Update element properties
  const updateElementProperty = useCallback(
    (property: string, value: any) => {
      if (!selectedElement || selectedElements.length === 0) return;

      const elementId = selectedElements[0].id;
      const elementType = selectedElements[0].type;

      const updates = { [property]: value };

      switch (elementType) {
        case "wall":
          updateWall(elementId, updates);
          break;
        case "room":
          updateRoom(elementId, updates);
          break;
        case "furniture":
          updateFurniture(elementId, updates);
          break;
      }
    },
    [selectedElement, selectedElements, updateWall, updateRoom, updateFurniture]
  );

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (selectedElements.length === 0) return;

    const element = selectedElements[0];
    switch (element.type) {
      case "wall":
        removeWall(element.id);
        break;
      case "room":
        removeRoom(element.id);
        break;
      case "furniture":
        removeFurniture(element.id);
        break;
    }
    clearSelection();
  }, [
    selectedElements,
    removeWall,
    removeRoom,
    removeFurniture,
    clearSelection,
  ]);

  // Duplicate selected element
  const duplicateSelectedElement = useCallback(() => {
    if (!selectedElement || selectedElements.length === 0) return;

    const elementType = selectedElements[0].type;
    const offset = 20; // Offset for duplicate

    switch (elementType) {
      case "room":
        const roomData = selectedElement as any;
        updateRoom("", {
          ...roomData,
          x: roomData.x + offset,
          y: roomData.y + offset,
          label: `${roomData.label} Copy`,
        });
        break;
      case "furniture":
        const furnitureData = selectedElement as any;
        updateFurniture("", {
          ...furnitureData,
          x: furnitureData.x + offset,
          y: furnitureData.y + offset,
          label: `${furnitureData.label} Copy`,
        });
        break;
    }
  }, [selectedElement, selectedElements, updateRoom, updateFurniture]);

  // Layer management
  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  }, []);

  // Get element icon
  const getElementIcon = (type: string) => {
    switch (type) {
      case "wall":
        return Move;
      case "room":
        return Square;
      case "furniture":
        return Package;
      case "door":
        return DoorOpen;
      case "window":
        return RectangleHorizontal;
      case "text":
        return Type;
      default:
        return Settings;
    }
  };

  // Render property inputs based on element type
  const renderElementProperties = () => {
    if (!selectedElement || !selectedElementType) {
      return (
        <div className="text-center py-8">
          <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Select an object to edit its properties
          </p>
        </div>
      );
    }

    const IconComponent = getElementIcon(selectedElementType);

    return (
      <div className="space-y-4">
        {/* Element Header */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <IconComponent className="h-5 w-5" />
          <div className="flex-1">
            <h3 className="font-medium text-sm capitalize">
              {selectedElementType}
            </h3>
            <p className="text-xs text-muted-foreground">
              ID: {selectedElement.id}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {selectedElements.length} selected
          </Badge>
        </div>

        {/* Basic Properties */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Basic Properties</h4>

          {/* Label/Name */}
          {(selectedElementType === "room" ||
            selectedElementType === "furniture") && (
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input
                value={(selectedElement as any).label || ""}
                onChange={(e) => updateElementProperty("label", e.target.value)}
                placeholder="Enter label..."
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Position */}
          {(selectedElementType === "room" ||
            selectedElementType === "furniture") && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">X Position</Label>
                <Input
                  type="number"
                  value={(selectedElement as any).x || 0}
                  onChange={(e) =>
                    updateElementProperty("x", Number(e.target.value))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={(selectedElement as any).y || 0}
                  onChange={(e) =>
                    updateElementProperty("y", Number(e.target.value))
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Dimensions */}
          {(selectedElementType === "room" ||
            selectedElementType === "furniture") && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={(selectedElement as any).width || 0}
                  onChange={(e) =>
                    updateElementProperty("width", Number(e.target.value))
                  }
                  className="h-8 text-xs"
                  min="1"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={(selectedElement as any).height || 0}
                  onChange={(e) =>
                    updateElementProperty("height", Number(e.target.value))
                  }
                  className="h-8 text-xs"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Wall-specific properties */}
          {selectedElementType === "wall" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Thickness</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[(selectedElement as any).thickness || 8]}
                    onValueChange={([value]: number[]) =>
                      updateElementProperty("thickness", value)
                    }
                    min={2}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {(selectedElement as any).thickness || 8}px
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Material Properties */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Material & Color
          </h4>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={(selectedElement as any).color || "#808080"}
                onChange={(e) => updateElementProperty("color", e.target.value)}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                type="text"
                value={(selectedElement as any).color || "#808080"}
                onChange={(e) => updateElementProperty("color", e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#808080"
              />
            </div>
          </div>

          {/* Material Swatches */}
          <div className="space-y-2">
            <Label className="text-xs">Quick Colors</Label>
            <div className="grid grid-cols-6 gap-1">
              {MATERIAL_SWATCHES.slice(0, 12).map((swatch) => (
                <Tooltip key={swatch.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="w-6 h-6 rounded border border-border/40 hover:scale-110 transition-transform"
                      style={{ backgroundColor: swatch.color }}
                      onClick={() =>
                        updateElementProperty("color", swatch.color)
                      }
                      title={swatch.name}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{swatch.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Texture Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Texture</Label>
            <Select
              value={(selectedElement as any).texture || "solid"}
              onValueChange={(value) => updateElementProperty("texture", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEXTURE_PATTERNS.map((texture) => (
                  <SelectItem key={texture.id} value={texture.id}>
                    <div className="flex items-center gap-2">
                      <span>{texture.icon}</span>
                      <span>{texture.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Layer Assignment */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Layer Assignment
          </h4>

          <Select
            value={(selectedElement as any).layerId || selectedElementType}
            onValueChange={(value) => updateElementProperty("layerId", value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layers.map((layer) => (
                <SelectItem key={layer.id} value={layer.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span>{layer.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={duplicateSelectedElement}
              className="flex items-center gap-2"
            >
              <Copy className="h-3 w-3" />
              <span className="text-xs">Duplicate</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelectedElement}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FloatingPanel panelId="properties">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-4">
          <ScrollArea className="h-[400px]">
            {renderElementProperties()}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layers" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Layer Management</h4>
              <Button variant="outline" size="sm" className="text-xs">
                Add Layer
              </Button>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {layers.map((layer) => (
                  <Card key={layer.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded border border-border/40"
                        style={{ backgroundColor: layer.color }}
                      />

                      <div className="flex-1">
                        <div className="font-medium text-sm">{layer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {layer.id}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLayerVisibility(layer.id)}
                              className="h-6 w-6 p-0"
                            >
                              {layer.visible ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {layer.visible ? "Hide" : "Show"} layer
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLayerLock(layer.id)}
                              className="h-6 w-6 p-0"
                            >
                              {layer.locked ? (
                                <Lock className="h-3 w-3" />
                              ) : (
                                <Unlock className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {layer.locked ? "Unlock" : "Lock"} layer
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Layer Tips */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Use layers to organize your floor plan elements. Hidden layers
                won't be visible in the canvas, and locked layers can't be
                edited.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selection Status */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-xs text-muted-foreground">
          {selectedElements.length === 0 ? (
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Select objects on the canvas to edit their properties</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Settings className="h-3 w-3" />
              <span>
                {selectedElements.length} object
                {selectedElements.length !== 1 ? "s" : ""} selected
              </span>
            </div>
          )}
        </div>
      </div>
    </FloatingPanel>
  );
};
