import React, { useState } from "react";
import { FloatingToolbar } from "./ui/floating-toolbar";
import { cn } from "../lib/utils";
import {
  MousePointer2,
  Hammer,
  Home,
  Armchair,
  Ruler,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Save,
  Share2,
  Box as Cube,
  Move,
  Hand,
  Download,
  Layers,
} from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore";

const Toolbar: React.FC = () => {
  const {
    currentTool,
    setCurrentTool,
    viewMode,
    setViewMode,
    toggleGrid,
    showGrid,
    zoom,
    setZoom,
  } = useFloorPlanStore();

  const [toolbarPosition, setToolbarPosition] = useState<
    "top" | "bottom" | "left" | "right"
  >("top");

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);

  const handleSave = () => {
    const data = useFloorPlanStore.getState().exportFloorPlan();
    console.log("Export data:", data);
    // Implement save to Django API
    useFloorPlanStore.getState().saveFloorPlan();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
    alert("Exporting design...");
  };

  const toggleToolbarPosition = () => {
    const positions: Array<"top" | "bottom" | "left" | "right"> = [
      "top",
      "right",
      "bottom",
      "left",
    ];
    const currentIndex = positions.indexOf(toolbarPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    setToolbarPosition(positions[nextIndex]);
  };

  const toolGroups = [
    {
      id: "selection",
      items: [
        {
          id: "select",
          label: "Select",
          icon: <MousePointer2 className="h-4 w-4" />,
          active: currentTool === "select",
          onClick: () => setCurrentTool("select"),
        },
        {
          id: "hand",
          label: "Pan",
          icon: <Hand className="h-4 w-4" />,
          active: currentTool === "hand",
          onClick: () => setCurrentTool("hand"),
        },
      ],
    },
    {
      id: "drawing",
      items: [
        {
          id: "wall",
          label: "Draw Wall",
          icon: <Hammer className="h-4 w-4" />,
          active: currentTool === "wall",
          onClick: () => setCurrentTool("wall"),
        },
        {
          id: "room",
          label: "Add Room",
          icon: <Home className="h-4 w-4" />,
          active: currentTool === "room",
          onClick: () => setCurrentTool("room"),
        },
        {
          id: "furniture",
          label: "Add Furniture",
          icon: <Armchair className="h-4 w-4" />,
          active: currentTool === "furniture",
          onClick: () => setCurrentTool("furniture"),
        },
        {
          id: "measure",
          label: "Measure",
          icon: <Ruler className="h-4 w-4" />,
          active: currentTool === "measure",
          onClick: () => setCurrentTool("measure"),
        },
      ],
    },
    {
      id: "view",
      items: [
        {
          id: "2d",
          label: "2D View",
          icon: <Layers className="h-4 w-4" />,
          active: viewMode === "2d",
          onClick: () => setViewMode("2d"),
        },
        {
          id: "3d",
          label: "3D View",
          icon: <Cube className="h-4 w-4" />,
          active: viewMode === "3d",
          onClick: () => setViewMode("3d"),
        },
        {
          id: "grid",
          label: "Toggle Grid",
          icon: (
            <Grid3X3 className={cn("h-4 w-4", showGrid && "text-blue-500")} />
          ),
          active: showGrid,
          onClick: () => toggleGrid(),
        },
      ],
    },
    {
      id: "zoom",
      items: [
        {
          id: "zoom-in",
          label: "Zoom In",
          icon: <ZoomIn className="h-4 w-4" />,
          onClick: handleZoomIn,
        },
        {
          id: "zoom-out",
          label: "Zoom Out",
          icon: <ZoomOut className="h-4 w-4" />,
          onClick: handleZoomOut,
        },
      ],
    },
    {
      id: "export",
      items: [
        {
          id: "save",
          label: "Save",
          icon: <Save className="h-4 w-4" />,
          onClick: handleSave,
        },
        {
          id: "export",
          label: "Export",
          icon: <Download className="h-4 w-4" />,
          onClick: handleExport,
        },
        {
          id: "share",
          label: "Share",
          icon: <Share2 className="h-4 w-4" />,
          onClick: () => alert("Sharing design..."),
        },
      ],
    },
    {
      id: "layout",
      items: [
        {
          id: "move-toolbar",
          label: "Move Toolbar",
          icon: <Move className="h-4 w-4" />,
          onClick: toggleToolbarPosition,
        },
      ],
    },
  ];

  return (
    <>
      <FloatingToolbar
        groups={toolGroups}
        orientation={
          toolbarPosition === "left" || toolbarPosition === "right"
            ? "vertical"
            : "horizontal"
        }
        position={toolbarPosition}
        className="shadow-md"
      />

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-3 py-1 flex justify-between text-xs text-gray-600 z-20">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>View: {viewMode.toUpperCase()}</span>
          <span>
            Tool: {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}
          </span>
        </div>
        <div>
          <span>HomeDecor.in FloorPlanner v1.0</span>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
