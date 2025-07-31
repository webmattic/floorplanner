import React from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Box, Plane } from "@react-three/drei";
import useFloorPlanStore from "../stores/floorPlanStore";
import CameraControls from "./CameraControls";
import CameraViewSelector from "./CameraViewSelector";

// Wall component for 3D view
const Wall3D: React.FC<{ wall: any }> = ({ wall }) => {
  if (!wall.points || wall.points.length < 4) return null;

  // Calculate wall dimensions from points
  const startX = wall.points[0] / 50; // Convert pixels to meters
  const startY = wall.points[1] / 50;
  const endX = wall.points[2] / 50;
  const endY = wall.points[3] / 50;

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = Math.atan2(endY - startY, endX - startX);
  const thickness = (wall.thickness || 8) / 50;
  const height = 2.5; // 2.5 meters high

  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;

  return (
    <Box
      position={[centerX, height / 2, centerY]}
      args={[length, height, thickness]}
      rotation={[0, angle, 0]}
    >
      <meshStandardMaterial color={wall.color || "#374151"} />
    </Box>
  );
};

// Room component for 3D view
const Room3D: React.FC<{ room: any }> = ({ room }) => {
  const x = room.x / 50; // Convert pixels to meters
  const y = room.y / 50;
  const width = room.width / 50;
  const height = room.height / 50;

  return (
    <Plane
      position={[x + width / 2, 0.01, y + height / 2]}
      args={[width, height]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial
        color={room.color || "rgba(59, 130, 246, 0.1)"}
        transparent
        opacity={0.3}
      />
    </Plane>
  );
};

// Furniture component for 3D view
const Furniture3D: React.FC<{ item: any }> = ({ item }) => {
  const x = item.x / 50; // Convert pixels to meters
  const y = item.y / 50;
  const width = item.width / 50;
  const height = item.height / 50;
  const furnitureHeight = 0.8; // 80cm high

  return (
    <Box
      position={[x + width / 2, furnitureHeight / 2, y + height / 2]}
      args={[width, furnitureHeight, height]}
    >
      <meshStandardMaterial color={item.color || "#8b5cf6"} />
    </Box>
  );
};

// Scene component
const Scene3D: React.FC = () => {
  const { walls, rooms, furniture, lighting, cameraView } = useFloorPlanStore();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={lighting.ambientLight} />
      <directionalLight position={[10, 10, 5]} intensity={lighting.mainLight} />
      <pointLight
        position={[-10, 10, -5]}
        intensity={lighting.mainLight * 0.5}
      />

      {/* Ground plane */}
      <Plane
        position={[0, 0, 0]}
        args={[50, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#f5f5f5" />
      </Plane>

      {/* Grid */}
      <Grid
        position={[0, 0.01, 0]}
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#999999"
        fadeDistance={25}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Render walls */}
      {walls.map((wall) => (
        <Wall3D key={wall.id} wall={wall} />
      ))}

      {/* Render rooms */}
      {rooms.map((room) => (
        <Room3D key={room.id} room={room} />
      ))}

      {/* Render furniture */}
      {furniture.map((item) => (
        <Furniture3D key={item.id} item={item} />
      ))}

      {/* Camera controls */}
      <CameraControls cameraView={cameraView} autoFrame={true} />
    </>
  );
};

// Main ModelViewer component
const ModelViewer: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-gray-100">
      <Canvas
        camera={{
          position: [15, 15, 15],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <Scene3D />
      </Canvas>

      {/* 3D View Info */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm">
        <div className="font-semibold">3D View</div>
        <div className="text-xs text-gray-600 mt-1">
          <div>• Drag to rotate</div>
          <div>• Scroll to zoom</div>
          <div>• Right-click to pan</div>
        </div>
      </div>

      {/* Camera View Selector */}
      <div className="absolute top-4 right-4">
        <CameraViewSelector />
      </div>
    </div>
  );
};

export default ModelViewer;
