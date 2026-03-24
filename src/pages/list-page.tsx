import { useState } from "react";
import { useParams, Navigate } from "react-router";
import { useTodos } from "@/hooks/use-todos";
import { useTodoLists } from "@/hooks/use-todo-lists";
import { TodoForm } from "@/components/todos/todo-form";
import { TodoList } from "@/components/todos/todo-list";
import { TodoDetail } from "@/components/todos/todo-detail";
import { ListActions } from "@/components/lists/list-actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Todo } from "@/types";

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const { data: lists, isLoading: listsLoading } = useTodoLists();
  const { data: todos, isLoading: todosLoading } = useTodos(listId ?? "");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const list = lists?.find((l) => l.id === listId);

  if (!listsLoading && !list) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      {listsLoading ? (
        <Skeleton className="h-9 w-48 mb-6" />
      ) : (
        list && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{list.name}</h1>
              {list.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {list.description}
                </p>
              )}
            </div>
            <ListActions list={list} />
          </div>
        )
      )}

      {/* Add todo */}
      <div className="mb-4">
        <TodoForm listId={listId ?? ""} />
      </div>

      {/* Todo list */}
      {todosLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-md" />
          ))}
        </div>
      ) : (
        <TodoList todos={todos ?? []} onEditTodo={setEditingTodo} />
      )}

      {/* Detail panel */}
      <TodoDetail
        todo={editingTodo}
        open={!!editingTodo}
        onOpenChange={(open) => !open && setEditingTodo(null)}
      />
    </div>
  );
}
