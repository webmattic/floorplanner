import React, { ReactNode } from "react";
// @ts-ignore - Missing type declarations
import { DndProvider } from "react-dnd";
// @ts-ignore - Missing type declarations
import { HTML5Backend } from "react-dnd-html5-backend";
// @ts-ignore - Missing type declarations
import { TouchBackend } from "react-dnd-touch-backend";

// Helper to detect touch devices
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
}) => {
  // Choose the backend based on the device type
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

  const opts = isTouchDevice()
    ? { enableMouseEvents: true } // Enable mouse events on touch devices for testing
    : {};

  return (
    <DndProvider backend={backend} options={opts}>
      {children}
    </DndProvider>
  );
};
