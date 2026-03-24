import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToggleTodo, useDeleteTodo } from "@/hooks/use-todos";
import { PRIORITY } from "@/lib/constants";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const priority = PRIORITY[todo.priority as keyof typeof PRIORITY];

  return (
    <div className="group flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent/50">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) =>
          toggleTodo.mutate({
            id: todo.id,
            completed: !!checked,
            listId: todo.list_id,
          })
        }
      />

      <button
        type="button"
        className="flex-1 text-left min-w-0"
        onClick={() => onEdit(todo)}
      >
        <span
          className={cn(
            "text-sm truncate block",
            todo.completed && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </span>
      </button>

      {todo.priority !== "medium" && (
        <Badge variant="secondary" className={cn("text-xs shrink-0", priority.color)}>
          {priority.label}
        </Badge>
      )}

      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(todo)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                deleteTodo.mutate({ id: todo.id, listId: todo.list_id })
              }
              className="text-destructive focus:text-destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
