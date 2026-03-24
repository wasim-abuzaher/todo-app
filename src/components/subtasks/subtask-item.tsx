import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToggleSubtask, useDeleteSubtask } from "@/hooks/use-subtasks";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subtask } from "@/types";

interface SubtaskItemProps {
  subtask: Subtask;
}

export function SubtaskItem({ subtask }: SubtaskItemProps) {
  const toggleSubtask = useToggleSubtask();
  const deleteSubtask = useDeleteSubtask();

  return (
    <div className="group flex items-center gap-2 py-1">
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={(checked) =>
          toggleSubtask.mutate({
            id: subtask.id,
            completed: !!checked,
            todoId: subtask.todo_id,
          })
        }
      />
      <span
        className={cn(
          "flex-1 text-sm",
          subtask.completed && "line-through text-muted-foreground"
        )}
      >
        {subtask.title}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        className="opacity-0 group-hover:opacity-100"
        onClick={() =>
          deleteSubtask.mutate({ id: subtask.id, todoId: subtask.todo_id })
        }
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}
