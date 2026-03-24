import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router";
import { useTodos } from "@/hooks/use-todos";
import { useTodoLists } from "@/hooks/use-todo-lists";
import { useFilters, applyFilters, applySorting } from "@/hooks/use-filters";
import { TodoForm } from "@/components/todos/todo-form";
import { DraggableTodoList } from "@/components/todos/draggable-todo-list";
import { TodoDetail } from "@/components/todos/todo-detail";
import { TodoFilters } from "@/components/todos/todo-filters";
import { ListActions } from "@/components/lists/list-actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Todo, Tag } from "@/types";
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const { data: lists, isLoading: listsLoading } = useTodoLists();
  const { data: todos, isLoading: todosLoading } = useTodos(listId ?? "");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const filters = useFilters();

  const list = lists?.find((l) => l.id === listId);

  // Batch fetch tags and subtask counts for all todos
  const todoIds = todos?.map((t) => t.id) ?? [];

  // Reuse the same query key + shape as useTodoTags so caches are shared
  const tagQueries = useQueries({
    queries: todoIds.map((todoId) => ({
      queryKey: ["todo-tags", todoId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("todo_tags")
          .select("tag_id, tags(*)")
          .eq("todo_id", todoId);
        if (error) throw error;
        return data.map((r) => r.tags!) as Tag[];
      },
      enabled: !!todoId,
    })),
  });

  // Reuse the same query key + shape as useSubtasks
  const subtaskQueries = useQueries({
    queries: todoIds.map((todoId) => ({
      queryKey: ["subtasks", todoId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("subtasks")
          .select("*")
          .eq("todo_id", todoId)
          .order("position")
          .order("created_at");
        if (error) throw error;
        return data;
      },
      enabled: !!todoId,
    })),
  });

  const todoTags = useMemo(() => {
    const map: Record<string, Tag[]> = {};
    todoIds.forEach((todoId, i) => {
      const tags = tagQueries[i]?.data;
      if (tags) map[todoId] = tags;
    });
    return map;
  }, [tagQueries, todoIds]);

  const todoTagIds = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [todoId, tags] of Object.entries(todoTags)) {
      map[todoId] = tags.map((t) => t.id);
    }
    return map;
  }, [todoTags]);

  const subtaskCounts = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {};
    todoIds.forEach((todoId, i) => {
      const subtasks = subtaskQueries[i]?.data;
      if (subtasks) {
        map[todoId] = {
          total: subtasks.length,
          done: subtasks.filter((s) => s.completed).length,
        };
      }
    });
    return map;
  }, [subtaskQueries, todoIds]);

  // Apply client-side filters and sorting
  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    const filtered = applyFilters(
      todos,
      { status: filters.status, priority: filters.priority, due: filters.due, tag: filters.tag },
      todoTagIds
    );
    return applySorting(filtered, filters.sort);
  }, [todos, filters.status, filters.priority, filters.due, filters.tag, filters.sort, todoTagIds]);

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
          <div className="flex items-center justify-between mb-4">
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

      {/* Filters */}
      <div className="mb-4">
        <TodoFilters />
      </div>

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
        <DraggableTodoList
          todos={filteredTodos}
          listId={listId ?? ""}
          todoTags={todoTags}
          subtaskCounts={subtaskCounts}
          onEditTodo={setEditingTodo}
        />
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
