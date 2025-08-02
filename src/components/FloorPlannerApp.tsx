import React, { useEffect, useState } from "react";
import CanvasEditor from "./CanvasEditor";
import ModelViewer from "./ModelViewer";
import CollaborationPanel from "./CollaborationPanel";
import ProfessionalSuggestions from "./ProfessionalSuggestions";
import FileManagerPanel from "./FileManagerPanel";
import PaymentPlans from "./PaymentPlans";
import Gallery from "./Gallery";
import FurniturePalette from "./FurniturePalette";
import MeasurementTools from "./MeasurementTools";
import MaterialPalette from "./MaterialPalette";
import ColorPaletteGenerator from "./ColorPaletteGenerator";
import LightingControls from "./LightingControls";
import CommentsPanel from "./CommentsPanel";
import MeasurementValidator from "./MeasurementValidator";
import { mobileUtils } from "./MobileLayout";
import { MobileLayout } from "./MobileLayout";
import {
  ResponsivePanelManager,
  useDeviceDetection,
} from "./mobile/ResponsivePanelManager";
import { useResponsivePanelLayout } from "./mobile/ResponsiveFloatingPanel";
import { TooltipProvider } from "./ui/tooltip";
import { PanelManager } from "./ui/floating-panel.tsx";
import { KeyboardShortcutsHelp } from "./ui/keyboard-shortcuts-help";
import { DrawingToolsPanel } from "./panels/DrawingToolsPanel";
import { FurnitureLibraryPanel } from "./panels/FurnitureLibraryPanel";
import { MaterialPalettePanel } from "./panels/MaterialPalettePanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { View3DPanel } from "./panels/View3DPanel";
import { MeasurementPanel } from "./panels/MeasurementPanel";
import { EnhancedSocialSharePanel } from "./panels/EnhancedSocialSharePanel";
import { AdvancedPanelManager } from "./panels/AdvancedPanelManager";
import { ExportPanel } from "./panels/ExportPanel";
import { RevisionHistoryPanel } from "./panels/RevisionHistoryPanel";
import { CadImportPanel } from "./panels/CadImportPanel";
import { PanelKeyboardShortcuts } from "./ui/panel-keyboard-shortcuts";
import {
  PanelIntegrationManager,
  IntegratedFloatingPanel,
} from "./ui/panel-integration-manager";
import { ErrorBoundary } from "./ui/error-boundary";
import { AccessibilityProvider } from "./accessibility/AccessibilityProvider";
import { PanelAccessibilityProvider } from "./ui/panel-accessibility.tsx";
import { PanelOnboarding } from "./ui/panel-onboarding.tsx";
import useFloorPlanStore from "../stores/floorPlanStore";
import { DragDropProvider } from "./DragDropProvider";
import CanvasDropZone from "./CanvasDropZone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { appConfig } from "../config/app.config";

interface AppConfig {
  userId: string | undefined;
  isAuthenticated: boolean;
  apiBaseUrl: string;
  wsUrl: string;
}

interface FloorPlannerAppProps {
  config: AppConfig;
}

const FloorPlannerApp: React.FC<FloorPlannerAppProps> = ({ config }) => {
  const { setApiConfig, initializeApp, viewMode } = useFloorPlanStore();
  const [rightPanelTab, setRightPanelTab] = useState("properties");
  const [currentFloorPlanId] = useState<number | null>(1);
  const deviceInfo = useDeviceDetection();
  const { reorganizePanels } = useResponsivePanelLayout();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Enhanced mobile detection and optimization
  useEffect(() => {
    // Initialize the app with standalone config
    setApiConfig({
      baseUrl: config.apiBaseUrl || appConfig.api.baseUrl,
      wsUrl: config.wsUrl || appConfig.api.wsUrl,
      userId: config.userId || appConfig.auth.mockUser?.id,
      isAuthenticated: config.isAuthenticated !== false,
    });

    // Always initialize app in standalone mode
    initializeApp();

    // Initialize mock API if enabled
    if (appConfig.development.mockApi) {
      console.log("Mock API initialized with sample data");
    }

    // Initialize mobile utilities with enhanced features
    mobileUtils.setViewportMeta();
    mobileUtils.handleSafeArea();
    mobileUtils.preventDoubleZoom();
    mobileUtils.registerServiceWorker();
    mobileUtils.enableBackgroundSync();

    // Auto-reorganize panels on mobile
    if (deviceInfo.isMobile || deviceInfo.isTablet) {
      reorganizePanels();
    }
  }, [config, initializeApp, setApiConfig, deviceInfo, reorganizePanels]);

  const handleCollaborationRequest = () => {
    // Show success message
    alert("Collaboration request sent successfully!");
    // Switch to collaboration tab
    setRightPanelTab("collaboration");
  };

  // Authentication is now always open; no login required

  // Main canvas component
  const canvas = viewMode === "2d" ? <CanvasEditor /> : <ModelViewer />;

  // Right panel with tabs
  const rightPanel = (
    <Tabs
      value={rightPanelTab}
      onValueChange={setRightPanelTab}
      className="h-full flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-12 text-xs shrink-0">
        <TabsTrigger value="properties">Props</TabsTrigger>
        <TabsTrigger value="professionals">Pros</TabsTrigger>
        <TabsTrigger value="collaboration">Collab</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="sharing">Share</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="furniture">Furn.</TabsTrigger>
        <TabsTrigger value="materials">Mats</TabsTrigger>
        <TabsTrigger value="colors">Colors</TabsTrigger>
        <TabsTrigger value="lighting">Light</TabsTrigger>
        <TabsTrigger value="measure">Meas.</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="properties" className="h-full p-0">
          <PropertiesPanel />
        </TabsContent>

        <TabsContent value="professionals" className="h-full p-0">
          {currentFloorPlanId && (
            <ProfessionalSuggestions
              floorplanId={currentFloorPlanId}
              onCollaborationRequest={handleCollaborationRequest}
            />
          )}
        </TabsContent>

        <TabsContent value="collaboration" className="h-full p-0">
          <CollaborationPanel />
        </TabsContent>

        <TabsContent value="comments" className="h-full p-0">
          <CommentsPanel />
        </TabsContent>

        <TabsContent value="sharing" className="h-full p-0">
          <EnhancedSocialSharePanel />
        </TabsContent>

        <TabsContent value="gallery" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <Gallery showPublicOnly={true} />
          </div>
        </TabsContent>

        <TabsContent value="furniture" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <FurniturePalette />
          </div>
        </TabsContent>

        <TabsContent value="materials" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <MaterialPalette />
          </div>
        </TabsContent>

        <TabsContent value="colors" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <ColorPaletteGenerator />
          </div>
        </TabsContent>

        <TabsContent value="lighting" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <LightingControls />
          </div>
        </TabsContent>

        <TabsContent value="measure" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <MeasurementTools />
          </div>
        </TabsContent>

        <TabsContent value="files" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            {currentFloorPlanId && (
              <FileManagerPanel floorplanId={currentFloorPlanId} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <PaymentPlans />
          </div>
        </TabsContent>

        <TabsContent value="help" className="h-full p-0">
          <div className="p-4 h-full overflow-y-auto">
            <div className="prose prose-sm">
              <h3>Material & Color Tools</h3>
              <p>
                Select any element in your floor plan, then use the Materials
                and Colors tabs to customize its appearance. You can
                drag-and-drop materials directly onto elements or use the color
                picker to choose precise colors.
              </p>
              <h3>Lighting Controls</h3>
              <p>
                Adjust scene lighting to simulate different times of day. Change
                intensity, color temperature, and ambient light to create the
                perfect ambiance for your design.
              </p>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );

  const mainContent = (
    <PanelIntegrationManager
      config={{
        enableErrorBoundaries: true,
        enablePerformanceMonitoring: process.env.NODE_ENV === "development",
        enableAutoSave: true,
        autoSaveInterval: 30000,
        enableKeyboardShortcuts: true,
        enablePanelSynchronization: true,
      }}
    >
      {/* Floating Panels with Error Boundaries and Integration */}
      <IntegratedFloatingPanel panelId="drawingTools">
        <DrawingToolsPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="furnitureLibrary">
        <FurnitureLibraryPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="materialPalette">
        <MaterialPalettePanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="properties">
        <PropertiesPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="layers">
        <LayersPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="view3D">
        <View3DPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="measurement">
        <MeasurementPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="socialShare">
        <EnhancedSocialSharePanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="advancedPanelManager">
        <AdvancedPanelManager />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="export">
        <ExportPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="revisionHistory">
        <RevisionHistoryPanel />
      </IntegratedFloatingPanel>

      <IntegratedFloatingPanel panelId="cadImport">
        <CadImportPanel />
      </IntegratedFloatingPanel>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </PanelIntegrationManager>
  );

  // Enhanced mobile right panel with responsive layout
  const enhancedRightPanel = (
    <div className="flex flex-col h-full">
      {deviceInfo.isMobile ? (
        <Tabs
          value={rightPanelTab}
          onValueChange={setRightPanelTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 h-12">
            <TabsTrigger value="properties" className="text-xs p-1">
              Props
            </TabsTrigger>
            <TabsTrigger value="furniture" className="text-xs p-1">
              Items
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-xs p-1">
              Colors
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="text-xs p-1">
              Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-4 space-y-4">
            <PropertiesPanel />
            <MeasurementTools />
            <MeasurementValidator />
          </TabsContent>

          <TabsContent value="furniture" className="mt-4 space-y-4">
            <FurniturePalette />
            <Gallery />
          </TabsContent>

          <TabsContent value="materials" className="mt-4 space-y-4">
            <MaterialPalette />
            <ColorPaletteGenerator />
            <LightingControls />
          </TabsContent>

          <TabsContent value="collaboration" className="mt-4 space-y-4">
            <CollaborationPanel />
            <CommentsPanel />
            {currentFloorPlanId && (
              <ProfessionalSuggestions
                floorplanId={currentFloorPlanId}
                onCollaborationRequest={handleCollaborationRequest}
              />
            )}
            {currentFloorPlanId && (
              <FileManagerPanel floorplanId={currentFloorPlanId} />
            )}
            <PaymentPlans />
          </TabsContent>
        </Tabs>
      ) : (
        rightPanel
      )}
    </div>
  );

  // Enhanced responsive layout based on device type
  if (deviceInfo.isMobile || deviceInfo.isTablet) {
    return (
      <AccessibilityProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <PanelKeyboardShortcuts enabled={true} />
            <ResponsivePanelManager>
              <DragDropProvider>
                <MobileLayout
                  rightPanel={enhancedRightPanel}
                  toolbar={<PanelManager />}
                >
                  <main
                    id="main-content"
                    role="main"
                    aria-label="Floor planner canvas"
                  >
                    <CanvasDropZone>{canvas}</CanvasDropZone>
                    {mainContent}
                  </main>
                </MobileLayout>
              </DragDropProvider>
            </ResponsivePanelManager>
          </TooltipProvider>
        </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  // Desktop layout with floating panels
  return (
    <AccessibilityProvider>
      <PanelAccessibilityProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <PanelKeyboardShortcuts enabled={true} />
            <ResponsivePanelManager>
              <DragDropProvider>
                <PanelOnboarding />
                <div className="h-screen w-screen flex flex-col overflow-hidden relative">
                  {/* Enhanced Panel Manager Toolbar */}
                  <nav role="navigation" aria-label="Panel management toolbar">
                    <PanelManager />
                  </nav>

                  {/* Main Canvas Area with responsive features */}
                  <div className="flex-1 relative overflow-hidden">
                    <main
                      id="main-content"
                      role="main"
                      aria-label="Floor planner canvas"
                    >
                      <CanvasDropZone>{canvas}</CanvasDropZone>
                    </main>
                  </div>

                  {mainContent}

                  {/* Enhanced Measurement Validator with mobile support */}
                  <aside role="complementary" aria-label="Measurement feedback">
                    <MeasurementValidator showFloatingFeedback={true} />
                  </aside>
                </div>
              </DragDropProvider>
            </ResponsivePanelManager>
          </TooltipProvider>
        </ErrorBoundary>
      </PanelAccessibilityProvider>
    </AccessibilityProvider>
  );
};

export default FloorPlannerApp;
