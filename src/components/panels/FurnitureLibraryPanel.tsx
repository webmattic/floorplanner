import React, { useState, useRef, useCallback, useMemo } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Search,
  Package,
  Sofa,
  Bed,
  Table,
  Lamp,
  Grid3x3,
  Filter,
  X,
  Move,
  Maximize2,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

interface FurnitureItem {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  category: string;
  tags: string[];
  description?: string;
}

const FURNITURE_CATEGORIES = [
  { id: "seating", label: "Seating", icon: Sofa, color: "#8B4513" },
  { id: "tables", label: "Tables", icon: Table, color: "#8B4513" },
  { id: "bedroom", label: "Bedroom", icon: Bed, color: "#8B4513" },
  { id: "storage", label: "Storage", icon: Package, color: "#8B4513" },
  { id: "lighting", label: "Lighting", icon: Lamp, color: "#FFD700" },
  { id: "decor", label: "Decor", icon: Package, color: "#228B22" },
];

const SAMPLE_FURNITURE: Record<string, FurnitureItem[]> = {
  seating: [
    {
      id: "sofa-1",
      name: "Modern Sofa",
      width: 200,
      height: 80,
      color: "#8B4513",
      category: "seating",
      tags: ["modern", "living room", "3-seater"],
      description: "Comfortable 3-seater modern sofa",
    },
    {
      id: "chair-1",
      name: "Office Chair",
      width: 60,
      height: 60,
      color: "#2F4F4F",
      category: "seating",
      tags: ["office", "ergonomic", "swivel"],
      description: "Ergonomic office chair with swivel base",
    },
    {
      id: "armchair-1",
      name: "Armchair",
      width: 80,
      height: 80,
      color: "#8B4513",
      category: "seating",
      tags: ["comfort", "reading", "single"],
      description: "Comfortable reading armchair",
    },
    {
      id: "sectional-1",
      name: "L-Sectional",
      width: 240,
      height: 160,
      color: "#8B4513",
      category: "seating",
      tags: ["sectional", "large", "corner"],
      description: "Large L-shaped sectional sofa",
    },
  ],
  tables: [
    {
      id: "dining-table-1",
      name: "Dining Table",
      width: 160,
      height: 80,
      color: "#8B4513",
      category: "tables",
      tags: ["dining", "rectangular", "6-seater"],
      description: "Rectangular dining table for 6 people",
    },
    {
      id: "coffee-table-1",
      name: "Coffee Table",
      width: 120,
      height: 60,
      color: "#8B4513",
      category: "tables",
      tags: ["coffee", "living room", "rectangular"],
      description: "Rectangular coffee table",
    },
    {
      id: "desk-1",
      name: "Office Desk",
      width: 140,
      height: 70,
      color: "#8B4513",
      category: "tables",
      tags: ["office", "work", "computer"],
      description: "Computer desk with storage",
    },
    {
      id: "round-table-1",
      name: "Round Table",
      width: 120,
      height: 120,
      color: "#8B4513",
      category: "tables",
      tags: ["round", "dining", "4-seater"],
      description: "Round dining table for 4 people",
    },
  ],
  bedroom: [
    {
      id: "bed-1",
      name: "Queen Bed",
      width: 160,
      height: 200,
      color: "#8B4513",
      category: "bedroom",
      tags: ["queen", "bed", "sleep"],
      description: "Queen size bed with headboard",
    },
    {
      id: "nightstand-1",
      name: "Nightstand",
      width: 50,
      height: 40,
      color: "#8B4513",
      category: "bedroom",
      tags: ["nightstand", "bedside", "storage"],
      description: "Bedside nightstand with drawer",
    },
    {
      id: "dresser-1",
      name: "Dresser",
      width: 120,
      height: 50,
      color: "#8B4513",
      category: "bedroom",
      tags: ["dresser", "storage", "clothes"],
      description: "6-drawer dresser",
    },
    {
      id: "king-bed-1",
      name: "King Bed",
      width: 180,
      height: 200,
      color: "#8B4513",
      category: "bedroom",
      tags: ["king", "bed", "large"],
      description: "King size bed with headboard",
    },
  ],
  storage: [
    {
      id: "bookshelf-1",
      name: "Bookshelf",
      width: 80,
      height: 30,
      color: "#8B4513",
      category: "storage",
      tags: ["books", "shelving", "display"],
      description: "5-shelf bookcase",
    },
    {
      id: "wardrobe-1",
      name: "Wardrobe",
      width: 120,
      height: 60,
      color: "#8B4513",
      category: "storage",
      tags: ["wardrobe", "clothes", "hanging"],
      description: "Double door wardrobe",
    },
    {
      id: "cabinet-1",
      name: "Cabinet",
      width: 100,
      height: 40,
      color: "#8B4513",
      category: "storage",
      tags: ["cabinet", "storage", "doors"],
      description: "Storage cabinet with doors",
    },
    {
      id: "chest-1",
      name: "Storage Chest",
      width: 90,
      height: 45,
      color: "#8B4513",
      category: "storage",
      tags: ["chest", "storage", "blankets"],
      description: "Storage chest for blankets",
    },
  ],
  lighting: [
    {
      id: "floor-lamp-1",
      name: "Floor Lamp",
      width: 30,
      height: 30,
      color: "#FFD700",
      category: "lighting",
      tags: ["floor", "lamp", "ambient"],
      description: "Modern floor lamp",
    },
    {
      id: "table-lamp-1",
      name: "Table Lamp",
      width: 20,
      height: 20,
      color: "#FFD700",
      category: "lighting",
      tags: ["table", "lamp", "desk"],
      description: "Desk table lamp",
    },
    {
      id: "chandelier-1",
      name: "Chandelier",
      width: 60,
      height: 60,
      color: "#FFD700",
      category: "lighting",
      tags: ["chandelier", "ceiling", "elegant"],
      description: "Crystal chandelier",
    },
    {
      id: "pendant-1",
      name: "Pendant Light",
      width: 25,
      height: 25,
      color: "#FFD700",
      category: "lighting",
      tags: ["pendant", "hanging", "modern"],
      description: "Modern pendant light",
    },
  ],
  decor: [
    {
      id: "plant-1",
      name: "Plant",
      width: 40,
      height: 40,
      color: "#228B22",
      category: "decor",
      tags: ["plant", "green", "natural"],
      description: "Indoor potted plant",
    },
    {
      id: "artwork-1",
      name: "Artwork",
      width: 60,
      height: 80,
      color: "#4169E1",
      category: "decor",
      tags: ["art", "wall", "painting"],
      description: "Framed artwork",
    },
    {
      id: "mirror-1",
      name: "Mirror",
      width: 50,
      height: 70,
      color: "#C0C0C0",
      category: "decor",
      tags: ["mirror", "wall", "reflection"],
      description: "Wall-mounted mirror",
    },
    {
      id: "vase-1",
      name: "Decorative Vase",
      width: 20,
      height: 20,
      color: "#8B4513",
      category: "decor",
      tags: ["vase", "decoration", "ceramic"],
      description: "Ceramic decorative vase",
    },
  ],
};

export const FurnitureLibraryPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("seating");
  const [draggedItem, setDraggedItem] = useState<FurnitureItem | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const { gridSize, snapToGrid, addFurniture } = useFloorPlanStore();

  // Get all available tags for filtering
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(SAMPLE_FURNITURE)
      .flat()
      .forEach((item) => {
        item.tags.forEach((tag) => tags.add(tag));
      });
    return Array.from(tags).sort();
  }, []);

  // Enhanced filtering with search and tags
  const filteredFurniture = useMemo(() => {
    let items =
      SAMPLE_FURNITURE[selectedCategory as keyof typeof SAMPLE_FURNITURE] || [];

    // Filter by search query
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      items = items.filter((item) =>
        selectedTags.some((tag) => item.tags.includes(tag))
      );
    }

    return items;
  }, [selectedCategory, searchQuery, selectedTags]);

  // Enhanced drag start with better data transfer
  const handleDragStart = useCallback(
    (e: React.DragEvent, furniture: FurnitureItem) => {
      setDraggedItem(furniture);
      setIsDragging(true);

      // Set drag data
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "furniture",
          ...furniture,
        })
      );

      // Set drag effect
      e.dataTransfer.effectAllowed = "copy";

      // Create custom drag image
      const dragImage = document.createElement("div");
      dragImage.style.width = `${furniture.width / 4}px`;
      dragImage.style.height = `${furniture.height / 4}px`;
      dragImage.style.backgroundColor = furniture.color;
      dragImage.style.border = "2px solid #3b82f6";
      dragImage.style.borderRadius = "4px";
      dragImage.style.opacity = "0.8";
      dragImage.style.position = "absolute";
      dragImage.style.top = "-1000px";
      document.body.appendChild(dragImage);

      e.dataTransfer.setDragImage(
        dragImage,
        furniture.width / 8,
        furniture.height / 8
      );

      // Clean up drag image after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setIsDragging(false);
  }, []);

  // Touch handling for mobile devices
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, furniture: FurnitureItem) => {
      const touch = e.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setDraggedItem(furniture);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartPos || !draggedItem) return;

      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);

      // Start dragging if moved enough
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true);
      }
    },
    [touchStartPos, draggedItem]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !draggedItem) {
        setTouchStartPos(null);
        setDraggedItem(null);
        setIsDragging(false);
        return;
      }

      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      // Check if dropped on canvas
      const canvas = document.querySelector("canvas");
      if (
        canvas &&
        (elementBelow === canvas || canvas.contains(elementBelow))
      ) {
        // Calculate canvas-relative position
        const canvasRect = canvas.getBoundingClientRect();
        const canvasX = touch.clientX - canvasRect.left;
        const canvasY = touch.clientY - canvasRect.top;

        // Convert to floor plan coordinates and add furniture
        const { zoom, panX, panY } = useFloorPlanStore.getState();
        const floorPlanX = (canvasX - panX) / zoom;
        const floorPlanY = (canvasY - panY) / zoom;

        // Snap to grid if enabled
        const finalPos = snapToGrid
          ? {
              x: Math.round(floorPlanX / gridSize) * gridSize,
              y: Math.round(floorPlanY / gridSize) * gridSize,
            }
          : { x: floorPlanX, y: floorPlanY };

        addFurniture({
          x: finalPos.x,
          y: finalPos.y,
          width: draggedItem.width,
          height: draggedItem.height,
          color: draggedItem.color,
          label: draggedItem.name,
        });
      }

      setTouchStartPos(null);
      setDraggedItem(null);
      setIsDragging(false);
    },
    [isDragging, draggedItem, snapToGrid, gridSize, addFurniture]
  );

  // Handle tag filter toggle
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTags([]);
  }, []);

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = FURNITURE_CATEGORIES.find((cat) => cat.id === categoryId);
    return category?.icon || Package;
  };

  return (
    <FloatingPanel panelId="furnitureLibrary">
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Tag Filters */}
          {showFilters && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter by tags:</span>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 h-auto">
            {FURNITURE_CATEGORIES.slice(0, 3).map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col gap-1 h-12 text-xs"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 mt-1 h-auto">
            {FURNITURE_CATEGORIES.slice(3).map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col gap-1 h-12 text-xs"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>{filteredFurniture.length} items found</span>
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Furniture Items */}
          <ScrollArea className="h-[320px] mt-2">
            <div className="grid grid-cols-2 gap-2 pr-2">
              {filteredFurniture.map((item) => {
                const IconComponent = getCategoryIcon(item.category);
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Card
                        className={`cursor-move hover:shadow-md transition-all duration-200 hover:scale-105 ${
                          isDragging && draggedItem?.id === item.id
                            ? "opacity-50 scale-95"
                            : ""
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, item)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <CardContent className="p-3">
                          <div
                            className="w-full h-16 rounded mb-2 flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: item.color }}
                          >
                            <IconComponent className="h-6 w-6 text-white/80" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.width} × {item.height}
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs px-1 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1 py-0"
                                  >
                                    +{item.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                        <div className="text-xs">
                          Size: {item.width} × {item.height} pixels
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {filteredFurniture.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Package className="h-8 w-8 mb-2" />
                <div className="text-sm">No furniture found</div>
                <div className="text-xs">
                  Try adjusting your search or filters
                </div>
              </div>
            )}
          </ScrollArea>
        </Tabs>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Move className="h-3 w-3" />
            <span>Drag furniture to canvas for automatic placement</span>
          </div>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-3 w-3" />
            <span>Items snap to grid when enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize2 className="h-3 w-3" />
            <span>Use corner handles to resize after placement</span>
          </div>
        </div>

        {/* Drag preview for mobile */}
        {isDragging && draggedItem && (
          <div
            ref={dragPreviewRef}
            className="fixed pointer-events-none z-50 opacity-80"
            style={{
              width: draggedItem.width / 4,
              height: draggedItem.height / 4,
              backgroundColor: draggedItem.color,
              border: "2px solid #3b82f6",
              borderRadius: "4px",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>
    </FloatingPanel>
  );
};
