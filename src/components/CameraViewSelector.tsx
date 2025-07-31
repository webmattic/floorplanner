import React from "react";
import { Button } from "./ui/button";
import {
  ChevronDown,
  Camera,
  ChevronsUp,
  ArrowRight,
  Maximize,
  LayoutGrid,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import useFloorPlanStore from "../stores/floorPlanStore";

interface CameraViewSelectorProps {
  className?: string;
}

const CameraViewSelector: React.FC<CameraViewSelectorProps> = ({
  className,
}) => {
  const cameraView = useFloorPlanStore((s) => s.cameraView);
  const setCameraView = useFloorPlanStore((s) => s.setCameraView);

  const cameraViews = [
    {
      id: "default",
      name: "Default View",
      icon: <Camera className="h-4 w-4" />,
    },
    { id: "top", name: "Top View", icon: <ChevronsUp className="h-4 w-4" /> },
    {
      id: "front",
      name: "Front View",
      icon: <ArrowRight className="h-4 w-4" />,
    },
    {
      id: "side",
      name: "Side View",
      icon: <ArrowRight className="h-4 w-4 rotate-90" />,
    },
    {
      id: "isometric",
      name: "Isometric",
      icon: <Maximize className="h-4 w-4" />,
    },
    {
      id: "corner",
      name: "Corner View",
      icon: <LayoutGrid className="h-4 w-4" />,
    },
  ];

  const activeView =
    cameraViews.find((view) => view.id === cameraView) || cameraViews[0];

  return (
    <div className={`flex ${className}`}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {activeView.icon}
                <span className="hidden sm:inline">{activeView.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Camera Views</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Camera Views</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {cameraViews.map((view) => (
            <DropdownMenuItem
              key={view.id}
              className="flex items-center gap-2"
              onClick={() => setCameraView(view.id)}
            >
              {view.icon}
              <span>{view.name}</span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCameraView("autoframe")}
            className="flex items-center gap-2"
          >
            <Maximize className="h-4 w-4" />
            <span>Auto-frame Scene</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CameraViewSelector;
