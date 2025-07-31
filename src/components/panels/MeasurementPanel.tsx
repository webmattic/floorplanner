import React from "react";
import { FloatingPanel } from "../ui/floating-panel";
import MeasurementTools from "../MeasurementTools";

export const MeasurementPanel: React.FC = () => {
  return (
    <FloatingPanel panelId="measurements">
      <MeasurementTools />
    </FloatingPanel>
  );
};
