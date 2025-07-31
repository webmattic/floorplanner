import React from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { AdvancedPanelManager as AdvancedPanelManagerComponent } from "../ui/advanced-panel-manager.tsx";

export const AdvancedPanelManager: React.FC = () => {
  return (
    <FloatingPanel panelId="advancedPanelManager">
      <AdvancedPanelManagerComponent />
    </FloatingPanel>
  );
};