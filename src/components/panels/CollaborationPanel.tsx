import React, { useState, useCallback, useEffect, useRef } from "react";
import { FloatingPanel } from "../ui/floating-panel.tsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";
import { Separator } from "../ui/separator.tsx";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Users,
  MessageCircle,
  Send,
  UserPlus,
  Settings,
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
  Info,
  Wifi,
  WifiOff,
  MousePointer,
  Palette,
  Move,
  Square,
  Package,
} from "lucide-react";
import useFloorPlanStore from "../../stores/floorPlanStore";

// Types for collaboration features
interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  status: "online" | "offline" | "away";
  cursor?: { x: number; y: number; tool?: string };
  lastSeen?: Date;
  color: string; // Unique color for cursor and selections
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "message" | "system" | "edit";
  replyTo?: string;
  edited?: boolean;
}

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

interface ShareLink {
  id: string;
  url: string;
  permission: "view" | "comment" | "edit";
  expiresAt?: Date;
  password?: string;
  createdAt: Date;
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

export const CollaborationPanel: React.FC = () => {
  const { ws, isConnected, sendMessage, selectedElements } =
    useFloorPlanStore();

  // Panel state
  const [activeTab, setActiveTab] = useState("users");
  const [showCursors, setShowCursors] = useState(true);
  const [showCommentPins, setShowCommentPins] = useState(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Comment pins state
  const [commentPins, setCommentPins] = useState<CommentPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentPosition, setCommentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "current-user",
      name: "You",
      email: "you@example.com",
      role: "owner",
      status: "online",
      color: "#3b82f6",
      cursor: { x: 0, y: 0, tool: "select" },
    },
  ]);

  // Share links state
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLinkPermission, setNewLinkPermission] = useState<
    "view" | "comment" | "edit"
  >("view");
  const [newLinkPassword, setNewLinkPassword] = useState("");
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

  // WebSocket message handling
  useEffect(() => {
    if (ws && isConnected) {
      setConnectionStatus("connected");
      ws.addEventListener("message", handleWebSocketMessage);

      // Send presence update
      sendPresenceUpdate();

      return () => {
        ws.removeEventListener("message", handleWebSocketMessage);
      };
    } else {
      setConnectionStatus("disconnected");
    }
  }, [ws, isConnected]);

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
        case "floor_plan_update":
          handleFloorPlanUpdate(data);
          break;
        case "presence_update":
          handlePresenceUpdate(data);
          break;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  // WebSocket event handlers
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

    // Add system message
    addSystemMessage(`${data.userName} joined the collaboration`);
  };

  const handleUserLeft = (data: any) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === data.userId
          ? { ...c, status: "offline", lastSeen: new Date() }
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
    const message: ChatMessage = {
      id: data.id || `msg_${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date(data.timestamp),
      type: "message",
      replyTo: data.replyTo,
    };
    setChatMessages((prev) => [...prev, message]);
  };

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
    } else if (data.action === "reply") {
      const reply: CommentReply = {
        id: data.replyId,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: new Date(data.timestamp),
      };
      setCommentPins((prev) =>
        prev.map((pin) =>
          pin.id === data.pinId
            ? { ...pin, replies: [...pin.replies, reply] }
            : pin
        )
      );
    }
  };

  const handleFloorPlanUpdate = (data: any) => {
    addSystemMessage(`${data.userName} made changes to the floor plan`, "edit");
  };

  const handlePresenceUpdate = (data: any) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === data.userId
          ? {
              ...c,
              status: data.status,
              lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
            }
          : c
      )
    );
  };

  // Helper functions
  const generateUserColor = (userId: string): string => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#8b5cf6",
      "#ec4899",
    ];
    const hash = userId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const addSystemMessage = (
    message: string,
    type: "system" | "edit" = "system"
  ) => {
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      userId: "system",
      userName: "System",
      message,
      timestamp: new Date(),
      type,
    };
    setChatMessages((prev) => [...prev, systemMessage]);
  };

  const sendPresenceUpdate = () => {
    if (sendMessage) {
      sendMessage({
        type: "presence_update",
        status: "online",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Chat functions
  const sendChatMessage = useCallback(() => {
    if (!newMessage.trim() || !sendMessage) return;

    const message = {
      type: "chat_message",
      message: newMessage,
      replyTo: replyingTo,
      timestamp: new Date().toISOString(),
    };

    sendMessage(message);
    setNewMessage("");
    setReplyingTo(null);
  }, [newMessage, replyingTo, sendMessage]);

  const replyToMessage = (messageId: string) => {
    setReplyingTo(messageId);
    // Focus on input (would need ref in real implementation)
  };

  // Comment pin functions
  const createCommentPin = useCallback(
    (x: number, y: number, message: string) => {
      if (!sendMessage) return;

      const pin = {
        type: "comment_pin",
        action: "create",
        x,
        y,
        message,
        timestamp: new Date().toISOString(),
      };

      sendMessage(pin);
      setNewComment("");
      setCommentPosition(null);
    },
    [sendMessage]
  );

  const resolveCommentPin = (pinId: string) => {
    if (!sendMessage) return;

    sendMessage({
      type: "comment_pin",
      action: "resolve",
      id: pinId,
      timestamp: new Date().toISOString(),
    });
  };

  const replyToCommentPin = (pinId: string, message: string) => {
    if (!sendMessage) return;

    sendMessage({
      type: "comment_pin",
      action: "reply",
      pinId,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  // Invite functions
  const sendInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;

    // In a real implementation, this would send an API request
    console.log("Sending invite:", {
      email: inviteEmail,
      role: inviteRole,
      message: inviteMessage,
    });

    setIsInviteOpen(false);
    setInviteEmail("");
    setInviteMessage("");
    addSystemMessage(`Invitation sent to ${inviteEmail}`);
  }, [inviteEmail, inviteRole, inviteMessage]);

  // Share link functions
  const createShareLink = useCallback(() => {
    const link: ShareLink = {
      id: `link_${Date.now()}`,
      url: `${window.location.origin}/shared/${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      permission: newLinkPermission,
      password: newLinkPassword || undefined,
      expiresAt:
        linkExpiryDays > 0
          ? new Date(Date.now() + linkExpiryDays * 24 * 60 * 60 * 1000)
          : undefined,
      createdAt: new Date(),
    };

    setShareLinks((prev) => [...prev, link]);
    setIsCreateLinkOpen(false);
    setNewLinkPassword("");
    addSystemMessage(
      `Share link created with ${newLinkPermission} permissions`
    );
  }, [newLinkPermission, newLinkPassword, linkExpiryDays]);

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // In real implementation, show toast notification
    console.log("Link copied to clipboard");
  };

  const deleteShareLink = (linkId: string) => {
    setShareLinks((prev) => prev.filter((link) => link.id !== linkId));
    addSystemMessage("Share link deleted");
  };

  // Get online collaborators count
  const onlineCount = collaborators.filter((c) => c.status === "online").length;

  return (
    <FloatingPanel panelId="collaboration">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {connectionStatus === "connected"
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {onlineCount} online
            </Badge>
          </div>

          {/* Collaboration Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Cursors</Label>
              <Switch checked={showCursors} onCheckedChange={setShowCursors} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Comment Pins</Label>
              <Switch
                checked={showCommentPins}
                onCheckedChange={setShowCommentPins}
              />
            </div>
          </div>

          <Separator />

          {/* Invite Button */}
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Collaborator</DialogTitle>
                <DialogDescription>
                  Send an invitation to collaborate on this floor plan.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
                <div className="space-y-2">
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
                        Viewer - Can view only
                      </SelectItem>
                      <SelectItem value="editor">
                        Editor - Can view and edit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-message">
                    Personal Message (Optional)
                  </Label>
                  <Textarea
                    id="invite-message"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Let's work on this floor plan together..."
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
                <Button onClick={sendInvite} disabled={!inviteEmail.trim()}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Collaborators List */}
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <Card key={collaborator.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback
                          className="text-xs"
                          style={{
                            backgroundColor: collaborator.color + "20",
                            color: collaborator.color,
                          }}
                        >
                          {collaborator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          collaborator.status === "online"
                            ? "bg-green-500"
                            : collaborator.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {collaborator.name}
                        </span>
                        {collaborator.role === "owner" && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                        {collaborator.role === "editor" && (
                          <Edit3 className="h-3 w-3 text-blue-500" />
                        )}
                        {collaborator.role === "viewer" && (
                          <Eye className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {collaborator.status === "online" ? (
                          <div className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            <span>Active now</span>
                            {collaborator.cursor?.tool && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                {collaborator.cursor.tool}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span>
                            {collaborator.lastSeen
                              ? `Last seen ${Math.round(
                                  (Date.now() -
                                    collaborator.lastSeen.getTime()) /
                                    60000
                                )}m ago`
                              : "Offline"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4 mt-4">
          {/* Chat Messages */}
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.type === "system"
                      ? "bg-blue-50 text-blue-700 text-center"
                      : message.type === "edit"
                      ? "bg-green-50 text-green-700"
                      : "bg-muted"
                  }`}
                >
                  {message.type !== "system" && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.userName}
                        </span>
                        {message.type === "edit" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {message.edited && (
                          <Edit3 className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-32 p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => replyToMessage(message.id)}
                              className="w-full justify-start h-7"
                            >
                              <Reply className="h-3 w-3 mr-2" />
                              Reply
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {message.replyTo && (
                    <div className="text-xs text-muted-foreground mb-2 pl-3 border-l-2 border-muted-foreground/20">
                      Replying to previous message
                    </div>
                  )}

                  <div className="text-sm">{message.message}</div>
                </div>
              ))}

              {chatMessages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Reply indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-muted p-2 rounded">
              <div className="flex items-center gap-2">
                <Reply className="h-3 w-3" />
                <span className="text-xs">Replying to message</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="h-4 w-4 p-0"
              >
                ×
              </Button>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              disabled={connectionStatus !== "connected"}
            />
            <Button
              onClick={sendChatMessage}
              size="sm"
              disabled={!newMessage.trim() || connectionStatus !== "connected"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4 mt-4">
          {/* Comment Instructions */}
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Click on the canvas to add comment pins at specific locations.
            </AlertDescription>
          </Alert>

          {/* Comment Pins List */}
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {commentPins.map((pin) => (
                <Card
                  key={pin.id}
                  className={`p-3 ${pin.resolved ? "opacity-60" : ""}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">
                            {pin.userName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pin.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {pin.resolved ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveCommentPin(pin.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="text-sm pl-6">{pin.message}</div>

                    <div className="text-xs text-muted-foreground pl-6">
                      Position: ({Math.round(pin.x)}, {Math.round(pin.y)})
                    </div>

                    {/* Replies */}
                    {pin.replies.length > 0 && (
                      <div className="pl-6 space-y-2 border-l-2 border-muted">
                        {pin.replies.map((reply) => (
                          <div key={reply.id} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {reply.userName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {reply.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div>{reply.message}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {!pin.resolved && (
                      <div className="pl-6">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Reply to comment..."
                            className="h-7 text-xs"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  replyToCommentPin(pin.id, input.value);
                                  input.value = "";
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {commentPins.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No comment pins yet. Click on the canvas to add one!
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="share" className="space-y-4 mt-4">
          {/* Create Share Link */}
          <Dialog open={isCreateLinkOpen} onOpenChange={setIsCreateLinkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Create Share Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Share Link</DialogTitle>
                <DialogDescription>
                  Generate a public link to share this floor plan.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Permission Level</Label>
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
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {level.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-password">Password (Optional)</Label>
                  <Input
                    id="link-password"
                    type="password"
                    value={newLinkPassword}
                    onChange={(e) => setNewLinkPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry-days">Expires in (days)</Label>
                  <Select
                    value={linkExpiryDays.toString()}
                    onValueChange={(value) => setLinkExpiryDays(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="0">Never expires</SelectItem>
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

          {/* Share Links List */}
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <Card key={link.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {
                          PERMISSION_LEVELS.find(
                            (p) => p.value === link.permission
                          )?.label
                        }
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyShareLink(link.url)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Copy link</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteShareLink(link.id)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs font-mono bg-muted p-2 rounded truncate">
                      {link.url}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Created: {link.createdAt.toLocaleDateString()}</div>
                      {link.expiresAt && (
                        <div>
                          Expires: {link.expiresAt.toLocaleDateString()}
                        </div>
                      )}
                      {link.password && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Password protected
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {shareLinks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No share links created yet.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Share Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Share links allow anyone with the URL to access your floor plan
              based on the permission level you set.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
};
