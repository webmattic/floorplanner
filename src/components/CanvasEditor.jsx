import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import useFloorPlanStore from "../stores/floorPlanStore.js";

const CanvasEditor = () => {
  const {
    walls,
    rooms,
    furniture,
    addWall,
    currentTool,
    zoom,
    panX,
    panY,
    setPan,
    selectedElements,
    setSelectedElements,
    viewMode,
    addRoom,
    addFurniture,
    comments,
  } = useFloorPlanStore();

  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [lighting, setLighting] = useState(50);
  const [sharedCursors, setSharedCursors] = useState([
    { x: 100, y: 100, name: "Alice" },
    { x: 200, y: 150, name: "Bob" },
  ]); // Placeholder for demo

  // DXF geometry state
  const [dxfGeometry, setDxfGeometry] = useState([]);
  const [dxfFileId, setDxfFileId] = useState(null);

  // Fetch DXF geometry when a file is selected
  useEffect(() => {
    if (dxfFileId) {
      axios
        .get(`/api/floorplanner/media/${dxfFileId}/geometry/`)
        .then((res) => {
          if (Array.isArray(res.data)) setDxfGeometry(res.data);
        });
    }
  }, [dxfFileId]);

  // Comment pins feature
  const [commentPins, setCommentPins] = useState([
    { x: 120, y: 120, text: "Try blue here?" },
  ]); // Placeholder for demo

  const addCommentPin = (x, y, text) => {
    setCommentPins((pins) => [...pins, { x, y, text }]);
  };

  useEffect(() => {
    const container = document.querySelector(".canvas-container");
    const handleResize = () => {
      if (container) {
        setStageSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  const GridLayer = ({ gridSpacing = 20 }) => {
    const lines = [];
    if (!stageSize.width) return null;

    // Vertical lines
    for (let i = 0; i < stageSize.width / gridSpacing + 1; i++) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i * gridSpacing, 0, i * gridSpacing, stageSize.height]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i < stageSize.height / gridSpacing + 1; i++) {
      lines.push(
        <Line
          key={`h${i}`}
          points={[0, i * gridSpacing, stageSize.width, i * gridSpacing]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  const Wall = ({ wall, isSelected, onClick }) => (
    <Line
      points={wall.points}
      stroke={isSelected ? "#3b82f6" : "#374151"}
      strokeWidth={wall.thickness || 8}
      lineCap="round"
      lineJoin="round"
      onClick={onClick}
    />
  );

  // Add resize handles to Room and Furniture components
  const ResizeHandle = ({ x, y, onDragMove }) => (
    <Rect
      x={x - 6}
      y={y - 6}
      width={12}
      height={12}
      fill="#3b82f6"
      draggable
      onDragMove={onDragMove}
      cornerRadius={3}
      shadowBlur={2}
    />
  );

  // Auto-calculated room dimensions
  const RoomDimensions = ({ room }) => (
    <Text
      x={room.x + room.width / 2 - 40}
      y={room.y + room.height / 2 - 10}
      text={`${Math.round(room.width)} x ${Math.round(room.height)} cm`}
      fontSize={14}
      fill="#374151"
      fontStyle="bold"
    />
  );

  const Room = ({ room, isSelected, onClick }) => (
    <React.Fragment>
      <Rect
        x={room.x}
        y={room.y}
        width={room.width}
        height={room.height}
        fill={room.color || "rgba(59, 130, 246, 0.1)"}
        stroke={isSelected ? "#3b82f6" : "#9ca3af"}
        strokeWidth={isSelected ? 2 : 1}
        onClick={onClick}
        onDrop={(e) => {
          const color = e.evt.dataTransfer.getData("material");
          if (color) useFloorPlanStore.getState().updateElement({ color });
        }}
        onDragOver={(e) => e.evt.preventDefault()}
      />
      <RoomDimensions room={room} />
      {isSelected && (
        <ResizeHandle
          x={room.x + room.width}
          y={room.y + room.height}
          onDragMove={(e) => {
            const newWidth = Math.max(20, e.target.x() - room.x);
            const newHeight = Math.max(20, e.target.y() - room.y);
            useFloorPlanStore
              .getState()
              .updateElement({ width: newWidth, height: newHeight });
          }}
        />
      )}
    </React.Fragment>
  );

  const Furniture = ({ item, isSelected, onClick }) => (
    <React.Fragment>
      <Rect
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        fill={item.color || "#8b5cf6"}
        stroke={isSelected ? "#3b82f6" : "#6b7280"}
        strokeWidth={isSelected ? 2 : 1}
        onClick={onClick}
        onDrop={(e) => {
          const color = e.evt.dataTransfer.getData("material");
          if (color) useFloorPlanStore.getState().updateElement({ color });
        }}
        onDragOver={(e) => e.evt.preventDefault()}
      />
      <Text
        x={item.x + 5}
        y={item.y + 5}
        text={item.label || "Furniture"}
        fontSize={12}
        fill="white"
      />
      {isSelected && (
        <ResizeHandle
          x={item.x + item.width}
          y={item.y + item.height}
          onDragMove={(e) => {
            const newWidth = Math.max(10, e.target.x() - item.x);
            const newHeight = Math.max(10, e.target.y() - item.y);
            useFloorPlanStore
              .getState()
              .updateElement({ width: newWidth, height: newHeight });
          }}
        />
      )}
    </React.Fragment>
  );

  const handleMouseDown = (e) => {
    if (currentTool === "wall") {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const adjustedPos = {
        x: (pos.x - panX) / zoom,
        y: (pos.y - panY) / zoom,
      };
      setCurrentPath([adjustedPos.x, adjustedPos.y]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || currentTool !== "wall") return;

    const pos = e.target.getStage().getPointerPosition();
    const adjustedPos = {
      x: (pos.x - panX) / zoom,
      y: (pos.y - panY) / zoom,
    };
    setCurrentPath((prev) => [...prev, adjustedPos.x, adjustedPos.y]);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length >= 4) {
      addWall({
        points: currentPath,
        thickness: 8,
        color: "#374151",
      });
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleElementClick = (element, type) => {
    if (currentTool === "select") {
      setSelectedElements([{ ...element, type }]);
    }
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedElements([]);

      const pos = e.target.getStage().getPointerPosition();
      const adjustedPos = {
        x: (pos.x - panX) / zoom,
        y: (pos.y - panY) / zoom,
      };

      if (currentTool === "room") {
        addRoom({
          x: adjustedPos.x,
          y: adjustedPos.y,
          width: 100,
          height: 100,
          color: "rgba(59, 130, 246, 0.1)",
          label: "New Room",
        });
      }

      if (currentTool === "furniture") {
        addFurniture({
          x: adjustedPos.x,
          y: adjustedPos.y,
          width: 60,
          height: 30,
          color: "#8b5cf6",
          label: "Furniture",
        });
      }

      if (currentTool === "comment") {
        // Add a new comment at click position
        const { addComment } = useFloorPlanStore.getState();
        addComment({
          id: `comment-${Date.now()}`,
          x: adjustedPos.x,
          y: adjustedPos.y,
          text: "Add your comment here...",
          createdAt: new Date().toISOString(),
          author: "Current User", // This would come from auth
          replies: [],
        });
      }
    }
  };

  // Add touch event handlers for mobile support
  useEffect(() => {
    const stage = stageRef.current?.getStage();
    if (!stage) return;

    const handleTouchStart = (e) => {
      if (currentTool === "wall") {
        setIsDrawing(true);
        const touch = e.evt.touches[0];
        const pos = stage.getPointerPosition();
        setCurrentPath([pos.x, pos.y]);
      }
    };
    const handleTouchMove = (e) => {
      if (!isDrawing || currentTool !== "wall") return;
      const touch = e.evt.touches[0];
      const pos = stage.getPointerPosition();
      setCurrentPath((prev) => [...prev, pos.x, pos.y]);
    };
    const handleTouchEnd = () => {
      if (isDrawing && currentPath.length >= 4) {
        addWall({ points: currentPath, thickness: 8, color: "#374151" });
      }
      setIsDrawing(false);
      setCurrentPath([]);
    };

    stage.on("touchstart", handleTouchStart);
    stage.on("touchmove", handleTouchMove);
    stage.on("touchend", handleTouchEnd);

    return () => {
      stage.off("touchstart", handleTouchStart);
      stage.off("touchmove", handleTouchMove);
      stage.off("touchend", handleTouchEnd);
    };
  }, [currentTool, isDrawing, currentPath, addWall]);

  const RealTime3DPreview = ({ walls, rooms, furniture }) => (
    <div
      className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50"
      style={{ width: 320, height: 240 }}
    >
      <div className="text-center text-gray-700">
        Live 3D Preview (Three.js integration coming soon)
      </div>
      {/* Here you would render the Three.js scene based on walls, rooms, furniture */}
    </div>
  );

  // Auto-camera angle logic for 3D view
  const getOptimalCameraAngle = (walls, rooms, furniture) => {
    // Placeholder: center the camera based on bounding box of all elements
    // In a real Three.js scene, you would compute the bounding box and set camera position
    return { x: 0, y: 0, z: 500, lookAt: { x: 0, y: 0, z: 0 } };
  };

  if (viewMode === "3d") {
    const camera = getOptimalCameraAngle(walls, rooms, furniture);
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 text-5xl">🎯</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">3D View</h3>
          <p className="text-gray-600">
            3D visualization will be implemented with Three.js
            <br />
            <span className="text-xs">
              Camera auto-set to optimal angle: {JSON.stringify(camera)}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Material swatch panel
  const MATERIALS = [
    { name: "Wall White", color: "#f3f4f6" },
    { name: "Floor Wood", color: "#deb887" },
    { name: "Fabric Blue", color: "#3b82f6" },
    { name: "Fabric Green", color: "#10b981" },
  ];

  const MaterialSwatchPanel = ({ onApply }) => (
    <div className="absolute left-4 top-4 bg-white shadow-lg rounded-lg p-2 z-50 flex gap-2">
      {MATERIALS.map((mat) => (
        <div
          key={mat.name}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          style={{ background: mat.color }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("material", mat.color);
          }}
          title={mat.name}
        />
      ))}
    </div>
  );

  // Smart color palette suggestion panel
  const COLOR_PALETTES = [
    ["#f3f4f6", "#3b82f6", "#10b981"], // Cool
    ["#deb887", "#f59e42", "#f43f5e"], // Warm
    ["#8b5cf6", "#f472b6", "#fbbf24"], // Vibrant
  ];

  const ColorPalettePanel = ({ onApply }) => (
    <div className="absolute left-4 top-20 bg-white shadow-lg rounded-lg p-2 z-50 flex gap-2">
      {COLOR_PALETTES.map((palette, idx) => (
        <div key={idx} className="flex gap-1">
          {palette.map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded cursor-pointer border border-gray-300"
              style={{ background: color }}
              onClick={() => onApply(color)}
              title={color}
            />
          ))}
        </div>
      ))}
    </div>
  );

  // Lighting slider panel
  const LightingSliderPanel = ({ value, onChange }) => (
    <div className="absolute left-4 top-36 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-center">
      <label className="text-xs text-gray-700 mb-1">
        Lighting (Time of Day)
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={onChange}
        className="w-32"
      />
      <span className="text-xs mt-1">
        {value < 33 ? "Morning" : value < 66 ? "Afternoon" : "Evening"}
      </span>
    </div>
  );

  // Real-time co-editing placeholder
  const SharedCursors = ({ cursors }) => (
    <>
      {cursors.map((cursor, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: cursor.x,
            top: cursor.y,
            pointerEvents: "none",
            zIndex: 100,
          }}
          className="text-xs text-blue-600"
        >
          <span>👤</span> {cursor.name}
        </div>
      ))}
    </>
  );

  // Render comment pins
  const CommentPins = ({ pins }) => (
    <>
      {pins.map((pin, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: pin.x,
            top: pin.y,
            zIndex: 101,
            pointerEvents: "none",
          }}
          className="text-xs text-pink-600 bg-white rounded shadow px-2 py-1"
        >
          <span>📍</span> {pin.text}
        </div>
      ))}
    </>
  );

  // Social sharing panel
  const SocialSharePanel = () => (
    <div className="absolute left-4 top-52 bg-white shadow-lg rounded-lg p-2 z-50 flex gap-2">
      <button
        className="px-2 py-1 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded text-xs"
        onClick={() => alert("Share to Instagram (branded visual)")}
      >
        Share to Instagram
      </button>
      <button
        className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
        onClick={() => alert("Share to Facebook (branded visual)")}
      >
        Share to Facebook
      </button>
    </div>
  );

  // Virtual tape measure tool
  const [tapeMeasure, setTapeMeasure] = useState({
    active: false,
    start: null,
    end: null,
  });

  const TapeMeasure = ({ start, end }) => {
    if (!start || !end) return null;
    const distance = Math.round(
      Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
    );
    return (
      <>
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke="#f59e42"
          strokeWidth={2}
          dash={[8, 4]}
        />
        <Text
          x={(start.x + end.x) / 2}
          y={(start.y + end.y) / 2 - 16}
          text={`${distance} cm`}
          fontSize={14}
          fill="#f59e42"
          fontStyle="bold"
        />
      </>
    );
  };

  // Error alerts for clearance issues
  const [errorAlerts, setErrorAlerts] = useState([
    { message: "Door won't open!", type: "clearance" },
  ]); // Placeholder for demo

  const ErrorAlertsPanel = ({ alerts }) => (
    <div className="absolute right-4 top-4 z-50">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="bg-red-100 text-red-700 px-3 py-2 rounded shadow mb-2 text-xs"
        >
          ⚠️ {alert.message}
        </div>
      ))}
    </div>
  );

  // Photorealistic render export panel
  const RenderExportPanel = () => (
    <div className="absolute right-4 top-20 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-end">
      <button
        className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded text-xs mb-2"
        onClick={() =>
          alert("Photorealistic 8K render will be generated (placeholder)")
        }
      >
        Export Photorealistic Render (8K)
      </button>
    </div>
  );

  // Virtual walkthrough video export panel
  const WalkthroughExportPanel = () => (
    <div className="absolute right-4 top-36 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-end">
      <button
        className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded text-xs mb-2"
        onClick={() =>
          alert("Virtual walkthrough video will be generated (placeholder)")
        }
      >
        Export Walkthrough Video
      </button>
    </div>
  );

  // PDF export panel
  const PDFExportPanel = () => (
    <div className="absolute right-4 top-52 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-end">
      <button
        className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-700 text-white rounded text-xs mb-2"
        onClick={() =>
          alert(
            "Printable PDF with scale accuracy will be generated (placeholder)"
          )
        }
      >
        Export PDF for Contractors
      </button>
    </div>
  );

  // Undo/redo and history slider
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveHistory = (state) => {
    setHistory((h) => [...h.slice(0, historyIndex + 1), state]);
    setHistoryIndex((idx) => idx + 1);
  };

  const undo = () => {
    if (historyIndex > 0) setHistoryIndex((idx) => idx - 1);
  };
  const redo = () => {
    if (historyIndex < history.length - 1) setHistoryIndex((idx) => idx + 1);
  };

  useEffect(() => {
    // Save to history on state change
    saveHistory({ walls, rooms, furniture });
    // eslint-disable-next-line
  }, [walls, rooms, furniture]);

  const HistorySliderPanel = () => (
    <div className="absolute left-1/2 top-4 -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 z-50 flex items-center gap-2">
      <button onClick={undo} className="px-2 py-1 bg-gray-300 rounded text-xs">
        Undo
      </button>
      <input
        type="range"
        min={0}
        max={history.length - 1}
        value={historyIndex}
        onChange={(e) => setHistoryIndex(Number(e.target.value))}
        className="w-32"
      />
      <button onClick={redo} className="px-2 py-1 bg-gray-300 rounded text-xs">
        Redo
      </button>
      <span className="text-xs">
        Step {historyIndex + 1} / {history.length}
      </span>
    </div>
  );

  // Version comparison overlay panel
  const VersionComparisonPanel = () => (
    <div className="absolute left-1/2 top-20 -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-center">
      <button
        className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs mb-2"
        onClick={() =>
          alert(
            "Version comparison overlay will highlight changes (placeholder)"
          )
        }
      >
        Compare Versions
      </button>
    </div>
  );

  // Cloud auto-save and cross-device sync panel
  const CloudAutoSavePanel = () => (
    <div className="absolute left-1/2 top-36 -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-center">
      <span className="text-xs text-green-600">
        Cloud auto-save enabled (cross-device sync placeholder)
      </span>
    </div>
  );

  // Autocad/Construction Document Import Panel
  const ImportAutocadPanel = () => (
    <div className="absolute left-4 bottom-4 bg-white shadow-lg rounded-lg p-2 z-50 flex flex-col items-start">
      <label className="text-xs text-gray-700 mb-1">
        Import Autocad/Construction Document
      </label>
      <input
        type="number"
        placeholder="Enter DXF File ID"
        className="text-xs border rounded px-2 py-1 mb-1"
        onChange={(e) => setDxfFileId(e.target.value)}
      />
      <span className="text-xs text-gray-400 mt-1">
        Supported: .dxf (enter file ID from Files tab)
      </span>
    </div>
  );

  // Add tape measure logic to Stage
  return (
    <div
      className="canvas-container h-full w-full overflow-hidden relative"
      style={{
        background:
          lighting < 33 ? "#f3f4f6" : lighting < 66 ? "#ffe4b5" : "#23272f",
        transition: "background 0.3s",
      }}
      onDoubleClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addCommentPin(x, y, "New comment");
      }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onClick={handleStageClick}
        draggable={currentTool === "select" || currentTool === "pan"}
        onDragEnd={(e) => {
          if (currentTool === "select" || currentTool === "pan") {
            setPan(e.target.x(), e.target.y());
          }
        }}
      >
        {/* Render DXF geometry if available */}
        <Layer>
          {dxfGeometry.map((geo, idx) => {
            if (geo.type === "line") {
              return (
                <Line
                  key={"dxf-line-" + idx}
                  points={[...geo.start, ...geo.end]}
                  stroke="#10b981"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                  dash={[8, 4]}
                />
              );
            }
            if (geo.type === "polyline") {
              return (
                <Line
                  key={"dxf-poly-" + idx}
                  points={geo.points.flat()}
                  stroke="#6366f1"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                  closed
                />
              );
            }
            return null;
          })}
        </Layer>
        <Layer>
          <GridLayer />
        </Layer>
        <Layer>
          {walls.map((wall) => (
            <Wall
              key={wall.id}
              wall={wall}
              isSelected={selectedElements.some((el) => el.id === wall.id)}
              onClick={() => handleElementClick(wall, "wall")}
            />
          ))}
          {rooms.map((room) => (
            <Room
              key={room.id}
              room={room}
              isSelected={selectedElements.some((el) => el.id === room.id)}
              onClick={() => handleElementClick(room, "room")}
            />
          ))}
          {furniture.map((item) => (
            <Furniture
              key={item.id}
              item={item}
              isSelected={selectedElements.some((el) => el.id === item.id)}
              onClick={() => handleElementClick(item, "furniture")}
            />
          ))}

          {/* Display comment pins on canvas */}
          {comments &&
            comments.map((comment) => (
              <Group
                key={comment.id}
                x={comment.x}
                y={comment.y}
                onClick={(e) => {
                  e.cancelBubble = true; // Prevent propagation
                  const { setActiveComment } = useFloorPlanStore.getState();
                  setActiveComment(comment.id);
                }}
                onTap={(e) => {
                  e.cancelBubble = true; // Prevent propagation
                  const { setActiveComment } = useFloorPlanStore.getState();
                  setActiveComment(comment.id);
                }}
                cursor="pointer"
              >
                <Circle
                  radius={8}
                  fill="#3b82f6"
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.3}
                />
                {comment.replies && comment.replies.length > 0 && (
                  <Text
                    text={comment.replies.length.toString()}
                    fontSize={10}
                    fill="white"
                    align="center"
                    verticalAlign="middle"
                    width={16}
                    height={16}
                    offsetX={8}
                    offsetY={8}
                  />
                )}
              </Group>
            ))}
        </Layer>
      </Stage>
      <RealTime3DPreview walls={walls} rooms={rooms} furniture={furniture} />
    </div>
  );
};

export default CanvasEditor;
