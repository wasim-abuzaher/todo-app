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
import { DueDateIndicator } from "./due-date-indicator";
import { TagBadge } from "@/components/tags/tag-badge";
import { PRIORITY } from "@/lib/constants";
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo, Tag } from "@/types";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface TodoItemProps {
  todo: Todo;
  tags?: Tag[];
  subtaskCount?: { done: number; total: number };
  onEdit: (todo: Todo) => void;
  dragListeners?: SyntheticListenerMap;
  dragAttributes?: Record<string, unknown>;
  canEdit?: boolean;
}

export function TodoItem({
  todo,
  tags,
  subtaskCount,
  onEdit,
  dragListeners,
  dragAttributes,
  canEdit = true,
}: TodoItemProps) {
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const priority = PRIORITY[todo.priority as keyof typeof PRIORITY];

  return (
    <div className="group flex items-center gap-2 rounded-md border px-2 py-2 transition-colors hover:bg-accent/50">
      {dragListeners && (
        <button
          type="button"
          aria-label="Reorder"
          className="cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          {...dragListeners}
          {...dragAttributes}
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <Checkbox
        checked={todo.completed}
        disabled={!canEdit}
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

      <div className="flex items-center gap-1.5 shrink-0">
        {tags && tags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            {tags.slice(0, 2).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
            )}
          </div>
        )}

        {subtaskCount && subtaskCount.total > 0 && (
          <span className="text-xs text-muted-foreground">
            {subtaskCount.done}/{subtaskCount.total}
          </span>
        )}

        {todo.due_date && (
          <DueDateIndicator dueDate={todo.due_date} completed={todo.completed} />
        )}

        {todo.priority !== "medium" && (
          <Badge variant="secondary" className={cn("text-xs", priority.color)}>
            {priority.label}
          </Badge>
        )}
      </div>

      {canEdit && (
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
      )}
    </div>
  );
}
