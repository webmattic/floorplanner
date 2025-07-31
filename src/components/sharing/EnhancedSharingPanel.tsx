// floorplanner/frontend/src/components/sharing/EnhancedSharingPanel.tsx

import React, { useState, useEffect, useCallback } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator.tsx";
import { Badge } from "../ui/badge.tsx";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Share2,
  Link2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Users,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

interface EnhancedSharingPanelProps {
  floorplanId: number;
}

interface ShareLink {
  id: string;
  token: string;
  preview_url: string;
  permission_level: "view" | "comment" | "edit";
  password?: string;
  expires_at?: string;
  is_active: boolean;
  access_count: number;
  created_at: string;
  analytics?: ShareLinkAnalytics;
  permission_settings?: ShareLinkPermissionSettings;
  audit_logs?: AuditLogEntry[];
  active_sessions_count?: number;
}

interface ShareLinkAnalytics {
  total_views: number;
  unique_viewers: number;
  total_comments: number;
  engagement_score: number;
  peak_concurrent_viewers: number;
  most_active_hour?: number;
  comment_heatmap: Record<string, any>;
}

interface ShareLinkPermissionSettings {
  allow_comments: boolean;
  allow_comment_replies: boolean;
  require_approval: boolean;
  restricted_areas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  watermark_enabled: boolean;
  download_enabled: boolean;
  max_comments_per_hour: number;
  max_views_per_ip_per_day: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user_name?: string;
  timestamp: string;
  ip_address?: string;
  details: Record<string, any>;
}

export const EnhancedSharingPanel: React.FC<EnhancedSharingPanelProps> = ({
  floorplanId,
}) => {
  const { currentFloorPlan } = useFloorPlanStore();
  const [activeTab, setActiveTab] = useState("links");
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Link creation state
  const [newLinkPermission, setNewLinkPermission] = useState<
    "view" | "comment" | "edit"
  >("view");
  const [newLinkPassword, setNewLinkPassword] = useState("");
  const [newLinkExpiry, setNewLinkExpiry] = useState("7"); // days
  const [customMessage, setCustomMessage] = useState("");

  // Permission settings state
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [permissionSettings] = useState<ShareLinkPermissionSettings>({
    allow_comments: true,
    allow_comment_replies: true,
    require_approval: false,
    restricted_areas: [],
    watermark_enabled: false,
    download_enabled: false,
    max_comments_per_hour: 10,
    max_views_per_ip_per_day: 100,
  });

  // Load share links
  useEffect(() => {
    if (floorplanId) {
      loadShareLinks();
    }
  }, [floorplanId]);

  const loadShareLinks = async () => {
    if (!floorplanId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/floorplanner/enhanced-share-links/?floorplan=${floorplanId}`
      );
      if (response.ok) {
        const data = await response.json();
        setShareLinks(data.results || data);
      } else {
        setError("Failed to load share links");
      }
    } catch (err) {
      setError("Network error loading share links");
      console.error("Error loading share links:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createShareLink = async () => {
    if (!floorplanId) return;

    setIsLoading(true);
    try {
      const expiresAt = newLinkExpiry
        ? new Date(
            Date.now() + parseInt(newLinkExpiry) * 24 * 60 * 60 * 1000
          ).toISOString()
        : undefined;

      const response = await fetch("/api/floorplanner/enhanced-share-links/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          floorplan: floorplanId,
          permission_level: newLinkPermission,
          password: newLinkPassword || undefined,
          expires_at: expiresAt,
        }),
      });

      if (response.ok) {
        const newLink = await response.json();
        setShareLinks((prev) => [...prev, newLink]);

        // Reset form
        setNewLinkPassword("");
        setNewLinkExpiry("7");
      } else {
        setError("Failed to create share link");
      }
    } catch (err) {
      setError("Network error creating share link");
      console.error("Error creating share link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateToken = async (linkId: string) => {
    try {
      const response = await fetch(
        `/api/floorplanner/enhanced-share-links/${linkId}/regenerate_token/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShareLinks((prev) =>
          prev.map((link) =>
            link.id === linkId
              ? { ...link, token: data.token, preview_url: data.preview_url }
              : link
          )
        );
      }
    } catch (err) {
      console.error("Error regenerating token:", err);
    }
  };

  const toggleLinkStatus = async (linkId: string) => {
    try {
      const response = await fetch(
        `/api/floorplanner/enhanced-share-links/${linkId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            is_active: !shareLinks.find((l) => l.id === linkId)?.is_active,
          }),
        }
      );

      if (response.ok) {
        const updatedLink = await response.json();
        setShareLinks((prev) =>
          prev.map((link) => (link.id === linkId ? updatedLink : link))
        );
      }
    } catch (err) {
      console.error("Error toggling link status:", err);
    }
  };

  const revokeLink = async (linkId: string) => {
    try {
      const response = await fetch(
        `/api/floorplanner/enhanced-share-links/${linkId}/revoke/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        setShareLinks((prev) => prev.filter((link) => link.id !== linkId));
      }
    } catch (err) {
      console.error("Error revoking link:", err);
    }
  };

  const updatePermissions = async (
    linkId: string,
    settings: Partial<ShareLinkPermissionSettings>
  ) => {
    try {
      const response = await fetch(
        `/api/floorplanner/enhanced-share-links/${linkId}/update_permissions/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(settings),
        }
      );

      if (response.ok) {
        const updatedSettings = await response.json();
        setShareLinks((prev) =>
          prev.map((link) =>
            link.id === linkId
              ? { ...link, permission_settings: updatedSettings }
              : link
          )
        );
      }
    } catch (err) {
      console.error("Error updating permissions:", err);
    }
  };

  const copyToClipboard = useCallback(async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (!currentFloorPlan) {
    return (
      <FloatingPanel panelId="enhancedSharing">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Save your floor plan to enable sharing features.
          </AlertDescription>
        </Alert>
      </FloatingPanel>
    );
  }

  return (
    <FloatingPanel panelId="enhancedSharing">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Advanced Sharing</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadShareLinks}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Share Links Tab */}
          <TabsContent value="links" className="space-y-4">
            {/* Create New Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create Share Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Permission Level</Label>
                    <Select
                      value={newLinkPermission}
                      onValueChange={(value: any) =>
                        setNewLinkPermission(value)
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View Only</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Expires In (days)</Label>
                    <Select
                      value={newLinkExpiry}
                      onValueChange={setNewLinkExpiry}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                        <SelectItem value="">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Password (Optional)</Label>
                  <Input
                    type="password"
                    placeholder="Set password for extra security"
                    value={newLinkPassword}
                    onChange={(e) => setNewLinkPassword(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Custom Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a message to share with your floor plan..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="text-xs"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={createShareLink}
                  disabled={isLoading}
                  className="w-full"
                  size="sm"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Share Link
                </Button>
              </CardContent>
            </Card>

            {/* Active Share Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Active Share Links ({shareLinks.length})
              </h4>
              {shareLinks.map((link) => (
                <Card
                  key={link.id}
                  className={`${!link.is_active ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            link.permission_level === "edit"
                              ? "default"
                              : link.permission_level === "comment"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {link.permission_level}
                        </Badge>
                        {link.password && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Protected
                          </Badge>
                        )}
                        {link.expires_at && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getDaysUntilExpiry(link.expires_at)}d left
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {link.is_active ? (
                          <Eye className="h-3 w-3 text-green-500" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {link.access_count} views
                        </span>
                        {link.active_sessions_count! > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {link.active_sessions_count} online
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        value={link.preview_url}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(link.preview_url, link.id)
                        }
                        className="shrink-0"
                      >
                        {copiedLinkId === link.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {formatDate(link.created_at)}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLinkId(link.id)}
                          className="h-6 p-1"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => regenerateToken(link.id)}
                          className="h-6 p-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLinkStatus(link.id)}
                          className="h-6 p-1"
                        >
                          {link.is_active ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeLink(link.id)}
                          className="h-6 p-1 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {shareLinks
              .filter((link) => link.analytics)
              .map((link) => (
                <Card key={link.id}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics - {link.permission_level} link
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">
                          {link.analytics!.total_views}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Views
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {link.analytics!.unique_viewers}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Unique Viewers
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {link.analytics!.total_comments}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comments
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(link.analytics!.engagement_score)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Engagement
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Peak concurrent viewers:{" "}
                        {link.analytics!.peak_concurrent_viewers}
                      </div>
                      {link.analytics!.most_active_hour !== undefined && (
                        <div>
                          Most active hour: {link.analytics!.most_active_hour}
                          :00
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {selectedLinkId && (
              <PermissionSettingsCard
                linkId={selectedLinkId}
                settings={
                  shareLinks.find((l) => l.id === selectedLinkId)
                    ?.permission_settings || permissionSettings
                }
                onUpdate={(settings) =>
                  updatePermissions(selectedLinkId, settings)
                }
              />
            )}

            {!selectedLinkId && (
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Select a share link from the Links tab to configure its
                  settings.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-4">
            {shareLinks.map(
              (link) =>
                link.audit_logs &&
                link.audit_logs.length > 0 && (
                  <Card key={link.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Audit Log - {link.permission_level} link
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {link.audit_logs.slice(0, 10).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between text-xs border-b pb-1"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {log.action}
                              </Badge>
                              <span>{log.user_name || "Anonymous"}</span>
                            </div>
                            <div className="text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FloatingPanel>
  );
};

// Permission Settings Component
const PermissionSettingsCard: React.FC<{
  linkId: string;
  settings: ShareLinkPermissionSettings;
  onUpdate: (settings: Partial<ShareLinkPermissionSettings>) => void;
}> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleUpdate = (key: keyof ShareLinkPermissionSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdate({ [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Permission Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Allow Comments</Label>
            <Switch
              checked={localSettings.allow_comments}
              onCheckedChange={(value: boolean) =>
                handleUpdate("allow_comments", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Allow Comment Replies</Label>
            <Switch
              checked={localSettings.allow_comment_replies}
              onCheckedChange={(value: boolean) =>
                handleUpdate("allow_comment_replies", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Require Approval</Label>
            <Switch
              checked={localSettings.require_approval}
              onCheckedChange={(value: boolean) =>
                handleUpdate("require_approval", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Watermark</Label>
            <Switch
              checked={localSettings.watermark_enabled}
              onCheckedChange={(value: boolean) =>
                handleUpdate("watermark_enabled", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Downloads</Label>
            <Switch
              checked={localSettings.download_enabled}
              onCheckedChange={(value: boolean) =>
                handleUpdate("download_enabled", value)
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Max Comments per Hour</Label>
            <Input
              type="number"
              value={localSettings.max_comments_per_hour}
              onChange={(e) =>
                handleUpdate("max_comments_per_hour", parseInt(e.target.value))
              }
              className="text-xs"
              min="1"
              max="100"
            />
          </div>

          <div>
            <Label className="text-xs">Max Views per IP per Day</Label>
            <Input
              type="number"
              value={localSettings.max_views_per_ip_per_day}
              onChange={(e) =>
                handleUpdate(
                  "max_views_per_ip_per_day",
                  parseInt(e.target.value)
                )
              }
              className="text-xs"
              min="10"
              max="1000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSharingPanel;
