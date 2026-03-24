import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";

export function useSearch(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return [];

      // Use websearch_to_tsquery for natural language search
      const tsQuery = query.trim().split(/\s+/).join(" & ");
      const { data, error } = await supabase
        .from("todos")
        .select("*, todo_lists!inner(name)")
        .textSearch("fts", tsQuery)
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user && query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
