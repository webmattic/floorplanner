import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// shadcn/ui components
import { Button } from "./ui/button";
import { Badge } from "./ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Progress } from "./ui/progress.tsx";
import { Separator } from "./ui/separator.tsx";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label.tsx";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox.tsx";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import { FloatingPanel } from "./ui/floating-panel";
import useFloorPlanStore from "../stores/floorPlanStore.js";

// API service for CAD import
const CADImportAPI = {
  async uploadFile(file, floorplanId, options = {}) {
    const formData = new FormData();
    formData.append("file", file);
    if (floorplanId) formData.append("floorplan_id", floorplanId);
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });

    const response = await fetch("/floorplanner/api/cad/imports/", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  },

  async getImportJob(jobId) {
    const response = await fetch(`/floorplanner/api/cad/imports/${jobId}/`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch import job");
    }

    return response.json();
  },

  async updateLayers(jobId, layerUpdates) {
    const response = await fetch(
      `/floorplanner/api/cad/imports/${jobId}/update_layers/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ layer_updates: layerUpdates }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update layers");
    }

    return response.json();
  },

  async startImport(jobId) {
    const response = await fetch(
      `/floorplanner/api/cad/imports/${jobId}/start_import/`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start import");
    }

    return response.json();
  },

  async cancelImport(jobId) {
    const response = await fetch(
      `/floorplanner/api/cad/imports/${jobId}/cancel/`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cancel import");
    }

    return response.json();
  },

  async getActiveImports() {
    const response = await fetch("/floorplanner/api/cad/status/check_status/", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch active imports");
    }

    return response.json();
  },

  async getTemplates() {
    const response = await fetch("/floorplanner/api/cad/templates/", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    return response.json();
  },

  async applyTemplate(jobId, templateId) {
    const response = await fetch(
      `/floorplanner/api/cad/imports/${jobId}/apply_template/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template_id: templateId }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to apply template");
    }

    return response.json();
  },
};

const CadImportPanel = ({ isOpen, onClose, position, onPositionChange }) => {
  const { currentFloorPlan, importCADFile } = useFloorPlanStore();

  // State management
  const [currentImport, setCurrentImport] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [importSettings, setImportSettings] = useState({
    sourceUnits: "auto",
    targetUnits: "m",
    scaleFactor: 1.0,
  });
  const [layerSettings, setLayerSettings] = useState({});
  const [activeImports, setActiveImports] = useState([]);

  // File format information
  const supportedFormats = {
    dxf: {
      name: "AutoCAD DXF",
      icon: FileText,
      description: "Drawing Exchange Format",
    },
    dwg: {
      name: "AutoCAD DWG",
      icon: FileText,
      description: "Drawing file (requires conversion)",
    },
    ifc: {
      name: "IFC Building Model",
      icon: FileText,
      description: "Industry Foundation Classes",
    },
    revit: {
      name: "Revit Family",
      icon: FileText,
      description: "Revit file format",
    },
    skp: {
      name: "SketchUp",
      icon: FileText,
      description: "SketchUp model file",
    },
    pdf: {
      name: "PDF Plans",
      icon: FileText,
      description: "Portable Document Format",
    },
  };

  // Layer types with colors for UI
  const layerTypes = {
    walls: { name: "Walls", color: "bg-stone-500" },
    doors: { name: "Doors", color: "bg-amber-600" },
    windows: { name: "Windows", color: "bg-sky-500" },
    furniture: { name: "Furniture", color: "bg-emerald-600" },
    dimensions: { name: "Dimensions", color: "bg-red-500" },
    text: { name: "Text/Labels", color: "bg-purple-500" },
    electrical: { name: "Electrical", color: "bg-yellow-500" },
    plumbing: { name: "Plumbing", color: "bg-blue-600" },
    hvac: { name: "HVAC", color: "bg-orange-500" },
    structural: { name: "Structural", color: "bg-gray-600" },
    other: { name: "Other", color: "bg-gray-400" },
  };

  // Load templates and active imports on mount
  useEffect(() => {
    loadTemplates();
    loadActiveImports();
    const interval = setInterval(loadActiveImports, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Load current import details when import ID changes
  useEffect(() => {
    if (currentImport?.id) {
      loadImportDetails();
    }
  }, [currentImport?.id]);

  const loadTemplates = async () => {
    try {
      const data = await CADImportAPI.getTemplates();
      setTemplates(data.results || data);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const loadActiveImports = async () => {
    try {
      const data = await CADImportAPI.getActiveImports();
      setActiveImports(data.active_imports || []);
    } catch (err) {
      console.error("Failed to load active imports:", err);
    }
  };

  const loadImportDetails = async () => {
    try {
      const data = await CADImportAPI.getImportJob(currentImport.id);
      setCurrentImport(data);

      // Initialize layer settings
      if (data.layers) {
        const settings = {};
        data.layers.forEach((layer) => {
          settings[layer.id] = {
            isVisible: layer.is_visible,
            isImportable: layer.is_importable,
            layerType: layer.layer_type,
            importPriority: layer.import_priority,
          };
        });
        setLayerSettings(settings);
      }

      // Update tab based on status
      if (data.status === "layer_review") {
        setActiveTab("layers");
      } else if (data.status === "completed") {
        setActiveTab("results");
      }
    } catch (err) {
      console.error("Failed to load import details:", err);
      setError("Failed to load import details");
    }
  };

  const handleFileUpload = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Validate file type
        const extension = file.name.split(".").pop().toLowerCase();
        if (!supportedFormats[extension]) {
          throw new Error(`Unsupported file format: ${extension}`);
        }

        // Create import job
        const result = await CADImportAPI.uploadFile(
          file,
          currentFloorPlan?.id,
          importSettings
        );

        setCurrentImport(result);
        setActiveTab("processing");
        setUploadProgress(100);

        // Start polling for updates
        const pollInterval = setInterval(async () => {
          try {
            const updated = await CADImportAPI.getImportJob(result.id);
            setCurrentImport(updated);

            if (updated.status === "layer_review") {
              setActiveTab("layers");
              clearInterval(pollInterval);
            } else if (updated.status === "failed") {
              setError(updated.error_message);
              clearInterval(pollInterval);
            } else if (updated.status === "completed") {
              setActiveTab("results");
              clearInterval(pollInterval);
            }
          } catch (err) {
            console.error("Polling error:", err);
            clearInterval(pollInterval);
          }
        }, 2000);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsUploading(false);
      }
    },
    [currentFloorPlan?.id, importSettings]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleLayerUpdate = async (layerId, updates) => {
    try {
      setLayerSettings((prev) => ({
        ...prev,
        [layerId]: { ...prev[layerId], ...updates },
      }));

      // Update backend
      await CADImportAPI.updateLayers(currentImport.id, [
        { id: layerId, ...updates },
      ]);
    } catch (err) {
      console.error("Failed to update layer:", err);
      setError("Failed to update layer settings");
    }
  };

  const handleStartImport = async () => {
    try {
      setError(null);
      const result = await CADImportAPI.startImport(currentImport.id);

      // Start polling for import progress
      const pollInterval = setInterval(async () => {
        try {
          const updated = await CADImportAPI.getImportJob(currentImport.id);
          setCurrentImport(updated);

          if (updated.status === "completed") {
            setActiveTab("results");
            clearInterval(pollInterval);

            // Trigger floorplan refresh
            if (importCADFile) {
              importCADFile(updated);
            }
          } else if (updated.status === "failed") {
            setError(updated.error_message);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Import polling error:", err);
          clearInterval(pollInterval);
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelImport = async () => {
    try {
      await CADImportAPI.cancelImport(currentImport.id);
      setCurrentImport(null);
      setActiveTab("upload");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !currentImport) return;

    try {
      await CADImportAPI.applyTemplate(currentImport.id, selectedTemplate);
      await loadImportDetails(); // Refresh import details
    } catch (err) {
      setError(err.message);
    }
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input").click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop CAD files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports DXF, DWG, IFC, Revit, SketchUp, and PDF files
        </p>
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".dxf,.dwg,.ifc,.rvt,.skp,.pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <Button variant="outline" size="sm">
          Choose Files
        </Button>
      </div>

      {/* Supported formats */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Supported Formats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(supportedFormats).map(([ext, info]) => {
            const Icon = info.icon;
            return (
              <div
                key={ext}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
              >
                <Icon className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium">{info.name}</div>
                  <div className="text-xs text-gray-500">
                    {info.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Import settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source-units">Source Units</Label>
              <Select
                value={importSettings.sourceUnits}
                onValueChange={(value) =>
                  setImportSettings((prev) => ({ ...prev, sourceUnits: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="mm">Millimeters</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="m">Meters</SelectItem>
                  <SelectItem value="in">Inches</SelectItem>
                  <SelectItem value="ft">Feet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target-units">Target Units</Label>
              <Select
                value={importSettings.targetUnits}
                onValueChange={(value) =>
                  setImportSettings((prev) => ({ ...prev, targetUnits: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Meters</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="mm">Millimeters</SelectItem>
                  <SelectItem value="ft">Feet</SelectItem>
                  <SelectItem value="in">Inches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="scale-factor">Scale Factor</Label>
            <Input
              id="scale-factor"
              type="number"
              step="0.1"
              min="0.1"
              max="1000"
              value={importSettings.scaleFactor}
              onChange={(e) =>
                setImportSettings((prev) => ({
                  ...prev,
                  scaleFactor: parseFloat(e.target.value) || 1.0,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Import Templates</CardTitle>
            <CardDescription>
              Apply saved settings from previous imports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderProcessingTab = () => (
    <div className="space-y-6">
      {currentImport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Processing {currentImport.original_filename}
            </CardTitle>
            <CardDescription>
              {currentImport.file_format.toUpperCase()} •{" "}
              {(currentImport.file_size_mb || 0).toFixed(1)} MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{currentImport.progress_percentage.toFixed(0)}%</span>
              </div>
              <Progress value={currentImport.progress_percentage} />
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  currentImport.status === "failed" ? "destructive" : "default"
                }
              >
                {currentImport.status.replace("_", " ").toUpperCase()}
              </Badge>
              {currentImport.status === "processing" && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
            </div>

            {currentImport.error_message && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {currentImport.error_message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleCancelImport}
                variant="outline"
                size="sm"
                disabled={
                  !["processing", "uploading"].includes(currentImport.status)
                }
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLayersTab = () => (
    <div className="space-y-6">
      {currentImport && currentImport.layers && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Found {currentImport.layers.length} layers
            </h4>
            <div className="flex space-x-2">
              {selectedTemplate && (
                <Button
                  onClick={handleApplyTemplate}
                  size="sm"
                  variant="outline"
                >
                  Apply Template
                </Button>
              )}
              <Button onClick={handleStartImport} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start Import
              </Button>
            </div>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {currentImport.layers.map((layer) => (
                <Card key={layer.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          layerTypes[layer.layer_type]?.color || "bg-gray-400"
                        }`}
                        style={{ backgroundColor: layer.color }}
                      />
                      <div>
                        <div className="font-medium text-sm">
                          {layer.display_name || layer.original_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {layer.entity_count} entities •{" "}
                          {layerTypes[layer.layer_type]?.name || "Other"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleLayerUpdate(layer.id, {
                                is_visible: !layerSettings[layer.id]?.isVisible,
                              })
                            }
                          >
                            {layerSettings[layer.id]?.isVisible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle visibility</TooltipContent>
                      </Tooltip>
                      <Checkbox
                        checked={layerSettings[layer.id]?.isImportable || false}
                        onCheckedChange={(checked) =>
                          handleLayerUpdate(layer.id, {
                            is_importable: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Apply Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6">
      {currentImport && currentImport.import_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Layers</div>
                <div className="font-medium">
                  {currentImport.import_summary.total_layers || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Imported</div>
                <div className="font-medium text-green-600">
                  {currentImport.import_summary.imported_layers || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Skipped</div>
                <div className="font-medium text-orange-600">
                  {currentImport.import_summary.skipped_layers || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Errors</div>
                <div className="font-medium text-red-600">
                  {currentImport.import_summary.errors?.length || 0}
                </div>
              </div>
            </div>

            {currentImport.import_summary.warnings?.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {currentImport.import_summary.warnings.map(
                      (warning, index) => (
                        <li key={index} className="text-sm">
                          {warning}
                        </li>
                      )
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setCurrentImport(null);
                  setActiveTab("upload");
                }}
                size="sm"
              >
                Import Another File
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Default component if no props provided (for standalone usage)
  if (typeof isOpen === "undefined") {
    return (
      <div className="w-80 max-h-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <CadImportPanelContent />
      </div>
    );
  }

  // Floating panel version
  const CadImportPanelContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">CAD Import</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="processing" disabled={!currentImport}>
              Processing
            </TabsTrigger>
            <TabsTrigger
              value="layers"
              disabled={
                !currentImport || currentImport.status !== "layer_review"
              }
            >
              Layers
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={!currentImport || currentImport.status !== "completed"}
            >
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="h-full p-4">
            <ScrollArea className="h-full">{renderUploadTab()}</ScrollArea>
          </TabsContent>

          <TabsContent value="processing" className="h-full p-4">
            <ScrollArea className="h-full">{renderProcessingTab()}</ScrollArea>
          </TabsContent>

          <TabsContent value="layers" className="h-full p-4">
            <ScrollArea className="h-full">{renderLayersTab()}</ScrollArea>
          </TabsContent>

          <TabsContent value="results" className="h-full p-4">
            <ScrollArea className="h-full">{renderResultsTab()}</ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 border-t">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );

  return (
    <FloatingPanel
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      onPositionChange={onPositionChange}
      title="CAD Import"
      size="large"
    >
      <CadImportPanelContent />
    </FloatingPanel>
  );
};

export default CadImportPanel;
