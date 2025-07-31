import React, { useState, useCallback, useEffect } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { Progress } from "../ui/progress.tsx";
import { Separator } from "../ui/separator.tsx";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox.tsx";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
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
import useFloorPlanStore from "../../stores/floorPlanStore";

interface ImportSettings {
  sourceUnits: "auto" | "mm" | "cm" | "m" | "in" | "ft";
  targetUnits: "m" | "cm" | "mm" | "ft" | "in";
  scaleFactor: number;
}

interface CADLayer {
  id: string;
  original_name: string;
  display_name?: string;
  color: string;
  entity_count: number;
  layer_type: "walls" | "doors" | "windows" | "furniture" | "dimensions" | "text" | "electrical" | "plumbing" | "hvac" | "structural" | "other";
  is_visible: boolean;
  is_importable: boolean;
  import_priority: number;
}

interface ImportJob {
  id: string;
  original_filename: string;
  file_format: string;
  file_size_mb: number;
  status: "uploading" | "processing" | "layer_review" | "importing" | "completed" | "failed";
  progress_percentage: number;
  error_message?: string;
  layers?: CADLayer[];
  import_summary?: {
    total_layers: number;
    imported_layers: number;
    skipped_layers: number;
    errors: string[];
    warnings: string[];
  };
}

interface ImportTemplate {
  id: string;
  name: string;
  description?: string;
  layer_mappings: Record<string, any>;
  settings: Partial<ImportSettings>;
}

interface SupportedFormat {
  name: string;
  icon: typeof FileText;
  description: string;
}

interface LayerType {
  name: string;
  color: string;
}

// API service for CAD import
const CADImportAPI = {
  async uploadFile(file: File, floorplanId?: string, options: Partial<ImportSettings> = {}): Promise<ImportJob> {
    const formData = new FormData();
    formData.append("file", file);
    if (floorplanId) formData.append("floorplan_id", floorplanId);
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
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

  async getImportJob(jobId: string): Promise<ImportJob> {
    const response = await fetch(`/floorplanner/api/cad/imports/${jobId}/`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch import job");
    }

    return response.json();
  },

  async updateLayers(jobId: string, layerUpdates: Array<{ id: string; [key: string]: any }>): Promise<any> {
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

  async startImport(jobId: string): Promise<any> {
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

  async cancelImport(jobId: string): Promise<any> {
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

  async getActiveImports(): Promise<{ active_imports: ImportJob[] }> {
    const response = await fetch("/floorplanner/api/cad/status/check_status/", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch active imports");
    }

    return response.json();
  },

  async getTemplates(): Promise<{ results: ImportTemplate[] }> {
    const response = await fetch("/floorplanner/api/cad/templates/", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    return response.json();
  },

  async applyTemplate(jobId: string, templateId: string): Promise<any> {
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

export const CadImportPanel: React.FC = () => {
  const { currentFloorPlan, importCADFile } = useFloorPlanStore();

  // State management
  const [currentImport, setCurrentImport] = useState<ImportJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "processing" | "layers" | "results">("upload");
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    sourceUnits: "auto",
    targetUnits: "m",
    scaleFactor: 1.0,
  });
  const [layerSettings, setLayerSettings] = useState<Record<string, {
    isVisible: boolean;
    isImportable: boolean;
    layerType: string;
    importPriority: number;
  }>>({});
  const [activeImports, setActiveImports] = useState<ImportJob[]>([]);

  // File format information
  const supportedFormats: Record<string, SupportedFormat> = {
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
  const layerTypes: Record<string, LayerType> = {
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
      setTemplates(data.results || []);
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
    if (!currentImport?.id) return;

    try {
      const data = await CADImportAPI.getImportJob(currentImport.id);
      setCurrentImport(data);

      // Initialize layer settings
      if (data.layers) {
        const settings: typeof layerSettings = {};
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
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Validate file type
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!extension || !supportedFormats[extension]) {
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
              setError(updated.error_message || "Import failed");
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
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [currentFloorPlan?.id, importSettings]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleLayerUpdate = async (layerId: string, updates: Partial<typeof layerSettings[string]>) => {
    try {
      setLayerSettings((prev) => ({
        ...prev,
        [layerId]: { ...prev[layerId], ...updates },
      }));

      // Update backend
      if (currentImport?.id) {
        await CADImportAPI.updateLayers(currentImport.id, [
          { id: layerId, ...updates },
        ]);
      }
    } catch (err) {
      console.error("Failed to update layer:", err);
      setError("Failed to update layer settings");
    }
  };

  const handleStartImport = async () => {
    if (!currentImport?.id) return;

    try {
      setError(null);
      await CADImportAPI.startImport(currentImport.id);

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
            setError(updated.error_message || "Import failed");
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Import polling error:", err);
          clearInterval(pollInterval);
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handleCancelImport = async () => {
    if (!currentImport?.id) return;

    try {
      await CADImportAPI.cancelImport(currentImport.id);
      setCurrentImport(null);
      setActiveTab("upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !currentImport?.id) return;

    try {
      await CADImportAPI.applyTemplate(currentImport.id, selectedTemplate);
      await loadImportDetails(); // Refresh import details
    } catch (err) {
      setError(err instanceof Error ? err.message : "Template application failed");
    }
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
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
                  setImportSettings((prev) => ({ ...prev, sourceUnits: value as ImportSettings["sourceUnits"] }))
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
                  setImportSettings((prev) => ({ ...prev, targetUnits: value as ImportSettings["targetUnits"] }))
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
                                isVisible: !layerSettings[layer.id]?.isVisible,
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
                            isImportable: checked as boolean,
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

            {currentImport.import_summary.warnings && currentImport.import_summary.warnings.length > 0 && (
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <FloatingPanel panelId="cadImport">
      <div className="h-full flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="h-full">
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
    </FloatingPanel>
  );
};