// floorplanner/frontend/src/components/sharing/FloorPlanPreview.tsx

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import {
  Eye,
  MessageCircle,
  Download,
  Share2,
  Clock,
  User,
  AlertTriangle,
  Lock,
  Wifi,
  WifiOff,
  Send,
  Reply,
  Paperclip,
  Image,
  File,
} from "lucide-react";

interface FloorPlanPreviewProps {
  token: string;
}

interface ShareLinkData {
  permission_level: "view" | "comment" | "edit";
  floorplan_title: string;
  floorplan_id: string;
  owner_name: string;
  last_updated: string;
  access_count: number;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  x: number;
  y: number;
  replies: Comment[];
  attachments: CommentAttachment[];
  can_edit: boolean;
  can_delete: boolean;
}

interface CommentAttachment {
  id: string;
  file_url: string;
  thumbnail_url?: string;
  original_filename: string;
  file_type: "image" | "document" | "video" | "audio";
  file_size: number;
}

export const FloorPlanPreview: React.FC<FloorPlanPreviewProps> = ({
  token,
}) => {
  // State management
  const [shareData, setShareData] = useState<ShareLinkData | null>(null);
  const [floorPlanData, setFloorPlanData] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");

  // Comment state
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentPosition, setCommentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // User state (for anonymous users)
  const [userName, setUserName] = useState(
    localStorage.getItem("preview_user_name") || ""
  );
  const [userNameSet, setUserNameSet] = useState(
    !!localStorage.getItem("preview_user_name")
  );

  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  // Load share link data
  useEffect(() => {
    loadShareLinkData();
  }, [token]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load cached data when offline
  useEffect(() => {
    if (!isOnline) {
      loadCachedData();
    }
  }, [isOnline, token]);

  const loadShareLinkData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/floorplanner/share-preview/${token}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: password ? JSON.stringify({ password }) : undefined,
        }
      );

      if (response.status === 401) {
        setPasswordRequired(true);
        setIsLoading(false);
        return;
      }

      if (response.status === 403) {
        setError("This share link has expired or access is restricted.");
        setIsLoading(false);
        return;
      }

      if (response.status === 404) {
        setError("This share link is invalid or has been removed.");
        setIsLoading(false);
        return;
      }

      if (response.status === 429) {
        setError("Too many requests. Please try again later.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load share link data");
      }

      const data = await response.json();
      setShareData(data);
      setPasswordRequired(false);

      // Cache the data for offline access
      if (isOnline) {
        localStorage.setItem(`preview_cache_${token}`, JSON.stringify(data));
      }

      // Load floor plan data and comments
      await Promise.all([loadFloorPlanData(), loadComments()]);
    } catch (err) {
      console.error("Error loading share link:", err);
      if (isOnline) {
        setError("Failed to load floor plan. Please check your connection.");
      } else {
        // Try to load from cache
        loadCachedData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadCachedData = () => {
    const cachedData = localStorage.getItem(`preview_cache_${token}`);
    const cachedFloorPlan = localStorage.getItem(`preview_floorplan_${token}`);
    const cachedComments = localStorage.getItem(`preview_comments_${token}`);

    if (cachedData) {
      setShareData(JSON.parse(cachedData));
    }
    if (cachedFloorPlan) {
      setFloorPlanData(JSON.parse(cachedFloorPlan));
    }
    if (cachedComments) {
      setComments(JSON.parse(cachedComments));
    }

    if (cachedData || cachedFloorPlan || cachedComments) {
      setError("Viewing cached version (offline mode)");
    } else {
      setError(
        "No cached data available. Please check your internet connection."
      );
    }
  };

  const loadFloorPlanData = async () => {
    try {
      const response = await fetch(
        `/api/floorplanner/share-preview/${token}/floorplan_data/`
      );
      if (response.ok) {
        const data = await response.json();
        setFloorPlanData(data);

        // Cache for offline access
        if (isOnline) {
          localStorage.setItem(
            `preview_floorplan_${token}`,
            JSON.stringify(data)
          );
        }
      }
    } catch (err) {
      console.error("Error loading floor plan data:", err);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(
        `/api/floorplanner/share-preview/${token}/comments/`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.results || data);

        // Cache for offline access
        if (isOnline) {
          localStorage.setItem(
            `preview_comments_${token}`,
            JSON.stringify(data.results || data)
          );
        }
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) return;
    await loadShareLinkData();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingComment || !shareData) return;
    if (shareData.permission_level === "view") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCommentPosition({ x, y });
    setIsAddingComment(false);
  };

  const addComment = async () => {
    if (!newComment.trim() || !commentPosition || !shareData) return;
    if (!userNameSet || !userName.trim()) {
      alert("Please enter your name to add comments");
      return;
    }

    try {
      const response = await fetch(
        `/api/floorplanner/share-preview/${token}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newComment,
            x: commentPosition.x,
            y: commentPosition.y,
            author_name: userName,
          }),
        }
      );

      if (response.status === 429) {
        alert("You are commenting too frequently. Please wait a moment.");
        return;
      }

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
        setCommentPosition(null);

        // Update cached comments
        const updatedComments = [comment, ...comments];
        localStorage.setItem(
          `preview_comments_${token}`,
          JSON.stringify(updatedComments)
        );
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
    }
  };

  const addReply = async (parentId: string) => {
    if (!replyText.trim() || !userName.trim()) return;

    try {
      const response = await fetch(
        `/api/floorplanner/share-preview/${token}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: replyText,
            parent: parentId,
            author_name: userName,
          }),
        }
      );

      if (response.ok) {
        const reply = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: [...comment.replies, reply] }
              : comment
          )
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Failed to add reply. Please try again.");
    }
  };

  const handleFileUpload = async (commentId: string, files: FileList) => {
    if (!files.length) return;

    setUploadingFiles((prev) => [...prev, commentId]);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("original_filename", file.name);
        formData.append("uploaded_by_name", userName);

        const response = await fetch(
          `/api/floorplanner/comments/${commentId}/attachments/`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const attachment = await response.json();
          // Update comment with new attachment
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    attachments: [...comment.attachments, attachment],
                  }
                : comment
            )
          );
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploadingFiles((prev) => prev.filter((id) => id !== commentId));
    }
  };

  const setUserNameAndSave = (name: string) => {
    setUserName(name);
    setUserNameSet(true);
    localStorage.setItem("preview_user_name", name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Render password form
  if (passwordRequired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Enter password to view this floor plan</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Password"
              />
            </div>
            <Button
              onClick={handlePasswordSubmit}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access Floor Plan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error && !shareData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading floor plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {shareData?.floorplan_title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  by {shareData?.owner_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {shareData ? formatDate(shareData.last_updated) : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {shareData?.access_count} views
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-1 text-sm">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={isOnline ? "text-green-600" : "text-red-600"}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Permission Badge */}
              <Badge
                variant={
                  shareData?.permission_level === "edit"
                    ? "default"
                    : "secondary"
                }
              >
                {shareData?.permission_level}
              </Badge>

              {/* Action Buttons */}
              {shareData?.permission_level !== "view" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingComment(true)}
                  disabled={!isOnline}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              )}

              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Name Input */}
          {!userNameSet && shareData?.permission_level !== "view" && (
            <Alert className="mt-4">
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter your name to add comments"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => setUserNameAndSave(userName)}
                    disabled={!userName.trim()}
                  >
                    Set Name
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floor Plan Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div
                  className={`relative bg-white min-h-[500px] ${
                    isAddingComment ? "cursor-crosshair" : ""
                  }`}
                  onClick={handleCanvasClick}
                >
                  {/* Floor Plan Rendering would go here */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Floor Plan Canvas
                    {floorPlanData?.watermark_enabled && (
                      <div className="absolute top-4 right-4 opacity-50 text-xs">
                        Preview Mode
                      </div>
                    )}
                  </div>

                  {/* Comment Pins */}
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer ${
                        selectedCommentId === comment.id
                          ? "ring-2 ring-blue-300"
                          : ""
                      }`}
                      style={{
                        left: comment.x - 12,
                        top: comment.y - 12,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCommentId(
                          selectedCommentId === comment.id ? null : comment.id
                        );
                      }}
                    >
                      <MessageCircle className="h-4 w-4 text-white m-1" />
                    </div>
                  ))}

                  {/* New Comment Position */}
                  {commentPosition && (
                    <div
                      className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"
                      style={{
                        left: commentPosition.x - 12,
                        top: commentPosition.y - 12,
                      }}
                    >
                      <MessageCircle className="h-4 w-4 text-white m-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Comment Form */}
            {commentPosition && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Add Comment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCommentPosition(null);
                        setNewComment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={addComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comments Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No comments yet.{" "}
                    {shareData?.permission_level !== "view" &&
                      "Click on the floor plan to add the first comment."}
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {comment.author_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {comment.author_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>

                          {/* Attachments */}
                          {comment.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {comment.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded"
                                >
                                  {attachment.file_type === "image" ? (
                                    <Image className="h-4 w-4" />
                                  ) : (
                                    <File className="h-4 w-4" />
                                  )}
                                  <span className="flex-1 truncate">
                                    {attachment.original_filename}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {formatFileSize(attachment.file_size)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Form */}
                          {replyingTo === comment.id && (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => addReply(comment.id)}
                                  disabled={!replyText.trim()}
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-2">
                            {shareData?.permission_level !== "view" &&
                              userNameSet && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyingTo(comment.id)}
                                  className="text-xs h-6"
                                >
                                  <Reply className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              )}

                            {shareData?.permission_level !== "view" &&
                              userNameSet && (
                                <label className="cursor-pointer">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6"
                                    disabled={uploadingFiles.includes(
                                      comment.id
                                    )}
                                  >
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    Attach
                                  </Button>
                                  <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        handleFileUpload(
                                          comment.id,
                                          e.target.files
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              )}
                          </div>

                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-100 pl-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {reply.author_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <p>{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Click anywhere on the floor plan to add a comment pin</p>
                <p>• Click on existing pins to view and reply to comments</p>
                {shareData?.permission_level === "view" && (
                  <p>• You have view-only access to this floor plan</p>
                )}
                {!isOnline && (
                  <p className="text-amber-600">
                    • You're viewing a cached version (offline)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FloorPlanPreview;
