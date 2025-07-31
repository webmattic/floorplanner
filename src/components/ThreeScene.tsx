import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import useFloorPlanStore from "../stores/floorPlanStore";

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { walls, rooms, furniture } = useFloorPlanStore();

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 15);

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Convert 2D elements to 3D objects
    const convertTo3D = () => {
      // Clear existing objects
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      // Add walls
      walls.forEach((wall) => {
        const points = wall.points;
        const shape = new THREE.Shape();
        shape.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) {
          shape.lineTo(points[i], points[i + 1]);
        }

        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: wall.thickness || 0.2,
          bevelEnabled: false,
        });

        const material = new THREE.MeshPhongMaterial({
          color: 0x808080,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 3; // Wall height
        scene.add(mesh);
      });

      // Add rooms
      rooms.forEach((room) => {
        const geometry = new THREE.BoxGeometry(room.width, 0.1, room.height);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(room.color || "#3b82f6"),
          transparent: true,
          opacity: 0.3,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(room.x, 0.05, room.y);
        scene.add(mesh);
      });

      // Add furniture
      furniture.forEach((item) => {
        const geometry = new THREE.BoxGeometry(item.width, 1, item.height);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(item.color || "#8b5cf6"),
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(item.x, 0.5, item.y);
        scene.add(mesh);
      });
    };

    // Initial conversion
    convertTo3D();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [walls, rooms, furniture]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeScene;
