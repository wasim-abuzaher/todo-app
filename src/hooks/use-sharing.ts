import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { ListShare, ShareInvite, TodoList } from "@/types";
import { toast } from "sonner";

// ─── List Shares ────────────────────────────────────────────────────────────

export function useListShares(listId: string) {
  return useQuery({
    queryKey: ["list-shares", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("list_shares")
        .select("*")
        .eq("list_id", listId)
        .order("created_at");
      if (error) throw error;
      return data as ListShare[];
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
      toast.success("Collaborator removed");
    },
    onError: (error) => {
      toast.error("Failed to remove collaborator", {
        description: error.message,
      });
    },
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
  const { data: shares } = useListShares(list?.id ?? "");

  if (!list || !user) return "viewer";
  if (list.owner_id === user.id) return "owner";

  const share = shares?.find((s) => s.shared_with === user.id);
  if (share?.role === "editor") return "editor";
  return "viewer";
}
