import React, { useState, useCallback } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { Slider } from "./slider";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Alert, AlertDescription } from "./alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import {
  Settings,
  Grid3x3,
  Magnet,
  Save,
  Upload,
  Download,
  RotateCcw,
  Minimize2,
  Maximize2,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  FolderOpen,
  Star,
  Info,
  Sparkles,
} from "lucide-react";
import { usePanelStore, PANEL_CONFIGS } from "../../stores/panelStore";

export const AdvancedPanelManager: React.FC = () => {
  const {
    panels,
    panelGroups,
    workspacePresets,
    activePresetId,
    snapToEdges,
    magneticBoundaries,
    snapThreshold,
    keyboardShortcutsEnabled,
    panelAnimations,

    // Panel management functions
    togglePanel,
    minimizeAllPanels,
    restoreAllPanels,
    resetPanelLayout,
    focusPanel,

    // Advanced functions
    snapPanelToEdges,
    enableMagneticBoundaries,
    setSnapThreshold,
    toggleKeyboardShortcuts,
    togglePanelAnimations,
    createWorkspaceLayout,
    switchWorkspace,
    exportPanelLayout,
    importPanelLayout,
    alignPanelsToGrid,
    distributeHorizontally,
    distributeVertically,
    cascadePanels,

    // Grouping functions
    createGroup,
    removeGroup,

    // Workspace functions
    deletePreset,
  } = usePanelStore();

  const [activeTab, setActiveTab] = useState("panels");
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [gridSize, setGridSize] = useState(20);

  const visiblePanels = Object.keys(panels).filter(
    (id) => panels[id].isVisible
  );

  const handlePanelSelection = useCallback(
    (panelId: string, selected: boolean) => {
      setSelectedPanels((prev) =>
        selected ? [...prev, panelId] : prev.filter((id) => id !== panelId)
      );
    },
    []
  );

  const handleSelectAllVisible = useCallback(() => {
    setSelectedPanels(visiblePanels);
  }, [visiblePanels]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPanels([]);
  }, []);

  const handleCreateWorkspace = useCallback(() => {
    if (!newWorkspaceName.trim()) return;

    createWorkspaceLayout(newWorkspaceName, newWorkspaceDescription);
    setNewWorkspaceName("");
    setNewWorkspaceDescription("");
    setIsCreateWorkspaceOpen(false);
  }, [newWorkspaceName, newWorkspaceDescription, createWorkspaceLayout]);

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim() || selectedPanels.length === 0) return;

    createGroup(newGroupName, selectedPanels);
    setNewGroupName("");
    setSelectedPanels([]);
    setIsCreateGroupOpen(false);
  }, [newGroupName, selectedPanels, createGroup]);

  const handleExportLayout = useCallback(() => {
    const layoutData = exportPanelLayout();
    const blob = new Blob([layoutData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `panel-layout-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportPanelLayout]);

  const handleImportLayout = useCallback(() => {
    if (!importData.trim()) return;

    try {
      importPanelLayout(importData);
      setImportData("");
      alert("Panel layout imported successfully!");
    } catch (error) {
      alert("Failed to import panel layout. Please check the format.");
    }
  }, [importData, importPanelLayout]);

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    },
    []
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Advanced Panel Manager</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {visiblePanels.length} panels visible
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="panels">Panels</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Panels Management Tab */}
        <TabsContent value="panels" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={handleSelectAllVisible}
                size="sm"
                variant="outline"
              >
                Select All Visible
              </Button>
              <Button onClick={handleDeselectAll} size="sm" variant="outline">
                Deselect All
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={minimizeAllPanels} size="sm" variant="outline">
                <Minimize2 className="h-4 w-4 mr-2" />
                Minimize All
              </Button>
              <Button onClick={restoreAllPanels} size="sm" variant="outline">
                <Maximize2 className="h-4 w-4 mr-2" />
                Restore All
              </Button>
            </div>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {Object.entries(PANEL_CONFIGS).map(([panelId, config]) => {
                const panelState = panels[panelId];
                const isSelected = selectedPanels.includes(panelId);
                const group = Object.values(panelGroups).find((g) =>
                  g.panelIds.includes(panelId)
                );

                return (
                  <Card
                    key={panelId}
                    className={`p-3 ${
                      isSelected ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handlePanelSelection(panelId, e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded ${
                              panelState?.isVisible
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span className="font-medium text-sm">
                            {config.title}
                          </span>
                          {group && (
                            <Badge variant="outline" className="text-xs">
                              {group.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => focusPanel(panelId)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Focus Panel</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePanel(panelId)}
                              className="h-6 w-6 p-0"
                            >
                              {panelState?.isVisible ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Toggle Visibility</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => snapPanelToEdges(panelId)}
                              className="h-6 w-6 p-0"
                            >
                              <Magnet className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Snap to Edges</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {panelState && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Position: ({Math.round(panelState.position.x)},{" "}
                        {Math.round(panelState.position.y)}) • Size:{" "}
                        {panelState.size.width}×{panelState.size.height} •
                        Z-Index: {panelState.zIndex}
                        {panelState.isMinimized && " • Minimized"}
                        {panelState.isDocked &&
                          ` • Docked ${panelState.dockPosition}`}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Layout Management Tab */}
        <TabsContent value="layout" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={resetPanelLayout}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Layout
                </Button>
                <Button
                  onClick={() => alignPanelsToGrid(gridSize)}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Align to Grid
                </Button>
                <Button
                  onClick={() => cascadePanels(selectedPanels)}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={selectedPanels.length < 2}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Cascade Selected
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => distributeHorizontally(selectedPanels)}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={selectedPanels.length < 2}
                >
                  <div className="h-4 w-4 mr-2" />
                  Distribute Horizontally
                </Button>
                <Button
                  onClick={() => distributeVertically(selectedPanels)}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={selectedPanels.length < 2}
                >
                  <div className="h-4 w-4 mr-2" />
                  Distribute Vertically
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Grid Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Grid Size: {gridSize}px</Label>
                <Slider
                  value={[gridSize]}
                  onValueChange={([value]) => setGridSize(value)}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Import/Export Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={handleExportLayout}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Layout
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  onClick={() =>
                    document.getElementById("import-file")?.click()
                  }
                  size="sm"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import File
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Or paste layout data:</Label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste exported layout JSON here..."
                  className="w-full h-20 p-2 text-xs border rounded resize-none"
                />
                <Button
                  onClick={handleImportLayout}
                  size="sm"
                  disabled={!importData.trim()}
                >
                  Import Layout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Management Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Panel Groups</h3>
            <Dialog
              open={isCreateGroupOpen}
              onOpenChange={setIsCreateGroupOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Panel Group</DialogTitle>
                  <DialogDescription>
                    Group selected panels together for easier management.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter group name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selected Panels ({selectedPanels.length})</Label>
                    <div className="text-sm text-muted-foreground">
                      {selectedPanels
                        .map((id) => PANEL_CONFIGS[id]?.title)
                        .join(", ") || "No panels selected"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateGroupOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={
                      !newGroupName.trim() || selectedPanels.length === 0
                    }
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-2">
              {Object.values(panelGroups).map((group) => (
                <Card key={group.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{group.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {group.panelIds.length} panels
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {group.panelIds
                      .map((id) => PANEL_CONFIGS[id]?.title)
                      .join(", ")}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {Object.keys(panelGroups).length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No panel groups created yet. Select panels and create a group to
                organize your workspace.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Workspace Presets</h3>
            <Dialog
              open={isCreateWorkspaceOpen}
              onOpenChange={setIsCreateWorkspaceOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Current Workspace</DialogTitle>
                  <DialogDescription>
                    Save the current panel layout as a workspace preset.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Enter workspace name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      value={newWorkspaceDescription}
                      onChange={(e) =>
                        setNewWorkspaceDescription(e.target.value)
                      }
                      placeholder="Describe this workspace..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateWorkspaceOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={!newWorkspaceName.trim()}
                  >
                    Save Workspace
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-2">
              {Object.values(workspacePresets).map((preset) => (
                <Card
                  key={preset.id}
                  className={`p-3 ${
                    activePresetId === preset.id ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">{preset.name}</span>
                      {preset.isDefault && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                      {activePresetId === preset.id && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => switchWorkspace(preset.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePreset(preset.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {preset.description && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {preset.description}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Created: {new Date(preset.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {Object.keys(workspacePresets).length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No workspace presets saved yet. Save your current panel layout
                to create reusable workspaces.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Panel Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Snap to Edges</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically snap panels to screen edges
                  </p>
                </div>
                <Switch
                  checked={snapToEdges}
                  onCheckedChange={(checked) =>
                    enableMagneticBoundaries(checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Magnetic Boundaries</Label>
                  <p className="text-xs text-muted-foreground">
                    Panels attract to edges and other panels
                  </p>
                </div>
                <Switch
                  checked={magneticBoundaries}
                  onCheckedChange={(checked) =>
                    enableMagneticBoundaries(checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Snap Threshold: {snapThreshold}px
                </Label>
                <Slider
                  value={[snapThreshold]}
                  onValueChange={([value]) => setSnapThreshold(value)}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Keyboard Shortcuts</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable keyboard shortcuts for panel management
                  </p>
                </div>
                <Switch
                  checked={keyboardShortcutsEnabled}
                  onCheckedChange={toggleKeyboardShortcuts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Panel Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Smooth animations for panel movements
                  </p>
                </div>
                <Switch
                  checked={panelAnimations}
                  onCheckedChange={togglePanelAnimations}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(panels).length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Panels
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {visiblePanels.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Visible</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(panelGroups).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Groups</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(workspacePresets).length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Workspaces
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
