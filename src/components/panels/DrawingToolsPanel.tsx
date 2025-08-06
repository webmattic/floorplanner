import React, { useState } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator.tsx";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label.tsx";
import { Slider } from "../ui/slider.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Move,
  Square,
  DoorOpen,
  RectangleHorizontal,
  Ruler,
  Type,
  MousePointer,
  Hand,
  RotateCcw,
  Redo2,
  Trash2,
  Copy,
  AlertTriangle,
  Info,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

const DRAWING_TOOLS = [
  {
    id: "select",
    label: "Select",
    icon: MousePointer,
    shortcut: "V",
    description: "Select and move objects",
  },
  {
    id: "wall",
    label: "Wall",
    icon: Move,
    shortcut: "W",
    description: "Draw walls with snap-to-grid",
  },
  {
    id: "room",
    label: "Room",
    icon: Square,
    shortcut: "R",
    description: "Create rooms with auto-dimensions",
  },
  {
    id: "door",
    label: "Door",
    icon: DoorOpen,
    shortcut: "D",
    description: "Place doors with clearance check",
  },
  {
    id: "window",
    label: "Window",
    icon: RectangleHorizontal,
    shortcut: "Shift+W",
    description: "Add windows to walls",
  },
  {
    id: "dimension",
    label: "Measure",
    icon: Ruler,
    shortcut: "M",
    description: "Virtual tape measure tool",
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
    shortcut: "T",
    description: "Add labels and annotations",
  },
  {
    id: "hand",
    label: "Pan",
    icon: Hand,
    shortcut: "H",
    description: "Pan around the canvas",
  },
];

const WALL_THICKNESSES = [
  { value: 4, label: "Thin (4px)" },
  { value: 8, label: "Standard (8px)" },
  { value: 12, label: "Thick (12px)" },
  { value: 16, label: "Extra Thick (16px)" },
];

const GRID_PRESETS = [
  { value: 25, label: "Fine (25px)" },
  { value: 50, label: "Standard (50px)" },
  { value: 75, label: "Coarse (75px)" },
  { value: 100, label: "Extra Coarse (100px)" },
];

export const DrawingToolsPanel: React.FC = () => {
  const {
    currentTool,
    setCurrentTool,
    showGrid,
    toggleGrid,
    gridSize,
    setGridSize,
    selectedElements = [],
    clearSelection,
    wallThickness,
    setWallThickness,
    snapToGrid,
    setSnapToGrid,
    showClearanceWarnings,
    setShowClearanceWarnings,
  } = useFloorPlanStore();

  const [activeTab, setActiveTab] = useState("tools");

  // Quick actions
  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log("Undo");
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log("Redo");
  };

  const handleDeleteSelected = () => {
    if (!selectedElements || selectedElements.length === 0) return;

    selectedElements.forEach((element) => {
      switch (element.type) {
        case "wall":
          useFloorPlanStore.getState().removeWall(element.id);
          break;
        case "room":
          useFloorPlanStore.getState().removeRoom(element.id);
          break;
        case "furniture":
          useFloorPlanStore.getState().removeFurniture(element.id);
          break;
      }
    });
    clearSelection();
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate selected elements");
  };

  return (
    <FloatingPanel panelId="drawingTools">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4 mt-4">
          {/* Drawing Tools */}
          <div>
            <h4 className="text-sm font-medium mb-3">Drawing Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              {DRAWING_TOOLS.map((tool) => {
                const IconComponent = tool.icon;
                const isActive = currentTool === tool.id;

                return (
                  <Button
                    key={tool.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool(tool.id)}
                    className="flex items-center gap-2 justify-start relative"
                    title={`${tool.description} (${tool.shortcut})`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs flex-1 text-left">
                      {tool.label}
                    </span>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {tool.shortcut}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Active Tool Info */}
          {currentTool && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {DRAWING_TOOLS.find((t) => t.id === currentTool)?.label} Tool
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {DRAWING_TOOLS.find((t) => t.id === currentTool)?.description}
              </p>

              {/* Tool-specific options */}
              {currentTool === "wall" && (
                <div className="mt-3 space-y-2">
                  <Label className="text-xs">Wall Thickness</Label>
                  <Select
                    value={(wallThickness || 8).toString()}
                    onValueChange={(value) => setWallThickness(Number(value))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WALL_THICKNESSES.map((thickness) => (
                        <SelectItem
                          key={thickness.value}
                          value={thickness.value.toString()}
                        >
                          {thickness.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentTool === "door" && showClearanceWarnings && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Door clearance validation is enabled. You'll be warned if
                    doors can't open properly.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          {/* Grid Settings */}
          <div>
            <h4 className="text-sm font-medium mb-3">Grid & Snap</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid" className="text-sm">
                  Show Grid
                </Label>
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={toggleGrid}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="snap-to-grid" className="text-sm">
                  Snap to Grid
                </Label>
                <Switch
                  id="snap-to-grid"
                  checked={snapToGrid}
                  onCheckedChange={setSnapToGrid}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Grid Size: {gridSize}px</Label>
                <Slider
                  value={[gridSize]}
                  onValueChange={([value]) => setGridSize(value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Grid Presets</Label>
                <div className="grid grid-cols-2 gap-1">
                  {GRID_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setGridSize(preset.value)}
                      className="text-xs h-7"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Drawing Settings */}
          <div>
            <h4 className="text-sm font-medium mb-3">Drawing Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="clearance-warnings" className="text-sm">
                  Clearance Warnings
                </Label>
                <Switch
                  id="clearance-warnings"
                  checked={showClearanceWarnings}
                  onCheckedChange={setShowClearanceWarnings}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4 mt-4">
          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="text-xs">Undo</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                className="flex items-center gap-2"
              >
                <Redo2 className="h-4 w-4" />
                <span className="text-xs">Redo</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedElements.length === 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs">Delete</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={selectedElements.length === 0}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                <span className="text-xs">Duplicate</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Selection Info */}
          <div>
            <h4 className="text-sm font-medium mb-3">Selection</h4>
            {selectedElements.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {selectedElements.length} object
                  {selectedElements.length !== 1 ? "s" : ""} selected
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedElements.map((element, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {element.type}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="w-full text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No objects selected. Click objects to select them.
              </p>
            )}
          </div>

          <Separator />

          {/* Tool Tips */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <h5 className="text-xs font-medium mb-2">💡 Quick Tips</h5>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Hold Shift while drawing for straight lines</p>
              <p>• Use Alt to temporarily disable snap-to-grid</p>
              <p>• Double-click objects to edit properties</p>
              <p>• Press Escape to cancel current operation</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
};
