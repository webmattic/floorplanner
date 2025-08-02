import React, { useState, useEffect } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Progress } from "../ui/progress.tsx";
import { Badge } from "../ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox.tsx";
import { Slider } from "../ui/slider.tsx";
import { Label } from "../ui/label.tsx";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Separator } from "../ui/separator.tsx";
import {
  Download,
  FileImage,
  FileVideo,
  FileText,
  Settings2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

interface ExportSettings {
  export_type: "image" | "video" | "pdf";
  quality: "standard" | "high" | "8k";
  resolution: "720p" | "1080p" | "1440p" | "4k" | "8k";
  image_format: "png" | "jpg" | "webp";
  include_measurements: boolean;
  include_materials: boolean;
  paper_size: "A4" | "A3" | "Letter" | "Legal";
  scale: "1:50" | "1:100" | "1:200";
  duration: number;
}

interface ExportJob {
  id: string;
  export_type: string;
  export_type_display: string;
  quality: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  created_at: string;
  is_ready_for_download: boolean;
  error_message?: string;
}

interface ExportPreset {
  id: string;
  name: string;
  export_type: "image" | "video" | "pdf";
  quality: string;
  resolution: string;
  image_format: string;
  settings: Partial<ExportSettings>;
  is_default?: boolean;
}

interface ExportStatistics {
  total_exports_this_month: number;
  success_rate: number;
}

interface QualityOption {
  value: string;
  label: string;
  description: string;
}

interface ResolutionOption {
  value: string;
  label: string;
}

interface ImageFormatOption {
  value: string;
  label: string;
  description: string;
}

export const ExportPanel: React.FC = () => {
  const { currentFloorPlan, apiConfig } = useFloorPlanStore();

  // Export state
  const [activeTab, setActiveTab] = useState<"image" | "video" | "pdf">(
    "image"
  );
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    export_type: "image",
    quality: "standard",
    resolution: "1080p",
    image_format: "png",
    include_measurements: true,
    include_materials: true,
    paper_size: "A4",
    scale: "1:100",
    duration: 30,
  });

  // Job management state
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [presets, setPresets] = useState<ExportPreset[]>([]);
  const [exportStatistics, setExportStatistics] =
    useState<ExportStatistics | null>(null);

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState("");

  // Quality options
  const qualityOptions: QualityOption[] = [
    {
      value: "standard",
      label: "Standard Quality",
      description: "Fast render, good quality",
    },
    {
      value: "high",
      label: "High Quality",
      description: "Slower render, great quality",
    },
    {
      value: "8k",
      label: "Ultra Quality (8K)",
      description: "Longest render, best quality",
    },
  ];

  // Resolution options
  const resolutionOptions: ResolutionOption[] = [
    { value: "720p", label: "HD (1280x720)" },
    { value: "1080p", label: "Full HD (1920x1080)" },
    { value: "1440p", label: "QHD (2560x1440)" },
    { value: "4k", label: "4K (3840x2160)" },
    { value: "8k", label: "8K (7680x4320)" },
  ];

  // Image format options
  const imageFormatOptions: ImageFormatOption[] = [
    { value: "png", label: "PNG", description: "Best quality, larger file" },
    { value: "jpg", label: "JPEG", description: "Good quality, smaller file" },
    {
      value: "webp",
      label: "WebP",
      description: "Modern format, great compression",
    },
  ];

  useEffect(() => {
    loadExportJobs();
    loadPresets();
    loadStatistics();

    // Poll for job updates every 5 seconds
    const pollInterval = setInterval(loadExportJobs, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  const loadExportJobs = async () => {
    if (!apiConfig) return;

    // Skip API calls in mock mode
    if (apiConfig.baseUrl.includes("localhost:3001")) {
      setExportJobs([]);
      return;
    }

    try {
      const response = await fetch(`${apiConfig.baseUrl}/exports/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExportJobs(data.results || data);
      }
    } catch (error) {
      console.error("Failed to load export jobs:", error);
      setExportJobs([]);
    }
  };

  const loadPresets = async () => {
    if (!apiConfig) return;

    // Skip API calls in mock mode
    if (apiConfig.baseUrl.includes("localhost:3001")) {
      setPresets([
        { id: 1, name: "High Quality", format: "PNG", settings: {} },
        { id: 2, name: "Web Optimized", format: "JPG", settings: {} },
      ]);
      return;
    }

    try {
      const response = await fetch(`${apiConfig.baseUrl}/export-presets/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data.results || data);
      }
    } catch (error) {
      console.error("Failed to load presets:", error);
    }
  };

  const loadStatistics = async () => {
    if (!apiConfig) return;

    try {
      const response = await fetch(`${apiConfig.baseUrl}/exports/statistics/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExportStatistics(data);
      }
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const handleExport = async () => {
    if (!currentFloorPlan || !apiConfig) {
      alert("Please save your floor plan first");
      return;
    }

    setIsCreatingJob(true);

    try {
      const response = await fetch(`${apiConfig.baseUrl}/exports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({
          floorplan_id: currentFloorPlan.id,
          ...exportSettings,
        }),
      });

      if (response.ok) {
        const newJob = await response.json();
        setExportJobs((prev) => [newJob, ...prev]);
      } else {
        throw new Error("Failed to create export job");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to start export. Please try again.");
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleDownload = async (job: ExportJob) => {
    if (!job.is_ready_for_download) return;

    try {
      const response = await fetch(
        `${apiConfig?.baseUrl}/exports/${job.id}/download/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export_${job.id}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file");
    }
  };

  const saveAsPreset = async () => {
    if (!newPresetName.trim() || !apiConfig) return;

    try {
      const response = await fetch(`${apiConfig.baseUrl}/export-presets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({
          name: newPresetName,
          ...exportSettings,
        }),
      });

      if (response.ok) {
        const newPreset = await response.json();
        setPresets((prev) => [newPreset, ...prev]);
        setNewPresetName("");
        alert("Preset saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save preset:", error);
      alert("Failed to save preset");
    }
  };

  const applyPreset = (preset: ExportPreset) => {
    setExportSettings({
      export_type: preset.export_type,
      quality: preset.quality,
      resolution: preset.resolution,
      image_format: preset.image_format,
      include_measurements: preset.settings.include_measurements ?? true,
      include_materials: preset.settings.include_materials ?? true,
      paper_size: preset.settings.paper_size ?? "A4",
      scale: preset.settings.scale ?? "1:100",
      duration: preset.settings.duration ?? 30,
    });
    setActiveTab(preset.export_type);
    setSelectedPreset(preset.id);
  };

  const updateSetting = <K extends keyof ExportSettings>(
    key: K,
    value: ExportSettings[K]
  ) => {
    setExportSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCsrfToken = (): string => {
    const element = document.querySelector(
      "[name=csrfmiddlewaretoken]"
    ) as HTMLInputElement;
    return element?.value || "";
  };

  const getStatusIcon = (status: ExportJob["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-4 w-4" />;
      case "video":
        return <FileVideo className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <FloatingPanel panelId="export">
      <div className="space-y-6">
        {/* Export Type Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as "image" | "video" | "pdf");
            updateSetting("export_type", value as "image" | "video" | "pdf");
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </TabsTrigger>
          </TabsList>

          {/* Image Export Settings */}
          <TabsContent value="image" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Image Export Settings</CardTitle>
                <CardDescription>
                  Generate high-quality images of your floor plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Select
                      value={exportSettings.quality}
                      onValueChange={(value) =>
                        updateSetting(
                          "quality",
                          value as ExportSettings["quality"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select
                      value={exportSettings.resolution}
                      onValueChange={(value) =>
                        updateSetting(
                          "resolution",
                          value as ExportSettings["resolution"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={exportSettings.image_format}
                    onValueChange={(value) =>
                      updateSetting(
                        "image_format",
                        value as ExportSettings["image_format"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageFormatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Export Settings */}
          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Video Export Settings</CardTitle>
                <CardDescription>
                  Create animated walkthroughs of your design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Select
                      value={exportSettings.quality}
                      onValueChange={(value) =>
                        updateSetting(
                          "quality",
                          value as ExportSettings["quality"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select
                      value={exportSettings.resolution}
                      onValueChange={(value) =>
                        updateSetting(
                          "resolution",
                          value as ExportSettings["resolution"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.slice(0, 3).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration: {exportSettings.duration}s
                  </Label>
                  <Slider
                    value={[exportSettings.duration]}
                    onValueChange={([value]) =>
                      updateSetting("duration", value)
                    }
                    max={300}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10s</span>
                    <span>5min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Export Settings */}
          <TabsContent value="pdf" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">PDF Export Settings</CardTitle>
                <CardDescription>
                  Generate scale-accurate plans for contractors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paper">Paper Size</Label>
                    <Select
                      value={exportSettings.paper_size}
                      onValueChange={(value) =>
                        updateSetting(
                          "paper_size",
                          value as ExportSettings["paper_size"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scale">Scale</Label>
                    <Select
                      value={exportSettings.scale}
                      onValueChange={(value) =>
                        updateSetting("scale", value as ExportSettings["scale"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:50">1:50</SelectItem>
                        <SelectItem value="1:100">1:100</SelectItem>
                        <SelectItem value="1:200">1:200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="measurements"
                      checked={exportSettings.include_measurements}
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "include_measurements",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="measurements">Include measurements</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="materials"
                      checked={exportSettings.include_materials}
                      onCheckedChange={(checked) =>
                        updateSetting("include_materials", checked as boolean)
                      }
                    />
                    <Label htmlFor="materials">Include materials list</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Presets */}
        {presets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {presets.slice(0, 4).map((preset) => (
                  <Button
                    key={preset.id}
                    variant={
                      selectedPreset === preset.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2"
                  >
                    {getTypeIcon(preset.export_type)}
                    {preset.name}
                    {preset.is_default && (
                      <Star className="h-3 w-3 fill-current" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={!currentFloorPlan || isCreatingJob}
            className="flex-1"
          >
            {isCreatingJob ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Export Settings</DialogTitle>
                <DialogDescription>
                  Manage presets and advanced options
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">
                    Save Current Settings as Preset
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="preset-name"
                      placeholder="Preset name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={saveAsPreset}
                      disabled={!newPresetName.trim()}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>My Presets</Label>
                  <ScrollArea className="h-32 mt-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded"
                      >
                        <span className="text-sm">{preset.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => applyPreset(preset)}
                          >
                            Apply
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Export Jobs */}
        {exportJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {exportJobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(job.export_type)}
                        <div>
                          <div className="font-medium text-sm">
                            {job.export_type_display} - {job.quality}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(job.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}

                        {job.status === "processing" && (
                          <div className="w-16">
                            <Progress value={job.progress} />
                            <div className="text-xs text-center">
                              {job.progress}%
                            </div>
                          </div>
                        )}

                        {job.status === "completed" &&
                          job.is_ready_for_download && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(job)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}

                        {job.status === "failed" && (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Export Statistics */}
        {exportStatistics && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {exportStatistics.total_exports_this_month}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This month
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {exportStatistics.success_rate?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Success rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FloatingPanel>
  );
};
