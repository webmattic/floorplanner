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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs.tsx";
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
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  History,
  RotateCcw,
  RotateCw,
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
  GitBranch,
  Users,
  Calendar,
  BarChart3,
  Eye,
  EyeOff,
  Settings,
  GitCompare as Compare,
  Bookmark,
  Download,
  Upload,
  FileText,
  MessageSquare,
  Zap,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

interface Revision {
  id: string;
  name?: string;
  description?: string;
  timestamp: string;
  is_checkpoint: boolean;
  is_auto_save: boolean;
  thumbnail?: string;
  changes?: any;
  time_ago_seconds: number;
}

interface AutoSaveSettings {
  enabled: boolean;
  interval: number;
  maxRevisions: number;
}

interface RevisionStatistics {
  total_revisions: number;
  checkpoints_count: number;
  auto_saves_count: number;
  manual_saves_count: number;
  average_time_between_saves: number;
}

interface CollaborationInsights {
  most_active_collaborator: string;
  peak_activity_hours: number[];
  collaboration_frequency: number;
  concurrent_edits: number;
}

interface SyncConflict {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface ComparisonData {
  changes: Array<{
    type: "added" | "removed" | "modified";
    description: string;
    element_type: string;
  }>;
  summary: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export const RevisionHistoryPanel: React.FC = () => {
  const { currentFloorPlan, apiConfig, revisionHistory, currentRevision } =
    useFloorPlanStore();

  // Panel state
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedRevisions, setSelectedRevisions] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [autoSaveSettings, setAutoSaveSettings] = useState<AutoSaveSettings>({
    enabled: true,
    interval: 300,
    maxRevisions: 50,
  });

  // Revision management state
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revisionStatistics, setRevisionStatistics] = useState<RevisionStatistics | null>(null);
  const [collaborationInsights, setCollaborationInsights] = useState<CollaborationInsights | null>(null);

  // History navigation state
  const [historyPosition, setHistoryPosition] = useState(0);
  const [isUndoRedoMode, setIsUndoRedoMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Version comparison state
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isComparingVersions, setIsComparingVersions] = useState(false);

  // Sync and conflict state
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "conflict">("synced");
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Time range options
  const timeRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
  ];

  // Filter type options
  const filterTypeOptions = [
    { value: "all", label: "All Revisions" },
    { value: "checkpoints", label: "Checkpoints Only" },
    { value: "auto-saves", label: "Auto-saves Only" },
    { value: "manual", label: "Manual Saves Only" },
    { value: "collaborative", label: "Collaborative Edits" },
  ];

  useEffect(() => {
    if (currentFloorPlan) {
      loadRevisionTimeline();
      loadRevisionStatistics();
      loadCollaborationInsights();
      loadAutoSaveSettings();
      loadSyncConflicts();
    }
  }, [currentFloorPlan]);

  const loadRevisionTimeline = async () => {
    if (!apiConfig || !currentFloorPlan) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/floorplans/${currentFloorPlan.id}/revisions/timeline/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRevisions(data);
        setHistoryPosition(data.length - 1);
      }
    } catch (error) {
      console.error("Failed to load revision timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRevisionStatistics = async () => {
    if (!apiConfig || !currentFloorPlan) return;

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/floorplans/${currentFloorPlan.id}/revisions/statistics/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRevisionStatistics(data);
      }
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const loadCollaborationInsights = async () => {
    if (!apiConfig || !currentFloorPlan) return;

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/floorplans/${currentFloorPlan.id}/analytics/collaboration_insights/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCollaborationInsights(data);
      }
    } catch (error) {
      console.error("Failed to load collaboration insights:", error);
    }
  };

  const loadAutoSaveSettings = async () => {
    if (!apiConfig) return;

    try {
      const response = await fetch(`${apiConfig.baseUrl}/auto-save-settings/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAutoSaveSettings(data);
      }
    } catch (error) {
      console.error("Failed to load auto-save settings:", error);
    }
  };

  const loadSyncConflicts = async () => {
    if (!apiConfig) return;

    try {
      const response = await fetch(`${apiConfig.baseUrl}/sync-conflicts/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSyncConflicts(data.results || data);
      }
    } catch (error) {
      console.error("Failed to load sync conflicts:", error);
    }
  };

  const handleUndo = () => {
    if (historyPosition > 0) {
      setHistoryPosition(historyPosition - 1);
      setIsUndoRedoMode(true);
      console.log("Undo to revision:", revisions[historyPosition - 1]);
    }
  };

  const handleRedo = () => {
    if (historyPosition < revisions.length - 1) {
      setHistoryPosition(historyPosition + 1);
      setIsUndoRedoMode(true);
      console.log("Redo to revision:", revisions[historyPosition + 1]);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!apiConfig || !currentFloorPlan) return;

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/floorplans/${currentFloorPlan.id}/revisions/${revisionId}/restore/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "X-CSRFToken": getCsrfToken(),
          },
          body: JSON.stringify({
            create_checkpoint: true,
            checkpoint_name: `Restore point - ${new Date().toLocaleString()}`,
          }),
        }
      );

      if (response.ok) {
        const restoredRevision = await response.json();
        console.log("Restored to revision:", restoredRevision);
        await loadRevisionTimeline();
        setHistoryPosition(revisions.length);
      } else {
        throw new Error("Failed to restore revision");
      }
    } catch (error) {
      console.error("Restore failed:", error);
      alert("Failed to restore revision. Please try again.");
    }
  };

  const handleCompareRevisions = async () => {
    if (selectedRevisions.length !== 2) {
      alert("Please select exactly 2 revisions to compare");
      return;
    }

    setIsComparingVersions(true);
    try {
      const response = await fetch(
        `${apiConfig?.baseUrl}/floorplans/${currentFloorPlan?.id}/revisions/compare/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "X-CSRFToken": getCsrfToken(),
          },
          body: JSON.stringify({
            revision_1: selectedRevisions[0],
            revision_2: selectedRevisions[1],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
        setComparisonMode(true);
      } else {
        throw new Error("Failed to compare revisions");
      }
    } catch (error) {
      console.error("Comparison failed:", error);
      alert("Failed to compare revisions. Please try again.");
    } finally {
      setIsComparingVersions(false);
    }
  };

  const handleCreateCheckpoint = async () => {
    const checkpointName = prompt("Enter checkpoint name:");
    if (!checkpointName || !apiConfig || !currentFloorPlan) return;

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/floorplans/${currentFloorPlan.id}/revisions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "X-CSRFToken": getCsrfToken(),
          },
          body: JSON.stringify({
            name: checkpointName,
            description: "User-created checkpoint",
            is_checkpoint: true,
            data: {},
          }),
        }
      );

      if (response.ok) {
        await loadRevisionTimeline();
      } else {
        throw new Error("Failed to create checkpoint");
      }
    } catch (error) {
      console.error("Checkpoint creation failed:", error);
      alert("Failed to create checkpoint. Please try again.");
    }
  };

  const updateAutoSaveSettings = async (newSettings: AutoSaveSettings) => {
    try {
      const response = await fetch(`${apiConfig?.baseUrl}/auto-save-settings/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setAutoSaveSettings(newSettings);
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Settings update failed:", error);
      alert("Failed to update auto-save settings.");
    }
  };

  const toggleRevisionSelection = (revisionId: string) => {
    setSelectedRevisions(prev => {
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId);
      } else if (prev.length < 2) {
        return [...prev, revisionId];
      } else {
        // Replace the first selected revision
        return [prev[1], revisionId];
      }
    });
  };

  const exitComparisonMode = () => {
    setComparisonMode(false);
    setComparisonData(null);
    setSelectedRevisions([]);
  };

  const getCsrfToken = (): string => {
    return document.querySelector("[name=csrfmiddlewaretoken]")?.getAttribute("value") || "";
  };

  const getRevisionIcon = (revision: Revision) => {
    if (revision.is_checkpoint) return <Bookmark className="h-4 w-4" />;
    if (revision.is_auto_save) return <Zap className="h-4 w-4" />;
    return <Save className="h-4 w-4" />;
  };

  const getRevisionBadgeVariant = (revision: Revision): "default" | "secondary" | "outline" => {
    if (revision.is_checkpoint) return "default";
    if (revision.is_auto_save) return "secondary";
    return "outline";
  };

  const formatTimeAgo = (timeAgoSeconds: number): string => {
    const minutes = Math.floor(timeAgoSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const filteredRevisions = revisions.filter((revision) => {
    if (filterType === "checkpoints" && !revision.is_checkpoint) return false;
    if (filterType === "auto-saves" && !revision.is_auto_save) return false;
    if (filterType === "manual" && revision.is_auto_save) return false;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !revision.name?.toLowerCase().includes(searchLower) &&
        !revision.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <FloatingPanel panelId="revisionHistory">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4 mt-4">
          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={handleUndo}
                disabled={historyPosition <= 0}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button
                onClick={handleRedo}
                disabled={historyPosition >= revisions.length - 1}
                size="sm"
                variant="outline"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Redo
              </Button>
            </div>
            <Button onClick={handleCreateCheckpoint} size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Checkpoint
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search revisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Revision Timeline */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredRevisions.map((revision) => (
                <Card
                  key={revision.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedRevisions.includes(revision.id)
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleRevisionSelection(revision.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getRevisionIcon(revision)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {revision.name || `Revision ${revision.id.substr(0, 8)}`}
                          </span>
                          <Badge variant={getRevisionBadgeVariant(revision)} className="text-xs">
                            {revision.is_checkpoint ? "Checkpoint" : revision.is_auto_save ? "Auto" : "Manual"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(revision.time_ago_seconds)}
                        </div>
                        {revision.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {revision.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedRevisions.includes(revision.id)}
                        onCheckedChange={() => toggleRevisionSelection(revision.id)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreRevision(revision.id);
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                  {revision.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={revision.thumbnail}
                        alt={`Revision ${revision.id} thumbnail`}
                        className="h-16 w-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Sync Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {syncStatus === "synced" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : syncStatus === "syncing" ? (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>
                {syncStatus === "synced" ? "All changes saved" : 
                 syncStatus === "syncing" ? "Syncing..." : "Sync conflicts"}
              </span>
            </div>
            {pendingChanges > 0 && (
              <Badge variant="secondary">{pendingChanges} pending</Badge>
            )}
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Select 2 revisions to compare ({selectedRevisions.length}/2)
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCompareRevisions}
                disabled={selectedRevisions.length !== 2 || isComparingVersions}
                size="sm"
              >
                {isComparingVersions ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Compare className="h-4 w-4 mr-2" />
                )}
                Compare
              </Button>
              {comparisonMode && (
                <Button onClick={exitComparisonMode} size="sm" variant="outline">
                  Exit Compare
                </Button>
              )}
            </div>
          </div>

          {comparisonData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Comparison Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {comparisonData.summary.additions}
                    </div>
                    <div className="text-xs text-muted-foreground">Added</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {comparisonData.summary.modifications}
                    </div>
                    <div className="text-xs text-muted-foreground">Modified</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {comparisonData.summary.deletions}
                    </div>
                    <div className="text-xs text-muted-foreground">Removed</div>
                  </div>
                </div>

                <Separator />

                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {comparisonData.changes.map((change, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            change.type === "added" ? "bg-green-500" :
                            change.type === "modified" ? "bg-blue-500" : "bg-red-500"
                          }`}
                        />
                        <span className="capitalize">{change.type}</span>
                        <span className="text-muted-foreground">{change.element_type}:</span>
                        <span>{change.description}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          {/* Revision Statistics */}
          {revisionStatistics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revision Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {revisionStatistics.total_revisions}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Revisions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {revisionStatistics.checkpoints_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Checkpoints</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {revisionStatistics.auto_saves_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Auto-saves</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(revisionStatistics.average_time_between_saves / 60)}m
                    </div>
                    <div className="text-xs text-muted-foreground">Avg. Save Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collaboration Insights */}
          {collaborationInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Collaboration Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Most Active Collaborator</span>
                  <Badge variant="outline">{collaborationInsights.most_active_collaborator}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collaboration Frequency</span>
                  <span className="text-sm font-medium">
                    {collaborationInsights.collaboration_frequency}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Concurrent Edits</span>
                  <span className="text-sm font-medium">
                    {collaborationInsights.concurrent_edits}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sync Conflicts */}
          {syncConflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sync Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {syncConflicts.map((conflict) => (
                      <Alert key={conflict.id} variant={conflict.resolved ? "default" : "destructive"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">{conflict.type}</AlertTitle>
                        <AlertDescription className="text-xs">
                          {conflict.description}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          {/* Auto-save Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Auto-save Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save-enabled">Enable Auto-save</Label>
                <Checkbox
                  id="auto-save-enabled"
                  checked={autoSaveSettings.enabled}
                  onCheckedChange={(checked) =>
                    setAutoSaveSettings(prev => ({ ...prev, enabled: checked as boolean }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Save Interval: {autoSaveSettings.interval}s</Label>
                <Slider
                  value={[autoSaveSettings.interval]}
                  onValueChange={([value]) =>
                    setAutoSaveSettings(prev => ({ ...prev, interval: value }))
                  }
                  min={60}
                  max={600}
                  step={30}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1min</span>
                  <span>10min</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Revisions: {autoSaveSettings.maxRevisions}</Label>
                <Slider
                  value={[autoSaveSettings.maxRevisions]}
                  onValueChange={([value]) =>
                    setAutoSaveSettings(prev => ({ ...prev, maxRevisions: value }))
                  }
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              <Button
                onClick={() => updateAutoSaveSettings(autoSaveSettings)}
                size="sm"
                className="w-full"
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Cloud Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cloud Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cloud-sync">Enable Cloud Sync</Label>
                <Checkbox
                  id="cloud-sync"
                  checked={cloudSyncEnabled}
                  onCheckedChange={setCloudSyncEnabled}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Cloud sync automatically backs up your revisions and enables
                cross-device collaboration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
};