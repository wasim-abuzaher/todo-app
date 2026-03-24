import { TodoItem } from "./todo-item";
import type { Todo } from "@/types";

interface TodoListProps {
  todos: Todo[];
  onEditTodo: (todo: Todo) => void;
}

export function TodoList({ todos, onEditTodo }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No todos yet. Add one above!
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onEdit={onEditTodo} />
      ))}
    </div>
  );
}
