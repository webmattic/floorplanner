import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator.tsx";
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
} from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  status: "online" | "offline" | "away";
  cursor?: { x: number; y: number };
  lastSeen?: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "message" | "system" | "edit";
}

const CollaborationPanel: React.FC = () => {
  const { ws, isConnected, sendMessage } = useFloorPlanStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "chat">("users");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCursors, setShowCursors] = useState(true);

  // Sample collaborators for demo
  const [demoCollaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "John Designer",
      email: "john@example.com",
      role: "owner",
      status: "online",
      cursor: { x: 150, y: 200 },
    },
    {
      id: "2",
      name: "Sarah Architect",
      email: "sarah@example.com",
      role: "editor",
      status: "online",
      cursor: { x: 300, y: 150 },
    },
    {
      id: "3",
      name: "Mike Client",
      email: "mike@example.com",
      role: "viewer",
      status: "away",
      lastSeen: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
  ]);

  useEffect(() => {
    // Listen for WebSocket messages
    if (ws && isConnected) {
      ws.addEventListener("message", handleWebSocketMessage);
      return () => {
        ws.removeEventListener("message", handleWebSocketMessage);
      };
    }
  }, [ws, isConnected]);

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "collaboration_event":
          handleCollaborationEvent(data);
          break;
        case "cursor_update":
          handleCursorUpdate(data);
          break;
        case "chat_message":
          handleChatMessage(data);
          break;
        case "floor_plan_update":
          handleFloorPlanUpdate(data);
          break;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  const handleCollaborationEvent = (data: any) => {
    // Handle user join/leave events
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      userId: "system",
      userName: "System",
      message: `${data.userName} ${data.event_type} the collaboration`,
      timestamp: new Date(),
      type: "system",
    };
    setChatMessages((prev) => [...prev, systemMessage]);
  };

  const handleCursorUpdate = (data: any) => {
    // Update cursor positions for real-time collaboration
    console.log("Cursor update:", data);
  };

  const handleChatMessage = (data: any) => {
    const message: ChatMessage = {
      id: data.id || `msg_${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date(data.timestamp),
      type: "message",
    };
    setChatMessages((prev) => [...prev, message]);
  };

  const handleFloorPlanUpdate = (data: any) => {
    // Handle real-time floor plan updates
    const editMessage: ChatMessage = {
      id: `edit_${Date.now()}`,
      userId: data.user_id,
      userName: data.userName || "Someone",
      message: `made changes to the floor plan`,
      timestamp: new Date(),
      type: "edit",
    };
    setChatMessages((prev) => [...prev, editMessage]);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !sendMessage) return;

    const message = {
      type: "chat_message",
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    sendMessage(message);
    setNewMessage("");
  };

  const inviteCollaborator = () => {
    // TODO: Implement invite modal
    console.log("Invite collaborator");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "editor":
        return <Settings className="h-3 w-3" />;
      case "viewer":
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Users className="h-4 w-4 mr-2" />
          {demoCollaborators.filter((c) => c.status === "online").length} Online
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-80 h-96 z-50 bg-white shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Collaboration</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCursors(!showCursors)}
              className="h-6 w-6 p-0"
            >
              {showCursors ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="flex space-x-1">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
            className="h-7 px-3 text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            Users ({demoCollaborators.length})
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("chat")}
            className="h-7 px-3 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {activeTab === "users" && (
          <div className="space-y-3">
            <Button
              onClick={inviteCollaborator}
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
            >
              <UserPlus className="h-3 w-3 mr-2" />
              Invite Collaborator
            </Button>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {demoCollaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center space-x-2 p-2 rounded-lg border bg-gray-50"
                  >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="text-xs">
                          {collaborator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${getStatusColor(
                          collaborator.status
                        )}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-medium truncate">
                          {collaborator.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`h-4 px-1 text-xs ${getRoleBadgeColor(
                            collaborator.role
                          )}`}
                        >
                          {getRoleIcon(collaborator.role)}
                          <span className="ml-1">{collaborator.role}</span>
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {collaborator.status === "online"
                          ? "Active now"
                          : collaborator.lastSeen
                          ? `Last seen ${Math.round(
                              (Date.now() - collaborator.lastSeen.getTime()) /
                                60000
                            )}m ago`
                          : "Offline"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-3">
            <ScrollArea className="h-52">
              <div className="space-y-2">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg text-xs ${
                      message.type === "system"
                        ? "bg-blue-50 text-blue-700 text-center"
                        : message.type === "edit"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50"
                    }`}
                  >
                    {message.type !== "system" && (
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="font-medium">{message.userName}</span>
                        {message.type === "edit" && (
                          <Clock className="h-3 w-3" />
                        )}
                        <span className="text-gray-500">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    <div>{message.message}</div>
                  </div>
                ))}

                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-xs py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewMessage(e.target.value)
                }
                placeholder="Type a message..."
                className="h-8 text-xs"
                onKeyPress={(e: React.KeyboardEvent) =>
                  e.key === "Enter" && sendChatMessage()
                }
              />
              <Button
                onClick={sendChatMessage}
                size="sm"
                className="h-8 w-8 p-0"
                disabled={!newMessage.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaborationPanel;
