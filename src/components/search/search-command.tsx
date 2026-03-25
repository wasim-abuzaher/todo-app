import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearch } from "@/hooks/use-search";
import { CheckSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodoSearchResult } from "@/types";

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
  const grouped = new Map<string, { listName: string; todos: TodoSearchResult[] }>();
  for (const result of results ?? []) {
    const listId = result.list_id;
    const listName = result.todo_lists.name;
    if (!grouped.has(listId)) {
      grouped.set(listId, { listName, todos: [] });
    }
    grouped.get(listId)!.todos.push(result);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search for todos across all lists</DialogDescription>
        </DialogHeader>
        <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
          <Command shouldFilter={false} className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
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
                  {todos.map((todo) => (
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
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
