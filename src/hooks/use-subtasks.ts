import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useSubtasks(todoId: string) {
  return useQuery({
    queryKey: ["subtasks", todoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("todo_id", todoId)
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!todoId,
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { todo_id: string; title: string }) => {
      const { data, error } = await supabase
        .from("subtasks")
        .insert(values)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", data.todo_id] });
    },
    onError: (error) => {
      toast.error("Failed to create subtask", { description: error.message });
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      completed,
      todoId,
    }: {
      id: string;
      completed: boolean;
      todoId: string;
    }) => {
      const { error } = await supabase
        .from("subtasks")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
      return { todoId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", data.todoId] });
    },
    onError: (error) => {
      toast.error("Failed to update subtask", { description: error.message });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, todoId }: { id: string; todoId: string }) => {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);
      if (error) throw error;
      return { todoId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", data.todoId] });
    },
    onError: (error) => {
      toast.error("Failed to delete subtask", { description: error.message });
    },
  });
}
