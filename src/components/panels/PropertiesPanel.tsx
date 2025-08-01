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
  // ...existing code...
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
import { Settings } from "lucide-react";
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

export const PropertiesPanel: React.FC<{ panelId?: string }> = ({ panelId = "properties" }) => {

  // Zustand selectors
  const selectedElementsRaw = useFloorPlanStore((s) => s.selectedElements);
  const selectedElements = Array.isArray(selectedElementsRaw) ? selectedElementsRaw : [];
  const rooms = useFloorPlanStore((s) => s.rooms);
  const walls = useFloorPlanStore((s) => s.walls);
  const furniture = useFloorPlanStore((s) => s.furniture);
  const rawLayers = useFloorPlanStore((s) => s.layers);
  const layers = Array.isArray(rawLayers) ? rawLayers : DEFAULT_LAYERS;
  const updateRoom = useFloorPlanStore((s) => s.updateRoom);
  const updateWall = useFloorPlanStore((s) => s.updateWall);
  const updateFurniture = useFloorPlanStore((s) => s.updateFurniture);
  const removeRoom = useFloorPlanStore((s) => s.removeRoom);
  const removeWall = useFloorPlanStore((s) => s.removeWall);
  const removeFurniture = useFloorPlanStore((s) => s.removeFurniture);
  const clearSelection = useFloorPlanStore((s) => s.clearSelection);

  const [activeTab, setActiveTab] = useState("properties");

  function handleDelete(selected) {
    if (selected.type === "room") {
      removeRoom(selected.id);
    } else if (selected.type === "wall") {
      removeWall(selected.id);
    } else if (selected.type === "furniture") {
      removeFurniture(selected.id);
    }
    clearSelection();
  }

  function renderElementProperties() {
    // Always render fallback heading and message for testability
    if (!selectedElements || selectedElements.length === 0 || !selectedElements[0]) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <h2 className="text-sm font-medium mb-2" role="heading" aria-level="2" data-testid="properties-header">Properties</h2>
          <div data-testid="no-selection-message">No elements selected</div>
        </div>
      );
    }

    const selected = selectedElements[0];
    let elementData;
    if (selected.type === "room") {
      elementData = rooms.find((r) => r.id === selected.id);
    } else if (selected.type === "wall") {
      elementData = walls.find((w) => w.id === selected.id);
    } else if (selected.type === "furniture") {
      elementData = furniture.find((f) => f.id === selected.id);
    }
    if (!elementData) return null;

    // Room properties
    if (selected.type === "room") {
      return (
        <form className="space-y-4" aria-label="Room Properties">
          <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" aria-label="Label" value={elementData.label} onChange={e => updateRoom(selected.id, { label: e.target.value })} />
            <Label htmlFor="x">X</Label>
            <Input id="x" aria-label="X" type="number" value={elementData.x} onChange={e => updateRoom(selected.id, { x: Number(e.target.value) })} />
            <Label htmlFor="y">Y</Label>
            <Input id="y" aria-label="Y" type="number" value={elementData.y} onChange={e => updateRoom(selected.id, { y: Number(e.target.value) })} />
            <Label htmlFor="width">Width</Label>
            <Input id="width" aria-label="Width" type="number" value={elementData.width} onChange={e => updateRoom(selected.id, { width: Number(e.target.value) })} />
            <Label htmlFor="height">Height</Label>
            <Input id="height" aria-label="Height" type="number" value={elementData.height} onChange={e => updateRoom(selected.id, { height: Number(e.target.value) })} />
            <Label htmlFor="color">Color</Label>
            <Input id="color" aria-label="Color" type="color" value={elementData.color} onChange={e => updateRoom(selected.id, { color: e.target.value })} />
            <Label htmlFor="texture">Texture</Label>
            <Select value={elementData.texture || "solid"} onValueChange={val => updateRoom(selected.id, { texture: val })} aria-label="Texture">
              <SelectTrigger id="texture">
                <SelectValue placeholder="Select texture" />
              </SelectTrigger>
              <SelectContent>
                {TEXTURE_PATTERNS.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id}>{pattern.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="layer-assignment">Layer Assignment</Label>
            <Select value={elementData.layer || layers[0].id} onValueChange={val => updateRoom(selected.id, { layer: val })} aria-label="Layer Assignment">
              <SelectTrigger id="layer-assignment">
                <SelectValue placeholder="Select layer" />
              </SelectTrigger>
              <SelectContent>
                {layers.map((layer) => (
                  <SelectItem key={layer.id} value={layer.id}>{layer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2">
            <div className="font-semibold mb-1">Quick Colors</div>
            <div className="flex gap-2">
              {MATERIAL_SWATCHES.map((swatch) => (
                <button key={swatch.id} type="button" aria-label={swatch.name} style={{ background: swatch.color, width: 24, height: 24, borderRadius: 4, border: "1px solid #ccc" }} onClick={() => updateRoom(selected.id, { color: swatch.color })} />
              ))}
            </div>
          </div>
          <Button type="button" variant="destructive" aria-label="Delete" onClick={() => handleDelete(selected)}>
            Delete
          </Button>
        </form>
      );
    }

    // Wall properties
    if (selected.type === "wall") {
      return (
        <form className="space-y-4" aria-label="Wall Properties">
          <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="wall-type" className="font-semibold col-span-2">Wall Type</Label>
            <Label htmlFor="color">Color</Label>
            <Input id="color" aria-label="Color" type="color" value={elementData.color} onChange={e => updateWall(selected.id, { color: e.target.value })} />
            <span className="font-semibold col-span-2">Wall Thickness</span>
            <Slider id="thickness" aria-label="Wall Thickness" min={4} max={24} value={[elementData.thickness]} onValueChange={val => updateWall(selected.id, { thickness: val[0] })} />
            <div className="col-span-2 text-xs">{elementData.thickness}px</div>
          </div>
          <Button type="button" variant="destructive" aria-label="Delete" onClick={() => handleDelete(selected)}>
            Delete
          </Button>
        </form>
      );
    }

    // Furniture properties
    if (selected.type === "furniture") {
      return (
        <form className="space-y-4" aria-label="Furniture Properties">
          <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" aria-label="Label" value={elementData.label} onChange={e => updateFurniture(selected.id, { label: e.target.value })} />
            <Label htmlFor="x">X</Label>
            <Input id="x" aria-label="X" type="number" value={elementData.x} onChange={e => updateFurniture(selected.id, { x: Number(e.target.value) })} />
            <Label htmlFor="y">Y</Label>
            <Input id="y" aria-label="Y" type="number" value={elementData.y} onChange={e => updateFurniture(selected.id, { y: Number(e.target.value) })} />
            <Label htmlFor="width">Width</Label>
            <Input id="width" aria-label="Width" type="number" value={elementData.width} onChange={e => updateFurniture(selected.id, { width: Number(e.target.value) })} />
            <Label htmlFor="height">Height</Label>
            <Input id="height" aria-label="Height" type="number" value={elementData.height} onChange={e => updateFurniture(selected.id, { height: Number(e.target.value) })} />
            <Label htmlFor="color">Color</Label>
            <Input id="color" aria-label="Color" type="color" value={elementData.color} onChange={e => updateFurniture(selected.id, { color: e.target.value })} />
          </div>
          <Button type="button" variant="destructive" aria-label="Delete" onClick={() => handleDelete(selected)}>
            Delete
          </Button>
        </form>
      );
    }

    return null;
  }

  function renderLayerManagement() {
    return (
      <div>
        <h2 className="text-lg font-bold mb-2" role="heading" aria-level="2">Layer Management</h2>
        <div className="grid grid-cols-2 gap-2">
          {layers.map((layer) => (
            <div key={layer.id} className="p-2 border rounded flex flex-col gap-1">
              <span className="font-semibold" style={{ color: layer.color }}>{layer.name}</span>
              <span className="text-xs">ID: {layer.id}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <FloatingPanel panelId={panelId}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties" role="tab" aria-label="Properties">Properties</TabsTrigger>
          <TabsTrigger value="layers" role="tab" aria-label="Layers">Layers</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" forceMount>
          <h2 className="text-lg font-bold mb-2" role="heading" aria-level="2" data-testid="properties-header">Properties</h2>
          {renderElementProperties()}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg" data-testid="selection-status-area">
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold mb-1">Selection Status</div>
              {selectedElements.length === 0 ? (
                <div className="flex items-center gap-2" data-testid="no-selection-status">
                  <span>Select objects on the canvas to edit their properties</span>
                </div>
              ) : (
                <div className="flex items-center gap-2" data-testid="selection-status">
                  <span>
                    {selectedElements.length > 1
                      ? `${selectedElements.length} objects selected`
                      : `${selectedElements.length} object selected`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="layers" forceMount>
          {renderLayerManagement()}
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
};
