import React, { useState, useCallback, useEffect, useRef } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Card } from "../ui/card.tsx";
import { Badge } from "../ui/badge.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Users,
  MessageCircle,
  Send,
  UserPlus,
  Eye,
  EyeOff,
  Crown,
  Clock,
  Share2,
  Link,
  Copy,
  MapPin,
  Reply,
  MoreHorizontal,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  MousePointer,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";
import {
  collaborationAPI,
  type Collaborator,
  type CollaborationMessage,
  type ShareLink,
  // type CollaboratorSession,
} from "../../services/collaborationApi";

// Legacy types for backwards compatibility with existing UI
interface CommentPin {
  id: string;
  userId: string;
  userName: string;
  x: number;
  y: number;
  message: string;
  timestamp: Date;
  resolved: boolean;
  replies: CommentReply[];
}

interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

// Permission levels
const PERMISSION_LEVELS = [
  { value: "view", label: "View Only", description: "Can view the floor plan" },
  {
    value: "comment",
    label: "Comment",
    description: "Can view and add comments",
  },
  { value: "edit", label: "Edit", description: "Can view, comment, and edit" },
];

export const CollaborationPanelEnhanced: React.FC = () => {
  const { ws, isConnected, sendMessage, currentFloorPlan } =
    useFloorPlanStore();
  const floorplanId = currentFloorPlan?.id?.toString() || "test-floorplan-id"; // fallback for now

  // Panel state
  const [activeTab, setActiveTab] = useState("users");
  const [showCursors, setShowCursors] = useState(true);
  const [showCommentPins, setShowCommentPins] = useState(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<CollaborationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);

  // Comment pins state (keeping existing functionality)
  const [commentPins, setCommentPins] = useState<CommentPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  // TODO: Implement UI for active sessions
  // const [activeSessions, setActiveSessions] = useState<CollaboratorSession[]>(
  //   []
  // );
  const [linkExpiryDays, setLinkExpiryDays] = useState<number>(7);

  // Invite dialog state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");
  const [inviteMessage, setInviteMessage] = useState("");

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  // Share link state
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLinkPermission, setNewLinkPermission] = useState<
    "view" | "comment" | "edit"
  >("view");
  const [newLinkPassword, setNewLinkPassword] = useState("");
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);

  // Error/loading state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refresh intervals
  const messagesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const collaboratorsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeCollaboration = async () => {
    if (!floorplanId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load initial data concurrently
      const [messages, collaboratorsData, shareLinksData] = await Promise.all([
        collaborationAPI.getMessages(floorplanId),
        collaborationAPI.getActiveCollaborators(floorplanId),
        collaborationAPI.getShareLinks(floorplanId),
      ]);

      setChatMessages(messages);
      setCollaborators(collaboratorsData);
      setShareLinks(shareLinksData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load collaboration data"
      );
      console.error("Error initializing collaboration:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startAutoRefresh = () => {
    // Refresh messages every 5 seconds
    messagesIntervalRef.current = setInterval(() => {
      if (floorplanId) {
        collaborationAPI
          .getMessages(floorplanId)
          .then(setChatMessages)
          .catch(console.error);
      }
    }, 5000);

    // Refresh collaborators every 10 seconds
    collaboratorsIntervalRef.current = setInterval(() => {
      if (floorplanId) {
        collaborationAPI
          .getActiveCollaborators(floorplanId)
          .then(setCollaborators)
          .catch(console.error);
      }
    }, 10000);

    // Update presence every 30 seconds
    presenceIntervalRef.current = setInterval(() => {
      if (floorplanId) {
        updatePresence("online");
      }
    }, 30000);
  };

  const stopAutoRefresh = () => {
    if (messagesIntervalRef.current) {
      clearInterval(messagesIntervalRef.current);
    }
    if (collaboratorsIntervalRef.current) {
      clearInterval(collaboratorsIntervalRef.current);
    }
    if (presenceIntervalRef.current) {
      clearInterval(presenceIntervalRef.current);
    }
  };

  useEffect(() => {
    if (floorplanId) {
      initializeCollaboration();
      startAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorplanId]);

  useEffect(() => {
    if (ws && isConnected) {
      setConnectionStatus("connected");
      ws.addEventListener("message", handleWebSocketMessage);

      joinCollaborationSession();

      return () => {
        ws.removeEventListener("message", handleWebSocketMessage);
        leaveCollaborationSession();
      };
    } else {
      setConnectionStatus("disconnected");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws, isConnected, floorplanId]);

  const joinCollaborationSession = async () => {
    if (!floorplanId) return;
    try {
      await collaborationAPI.joinSession(floorplanId, { x: 0, y: 0 });
      await updatePresence("online");
    } catch (err) {
      console.error("Error joining collaboration session:", err);
    }
  };

  const leaveCollaborationSession = async () => {
    if (!floorplanId) return;
    try {
      await collaborationAPI.leaveSession(floorplanId);
      await updatePresence("offline");
    } catch (err) {
      console.error("Error leaving collaboration session:", err);
    }
  };

  const updatePresence = async (
    status: "online" | "away" | "offline",
    tool?: string
  ) => {
    if (!floorplanId) return;
    try {
      await collaborationAPI.updatePresence(floorplanId, status, tool);
    } catch (err) {
      console.error("Error updating presence:", err);
    }
  };

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "user_joined":
          handleUserJoined(data);
          break;
        case "user_left":
          handleUserLeft(data);
          break;
        case "cursor_update":
          handleCursorUpdate(data);
          break;
        case "chat_message":
          handleChatMessage(data);
          break;
        case "comment_pin":
          handleCommentPin(data);
          break;
        case "collaboration_message":
          handleCollaborationMessage(data);
          break;
        case "presence_update":
          handlePresenceUpdate(data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  const handleCommentPin = (data: any) => {
    if (data.action === "create") {
      const pin: CommentPin = {
        id: data.id,
        userId: data.userId,
        userName: data.userName,
        x: data.x,
        y: data.y,
        message: data.message,
        timestamp: new Date(data.timestamp),
        resolved: false,
        replies: [],
      };
      setCommentPins((prev) => [...prev, pin]);
    } else if (data.action === "resolve") {
      setCommentPins((prev) =>
        prev.map((pin) =>
          pin.id === data.id ? { ...pin, resolved: true } : pin
        )
      );
    }
  };

  const handleUserJoined = (data: any) => {
    const newUser: Collaborator = {
      id: data.userId,
      name: data.userName,
      email: data.userEmail,
      role: data.role || "viewer",
      status: "online",
      color: data.color || generateUserColor(data.userId),
    };

    setCollaborators((prev) => {
      const existing = prev.find((c) => c.id === data.userId);
      if (existing) {
        return prev.map((c) =>
          c.id === data.userId ? { ...c, status: "online" } : c
        );
      }
      return [...prev, newUser];
    });

    addSystemMessage(`${data.userName} joined the collaboration`);
  };

  const handleUserLeft = (data: any) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === data.userId
          ? { ...c, status: "offline", last_seen: new Date().toISOString() }
          : c
      )
    );
    addSystemMessage(`${data.userName} left the collaboration`);
  };

  const handleCursorUpdate = (data: any) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === data.userId
          ? { ...c, cursor: { x: data.x, y: data.y, tool: data.tool } }
          : c
      )
    );
  };

  const handleChatMessage = (data: any) => {
    const newMessage: CollaborationMessage = {
      id: data.id || `msg_${Date.now()}`,
      floorplan: floorplanId || "",
      user: data.userId,
      user_name: data.userName,
      message_type: "chat",
      content: data.message,
      reply_to: data.replyTo,
      created_at: new Date(data.timestamp).toISOString(),
      updated_at: new Date(data.timestamp).toISOString(),
      is_edited: false,
    };
    setChatMessages((prev) => [...prev, newMessage]);
  };

  const handleCollaborationMessage = (data: CollaborationMessage) => {
    setChatMessages((prev) => {
      const existing = prev.find((m) => m.id === data.id);
      if (existing) {
        return prev.map((m) => (m.id === data.id ? data : m));
      }
      return [...prev, data];
    });
  };

  // const handleSessionUpdate = (data: any) => {
  //   if (data.action === "join") {
  //     setActiveSessions((prev) => [
  //       ...prev.filter((s) => s.user !== data.user),
  //       data.session,
  //     ]);
  //   } else if (data.action === "leave") {
  //     setActiveSessions((prev) => prev.filter((s) => s.user !== data.user));
  //   } else if (data.action === "cursor") {
  //     setActiveSessions((prev) =>
  //       prev.map((s) =>
  //         s.user === data.user
  //           ? { ...s, cursor_position: data.cursor_position }
  //           : s
  //       )
  //     );
  //   }
  // };

  const handlePresenceUpdate = (data: any) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === data.userId
          ? {
              ...c,
              status: data.status,
              cursor: data.cursor,
            }
          : c
      )
    );
  };

  // Chat functions
  const sendChatMessage = async () => {
    if (!newMessage.trim() || !floorplanId) return;

    try {
      const message = await collaborationAPI.sendMessage(
        floorplanId,
        newMessage.trim(),
        "chat",
        replyingTo || undefined
      );

      setChatMessages((prev) => [...prev, message]);

      if (ws && isConnected) {
        sendMessage({
          type: "collaboration_message",
          data: message,
        });
      }

      setNewMessage("");
      setReplyingTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Error sending message:", err);
    }
  };

  const editChatMessage = async (messageId: string, newContent: string) => {
    try {
      const updatedMessage = await collaborationAPI.editMessage(
        messageId,
        newContent
      );
      setChatMessages((prev) =>
        prev.map((m) => (m.id === messageId ? updatedMessage : m))
      );
      if (ws && isConnected) {
        sendMessage({
          type: "collaboration_message_update",
          data: updatedMessage,
        });
      }
      setEditingMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit message");
      console.error("Error editing message:", err);
    }
  };

  const deleteChatMessage = async (messageId: string) => {
    try {
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (ws && isConnected) {
        sendMessage({
          type: "collaboration_message_delete",
          data: { messageId },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
      console.error("Error deleting message:", err);
    }
  };

  // Share link functions
  const createShareLink = async () => {
    if (!floorplanId) return;

    try {
      const expiresAt =
        linkExpiryDays > 0
          ? new Date(
              Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined;

      const shareLink = await collaborationAPI.createShareLink(
        floorplanId,
        newLinkPermission,
        newLinkPassword || undefined,
        expiresAt
      );

      setShareLinks((prev) => [...prev, shareLink]);
      setIsCreateLinkOpen(false);
      setNewLinkPassword("");
      setLinkExpiryDays(7);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create share link"
      );
      console.error("Error creating share link:", err);
    }
  };

  const toggleShareLink = async (linkId: string) => {
    try {
      const updatedLink = await collaborationAPI.toggleShareLink(linkId);
      setShareLinks((prev) =>
        prev.map((link) => (link.id === linkId ? updatedLink : link))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle share link"
      );
      console.error("Error toggling share link:", err);
    }
  };

  const regenerateShareLink = async (linkId: string) => {
    try {
      const updatedLink = await collaborationAPI.regenerateShareLink(linkId);
      setShareLinks((prev) =>
        prev.map((link) => (link.id === linkId ? updatedLink : link))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to regenerate share link"
      );
      console.error("Error regenerating share link:", err);
    }
  };

  // Invite functions
  const inviteCollaborator = async () => {
    if (!inviteEmail.trim() || !floorplanId) return;

    try {
      await collaborationAPI.inviteCollaborator(
        floorplanId,
        inviteEmail.trim(),
        inviteRole,
        inviteMessage.trim() || undefined
      );

      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteMessage("");
      setInviteRole("viewer");

      const updatedCollaborators =
        await collaborationAPI.getActiveCollaborators(floorplanId);
      setCollaborators(updatedCollaborators);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to invite collaborator"
      );
      console.error("Error inviting collaborator:", err);
    }
  };

  // Utility functions
  const generateUserColor = (userId: string): string => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f43f5e",
      "#84cc16",
    ];
    const hash = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: CollaborationMessage = {
      id: `system_${Date.now()}`,
      floorplan: floorplanId || "",
      user: "system",
      user_name: "System",
      message_type: "system",
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false,
    };
    setChatMessages((prev) => [...prev, systemMessage]);
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  if (isLoading) {
    return (
      <FloatingPanel panelId="collaboration-loading" className="w-96 h-[600px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading collaboration...
            </p>
          </div>
        </div>
      </FloatingPanel>
    );
  }

  return (
    <FloatingPanel panelId="collaboration-panel" className="w-96 h-[600px]">
      {/* Connection status and online count */}
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <div className="flex items-center space-x-2">
          {connectionStatus === "connected" ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {collaborators.filter((c) => c.status === "online").length} online
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-auto"
            onClick={() => setError(null)}
          >
            ×
          </Button>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-4 mx-2 mt-2">
            <TabsTrigger value="users" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Pins
            </TabsTrigger>
            <TabsTrigger value="share" className="text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Users Tab */}
            <TabsContent
              value="users"
              className="h-full flex flex-col m-0 data-[state=active]:mt-2"
            >
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-medium">Collaborators</h3>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Collaborator</DialogTitle>
                      <DialogDescription>
                        Invite someone to collaborate on this floor plan.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-role">Role</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value: "editor" | "viewer") =>
                            setInviteRole(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">
                              <div>
                                <div className="font-medium">Viewer</div>
                                <div className="text-xs text-muted-foreground">
                                  Can view and comment
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="editor">
                              <div>
                                <div className="font-medium">Editor</div>
                                <div className="text-xs text-muted-foreground">
                                  Can view, comment, and edit
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="invite-message">
                          Message (Optional)
                        </Label>
                        <Textarea
                          id="invite-message"
                          placeholder="Add a personal message..."
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={inviteCollaborator}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="flex-1 px-2">
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <Card key={collaborator.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={collaborator.email} />
                              <AvatarFallback className="text-xs">
                                {collaborator.name
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                                collaborator.status === "online"
                                  ? "bg-green-500"
                                  : collaborator.status === "away"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium truncate">
                                {collaborator.name}
                              </p>
                              {collaborator.role === "owner" && (
                                <Crown className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {collaborator.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge
                            variant={
                              collaborator.role === "owner"
                                ? "default"
                                : collaborator.role === "editor"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {collaborator.role}
                          </Badge>
                          {collaborator.cursor && showCursors && (
                            <div className="flex items-center space-x-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: collaborator.color,
                                }}
                              />
                              <MousePointer className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      {collaborator.status !== "online" &&
                        collaborator.last_seen && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last seen {formatTimestamp(collaborator.last_seen)}
                          </p>
                        )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Visibility Controls */}
              <div className="border-t p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-cursors" className="text-xs">
                    Show cursors
                  </Label>
                  <Switch
                    id="show-cursors"
                    checked={showCursors}
                    onCheckedChange={setShowCursors}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-pins" className="text-xs">
                    Show comment pins
                  </Label>
                  <Switch
                    id="show-pins"
                    checked={showCommentPins}
                    onCheckedChange={setShowCommentPins}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent
              value="chat"
              className="h-full flex flex-col m-0 data-[state=active]:mt-2"
            >
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="group">
                      {message.message_type === "system" ? (
                        <div className="flex justify-center">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {message.content}
                          </span>
                        </div>
                      ) : (
                        <Card className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 flex-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={message.user_avatar} />
                                <AvatarFallback className="text-xs">
                                  {message.user_name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs font-medium">
                                    {message.user_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimestamp(message.created_at)}
                                  </p>
                                  {message.is_edited && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      edited
                                    </Badge>
                                  )}
                                </div>
                                {message.reply_to_message && (
                                  <div className="mt-1 p-2 bg-muted rounded text-xs">
                                    <p className="font-medium">
                                      {message.reply_to_message.user_name}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {message.reply_to_message.content}
                                    </p>
                                  </div>
                                )}
                                {editingMessage === message.id ? (
                                  <div className="mt-2">
                                    <Textarea
                                      defaultValue={message.content}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          editChatMessage(
                                            message.id,
                                            e.currentTarget.value
                                          );
                                          setEditingMessage(null);
                                        } else if (e.key === "Escape") {
                                          setEditingMessage(null);
                                        }
                                      }}
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm mt-1">
                                    {message.content}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-1" align="end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs"
                                  onClick={() => setReplyingTo(message.id)}
                                >
                                  <Reply className="h-3 w-3 mr-2" />
                                  Reply
                                </Button>
                                {message.user === "current-user" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs"
                                      onClick={() =>
                                        setEditingMessage(message.id)
                                      }
                                    >
                                      <Edit3 className="h-3 w-3 mr-2" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                      onClick={() =>
                                        deleteChatMessage(message.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </PopoverContent>
                            </Popover>
                          </div>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t p-2 space-y-2">
                {replyingTo && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                    <span>
                      Replying to{" "}
                      {chatMessages.find((m) => m.id === replyingTo)?.user_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setReplyingTo(null)}
                    >
                      ×
                    </Button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={sendChatMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent
              value="comments"
              className="h-full flex flex-col m-0 data-[state=active]:mt-2"
            >
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-medium">Comment Pins</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log("Add pin clicked");
                    // TODO: Implement pin creation
                  }}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Add Pin
                </Button>
              </div>

              <ScrollArea className="flex-1 px-2">
                <div className="space-y-2">
                  {commentPins.map((pin) => (
                    <Card
                      key={pin.id}
                      className={`p-3 cursor-pointer ${
                        selectedPin === pin.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedPin(pin.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center space-y-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {pin.x}, {pin.y}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-medium">
                              {pin.userName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(pin.timestamp)}
                            </p>
                            {pin.resolved && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm mt-1">{pin.message}</p>
                          {pin.replies.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {pin.replies.length} replies
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Share Tab */}
            <TabsContent
              value="share"
              className="h-full flex flex-col m-0 data-[state=active]:mt-2"
            >
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-medium">Share Links</h3>
                <Dialog
                  open={isCreateLinkOpen}
                  onOpenChange={setIsCreateLinkOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Link className="h-3 w-3 mr-1" />
                      Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Share Link</DialogTitle>
                      <DialogDescription>
                        Create a shareable link for this floor plan.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="link-permission">
                          Permission Level
                        </Label>
                        <Select
                          value={newLinkPermission}
                          onValueChange={(value: "view" | "comment" | "edit") =>
                            setNewLinkPermission(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERMISSION_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div>
                                  <div className="font-medium">
                                    {level.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {level.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="link-password">
                          Password (Optional)
                        </Label>
                        <Input
                          id="link-password"
                          type="password"
                          placeholder="Leave empty for no password"
                          value={newLinkPassword}
                          onChange={(e) => setNewLinkPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="link-expiry">
                          Expires After (Days)
                        </Label>
                        <Select
                          value={linkExpiryDays.toString()}
                          onValueChange={(value) =>
                            setLinkExpiryDays(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="7">1 Week</SelectItem>
                            <SelectItem value="30">1 Month</SelectItem>
                            <SelectItem value="0">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateLinkOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createShareLink}>Create Link</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="flex-1 px-2">
                <div className="space-y-2">
                  {shareLinks.map((shareLink) => (
                    <Card key={shareLink.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                shareLink.permission_level === "edit"
                                  ? "default"
                                  : shareLink.permission_level === "comment"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {shareLink.permission_level}
                            </Badge>
                            {shareLink.password && (
                              <Badge variant="outline" className="text-xs">
                                Protected
                              </Badge>
                            )}
                            {!shareLink.is_active && (
                              <Badge variant="destructive" className="text-xs">
                                Disabled
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {shareLink.is_active ? (
                              <Eye className="h-3 w-3 text-green-500" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Input
                            value={shareLink.url}
                            readOnly
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(shareLink.url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Created {formatTimestamp(shareLink.created_at)}
                          </span>
                          <span>{shareLink.access_count} views</span>
                        </div>

                        {shareLink.expires_at && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              Expires {formatTimestamp(shareLink.expires_at)}
                            </span>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleShareLink(shareLink.id)}
                            className="flex-1"
                          >
                            {shareLink.is_active ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => regenerateShareLink(shareLink.id)}
                            className="flex-1"
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </FloatingPanel>
  );
};
