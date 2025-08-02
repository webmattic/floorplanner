import React from "react";
// @ts-ignore - React DND types are causing issues
import { useDrop, DropTargetMonitor } from "react-dnd";
// @ts-ignore
import { getEmptyImage } from "react-dnd-html5-backend";
import { ItemTypes } from "./DraggableFurniture";
import useFloorPlanStore from "../stores/floorPlanStore";
import { FurnitureItemData } from "./DraggableFurniture";

interface DropZoneProps {
  children: React.ReactNode;
}

// This type is used internally by the component
// to define the shape of dragged furniture items
interface DraggedFurnitureItem {
  type: string;
  id: number;
  furnitureItem: FurnitureItemData;
}

/**
 * A component that wraps the canvas and handles furniture item drops
 */
const CanvasDropZone: React.FC<DropZoneProps> = ({ children }) => {
  // Use selector pattern instead of destructuring to avoid TypeScript errors
  const addFurniture = useFloorPlanStore((state) => state.addFurniture);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.FURNITURE,
    drop: (item: DraggedFurnitureItem, monitor: DropTargetMonitor) => {
      // Calculate drop position relative to the canvas
      const clientOffset = monitor.getClientOffset();

      // Get the DOM node to calculate the position (commented out as we're not using it currently)
      // const dropTargetXY = monitor.getDropTargetClientOffset();

      if (clientOffset && item.furnitureItem) {
        // Get canvas element and calculate relative position
        const canvasElement = document.getElementById("canvas-container");
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const x = clientOffset.x - rect.left;
          const y = clientOffset.y - rect.top;

          // Get furniture dimensions from the item
          const { dimensions } = item.furnitureItem;
          const width = dimensions?.width || 50;
          const height = dimensions?.height || 50;

          // Adjust position to center the furniture on the drop point
          const adjustedX = Math.max(0, x - width / 2);
          const adjustedY = Math.max(0, y - height / 2);

          // Get current zoom level
          const zoom = 1; // Default to 1 if can't access store
          const scaledWidth = width / zoom;
          const scaledHeight = height / zoom;

          // Add furniture to the store
          addFurniture({
            x: adjustedX / zoom,
            y: adjustedY / zoom,
            width: scaledWidth,
            height: scaledHeight,
            color: "#8b5cf6",
            label: item.furnitureItem.name,
          });

          return { dropped: true };
        }
      }
      return { dropped: false };
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as any}
      id="canvas-container"
      className="relative w-full h-full"
      style={{
        outline: isOver ? "2px dashed #3b82f6" : "none",
        backgroundColor:
          isOver && canDrop ? "rgba(59, 130, 246, 0.05)" : "transparent",
      }}
    >
      {children}

      {/* Optional overlay to show drop status */}
      {isOver && canDrop && (
        <div className="absolute inset-0 pointer-events-none bg-blue-500/10 flex items-center justify-center">
          <div className="bg-white/90 px-3 py-1 rounded-full shadow-lg text-sm font-medium text-blue-600">
            Drop furniture here
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasDropZone;
