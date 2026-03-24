import { describe, it, expect } from "vitest";
import { applyFilters, applySorting } from "../use-filters";
import type { Todo } from "@/types";

const baseTodo: Todo = {
  id: "1",
  list_id: "list-1",
  created_by: "user-1",
  title: "Test",
  description: null,
  completed: false,
  completed_at: null,
  priority: "medium",
  due_date: null,
  position: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const todos: Todo[] = [
  { ...baseTodo, id: "1", title: "Alpha", priority: "high", completed: false, position: 0 },
  { ...baseTodo, id: "2", title: "Beta", priority: "low", completed: true, position: 1 },
  { ...baseTodo, id: "3", title: "Gamma", priority: "medium", completed: false, due_date: "2020-01-01", position: 2 },
  { ...baseTodo, id: "4", title: "Delta", priority: "high", completed: false, due_date: "2099-12-31", position: 3 },
];

describe("applyFilters", () => {
  const defaults = { status: "all" as const, priority: "all" as const, due: "all" as const, tag: "all" };

  it("returns all todos with default filters", () => {
    expect(applyFilters(todos, defaults)).toHaveLength(4);
  });

  it("filters by active status", () => {
    const result = applyFilters(todos, { ...defaults, status: "active" });
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it("filters by completed status", () => {
    const result = applyFilters(todos, { ...defaults, status: "completed" });
    expect(result.every((t) => t.completed)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it("filters by priority", () => {
    const result = applyFilters(todos, { ...defaults, priority: "high" });
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.priority === "high")).toBe(true);
  });

  it("filters by no-date", () => {
    const result = applyFilters(todos, { ...defaults, due: "no-date" });
    expect(result.every((t) => !t.due_date)).toBe(true);
  });

  it("filters by tag", () => {
    const tagIds = { "1": ["tag-a"], "2": [], "3": ["tag-a", "tag-b"], "4": [] };
    const result = applyFilters(todos, { ...defaults, tag: "tag-a" }, tagIds);
    expect(result).toHaveLength(2);
  });
});

describe("applySorting", () => {
  it("returns same order for position sort", () => {
    const result = applySorting(todos, "position");
    expect(result).toBe(todos);
  });

  it("sorts by title alphabetically", () => {
    const result = applySorting(todos, "title");
    expect(result.map((t) => t.title)).toEqual(["Alpha", "Beta", "Delta", "Gamma"]);
  });

  it("sorts by priority (high first)", () => {
    const result = applySorting(todos, "priority");
    expect(result[0].priority).toBe("high");
    expect(result[result.length - 1].priority).toBe("low");
  });

  it("sorts by due date with null dates last", () => {
    const result = applySorting(todos, "due_date");
    expect(result[0].due_date).toBe("2020-01-01");
    expect(result[result.length - 1].due_date).toBeNull();
  });
});
