import React, { useState, useCallback, useMemo } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Separator } from "../ui/separator.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  Info,
  Palette,
  Move,
  Square,
  Package,
  DoorOpen,
  Type,
  Ruler,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

// Layer interface
interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  order: number;
  objectCount: number;
  type?: "default" | "custom";
}

// Default layers that come with the system
const DEFAULT_LAYERS: Omit<Layer, "objectCount">[] = [
  {
    id: "walls",
    name: "Walls",
    color: "#8B4513",
    visible: true,
    locked: false,
    order: 0,
    type: "default",
  },
  {
    id: "rooms",
    name: "Rooms",
    color: "#90EE90",
    visible: true,
    locked: false,
    order: 1,
    type: "default",
  },
  {
    id: "furniture",
    name: "Furniture",
    color: "#4169E1",
    visible: true,
    locked: false,
    order: 2,
    type: "default",
  },
  {
    id: "doors-windows",
    name: "Doors & Windows",
    color: "#FF6347",
    visible: true,
    locked: false,
    order: 3,
    type: "default",
  },
  {
    id: "dimensions",
    name: "Dimensions",
    color: "#FFD700",
    visible: true,
    locked: false,
    order: 4,
    type: "default",
  },
  {
    id: "text-labels",
    name: "Text & Labels",
    color: "#9370DB",
    visible: true,
    locked: false,
    order: 5,
    type: "default",
  },
];

// Layer colors for new layers
const LAYER_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
];

export const LayersPanel: React.FC = () => {
  const { walls, rooms, furniture } = useFloorPlanStore();

  // Layer management state
  const [layers, setLayers] = useState<Layer[]>(() =>
    DEFAULT_LAYERS.map((layer) => ({
      ...layer,
      objectCount: getObjectCountForLayer(layer.id),
    }))
  );

  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  const [dragOverLayer, setDragOverLayer] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Form states
  const [newLayerName, setNewLayerName] = useState("");
  const [newLayerColor, setNewLayerColor] = useState(LAYER_COLORS[0]);
  const [editLayerName, setEditLayerName] = useState("");
  const [editLayerColor, setEditLayerColor] = useState("");

  // Helper function to get object count for a layer
  function getObjectCountForLayer(layerId: string): number {
    switch (layerId) {
      case "walls":
        return walls.length;
      case "rooms":
        return rooms.length;
      case "furniture":
        return furniture.length;
      case "doors-windows":
        // In a real implementation, you'd have door/window objects
        return 0;
      case "dimensions":
        // In a real implementation, you'd have dimension objects
        return 0;
      case "text-labels":
        // In a real implementation, you'd have text/annotation objects
        return 0;
      default:
        return 0;
    }
  }

  // Update object counts when store changes
  const updateObjectCounts = useCallback(() => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => ({
        ...layer,
        objectCount: getObjectCountForLayer(layer.id),
      }))
    );
  }, [walls.length, rooms.length, furniture.length]);

  // Update counts when objects change
  React.useEffect(() => {
    updateObjectCounts();
  }, [updateObjectCounts]);

  // Sorted layers by order
  const sortedLayers = useMemo(
    () => [...layers].sort((a, b) => a.order - b.order),
    [layers]
  );

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  // Toggle layer lock
  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  }, []);

  // Create new layer
  const createLayer = useCallback(() => {
    if (!newLayerName.trim()) return;

    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: newLayerName.trim(),
      color: newLayerColor,
      visible: true,
      locked: false,
      order: layers.length,
      objectCount: 0,
      type: "custom",
    };

    setLayers((prevLayers) => [...prevLayers, newLayer]);
    setNewLayerName("");
    setNewLayerColor(LAYER_COLORS[0]);
    setIsCreateDialogOpen(false);
  }, [newLayerName, newLayerColor, layers.length]);

  // Edit layer
  const editLayer = useCallback(() => {
    if (!selectedLayerId || !editLayerName.trim()) return;

    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === selectedLayerId
          ? { ...layer, name: editLayerName.trim(), color: editLayerColor }
          : layer
      )
    );

    setIsEditDialogOpen(false);
    setSelectedLayerId(null);
    setEditLayerName("");
    setEditLayerColor("");
  }, [selectedLayerId, editLayerName, editLayerColor]);

  // Delete layer
  const deleteLayer = useCallback(() => {
    if (!selectedLayerId) return;

    setLayers((prevLayers) =>
      prevLayers.filter((layer) => layer.id !== selectedLayerId)
    );

    setIsDeleteDialogOpen(false);
    setSelectedLayerId(null);
  }, [selectedLayerId]);

  // Open edit dialog
  const openEditDialog = useCallback((layer: Layer) => {
    setSelectedLayerId(layer.id);
    setEditLayerName(layer.name);
    setEditLayerColor(layer.color);
    setIsEditDialogOpen(true);
  }, []);

  // Open delete dialog
  const openDeleteDialog = useCallback((layerId: string) => {
    setSelectedLayerId(layerId);
    setIsDeleteDialogOpen(true);
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, layerId: string) => {
    setDraggedLayer(layerId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverLayer(layerId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverLayer(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetLayerId: string) => {
      e.preventDefault();

      if (!draggedLayer || draggedLayer === targetLayerId) {
        setDraggedLayer(null);
        setDragOverLayer(null);
        return;
      }

      setLayers((prevLayers) => {
        const newLayers = [...prevLayers];
        const draggedIndex = newLayers.findIndex((l) => l.id === draggedLayer);
        const targetIndex = newLayers.findIndex((l) => l.id === targetLayerId);

        if (draggedIndex === -1 || targetIndex === -1) return prevLayers;

        // Remove dragged layer and insert at target position
        const [draggedLayerObj] = newLayers.splice(draggedIndex, 1);
        newLayers.splice(targetIndex, 0, draggedLayerObj);

        // Update order values
        return newLayers.map((layer, index) => ({
          ...layer,
          order: index,
        }));
      });

      setDraggedLayer(null);
      setDragOverLayer(null);
    },
    [draggedLayer]
  );

  // Get layer icon
  const getLayerIcon = (layerId: string) => {
    switch (layerId) {
      case "walls":
        return Move;
      case "rooms":
        return Square;
      case "furniture":
        return Package;
      case "doors-windows":
        return DoorOpen;
      case "dimensions":
        return Ruler;
      case "annotations":
        return Type;
      default:
        return Layers;
    }
  };

  return (
    <FloatingPanel panelId="layers">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2" data-testid="layer-management-header">
            <Layers className="h-4 w-4" />
            Layer Management
          </h3>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7" data-testid="add-layer-button">
                <Plus className="h-3 w-3 mr-1" />
                Add Layer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Layer</DialogTitle>
                <DialogDescription>
                  Add a new layer to organize your floor plan elements.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="layer-name">Layer Name</Label>
                  <Input
                    id="layer-name"
                    value={newLayerName}
                    onChange={(e) => setNewLayerName(e.target.value)}
                    placeholder="Enter layer name..."
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="layer-color">Layer Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="layer-color"
                      type="color"
                      value={newLayerColor}
                      onChange={(e) => setNewLayerColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <div className="grid grid-cols-5 gap-1 flex-1">
                      {LAYER_COLORS.slice(0, 10).map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border border-border/40 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => setNewLayerColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createLayer} disabled={!newLayerName.trim()}>
                  Create Layer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* Layers List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {sortedLayers.map((layer) => {
              const IconComponent = getLayerIcon(layer.id);
              const isDragging = draggedLayer === layer.id;
              const isDragOver = dragOverLayer === layer.id;

              return (
                <Card
                  key={layer.id}
                  className={`transition-all duration-200 ${isDragging ? "opacity-50 scale-95" : ""}
                    ${isDragOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, layer.id)}
                  onDragOver={(e) => handleDragOver(e, layer.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, layer.id)}
                  data-testid={`layer-card-${layer.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Drag Handle */}
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:text-foreground" data-testid="drag-handle" />

                      {/* Layer Color & Icon */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-border/40"
                          style={{ backgroundColor: layer.color }}
                        />
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Layer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate" data-testid={`layer-name-${layer.id}`}>
                            {layer.name}
                          </span>
                          {layer.type === "default" && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1 py-0"
                              data-testid={`layer-default-badge-${layer.id}`}
                            >
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground" data-testid={`layer-object-count-${layer.id}`}
                          data-layer-id={layer.id}>
                          {layer.objectCount} object{layer.objectCount !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Layer Controls */}
                      <div className="flex items-center gap-1">
                        {/* Visibility Toggle */}
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

                        {/* Lock Toggle */}
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

                        {/* Edit Button (only for custom layers) */}
                        {layer.type === "custom" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(layer)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Edit layer</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Delete Button (only for custom layers) */}
                        {layer.type === "custom" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(layer.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Delete layer</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Layer Statistics */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span data-testid="total-layers-label">Total Layers:</span>
              <span className="font-medium" data-testid="total-layers-value">{layers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span data-testid="visible-layers-label">Visible Layers:</span>
              <span className="font-medium" data-testid="visible-layers-value">
                {layers.filter((l) => l.visible).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span data-testid="total-objects-label">Total Objects:</span>
              <span className="font-medium" data-testid="total-objects-value">
                {layers.reduce((sum, layer) => sum + layer.objectCount, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Help Information */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs" data-testid="layer-help-alert">
            Drag layers to reorder them. Use visibility and lock controls to
            manage your workspace. Default layers cannot be deleted.
          </AlertDescription>
        </Alert>
      </div>

      {/* Edit Layer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Layer</DialogTitle>
            <DialogDescription>
              Modify the layer name and color.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-layer-name">Layer Name</Label>
              <Input
                id="edit-layer-name"
                value={editLayerName}
                onChange={(e) => setEditLayerName(e.target.value)}
                placeholder="Enter layer name..."
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-layer-color">Layer Color</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-layer-color"
                  type="color"
                  value={editLayerColor}
                  onChange={(e) => setEditLayerColor(e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <div className="grid grid-cols-5 gap-1 flex-1">
                  {LAYER_COLORS.slice(0, 10).map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-border/40 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setEditLayerColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={editLayer} disabled={!editLayerName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Layer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Layer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this layer? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteLayer}>
              Delete Layer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FloatingPanel>
  );
};
