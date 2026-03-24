import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

export function useTags() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTodoTags(todoId: string) {
  return useQuery({
    queryKey: ["todo-tags", todoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todo_tags")
        .select("tag_id, tags(*)")
        .eq("todo_id", todoId);
      if (error) throw error;
      return data.map((row) => row.tags!);
    },
    enabled: !!todoId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: { name: string; color?: string }) => {
      if (!user) throw new Error("User must be authenticated");
      const { data, error } = await supabase
        .from("tags")
        .insert({ ...values, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      toast.error("Failed to create tag", { description: error.message });
    },
  });
}

export function useAddTodoTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ todoId, tagId }: { todoId: string; tagId: string }) => {
      const { error } = await supabase
        .from("todo_tags")
        .insert({ todo_id: todoId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todo-tags", vars.todoId] });
    },
    onError: (error) => {
      toast.error("Failed to add tag", { description: error.message });
    },
  });
}

export function useRemoveTodoTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ todoId, tagId }: { todoId: string; tagId: string }) => {
      const { error } = await supabase
        .from("todo_tags")
        .delete()
        .eq("todo_id", todoId)
        .eq("tag_id", tagId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todo-tags", vars.todoId] });
    },
    onError: (error) => {
      toast.error("Failed to remove tag", { description: error.message });
    },
  });
}
