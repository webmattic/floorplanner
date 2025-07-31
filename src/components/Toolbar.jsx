import React from "react";
import useFloorPlanStore from "../stores/floorPlanStore.js";

const Toolbar = () => {
  const { currentTool, setCurrentTool, viewMode, setViewMode } =
    useFloorPlanStore();

  const tools = [
    { id: "wall", icon: "🧱", label: "Draw Wall" },
    { id: "room", icon: "🚪", label: "Define Room" },
    { id: "furniture", icon: "🛋️", label: "Add Furniture" },
    { id: "measure", icon: "📏", label: "Measure" },
    { id: "comment", icon: "💬", label: "Add Comment" },
  ];

  const views = [
    { id: "2d", icon: "📐", label: "2D View" },
    { id: "3d", icon: "🧊", label: "3D View" },
  ];

  return (
    <>
      <div className="sidebar-section">
        <h3 className="sidebar-title">Tools</h3>
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-button ${currentTool === tool.id ? "active" : ""}`}
            onClick={() => setCurrentTool(tool.id)}
          >
            <span className="icon">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>
      <div className="sidebar-section">
        <h3 className="sidebar-title">View</h3>
        {views.map((view) => (
          <button
            key={view.id}
            className={`view-button ${viewMode === view.id ? "active" : ""}`}
            onClick={() => setViewMode(view.id)}
          >
            <span className="icon">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default Toolbar;
