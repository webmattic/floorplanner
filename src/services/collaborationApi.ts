// src/services/collaborationApi.ts

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  status: "online" | "offline" | "away";
  cursor?: { x: number; y: number; tool?: string };
  color: string;
  last_seen?: string;
}

export interface CollaborationMessage {
  id: string;
  floorplan: string;
  user: string;
  user_name: string;
  user_avatar?: string;
  message_type: "chat" | "system" | "action" | "deleted";
  content: string;
  reply_to?: string;
  reply_to_message?: {
    id: string;
    content: string;
    user_name: string;
  };
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}

export interface ShareLink {
  id: string;
  floorplan: string;
  created_by: string;
  created_by_name: string;
  permission_level: "view" | "comment" | "edit";
  password?: string;
  expires_at?: string;
  is_active: boolean;
  access_count: number;
  created_at: string;
  url: string;
}

export interface CollaboratorSession {
  user: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  cursor_position: Record<string, any>;
  last_activity: string;
  joined_at: string;
  user_color: string;
}

export interface CollaborationPresence {
  user: string;
  user_name: string;
  status: "online" | "away" | "offline";
  last_seen: string;
  current_tool?: string;
  cursor_data: Record<string, any>;
}

class CollaborationAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use relative URL or get from environment
    this.baseURL = "/api/floorplanner/api";
    this.token = localStorage.getItem("authToken");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Collaboration Messages
  async getMessages(floorplanId: string): Promise<CollaborationMessage[]> {
    return this.request(`/collaboration-messages/?floorplan=${floorplanId}`);
  }

  async sendMessage(
    floorplanId: string,
    content: string,
    messageType: string = "chat",
    replyTo?: string
  ): Promise<CollaborationMessage> {
    return this.request("/collaboration-messages/", {
      method: "POST",
      body: JSON.stringify({
        floorplan: floorplanId,
        content,
        message_type: messageType,
        reply_to: replyTo,
      }),
    });
  }

  async editMessage(
    messageId: string,
    content: string
  ): Promise<CollaborationMessage> {
    return this.request(`/collaboration-messages/${messageId}/edit/`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.request(
      `/collaboration-messages/${messageId}/delete_message/`,
      {
        method: "DELETE",
      }
    );
  }

  // Share Links
  async getShareLinks(floorplanId: string): Promise<ShareLink[]> {
    return this.request(`/share-links/?floorplan=${floorplanId}`);
  }

  async createShareLink(
    floorplanId: string,
    permissionLevel: "view" | "comment" | "edit",
    password?: string,
    expiresAt?: string
  ): Promise<ShareLink> {
    return this.request("/share-links/", {
      method: "POST",
      body: JSON.stringify({
        floorplan: floorplanId,
        permission_level: permissionLevel,
        password,
        expires_at: expiresAt,
      }),
    });
  }

  async toggleShareLink(linkId: string): Promise<ShareLink> {
    return this.request(`/share-links/${linkId}/toggle_active/`, {
      method: "POST",
    });
  }

  async regenerateShareLink(linkId: string): Promise<ShareLink> {
    return this.request(`/share-links/${linkId}/regenerate/`, {
      method: "POST",
    });
  }

  async validateShareLink(token: string, password?: string) {
    return this.request(`/share-links/validate_link/?token=${token}`, {
      method: "GET",
      body: password ? JSON.stringify({ password }) : undefined,
    });
  }

  // Collaborator Sessions
  async joinSession(
    floorplanId: string,
    cursorPosition: Record<string, any> = {}
  ): Promise<CollaboratorSession> {
    return this.request("/collaborator-sessions/join_session/", {
      method: "POST",
      body: JSON.stringify({
        floorplan_id: floorplanId,
        cursor_position: cursorPosition,
      }),
    });
  }

  async updateCursor(
    floorplanId: string,
    cursorPosition: Record<string, any>
  ): Promise<void> {
    return this.request("/collaborator-sessions/update_cursor/", {
      method: "POST",
      body: JSON.stringify({
        floorplan_id: floorplanId,
        cursor_position: cursorPosition,
      }),
    });
  }

  async leaveSession(floorplanId: string): Promise<void> {
    return this.request("/collaborator-sessions/leave_session/", {
      method: "POST",
      body: JSON.stringify({
        floorplan_id: floorplanId,
      }),
    });
  }

  async getActiveSessions(floorplanId: string): Promise<CollaboratorSession[]> {
    return this.request(`/collaborator-sessions/?floorplan=${floorplanId}`);
  }

  // Collaboration Presence
  async updatePresence(
    floorplanId: string,
    status: "online" | "away" | "offline",
    currentTool?: string,
    cursorData: Record<string, any> = {}
  ): Promise<CollaborationPresence> {
    return this.request("/collaboration-presence/update_presence/", {
      method: "POST",
      body: JSON.stringify({
        floorplan_id: floorplanId,
        status,
        current_tool: currentTool,
        cursor_data: cursorData,
      }),
    });
  }

  async getPresence(floorplanId: string): Promise<CollaborationPresence[]> {
    return this.request(`/collaboration-presence/?floorplan=${floorplanId}`);
  }

  // Combined Collaboration Operations
  async getActiveCollaborators(floorplanId: string): Promise<Collaborator[]> {
    return this.request(
      `/collaboration/active_collaborators/?floorplan_id=${floorplanId}`
    );
  }

  async inviteCollaborator(
    floorplanId: string,
    email: string,
    role: "editor" | "viewer",
    message?: string
  ): Promise<{ status: string; collaboration_id: string }> {
    return this.request("/collaboration/invite_collaborator/", {
      method: "POST",
      body: JSON.stringify({
        floorplan_id: floorplanId,
        email,
        role,
        message,
      }),
    });
  }
}

export const collaborationAPI = new CollaborationAPI();
