import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { TodoSearchResult } from "@/types";

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Clear immediately when input is emptied
    if (!value.trim()) {
      setDebounced("");
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useSearch(query: string) {
  const { user } = useAuth();
  const debouncedQuery = useDebouncedValue(query, 250);

  return useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async (): Promise<TodoSearchResult[]> => {
      if (!debouncedQuery.trim()) return [];

      const trimmed = debouncedQuery.trim();

      // Try prefix-matching full-text search first (e.g. "gro" → "gro:*")
      const tsQuery = trimmed.split(/\s+/).map((t) => `${t}:*`).join(" & ");
      const { data, error } = await supabase
        .from("todos")
        .select("*, todo_lists!inner(name)")
        .textSearch("fts", tsQuery)
        .limit(20);

      if (!error && data && data.length > 0) {
        return data as TodoSearchResult[];
      }

      // Fallback to ilike for short/partial queries
      const escaped = trimmed.replace(/[%_,.*()]/g, "\\$&");
      const { data: fallback, error: fallbackError } = await supabase
        .from("todos")
        .select("*, todo_lists!inner(name)")
        .or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`)
        .limit(20);
      if (fallbackError) throw fallbackError;
      return fallback as TodoSearchResult[];
    },
    enabled: !!user && debouncedQuery.trim().length > 0,
  });
}
