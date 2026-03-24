import { useSearchParams } from "react-router";
import { useCallback, useMemo } from "react";
import { isToday, isPast, parseISO, isThisWeek } from "date-fns";
import type { Todo } from "@/types";

export type StatusFilter = "all" | "active" | "completed";
export type PriorityFilter = "all" | "low" | "medium" | "high";
export type DueFilter = "all" | "overdue" | "today" | "this-week" | "no-date";
export type SortField = "position" | "due_date" | "priority" | "created_at" | "title";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get("status") as StatusFilter) ?? "all";
  const priority = (searchParams.get("priority") as PriorityFilter) ?? "all";
  const due = (searchParams.get("due") as DueFilter) ?? "all";
  const tag = searchParams.get("tag") ?? "all";
  const sort = (searchParams.get("sort") as SortField) ?? "position";

  const setFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "all" || value === "position") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const hasActiveFilters = status !== "all" || priority !== "all" || due !== "all" || tag !== "all";

  return { status, priority, due, tag, sort, setFilter, clearFilters, hasActiveFilters };
}

export function applyFilters(
  todos: Todo[],
  filters: { status: StatusFilter; priority: PriorityFilter; due: DueFilter; tag: string },
  todoTagIds?: Record<string, string[]>
): Todo[] {
  return todos.filter((todo) => {
    if (filters.status === "active" && todo.completed) return false;
    if (filters.status === "completed" && !todo.completed) return false;

    if (filters.priority !== "all" && todo.priority !== filters.priority) return false;

    if (filters.due !== "all" && todo.due_date) {
      const date = parseISO(todo.due_date);
      if (filters.due === "overdue" && !(isPast(date) && !isToday(date))) return false;
      if (filters.due === "today" && !isToday(date)) return false;
      if (filters.due === "this-week" && !isThisWeek(date)) return false;
    }
    if (filters.due === "no-date" && todo.due_date) return false;
    if (filters.due !== "all" && filters.due !== "no-date" && !todo.due_date) return false;

    if (filters.tag !== "all" && todoTagIds) {
      const tags = todoTagIds[todo.id] ?? [];
      if (!tags.includes(filters.tag)) return false;
    }

    return true;
  });
}

export function applySorting(todos: Todo[], sort: SortField): Todo[] {
  if (sort === "position") return todos;

  return [...todos].sort((a, b) => {
    switch (sort) {
      case "due_date": {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      case "priority":
        return (
          PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] -
          PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER]
        );
      case "created_at":
        return b.created_at.localeCompare(a.created_at);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}
