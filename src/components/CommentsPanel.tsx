import React, { useState } from "react";
import { ScrollArea } from "./ui/scroll-area.tsx";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { MessageCirclePlus, Trash2, Pin } from "lucide-react";
import { Separator } from "./ui/separator.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CommentPin from "./CommentPin";
import useFloorPlanStore from "../stores/floorPlanStore";

const CommentsPanel: React.FC = () => {
  const [isPlacingComment, setIsPlacingComment] = useState(false);

  // Cast the store to 'any' temporarily until we define the proper types
  const floorPlanStore = useFloorPlanStore() as any;
  const { comments, addComment, removeComment } = floorPlanStore;

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  const handleAddComment = (position: { x: number; y: number }) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      x: position.x,
      y: position.y,
      author: {
        id: "current-user", // In a real app, get from authentication state
        name: "Current User",
        avatarUrl: "",
      },
      content: "Add your comment here...", // Default text, would be editable in real app
      createdAt: new Date().toISOString(),
      replies: [],
    };

    addComment(newComment);
    setIsPlacingComment(false);
    setSelectedCommentId(newComment.id);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlacingComment) {
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      handleAddComment({ x, y });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex justify-between items-center">
            Comments
            <Button
              variant={isPlacingComment ? "destructive" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => setIsPlacingComment(!isPlacingComment)}
            >
              {isPlacingComment ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <MessageCirclePlus className="h-4 w-4" />
              )}
              {isPlacingComment ? "Cancel" : "Add Comment"}
            </Button>
          </CardTitle>
          {isPlacingComment && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm text-amber-800 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Click anywhere on the floor plan to place your comment
            </div>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <CardContent className="space-y-4 pb-6">
            {comments && comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCirclePlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet.</p>
                <p className="text-xs">
                  Click "Add Comment" to start the conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments &&
                  comments.map((comment: any) => (
                    <div key={comment.id} className="pb-4">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          {comment.author.avatarUrl ? (
                            <AvatarImage
                              src={comment.author.avatarUrl}
                              alt={comment.author.name}
                            />
                          ) : (
                            <AvatarFallback>
                              {comment.author.name.substring(0, 2)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <span className="text-sm font-medium">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => removeComment(comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>

                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 ml-4 space-y-2">
                              <span className="text-xs text-muted-foreground">
                                {comment.replies.length} replies
                              </span>
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="flex gap-2">
                                  <Avatar className="h-5 w-5">
                                    {reply.author.avatarUrl ? (
                                      <AvatarImage
                                        src={reply.author.avatarUrl}
                                        alt={reply.author.name}
                                      />
                                    ) : (
                                      <AvatarFallback className="text-[10px]">
                                        {reply.author.name.substring(0, 2)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted p-2 rounded-md">
                                      <p className="text-xs font-medium">
                                        {reply.author.name}
                                      </p>
                                      <p className="text-xs">{reply.content}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      {new Date(
                                        reply.createdAt
                                      ).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>

        <CardFooter className="pt-2">
          <p className="text-xs text-muted-foreground w-full text-center">
            {isPlacingComment
              ? "Click anywhere on the floor plan to place a comment"
              : "Comments help you collaborate on specific design elements"}
          </p>
        </CardFooter>
      </Card>

      {/* Overlay for comment pins on canvas - in a real app, this would be in the CanvasEditor */}
      <div
        id="comments-overlay"
        className={`absolute inset-0 ${
          isPlacingComment ? "cursor-crosshair" : ""
        }`}
        style={{ pointerEvents: isPlacingComment ? "auto" : "none" }}
        onClick={handleCanvasClick}
      >
        {comments &&
          comments.map((comment: any) => (
            <CommentPin
              key={comment.id}
              id={comment.id}
              x={comment.x}
              y={comment.y}
              author={comment.author}
              content={comment.content}
              createdAt={comment.createdAt}
              replies={comment.replies}
              isSelected={selectedCommentId === comment.id}
              onSelect={() => setSelectedCommentId(comment.id)}
              onClose={() => setSelectedCommentId(null)}
            />
          ))}
      </div>
    </div>
  );
};

export default CommentsPanel;
