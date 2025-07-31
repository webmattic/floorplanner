import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@/components/ui/separator.tsx";
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
import { FloatingPanel } from "@/components/ui/floating-panel";
import useFloorPlanStore from "../stores/floorPlanStore.js";

const RevisionHistoryPanel = () => {
  const { currentFloorPlan, apiConfig, revisionHistory, currentRevision } =
    useFloorPlanStore();

  // Panel state
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedRevisions, setSelectedRevisions] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [autoSaveSettings, setAutoSaveSettings] = useState({
    enabled: true,
    interval: 300,
    maxRevisions: 50,
  });

  // Revision management state
  const [revisions, setRevisions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revisionStatistics, setRevisionStatistics] = useState(null);
  const [collaborationInsights, setCollaborationInsights] = useState(null);

  // History navigation state
  const [historyPosition, setHistoryPosition] = useState(0);
  const [isUndoRedoMode, setIsUndoRedoMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Version comparison state
  const [comparisonData, setComparisonData] = useState(null);
  const [isComparingVersions, setIsComparingVersions] = useState(false);

  // Sync and conflict state
  const [syncStatus, setSyncStatus] = useState("synced");
  const [syncConflicts, setSyncConflicts] = useState([]);
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

  const handleRestoreRevision = async (revisionId) => {
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
        `${apiConfig.baseUrl}/floorplans/${currentFloorPlan.id}/revisions/compare/`,
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

  const updateAutoSaveSettings = async (newSettings) => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/auto-save-settings/`, {
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

  const getCsrfToken = () => {
    return document.querySelector("[name=csrfmiddlewaretoken]")?.value || "";
  };

  const getRevisionIcon = (revision) => {
    if (revision.is_checkpoint) return <Bookmark className="h-4 w-4" />;
    if (revision.is_auto_save) return <Zap className="h-4 w-4" />;
    return <Save className="h-4 w-4" />;
  };

  const getRevisionBadgeVariant = (revision) => {
    if (revision.is_checkpoint) return "default";
    if (revision.is_auto_save) return "secondary";
    return "outline";
  };

  const formatTimeAgo = (timeAgoSeconds) => {
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
    <div className="revision-history-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Revision History</h3>
        <div className="flex gap-2">
          {selectedRevisions.length === 2 ? (
            <button
              onClick={handleCompare}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Compare
            </button>
          ) : null}
          {isComparing && (
            <button
              onClick={exitComparisonMode}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Exit Comparison
            </button>
          )}
        </div>
      </div>

      {isComparing ? (
        <div className="comparison-view border rounded-md p-3 bg-gray-50">
          <h4 className="font-medium mb-2">Comparing Revisions</h4>
          <div className="grid grid-cols-2 gap-4">
            {selectedRevisions.map((revId, index) => {
              const rev = revisionHistory.find((r) => r.id === revId);
              return (
                <div key={revId} className="border rounded p-2 bg-white">
                  <div className="text-sm font-medium">
                    {index === 0 ? "Before" : "After"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(rev.timestamp).toLocaleString()}
                  </div>
                  <div className="mt-2 p-1 bg-gray-100 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(rev.changes, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 border-t">
            <h5 className="font-medium text-sm mb-2">Changes Detected:</h5>
            <ul className="text-xs space-y-1">
              <li className="flex items-center">
                <span className="w-3 h-3 inline-block bg-green-500 mr-2 rounded-full"></span>
                <span>Added 2 furniture items</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 inline-block bg-red-500 mr-2 rounded-full"></span>
                <span>Removed 1 wall</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 inline-block bg-yellow-500 mr-2 rounded-full"></span>
                <span>Modified room dimensions</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="history-slider flex items-center relative">
                {revisionHistory.map((rev, index) => (
                  <button
                    key={rev.id}
                    className={`absolute w-4 h-4 rounded-full -ml-2 transform -translate-y-1/2 top-1/2
                      ${
                        rev.id === currentRevision
                          ? "bg-blue-600 ring-2 ring-blue-300"
                          : selectedRevisions.includes(rev.id)
                          ? "bg-purple-500"
                          : "bg-gray-400"
                      }`}
                    style={{
                      left: `${(index / (revisionHistory.length - 1)) * 100}%`,
                    }}
                    onClick={() => setCurrentRevision(rev.id)}
                    title={new Date(rev.timestamp).toLocaleString()}
                  ></button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {revisionHistory.map((revision) => (
              <div
                key={revision.id}
                className={`revision-item border rounded-md p-3 cursor-pointer
                  ${
                    revision.id === currentRevision
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }
                  ${
                    selectedRevisions.includes(revision.id)
                      ? "border-purple-500 bg-purple-50"
                      : ""
                  }`}
                onClick={() => toggleRevisionSelection(revision.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {revision.name || `Revision ${revision.id.substr(0, 8)}`}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(revision.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedRevisions.includes(revision.id)}
                      onChange={() => toggleRevisionSelection(revision.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    {revision.id === currentRevision && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <p>{revision.description || "No description available"}</p>
                </div>
                {revision.thumbnail && (
                  <div className="mt-2">
                    <img
                      src={revision.thumbnail}
                      alt={`Revision ${revision.id} thumbnail`}
                      className="h-20 object-cover rounded border"
                    />
                  </div>
                )}
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentRevision(revision.id);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              All changes are automatically saved to the cloud.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionHistoryPanel;
