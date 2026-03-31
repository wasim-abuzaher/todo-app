import { useRef, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTodo, useTodos } from "@/hooks/use-todos";
import { MAX_COUNT } from "@/lib/constants";
import { Plus, AlertTriangle, ArrowRight } from "lucide-react";

interface TodoFormProps {
  listId: string;
}

const MAX_SIMILAR_RESULTS = 5;
// Matches "4 shirts", "3x exercise", "2 x push-ups" but NOT leading zeros like "007 items"
// or dimension patterns like "10 x 10 grid"
const COUNT_PATTERN = /^([1-9]\d*)\s*x?\s+(.+)$/i;

export function parseCountFromTitle(title: string): { count: number; title: string } | null {
  const match = title.trim().match(COUNT_PATTERN);
  if (!match) return null;
  const count = parseInt(match[1]);
  const parsedTitle = match[2].trim();
  if (count < 2 || count > MAX_COUNT || !parsedTitle) return null;
  // Reject dimension-like patterns where the remainder starts with a number (e.g. "10 x 10 grid")
  if (/^\d/.test(parsedTitle)) return null;
  return { count, title: parsedTitle };
}

export function findSimilarTodos(
  title: string,
  todos: { title: string; completed: boolean }[]
): string[] {
  const query = title.toLowerCase().trim();
  if (query.length < 3) return [];

  const results: string[] = [];
  for (const t of todos) {
    if (!t.completed && t.title.toLowerCase().includes(query)) {
      results.push(t.title);
      if (results.length >= MAX_SIMILAR_RESULTS) break;
    }
  }
  return results;
}

export function TodoForm({ listId }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTodo = useCreateTodo();
  const { data: todos } = useTodos(listId);

  const similarTitles = useMemo(
    () => findSimilarTodos(title, todos ?? []),
    [title, todos]
  );

  const parsedCount = useMemo(() => parseCountFromTitle(title), [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTodo.mutateAsync({ list_id: listId, title: title.trim() });
      setTitle("");
    } catch {
      // Error is already handled by the mutation's onError callback (toast)
    }
    inputRef.current?.focus();
  };

  const handleAddWithCount = async () => {
    if (!parsedCount) return;
    try {
      await createTodo.mutateAsync({
        list_id: listId,
        title: parsedCount.title,
        count: parsedCount.count,
      });
      setTitle("");
    } catch {
      // Error is already handled by the mutation's onError callback (toast)
    }
    inputRef.current?.focus();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Add a todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="pl-9"
            disabled={createTodo.isPending}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={createTodo.isPending || !title.trim()}
          aria-label="Add todo"
        >
          <Plus className="size-4" />
        </Button>
      </form>
      {parsedCount && (
        <button
          type="button"
          onClick={handleAddWithCount}
          disabled={createTodo.isPending}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ArrowRight className="size-3.5 shrink-0" />
          Add "<span className="font-medium">{parsedCount.title}</span>" with count
          &times;{parsedCount.count}?
        </button>
      )}
      {similarTitles.length > 0 && (
        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <span>
            Similar todo{similarTitles.length > 1 ? "s" : ""} already exist
            {similarTitles.length <= 3 ? ": " : "."}
            {similarTitles.length <= 3 &&
              similarTitles.map((t, i) => (
                <span key={i}>
                  {i > 0 && ", "}
                  <span className="font-medium">"{t}"</span>
                </span>
              ))}
          </span>
        </div>
      )}
    </div>
  );
}
