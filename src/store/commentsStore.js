import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useCommentsStore = create(
  persist(
    (set, get) => ({
      comments: [],
      viewerComments: [],
      isLoading: false,
      error: null,

      // For regular comments
      fetchComments: async (floorPlanId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `/api/floorplanner/floorplans/${floorPlanId}/comments/`
          );
          set({ comments: response.data, isLoading: false });
        } catch (error) {
          console.error("Error fetching comments:", error);
          set({ error: "Failed to load comments", isLoading: false });
        }
      },

      addComment: async (floorPlanId, comment) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `/api/floorplanner/floorplans/${floorPlanId}/comments/`,
            comment
          );
          set((state) => ({
            comments: [...state.comments, response.data],
            isLoading: false,
          }));
          return response.data;
        } catch (error) {
          console.error("Error adding comment:", error);
          set({ error: "Failed to add comment", isLoading: false });
          return null;
        }
      },

      updateComment: async (floorPlanId, commentId, updatedComment) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(
            `/api/floorplanner/floorplans/${floorPlanId}/comments/${commentId}/`,
            updatedComment
          );
          set((state) => ({
            comments: state.comments.map((c) =>
              c.id === commentId ? response.data : c
            ),
            isLoading: false,
          }));
          return response.data;
        } catch (error) {
          console.error("Error updating comment:", error);
          set({ error: "Failed to update comment", isLoading: false });
          return null;
        }
      },

      deleteComment: async (floorPlanId, commentId) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(
            `/api/floorplanner/floorplans/${floorPlanId}/comments/${commentId}/`
          );
          set((state) => ({
            comments: state.comments.filter((c) => c.id !== commentId),
            isLoading: false,
          }));
          return true;
        } catch (error) {
          console.error("Error deleting comment:", error);
          set({ error: "Failed to delete comment", isLoading: false });
          return false;
        }
      },

      // For viewer comments (preview mode)
      fetchViewerComments: async (shareLinkId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `/api/floorplanner/preview/${shareLinkId}/comments/`
          );
          set({ viewerComments: response.data, isLoading: false });
        } catch (error) {
          console.error("Error fetching viewer comments:", error);
          set({ error: "Failed to load viewer comments", isLoading: false });
        }
      },

      addViewerComment: async (shareLinkId, comment) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `/api/floorplanner/preview/${shareLinkId}/comments/`,
            comment
          );
          set((state) => ({
            viewerComments: [...state.viewerComments, response.data],
            isLoading: false,
          }));
          return response.data;
        } catch (error) {
          console.error("Error adding viewer comment:", error);
          set({ error: "Failed to add viewer comment", isLoading: false });
          return null;
        }
      },

      clearComments: () => {
        set({ comments: [], viewerComments: [] });
      },
    }),
    {
      name: "floorplanner-comments-storage",
    }
  )
);

export default useCommentsStore;
