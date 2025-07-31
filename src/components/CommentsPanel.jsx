import React, { useState, useEffect } from "react";
import useFloorPlanStore from "../stores/floorPlanStore.js";
import useCommentsStore from "../store/commentsStore.js";

const CommentsPanel = () => {
  const {
    comments,
    activeComment,
    setActiveComment,
    addCommentReply,
    removeComment,
    isPreviewMode,
    shareLinkId,
    floorPlanId,
  } = useFloorPlanStore();

  const {
    viewerComments,
    fetchViewerComments,
    addViewerComment,
    fetchComments,
  } = useCommentsStore();

  const [newReply, setNewReply] = useState("");
  const [viewerName, setViewerName] = useState(
    localStorage.getItem("viewerName") || ""
  );

  // Load appropriate comments based on mode
  useEffect(() => {
    if (isPreviewMode && shareLinkId) {
      fetchViewerComments(shareLinkId);
    } else if (floorPlanId) {
      fetchComments(floorPlanId);
    }
  }, [isPreviewMode, shareLinkId, floorPlanId]);

  // Determine which comments array to use based on mode
  const commentsList = isPreviewMode ? viewerComments : comments;

  // Find the active comment from the store
  const activeCommentData = commentsList.find(
    (comment) => comment.id === activeComment
  );

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!newReply.trim() || !activeComment) return;

    if (isPreviewMode) {
      // For preview mode, we need the viewer's name
      if (!viewerName.trim()) {
        const name = prompt("Please enter your name to add a reply:", "");
        if (!name) return;
        setViewerName(name);
        localStorage.setItem("viewerName", name);
      }

      addViewerComment(shareLinkId, {
        parentId: activeComment,
        text: newReply,
        author: viewerName,
        position: activeCommentData.position, // Use the same position as the parent comment
      });
    } else {
      // Regular comment reply
      addCommentReply(activeComment, newReply);
    }

    setNewReply("");
  };

  const handleDeleteComment = () => {
    // Only allow deletion in regular mode
    if (
      !isPreviewMode &&
      confirm(
        "Are you sure you want to delete this comment and all its replies?"
      )
    ) {
      removeComment(activeComment);
    }
  };

  if (!activeComment || !activeCommentData) {
    return (
      <div className="comments-panel p-4">
        <p className="text-gray-500 italic">
          {isPreviewMode
            ? "No comment selected. Click on a comment pin on the canvas to view it."
            : "No comment selected. Click on a comment pin on the canvas or add a new comment."}
        </p>

        {isPreviewMode && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (for comments)
            </label>
            <input
              type="text"
              value={viewerName}
              onChange={(e) => {
                setViewerName(e.target.value);
                localStorage.setItem("viewerName", e.target.value);
              }}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your name"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="comments-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Comment Details</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveComment(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
          {!isPreviewMode && (
            <button
              onClick={handleDeleteComment}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-3 mb-4 border border-gray-200">
        <div className="flex items-start gap-2 mb-2">
          <div className="rounded-full bg-blue-500 text-white w-8 h-8 flex items-center justify-center font-bold">
            {activeCommentData.author?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-semibold">
              {activeCommentData.author || "User"}
            </div>
            <div className="text-gray-500 text-xs">
              {new Date(activeCommentData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <p className="text-gray-800 mt-2">{activeCommentData.text}</p>
      </div>

      <h4 className="font-medium mb-2">Replies</h4>
      {activeCommentData.replies?.length > 0 ? (
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {activeCommentData.replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-gray-50 rounded p-2 border-l-2 border-blue-400"
            >
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm">
                  {reply.author || "User"}
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm mt-1">{reply.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic text-sm mb-4">No replies yet</p>
      )}

      <form onSubmit={handleAddReply} className="mt-4">
        {isPreviewMode && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={viewerName}
              onChange={(e) => {
                setViewerName(e.target.value);
                localStorage.setItem("viewerName", e.target.value);
              }}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Enter your name"
            />
          </div>
        )}

        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
          placeholder="Add a reply..."
          rows="2"
        ></textarea>
        <button
          type="submit"
          className="mt-2 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          disabled={!newReply.trim() || (isPreviewMode && !viewerName.trim())}
        >
          Reply
        </button>
      </form>
    </div>
  );
};

export default CommentsPanel;
