import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Subscribes to Supabase Realtime changes for a given list.
 * Invalidates relevant TanStack Query caches when changes arrive.
 */
export function useRealtimeSync(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId) return;

    const channel = supabase
      .channel(`list-${listId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos", filter: `list_id=eq.${listId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["todos", listId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subtasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["subtasks-batch", listId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todo_tags" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["todo-tags-batch", listId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "list_shares", filter: `list_id=eq.${listId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["list-shares", listId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, queryClient]);
}
