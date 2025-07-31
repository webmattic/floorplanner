import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import useFloorPlanStore from "../stores/floorPlanStore";

interface CameraControlsProps {
  cameraView: string;
  autoFrame?: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  cameraView = "default",
  autoFrame = true,
}) => {
  const { walls, rooms, furniture } = useFloorPlanStore();
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Auto-frame the scene when components mount or when the scene content changes
  useEffect(() => {
    if (autoFrame && controlsRef.current) {
      // Get the bounding box of all objects in the scene
      const bbox = new THREE.Box3();

      // Create a bounding box for all scene objects

      // Process walls
      walls.forEach((wall) => {
        if (wall.points && wall.points.length >= 4) {
          const startX = wall.points[0] / 50;
          const startY = wall.points[1] / 50;
          const endX = wall.points[2] / 50;
          const endY = wall.points[3] / 50;

          // Create temporary box to include in bounding calculation
          const box = new THREE.Box3();
          box.expandByPoint(new THREE.Vector3(startX, 0, startY));
          box.expandByPoint(new THREE.Vector3(endX, 2.5, endY));
          bbox.union(box);
        }
      });

      // Process rooms
      rooms.forEach((room) => {
        const x = room.x / 50;
        const y = room.y / 50;
        const width = room.width / 50;
        const height = room.height / 50;

        // Create temporary box to include in bounding calculation
        const box = new THREE.Box3();
        box.expandByPoint(new THREE.Vector3(x, 0, y));
        box.expandByPoint(new THREE.Vector3(x + width, 0, y + height));
        bbox.union(box);
      });

      // Process furniture
      furniture.forEach((item) => {
        const x = item.x / 50;
        const y = item.y / 50;
        const width = item.width / 50;
        const height = item.height / 50;
        const furnitureHeight = 0.8;

        // Create temporary box to include in bounding calculation
        const box = new THREE.Box3();
        box.expandByPoint(new THREE.Vector3(x, 0, y));
        box.expandByPoint(
          new THREE.Vector3(x + width, furnitureHeight, y + height)
        );
        bbox.union(box);
      });

      // If the scene is empty, use default camera position
      if (bbox.isEmpty()) {
        camera.position.set(15, 15, 15);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
        return;
      }

      // Calculate center of the scene
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Set controls target to center of the scene
      controlsRef.current.target.copy(center);

      // Calculate size of the bounding box
      const size = new THREE.Vector3();
      bbox.getSize(size);

      // Calculate the distance based on the size to fit everything in view
      const maxDim = Math.max(size.x, size.z);
      // Use a default FOV of 50 degrees if camera.fov is not available
      const fov = (camera as any).fov
        ? (camera as any).fov * (Math.PI / 180)
        : 50 * (Math.PI / 180);
      let distance = maxDim / 2 / Math.tan(fov / 2);

      // Add some padding
      distance *= 1.5;

      // Set camera position based on the camera view
      switch (cameraView) {
        case "top":
          camera.position.set(center.x, distance, center.z);
          break;
        case "front":
          camera.position.set(center.x, center.y, center.z + distance);
          break;
        case "side":
          camera.position.set(center.x + distance, center.y, center.z);
          break;
        case "isometric":
          camera.position.set(
            center.x + distance * 0.7,
            distance * 0.7,
            center.z + distance * 0.7
          );
          break;
        case "corner":
          camera.position.set(
            center.x + distance * 0.5,
            distance * 0.3,
            center.z + distance * 0.5
          );
          break;
        default:
          camera.position.set(
            center.x + distance * 0.5,
            distance * 0.5,
            center.z + distance * 0.5
          );
      }

      // Update controls and camera
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
      controlsRef.current.update();
    }
  }, [walls, rooms, furniture, camera, cameraView, autoFrame]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={0.1}
    />
  );
};

export default CameraControls;
