import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
// Create a simple Textarea component directly instead of importing
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
      ref={ref}
      {...props}
    />
  );
});
import useFloorPlanStore from "../stores/floorPlanStore";

interface CommentPinProps {
  id: string;
  x: number;
  y: number;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  replies?: CommentReply[];
  isSelected?: boolean;
  onSelect?: () => void;
  onClose?: () => void;
  position?: "absolute" | "relative";
}

interface CommentReply {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

const CommentPin: React.FC<CommentPinProps> = ({
  id,
  x,
  y,
  author,
  content,
  createdAt,
  replies = [],
  isSelected = false,
  onSelect,
  onClose,
  position = "absolute",
}) => {
  const [newReply, setNewReply] = useState("");
  // Cast floorPlanStore to any to temporarily bypass TypeScript error
  // This will be properly typed once we update the store
  const floorPlanStore = useFloorPlanStore() as any;

  const handleSubmitReply = () => {
    if (newReply.trim() === "") return;

    floorPlanStore.addCommentReply(id, {
      id: `reply-${Date.now()}`,
      author: {
        id: "current-user",
        name: "Current User",
      },
      content: newReply,
      createdAt: new Date().toISOString(),
    });

    setNewReply("");
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isSelected) {
    // Render just the pin when not selected
    return (
      <div
        className={`${
          position === "absolute" ? "absolute" : "relative"
        } z-10 cursor-pointer`}
        style={position === "absolute" ? { left: x, top: y } : {}}
        onClick={onSelect}
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6 text-blue-500 fill-blue-500" />
          {replies.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {replies.length}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Render the full comment card when selected
  return (
    <div
      className={`${position === "absolute" ? "absolute" : "relative"} z-20`}
      style={
        position === "absolute"
          ? { left: x, top: y, transform: "translate(-50%, -100%)" }
          : {}
      }
    >
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row justify-between items-start space-y-0">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              {author.avatarUrl ? (
                <AvatarImage src={author.avatarUrl} alt={author.name} />
              ) : (
                <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{author.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-4 py-2 text-sm">
          <p>{content}</p>

          {replies.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </p>
                {replies.map((reply) => (
                  <div key={reply.id} className="flex mb-2">
                    <Avatar className="h-5 w-5 mr-2 mt-0.5">
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
                        {formatDate(reply.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-4 py-3 flex gap-2">
          <Textarea
            placeholder="Add a reply..."
            className="h-8 min-h-8 text-xs resize-none"
            value={newReply}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewReply(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitReply();
              }
            }}
          />
          <Button size="sm" className="px-2" onClick={handleSubmitReply}>
            <Send className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CommentPin;
