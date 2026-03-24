import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { Todo, TodoInsert, TodoUpdate } from "@/types";
import { toast } from "sonner";

export function useTodos(listId: string) {
  return useQuery({
    queryKey: ["todos", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("list_id", listId)
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: { list_id: string; title: string; position?: number }) => {
      if (!user) throw new Error("User must be authenticated");
      const { data, error } = await supabase
        .from("todos")
        .insert({
          ...values,
          created_by: user.id,
        } satisfies TodoInsert)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos", data.list_id] });
    },
    onError: (error) => {
      toast.error("Failed to create todo", { description: error.message });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      listId,
      ...values
    }: TodoUpdate & { id: string; listId: string }) => {
      const { data, error } = await supabase
        .from("todos")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos", data.list_id] });
    },
    onError: (error) => {
      toast.error("Failed to update todo", { description: error.message });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
      listId: string;
    }) => {
      const { error } = await supabase
        .from("todos")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", listId] });
      const previous = queryClient.getQueryData<Todo[]>(["todos", listId]);
      queryClient.setQueryData<Todo[]>(["todos", listId], (old) =>
        old?.map((t) =>
          t.id === id
            ? {
                ...t,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
              }
            : t
        )
      );
      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(["todos", context.listId], context.previous);
      }
      toast.error("Failed to update todo");
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todos", vars.listId] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, listId }: { id: string; listId: string }) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
      return { listId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["todos", data.listId] });
      toast.success("Todo deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete todo", { description: error.message });
    },
  });
}
