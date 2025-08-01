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
  // Renders properties for selected elements (room, wall, furniture)
  function renderElementProperties() {
    if (!selectedElements || selectedElements.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <h4 className="text-sm font-medium mb-2" data-testid="properties-header">Properties</h4>
          <div data-testid="no-selection-message">No elements selected</div>
        </div>
      );
    }
    const selected = selectedElements[0];
    let objectProps = null;
    if (selected.type === "room") {
      const room = rooms.find((r) => r.id === selected.id);
      if (!room) return null;
      objectProps = (
        <div>
          <h4 className="text-sm font-medium mb-2">Room Properties</h4>
          <Label htmlFor="room-label">Label</Label>
          <Input id="room-label" value={room.label || ""} aria-label="Label" readOnly />
          <Label htmlFor="room-x">X</Label>
          <Input id="room-x" value={room.x} aria-label="X" readOnly />
          <Label htmlFor="room-y">Y</Label>
          <Input id="room-y" value={room.y} aria-label="Y" readOnly />
          <Label htmlFor="room-width">Width</Label>
          <Input id="room-width" value={room.width} aria-label="Width" readOnly />
          <Label htmlFor="room-height">Height</Label>
          <Input id="room-height" value={room.height} aria-label="Height" readOnly />
          <Label htmlFor="room-color">Color</Label>
          <Input id="room-color" value={room.color} aria-label="Color" readOnly />
        </div>
      );
    }
    if (selected.type === "wall") {
      const wall = walls.find((w) => w.id === selected.id);
      if (!wall) return null;
      objectProps = (
        <div>
          <h4 className="text-sm font-medium mb-2">Wall Properties</h4>
          <Label htmlFor="wall-type">Wall Type</Label>
          <Input id="wall-type" value={wall.type || "Standard"} aria-label="Wall Type" readOnly />
          <Label htmlFor="wall-color">Color</Label>
          <Input id="wall-color" value={wall.color} aria-label="Color" readOnly />
          <Label htmlFor="wall-thickness">Wall Thickness</Label>
          <div className="flex items-center gap-2">
            <Slider id="wall-thickness" value={[wall.thickness || 8]} min={1} max={24} step={1} aria-label="Wall Thickness" readOnly />
            <span>{(wall.thickness || 8) + "px"}</span>
          </div>
        </div>
      );
    }
    if (selected.type === "furniture") {
      const furn = furniture.find((f) => f.id === selected.id);
      if (!furn) return null;
      objectProps = (
        <div>
          <h4 className="text-sm font-medium mb-2">Furniture Properties</h4>
          <Label htmlFor="furn-label">Label</Label>
          <Input id="furn-label" value={furn.label || ""} aria-label="Label" readOnly />
          <Label htmlFor="furn-x">X</Label>
          <Input id="furn-x" value={furn.x} aria-label="X" readOnly />
          <Label htmlFor="furn-y">Y</Label>
          <Input id="furn-y" value={furn.y} aria-label="Y" readOnly />
          <Label htmlFor="furn-width">Width</Label>
          <Input id="furn-width" value={furn.width} aria-label="Width" readOnly />
          <Label htmlFor="furn-height">Height</Label>
          <Input id="furn-height" value={furn.height} aria-label="Height" readOnly />
          <Label htmlFor="furn-color">Color</Label>
          <Input id="furn-color" value={furn.color} aria-label="Color" readOnly />
        </div>
      );
    }
    // Quick Colors section
    const quickColors = (
      <div className="mt-4">
        <h4 className="text-xs font-semibold mb-2">Quick Colors</h4>
        <div className="flex gap-2 flex-wrap">
          {MATERIAL_SWATCHES.map((swatch) => (
            <div key={swatch.id} className="w-6 h-6 rounded border" style={{ backgroundColor: swatch.color }} title={swatch.name} />
          ))}
        </div>
      </div>
    );
    // Texture dropdown
    const textureDropdown = (
      <div className="mt-4">
        <Label htmlFor="texture-select">Texture</Label>
        <Select id="texture-select" aria-label="Texture">
          <SelectTrigger>
            <SelectValue placeholder="Select texture" />
          </SelectTrigger>
          <SelectContent>
            {TEXTURE_PATTERNS.map((pattern) => (
              <SelectItem key={pattern.id} value={pattern.id}>{pattern.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
    // Layer Assignment dropdown
    const layerAssignment = (
      <div className="mt-4">
        <Label htmlFor="layer-select">Layer Assignment</Label>
        <Select id="layer-select" aria-label="Layer Assignment">
          <SelectTrigger>
            <SelectValue placeholder="Select layer" />
          </SelectTrigger>
          <SelectContent>
            {layers.map((layer) => (
              <SelectItem key={layer.id} value={layer.id}>{layer.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
    return (
      <div>
        {objectProps}
        {quickColors}
        {textureDropdown}
        {layerAssignment}
      </div>
    );
  }
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

  // ...existing code...

  // Place the main return block at the end of the component
  return (
    <FloatingPanel panelId="properties">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties" data-testid="properties-tab">Properties</TabsTrigger>
          <TabsTrigger value="layers" data-testid="layers-tab">Layers</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-4" data-testid="properties-tab-content">
          <ScrollArea className="h-[400px]">
            {renderElementProperties()}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layers" className="mt-4" data-testid="layers-tab-content">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium" data-testid="layer-management-header">Layer Management</h4>
              <Button variant="outline" size="sm" className="text-xs" data-testid="add-layer-button">
                Add Layer
              </Button>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {layers.map((layer) => (
                  <Card key={layer.id} className="p-3" data-testid={`layer-card-${layer.id}`}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded border border-border/40"
                        style={{ backgroundColor: layer.color }}
                        data-testid={`layer-color-${layer.id}`}
                      />

                      <div className="flex-1">
                        <div className="font-medium text-sm" data-testid={`layer-name-${layer.id}`}>{layer.name}</div>
                        <div className="text-xs text-muted-foreground" data-testid={`layer-id-${layer.id}`}>{layer.id}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLayerVisibility(layer.id)}
                              className="h-6 w-6 p-0"
                              data-testid={`layer-visibility-btn-${layer.id}`}
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
                              data-testid={`layer-lock-btn-${layer.id}`}
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
            <Alert data-testid="layer-tips-alert">
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
      <div className="mt-4 p-3 bg-muted/50 rounded-lg" data-testid="selection-status-area">
        <div className="text-xs text-muted-foreground">
          {selectedElements.length === 0 ? (
            <div className="flex items-center gap-2" data-testid="no-selection-status">
              <Info className="h-3 w-3" />
              <span>Select objects on the canvas to edit their properties</span>
            </div>
          ) : (
            <div className="flex items-center gap-2" data-testid="selection-status">
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
