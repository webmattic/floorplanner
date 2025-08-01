import React, { useRef, useEffect, useState, useCallback } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Badge } from "../ui/badge.tsx";
import { Separator } from "../ui/separator.tsx";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Camera,
  Maximize2,
  Lightbulb,
  Move3d,
  Info,
  Play,
  Pause,
  Download,
  Share2,
  Fullscreen,
  ChevronsUp,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import {
  Grid,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import useFloorPlanStore from "../../stores/floorPlanStore";

// Camera preset configurations
const CAMERA_PRESETS = [
  {
    id: "default",
    name: "Default View",
    icon: Camera,
    position: [15, 15, 15] as [number, number, number],
    description: "Balanced perspective view",
  },
  {
    id: "top",
    name: "Top View",
    icon: ChevronsUp,
    position: [0, 30, 0] as [number, number, number],
    description: "Bird's eye view from above",
  },
  {
    id: "front",
    name: "Front View",
    icon: ArrowRight,
    position: [0, 5, 25] as [number, number, number],
    description: "Straight-on front perspective",
  },
  {
    id: "side",
    name: "Side View",
    icon: ArrowRight,
    position: [25, 5, 0] as [number, number, number],
    description: "Side profile view",
  },
  {
    id: "isometric",
    name: "Isometric",
    icon: LayoutGrid,
    position: [20, 20, 20] as [number, number, number],
    description: "Technical isometric projection",
  },
  {
    id: "corner",
    name: "Corner View",
    icon: Maximize2,
    position: [12, 8, 12] as [number, number, number],
    description: "Angled corner perspective",
  },
];

// Rendering quality presets
const QUALITY_PRESETS = [
  { id: "low", name: "Low", description: "Fast rendering, lower quality" },
  {
    id: "medium",
    name: "Medium",
    description: "Balanced quality and performance",
  },
  { id: "high", name: "High", description: "Best quality, slower rendering" },
  {
    id: "ultra",
    name: "Ultra",
    description: "Maximum quality for final renders",
  },
];

// Environment presets
const ENVIRONMENT_PRESETS = [
  { id: "studio", name: "Studio", description: "Neutral studio lighting" },
  { id: "sunset", name: "Sunset", description: "Warm sunset ambiance" },
  { id: "dawn", name: "Dawn", description: "Soft morning light" },
  { id: "night", name: "Night", description: "Evening interior lighting" },
  { id: "warehouse", name: "Warehouse", description: "Industrial lighting" },
];

// Wall component for 3D rendering
const Wall3D: React.FC<{ wall: any }> = ({ wall }) => {
  if (!wall.points || wall.points.length < 4) return null;

  const startX = wall.points[0] / 50;
  const startY = wall.points[1] / 50;
  const endX = wall.points[2] / 50;
  const endY = wall.points[3] / 50;

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = Math.atan2(endY - startY, endX - startX);
  const thickness = (wall.thickness || 8) / 50;
  const height = 2.5;

  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;

  return (
    <mesh
      position={[centerX, height / 2, centerY]}
      rotation={[0, angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={wall.color || "#374151"} />
    </mesh>
  );
};

// Room component for 3D rendering
const Room3D: React.FC<{ room: any }> = ({ room }) => {
  const x = room.x / 50;
  const y = room.y / 50;
  const width = room.width / 50;
  const height = room.height / 50;

  return (
    <mesh
      position={[x + width / 2, 0.01, y + height / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={room.color || "#3b82f6"}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

// Furniture component for 3D rendering
const Furniture3D: React.FC<{ item: any }> = ({ item }) => {
  const x = item.x / 50;
  const y = item.y / 50;
  const width = item.width / 50;
  const height = item.height / 50;
  const furnitureHeight = 0.8;

  return (
    <mesh
      position={[x + width / 2, furnitureHeight / 2, y + height / 2]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[width, furnitureHeight, height]} />
      <meshStandardMaterial color={item.color || "#8b5cf6"} />
    </mesh>
  );
};

// Main 3D Scene component
const Scene3D: React.FC<{
  cameraPreset: string;
  quality: string;
  environment: string;
  showGrid: boolean;
  showShadows: boolean;
  autoRotate: boolean;
}> = ({
  cameraPreset,
  quality,
  environment,
  showGrid,
  showShadows,
  autoRotate,
}) => {
    const { walls, rooms, furniture, lighting } = useFloorPlanStore();
    const controlsRef = useRef<any>(null);

    // Auto-frame scene when content changes
    useEffect(() => {
      if (controlsRef.current && cameraPreset === "autoframe") {
        // Auto-frame logic would go here
        controlsRef.current.reset();
      }
    }, [walls, rooms, furniture, cameraPreset]);

    return (
      <>
        {/* Lighting setup */}
        <ambientLight intensity={lighting.ambientLight * 0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={lighting.mainLight}
          castShadow={showShadows}
          shadow-mapSize-width={
            quality === "ultra" ? 2048 : quality === "high" ? 1024 : 512
          }
          shadow-mapSize-height={
            quality === "ultra" ? 2048 : quality === "high" ? 1024 : 512
          }
        />
        <pointLight
          position={[-10, 10, -5]}
          intensity={lighting.mainLight * 0.3}
          castShadow={showShadows}
        />

        {/* Environment */}
        {environment !== "none" && (
          <Environment preset={environment as any} background={false} />
        )}

        {/* Ground plane */}
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow={showShadows}
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* Grid */}
        {showGrid && (
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
        )}

        {/* Contact shadows */}
        {showShadows && (
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={50}
            blur={2}
            far={10}
          />
        )}

        {/* Render scene objects */}
        {walls.map((wall) => (
          <Wall3D key={wall.id} wall={wall} />
        ))}
        {rooms.map((room) => (
          <Room3D key={room.id} room={room} />
        ))}
        {furniture.map((item) => (
          <Furniture3D key={item.id} item={item} />
        ))}

        {/* Camera controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={0.1}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </>
    );
  };

export const View3DPanel: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setCameraView,
    lighting,
    updateSceneLighting,
  } = useFloorPlanStore();

  // Panel state
  const [activeTab, setActiveTab] = useState("view");
  const [cameraPreset, setCameraPreset] = useState("default");
  const [quality, setQuality] = useState("medium");
  const [environment, setEnvironment] = useState("studio");
  const [showGrid, setShowGrid] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lighting controls
  const [localLighting, setLocalLighting] = useState(lighting);

  // Update store lighting when local changes
  const handleLightingChange = useCallback(
    (newLighting: typeof lighting) => {
      setLocalLighting(newLighting);
      updateSceneLighting(newLighting);
    },
    [updateSceneLighting]
  );

  // Camera preset selection
  const handleCameraPreset = useCallback(
    (presetId: string) => {
      setCameraPreset(presetId);
      setCameraView(presetId);
    },
    [setCameraView]
  );

  // Toggle 2D/3D view
  const toggle2D3D = useCallback(() => {
    setViewMode(viewMode === "2d" ? "3d" : "2d");
  }, [viewMode, setViewMode]);

  // Auto-frame scene
  const autoFrameScene = useCallback(() => {
    setCameraPreset("autoframe");
    setCameraView("autoframe");
  }, [setCameraView]);

  // Export 3D view
  const export3DView = useCallback(() => {
    // Implementation would capture canvas and download
    console.log("Exporting 3D view...");
  }, []);

  return (
    <FloatingPanel panelId="view3D">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="render">Render</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4 mt-4">
          {/* 3D Canvas */}
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
              <Canvas
                camera={{
                  position: CAMERA_PRESETS.find((p) => p.id === cameraPreset)
                    ?.position || [15, 15, 15],
                  fov: 50,
                  near: 0.1,
                  far: 1000,
                }}
                shadows={showShadows}
                gl={{
                  antialias: quality !== "low",
                  alpha: true,
                  powerPreference:
                    quality === "ultra" ? "high-performance" : "default",
                }}
              >
                <Scene3D
                  cameraPreset={cameraPreset}
                  quality={quality}
                  environment={environment}
                  showGrid={showGrid}
                  showShadows={showShadows}
                  autoRotate={autoRotate}
                />
              </Canvas>
            </div>

            {/* View controls overlay */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggle2D3D}
                    className="h-7 w-7 p-0"
                  >
                    <Move3d className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Toggle 2D/3D View</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-7 w-7 p-0"
                  >
                    <Fullscreen className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Fullscreen</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* View mode indicator */}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {viewMode.toUpperCase()} View
              </Badge>
            </div>
          </div>

          {/* Quick controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">View Controls</Label>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={autoFrameScene}
                      className="h-7"
                    >
                      <Maximize2 className="h-3 w-3 mr-1" />
                      Frame
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Auto-frame scene</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoRotate(!autoRotate)}
                      className="h-7"
                    >
                      {autoRotate ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {autoRotate ? "Stop" : "Start"} rotation
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <Label htmlFor="show-grid" className="text-xs">
                  Grid
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-shadows"
                  checked={showShadows}
                  onCheckedChange={setShowShadows}
                />
                <Label htmlFor="show-shadows" className="text-xs">
                  Shadows
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4 mt-4">
          {/* Camera presets */}
          <div className="space-y-3">
            <Label className="text-sm" data-testid="camera-presets-label">Camera Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {CAMERA_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <Tooltip key={preset.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          cameraPreset === preset.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleCameraPreset(preset.id)}
                        className="flex items-center gap-2 justify-start h-8"
                      >
                        <IconComponent className="h-3 w-3" />
                        <span className="text-xs truncate" data-testid={`camera-preset-${preset.id}`}>{preset.name}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{preset.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Lighting controls */}
          <div className="space-y-3">
            <Label className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Scene Lighting
            </Label>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Main Light</Label>
                  <span className="text-xs text-muted-foreground" data-testid="main-light-value">
                    {localLighting.mainLight.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[localLighting.mainLight]}
                  onValueChange={([value]: number[]) =>
                    handleLightingChange({ ...localLighting, mainLight: value })
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Ambient Light</Label>
                  <span className="text-xs text-muted-foreground" data-testid="ambient-light-value">
                    {localLighting.ambientLight.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[localLighting.ambientLight]}
                  onValueChange={([value]: number[]) =>
                    handleLightingChange({
                      ...localLighting,
                      ambientLight: value,
                    })
                  }
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Temperature</Label>
                  <span className="text-xs text-muted-foreground" data-testid="temperature-value">
                    {localLighting.temperature}K
                  </span>
                </div>
                <Slider
                  value={[localLighting.temperature]}
                  onValueChange={([value]: number[]) =>
                    handleLightingChange({
                      ...localLighting,
                      temperature: value,
                    })
                  }
                  min={2700}
                  max={6500}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="render" className="space-y-4 mt-4">
          {/* Render quality */}
          <div className="space-y-2">
            <Label className="text-sm" data-testid="render-quality-label">Render Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label className="text-sm" data-testid="environment-label">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENT_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Export options */}
          <div className="space-y-3">
            <Label className="text-sm" data-testid="export-share-label">Export & Share</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={export3DView}
                className="flex items-center gap-2 h-8"
                data-testid="export-button"
              >
                <Download className="h-3 w-3" />
                <span className="text-xs">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-8"
                data-testid="share-button"
              >
                <Share2 className="h-3 w-3" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </div>

          {/* Render info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs" data-testid="realtime-sync-alert">
              Real-time sync: Changes in 2D view automatically update the 3D
              visualization.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
};
