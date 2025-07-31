import React, { useState } from "react";
// @ts-ignore - Import react-dnd packages
import { useDrag } from "react-dnd";
// @ts-ignore - Import react-dnd packages
import { getEmptyImage } from "react-dnd-html5-backend";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { MaterialData } from "./MaterialPalette";

// Define the drag type for materials
export const ItemTypes = {
  MATERIAL: "material",
};

interface DraggableMaterialProps {
  material: MaterialData;
  onApply: (material: MaterialData) => void;
}

export const DraggableMaterial: React.FC<DraggableMaterialProps> = ({
  material,
  onApply,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Set up drag functionality
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.MATERIAL,
    item: () => ({
      type: ItemTypes.MATERIAL,
      id: material.id,
      materialItem: material,
    }),
    end: (_: unknown, monitor: any) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        // Material was dropped on a droppable target
        onApply(material);
      }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Use empty image as drag preview (we'll create a custom one)
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <Card
      ref={drag}
      className={cn(
        "cursor-grab transition-all overflow-hidden",
        isDragging ? "opacity-50" : "opacity-100",
        isHovered ? "ring-2 ring-primary" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="h-24 bg-cover bg-center"
        style={{
          backgroundColor: material.color,
          backgroundImage: `url(${material.previewUrl})`,
        }}
      />
      <CardContent className="p-2">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium">{material.name}</h4>
            <p className="text-xs text-muted-foreground capitalize">
              {material.category}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onApply(material)}
          >
            <span className="sr-only">Apply</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const MaterialPreview: React.FC<{ material: MaterialData }> = ({
  material,
}) => {
  return (
    <div className="pointer-events-none fixed z-50 bg-white shadow-lg rounded-md p-2 w-48">
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded"
          style={{ backgroundColor: material.color }}
        />
        <div>
          <h4 className="text-sm font-medium">{material.name}</h4>
          <div className="text-xs text-gray-500 capitalize">
            {material.category} material
          </div>
        </div>
      </div>
    </div>
  );
};
