import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { ListShareWithEmail, ShareInvite, TodoList } from "@/types";
import { toast } from "sonner";

// ─── List Shares ────────────────────────────────────────────────────────────

export function useListShares(listId: string) {
  return useQuery({
    queryKey: ["list-shares", listId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_list_collaborators", {
        p_list_id: listId,
      });
      if (error) throw error;
      return data as ListShareWithEmail[];
    },
    enabled: !!listId,
  });
}

export function useUpdateShareRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      role,
      listId,
    }: {
      id: string;
      role: "viewer" | "editor";
      listId: string;
    }) => {
      const { error } = await supabase
        .from("list_shares")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
      return { listId };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ["list-shares", listId] });
      queryClient.invalidateQueries({ queryKey: ["list-members", listId] });
      toast.success("Role updated");
    },
    onError: (error) => {
      toast.error("Failed to update role", { description: error.message });
    },
  });
}

export function useRemoveCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, listId }: { id: string; listId: string }) => {
      const { error } = await supabase
        .from("list_shares")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { listId };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({ queryKey: ["list-shares", listId] });
      queryClient.invalidateQueries({ queryKey: ["list-members", listId] });
      toast.success("Collaborator removed");
    },
    onError: (error) => {
      toast.error("Failed to remove collaborator", {
        description: error.message,
      });
    },
  });
}

// ─── List Members (owner + collaborators with emails) ───────────────────────

export interface ListMember {
  user_id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
}

export function useListMembers(listId: string) {
  return useQuery({
    queryKey: ["list-members", listId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_list_members", {
        p_list_id: listId,
      });
      if (error) {
        console.error("get_list_members error:", error.message, error.code, error.details, error.hint);
        throw error;
      }
      console.log("get_list_members data:", JSON.stringify(data));
      return data as ListMember[];
    },
    enabled: !!listId,
  });
}

// ─── Share Invites ──────────────────────────────────────────────────────────

export function useShareInvites(listId: string) {
  return useQuery({
    queryKey: ["share-invites", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("share_invites")
        .select("*")
        .eq("list_id", listId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ShareInvite[];
    },
    enabled: !!listId,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      listId,
      role,
    }: {
      listId: string;
      role: "viewer" | "editor";
    }) => {
      if (!user) throw new Error("User must be authenticated");
      const { data, error } = await supabase
        .from("share_invites")
        .insert({ list_id: listId, role, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as ShareInvite;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["share-invites", data.list_id],
      });
    },
    onError: (error) => {
      toast.error("Failed to create invite", { description: error.message });
    },
  });
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, listId }: { id: string; listId: string }) => {
      const { error } = await supabase
        .from("share_invites")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { listId };
    },
    onSuccess: ({ listId }) => {
      queryClient.invalidateQueries({
        queryKey: ["share-invites", listId],
      });
    },
    onError: (error) => {
      toast.error("Failed to delete invite", { description: error.message });
    },
  });
}

// ─── Accept Invite RPC ──────────────────────────────────────────────────────

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc("accept_invite", {
        p_token: token,
      });
      if (error) throw error;
      return data as string; // returns list_id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
    onError: (error) => {
      toast.error("Failed to accept invite", { description: error.message });
    },
  });
}

// ─── List Role Helper ───────────────────────────────────────────────────────

export type ListRole = "owner" | "editor" | "viewer";

export function useListRole(list: TodoList | undefined): ListRole {
  const { user } = useAuth();
  const isOwner = !!list && !!user && list.owner_id === user.id;
  const { data: shares } = useListShares(isOwner ? "" : (list?.id ?? ""));

  if (!list || !user) return "viewer";
  if (isOwner) return "owner";

  const share = shares?.find((s) => s.shared_with === user.id);
  if (share?.role === "editor") return "editor";
  return "viewer";
}
