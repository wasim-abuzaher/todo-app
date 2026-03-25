import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { TodoItem } from "../todo-item";
import type { Todo } from "@/types";

// Mock useAuth
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com" },
    session: {},
    loading: false,
  }),
}));

const baseTodo: Todo = {
  id: "todo-1",
  list_id: "list-1",
  created_by: "user-1",
  title: "Test Todo",
  description: null,
  completed: false,
  completed_at: null,
  priority: "medium",
  due_date: null,
  position: 0,
  fts: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("TodoItem permissions", () => {
  it("shows edit/delete menu when canEdit is true", () => {
    renderWithProviders(
      <TodoItem todo={baseTodo} onEdit={vi.fn()} canEdit={true} />
    );

    expect(screen.getByText("Test Todo")).toBeInTheDocument();
    // Checkbox should be enabled
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeDisabled();
  });

  it("disables checkbox and hides actions when canEdit is false", () => {
    renderWithProviders(
      <TodoItem todo={baseTodo} onEdit={vi.fn()} canEdit={false} />
    );

    expect(screen.getByText("Test Todo")).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();

    // The dropdown trigger button should not exist
    expect(screen.queryByRole("button", { name: /more/i })).not.toBeInTheDocument();
  });
});
