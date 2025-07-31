import React, { useState, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Package } from "lucide-react";
import { cn } from "../lib/utils";

export interface FurnitureItemData {
  id: number;
  name: string;
  category: string;
  description: string;
  price?: number;
  image_url?: string;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  style?: string;
  material?: string;
  color?: string;
}

interface DragItem {
  type: typeof ItemTypes.FURNITURE;
  id: number;
  furnitureItem: FurnitureItemData;
}

interface DraggableFurnitureProps {
  item: FurnitureItemData;
  onAdd: (item: FurnitureItemData) => void;
  getCategoryIcon: (categoryId: string) => React.ReactNode;
  showPrice?: boolean;
  compact?: boolean;
}

// Define the drag type for furniture
export const ItemTypes = {
  FURNITURE: "furniture",
};

export const DraggableFurniture: React.FC<DraggableFurnitureProps> = ({
  item,
  onAdd,
  getCategoryIcon,
  showPrice = true,
  compact = false,
}) => {
  const [isOver, setIsOver] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Set up drag functionality
  const [{ isDragging }, drag, preview] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: ItemTypes.FURNITURE,
    item: () => ({
      type: ItemTypes.FURNITURE,
      id: item.id,
      furnitureItem: item,
    }),
    end: (draggedItem, monitor) => {
      const dropResult = monitor.getDropResult();
      if (draggedItem && dropResult) {
        onAdd(item);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag source
  drag(dragRef);

  // Use empty image as drag preview (we'll create a custom one)
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  if (compact) {
    return (
      <div
        ref={dragRef}
        className={cn(
          "p-2 border rounded-lg bg-white cursor-grab transition-all",
          isDragging ? "opacity-50" : "opacity-100",
          isOver ? "border-primary" : "border-gray-200"
        )}
        onMouseOver={() => setIsOver(true)}
        onMouseOut={() => setIsOver(false)}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              getCategoryIcon(item.category)
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {item.dimensions.width}×{item.dimensions.height} cm
              </span>
              {showPrice && item.price && (
                <span className="text-xs font-medium">
                  ₹{item.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      ref={dragRef}
      className={cn(
        "border cursor-grab transition-all",
        isDragging ? "opacity-50" : "opacity-100",
        isOver ? "border-primary ring-1 ring-primary" : "border-gray-200"
      )}
      onMouseOver={() => setIsOver(true)}
      onMouseOut={() => setIsOver(false)}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              getCategoryIcon(item.category)
            )}
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
              <Badge variant="outline" className="text-xs ml-2">
                {item.category}
              </Badge>
            </div>

            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
              {item.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>
                {item.dimensions.width}×{item.dimensions.height}
                {item.dimensions.depth && `×${item.dimensions.depth}`} cm
              </span>
              {showPrice && item.price && (
                <span className="font-medium text-gray-900">
                  ₹{item.price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-1 mb-2">
              {item.style && (
                <Badge variant="secondary" className="text-xs">
                  {item.style}
                </Badge>
              )}
              {item.material && (
                <Badge variant="outline" className="text-xs">
                  {item.material}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DragPreview: React.FC<{ item: FurnitureItemData }> = ({
  item,
}) => {
  return (
    <div className="bg-white border border-primary shadow-lg rounded-md p-2 w-48 pointer-events-none">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h4 className="text-sm font-medium">{item.name}</h4>
          <div className="text-xs text-gray-500">
            {item.dimensions.width}×{item.dimensions.height} cm
          </div>
        </div>
      </div>
    </div>
  );
};
