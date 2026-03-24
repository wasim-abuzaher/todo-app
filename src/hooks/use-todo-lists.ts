import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { TodoListInsert, TodoListUpdate } from "@/types";
import { toast } from "sonner";

export function useTodoLists() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["todo-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todo_lists")
        .select("*")
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: { name: string; description?: string }) => {
      if (!user) throw new Error("User must be authenticated");
      const { data, error } = await supabase
        .from("todo_lists")
        .insert({
          ...values,
          owner_id: user.id,
        } satisfies TodoListInsert)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
      toast.success("List created");
    },
    onError: (error) => {
      toast.error("Failed to create list", { description: error.message });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...values
    }: TodoListUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("todo_lists")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
    onError: (error) => {
      toast.error("Failed to update list", { description: error.message });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("todo_lists")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
      toast.success("List deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete list", { description: error.message });
    },
  });
}
