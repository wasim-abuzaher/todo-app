// This file will be replaced by running:
// npx supabase gen types typescript --project-id <ref> > src/types/database.ts
//
// For now, define a minimal placeholder so imports don't break.

export type Database = {
  public: {
    Tables: {
      todo_lists: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          position?: number;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          list_id: string;
          created_by: string;
          title: string;
          description: string | null;
          completed: boolean;
          completed_at: string | null;
          priority: "low" | "medium" | "high";
          due_date: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          position?: number;
          updated_at?: string;
        };
      };
      subtasks: {
        Row: {
          id: string;
          todo_id: string;
          title: string;
          completed: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          title: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          completed?: boolean;
          position?: number;
        };
      };
      tags: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
        };
      };
      todo_tags: {
        Row: {
          todo_id: string;
          tag_id: string;
        };
        Insert: {
          todo_id: string;
          tag_id: string;
        };
        Update: {
          todo_id?: string;
          tag_id?: string;
        };
      };
      list_shares: {
        Row: {
          id: string;
          list_id: string;
          shared_with: string;
          role: "viewer" | "editor";
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          shared_with: string;
          role?: "viewer" | "editor";
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "viewer" | "editor";
        };
      };
      share_invites: {
        Row: {
          id: string;
          list_id: string;
          token: string;
          role: "viewer" | "editor";
          created_by: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          token?: string;
          role?: "viewer" | "editor";
          created_by: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "viewer" | "editor";
          expires_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
