import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { CheckSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: results } = useSearch(query);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (listId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/lists/${listId}`);
  };

  // Group results by list
  const grouped = new Map<string, { listName: string; todos: typeof results }>();
  for (const result of results ?? []) {
    const listId = result.list_id;
    const listName = (result as Record<string, unknown>).todo_lists
      ? ((result as Record<string, unknown>).todo_lists as { name: string }).name
      : "Unknown";
    if (!grouped.has(listId)) {
      grouped.set(listId, { listName, todos: [] });
    }
    grouped.get(listId)!.todos!.push(result);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent w-full"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search todos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim() ? "No results found." : "Type to search..."}
          </CommandEmpty>
          {Array.from(grouped.entries()).map(([listId, { listName, todos }]) => (
            <CommandGroup key={listId} heading={listName}>
              {todos?.map((todo) => (
                <CommandItem
                  key={todo.id}
                  onSelect={() => handleSelect(listId)}
                  className="gap-2"
                >
                  <CheckSquare
                    className={cn(
                      "size-4",
                      todo.completed ? "text-muted-foreground" : "text-primary"
                    )}
                  />
                  <span className={cn(todo.completed && "line-through text-muted-foreground")}>
                    {todo.title}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
