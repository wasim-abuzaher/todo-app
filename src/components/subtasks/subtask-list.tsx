import { useState } from "react";
import { useSubtasks, useCreateSubtask } from "@/hooks/use-subtasks";
import { SubtaskItem } from "./subtask-item";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

interface SubtaskListProps {
  todoId: string;
}

export function SubtaskList({ todoId }: SubtaskListProps) {
  const { data: subtasks, isLoading } = useSubtasks(todoId);
  const createSubtask = useCreateSubtask();
  const [title, setTitle] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createSubtask.mutateAsync({ todo_id: todoId, title: title.trim() });
    setTitle("");
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    );
  }

  return (
    <div>
      {subtasks?.map((subtask) => (
        <SubtaskItem key={subtask.id} subtask={subtask} />
      ))}
      <form onSubmit={handleAdd} className="relative mt-1">
        <Plus className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add subtask..."
          className="h-8 pl-7 text-sm"
          disabled={createSubtask.isPending}
        />
      </form>
    </div>
  );
}
