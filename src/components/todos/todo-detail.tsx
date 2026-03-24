import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/use-todos";
import { PRIORITY } from "@/lib/constants";
import { Loader2, Trash2 } from "lucide-react";
import type { Todo } from "@/types";

interface TodoDetailProps {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoDetail({ todo, open, onOpenChange }: TodoDetailProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description ?? "");
      setPriority(todo.priority);
    }
  }, [todo]);

  if (!todo) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    await updateTodo.mutateAsync({
      id: todo.id,
      listId: todo.list_id,
      title: title.trim(),
      description: description.trim() || null,
      priority: priority as "low" | "medium" | "high",
    });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    await deleteTodo.mutateAsync({ id: todo.id, listId: todo.list_id });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Todo</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Todo title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY).map(([value, { label, color }]) => (
                  <SelectItem key={value} value={value}>
                    <span className={color}>{label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTodo.isPending}
          >
            <Trash2 />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateTodo.isPending || !title.trim()}
            >
              {updateTodo.isPending && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
