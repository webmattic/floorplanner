import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Button } from "./button";
import { Separator } from "./separator.tsx";

interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

interface ToolbarGroup {
  id: string;
  items: ToolbarItem[];
}

interface FloatingToolbarProps {
  groups: ToolbarGroup[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  onItemClick?: (itemId: string) => void;
  activeItem?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  groups,
  orientation = "horizontal",
  className,
  position = "top",
  onItemClick,
  activeItem,
}) => {
  const [currentActiveItem, setCurrentActiveItem] = useState(activeItem);

  const handleItemClick = (item: ToolbarItem) => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    }

    if (onItemClick) {
      onItemClick(item.id);
    }

    setCurrentActiveItem(item.id);
  };

  const isVertical = orientation === "vertical";

  const positionClasses = {
    top: "top-4 left-1/2 transform -translate-x-1/2",
    bottom: "bottom-4 left-1/2 transform -translate-x-1/2",
    left: "left-4 top-1/2 transform -translate-y-1/2",
    right: "right-4 top-1/2 transform -translate-y-1/2",
  };

  return (
    <div
      className={cn(
        "fixed z-40 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg border border-gray-200",
        isVertical ? "flex-col" : "flex-row",
        positionClasses[position],
        className
      )}
    >
      <div className={cn("flex p-1", isVertical ? "flex-col" : "flex-row")}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.id}>
            {groupIndex > 0 && (
              <Separator
                className={cn(
                  "mx-1 my-1",
                  isVertical ? "w-full h-0" : "h-full w-0"
                )}
              />
            )}
            <div
              className={cn("flex gap-1", isVertical ? "flex-col" : "flex-row")}
            >
              {group.items.map((item) => {
                const isActive = item.active || currentActiveItem === item.id;

                return (
                  <Tooltip key={item.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={cn(
                          "h-9 w-9 rounded",
                          isActive && "bg-primary/10",
                          item.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {item.icon}
                        <span className="sr-only">{item.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={isVertical ? "right" : "bottom"}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FloatingToolbar;
