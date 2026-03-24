import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Todo } from "@/types";
import { toast } from "sonner";

export function useReorderTodos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      reordered,
    }: {
      listId: string;
      reordered: Todo[];
    }) => {
      const updates = reordered.map((todo, index) => ({
        id: todo.id,
        position: index * 1000,
      }));

      // Batch update positions
      for (const { id, position } of updates) {
        const { error } = await supabase
          .from("todos")
          .update({ position })
          .eq("id", id);
        if (error) throw error;
      }
      return { listId };
    },
    onMutate: async ({ listId, reordered }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", listId] });
      const previous = queryClient.getQueryData<Todo[]>(["todos", listId]);
      queryClient.setQueryData<Todo[]>(
        ["todos", listId],
        reordered.map((todo, index) => ({ ...todo, position: index * 1000 }))
      );
      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(["todos", context.listId], context.previous);
      }
      toast.error("Failed to reorder todos");
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todos", vars.listId] });
    },
  });
}
