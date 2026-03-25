import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useTodos } from "@/hooks/use-todos";
import { useTodoLists } from "@/hooks/use-todo-lists";
import { useFilters, applyFilters, applySorting } from "@/hooks/use-filters";
import { useListRole } from "@/hooks/use-sharing";
import { useRealtimeSync } from "@/hooks/use-realtime";
import { usePresence } from "@/hooks/use-presence";
import { TodoForm } from "@/components/todos/todo-form";
import { DraggableTodoList } from "@/components/todos/draggable-todo-list";
import { TodoDetail } from "@/components/todos/todo-detail";
import { TodoFilters } from "@/components/todos/todo-filters";
import { ListActions } from "@/components/lists/list-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import type { Todo, Tag, Subtask } from "@/types";

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const { data: lists, isLoading: listsLoading } = useTodoLists();
  const { data: todos, isLoading: todosLoading } = useTodos(listId ?? "");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const filters = useFilters();

  const list = lists?.find((l) => l.id === listId);
  const role = useListRole(list);
  const canEdit = role === "owner" || role === "editor";
  const onlineUsers = usePresence(listId ?? "");
  useRealtimeSync(listId ?? "");

  const todoIds = useMemo(() => todos?.map((t) => t.id) ?? [], [todos]);

  // Batch fetch all tags for all todos in this list (1 query instead of N)
  const { data: allTodoTags } = useQuery({
    queryKey: ["todo-tags-batch", listId, todoIds],
    queryFn: async () => {
      if (todoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("todo_tags")
        .select("todo_id, tag_id, tags(*)")
        .in("todo_id", todoIds);
      if (error) throw error;
      return data as (typeof data[number] & { tags: Tag })[];
    },
    enabled: todoIds.length > 0,
    staleTime: 30_000,
  });

  // Batch fetch all subtasks for all todos in this list (1 query instead of N)
  const { data: allSubtasks } = useQuery({
    queryKey: ["subtasks-batch", listId, todoIds],
    queryFn: async () => {
      if (todoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .in("todo_id", todoIds)
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data as Subtask[];
    },
    enabled: todoIds.length > 0,
    staleTime: 30_000,
  });

  const todoTags = useMemo(() => {
    const map: Record<string, Tag[]> = {};
    for (const row of allTodoTags ?? []) {
      if (!map[row.todo_id]) map[row.todo_id] = [];
      if (row.tags) map[row.todo_id].push(row.tags);
    }
    return map;
  }, [allTodoTags]);

  const todoTagIds = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [todoId, tags] of Object.entries(todoTags)) {
      map[todoId] = tags.map((t) => t.id);
    }
    return map;
  }, [todoTags]);

  const subtaskCounts = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {};
    for (const subtask of allSubtasks ?? []) {
      if (!map[subtask.todo_id]) map[subtask.todo_id] = { done: 0, total: 0 };
      map[subtask.todo_id].total++;
      if (subtask.completed) map[subtask.todo_id].done++;
    }
    return map;
  }, [allSubtasks]);

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
            <div className="flex items-center gap-2">
              {/* Online presence avatars */}
              {onlineUsers.length > 0 && (
                <TooltipProvider>
                  <div className="flex -space-x-2">
                    {onlineUsers.slice(0, 3).map((u) => (
                      <Tooltip key={u.userId}>
                        <TooltipTrigger asChild>
                          <Avatar className="size-7 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {(u.email?.[0] ?? "?").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>{u.email}</TooltipContent>
                      </Tooltip>
                    ))}
                    {onlineUsers.length > 3 && (
                      <Avatar className="size-7 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          +{onlineUsers.length - 3}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </TooltipProvider>
              )}
              <ListActions list={list} />
            </div>
          </div>
        )
      )}

      {/* Filters */}
      <div className="mb-4">
        <TodoFilters />
      </div>

      {/* Add todo */}
      {canEdit && (
        <div className="mb-4">
          <TodoForm listId={listId ?? ""} />
        </div>
      )}

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
          canEdit={canEdit}
        />
      )}

      {/* Detail panel */}
      <TodoDetail
        todo={editingTodo}
        open={!!editingTodo}
        onOpenChange={(open) => !open && setEditingTodo(null)}
        canEdit={canEdit}
      />
    </div>
  );
}
