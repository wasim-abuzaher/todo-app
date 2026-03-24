import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCreateTodo } from "@/hooks/use-todos";
import { Plus } from "lucide-react";

interface TodoFormProps {
  listId: string;
}

export function TodoForm({ listId }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const createTodo = useCreateTodo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTodo.mutateAsync({ list_id: listId, title: title.trim() });
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Add a todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="pl-9"
        disabled={createTodo.isPending}
      />
    </form>
  );
}
