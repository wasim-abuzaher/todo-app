import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoItem } from "../todo-item";
import type { Todo } from "@/types";

const mockToggle = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/hooks/use-todos", () => ({
  useToggleTodo: () => ({ mutate: mockToggle }),
  useDeleteTodo: () => ({ mutate: mockDelete }),
}));

const baseTodo: Todo = {
  id: "todo-1",
  list_id: "list-1",
  created_by: "user-1",
  title: "Buy milk",
  description: null,
  completed: false,
  completed_at: null,
  priority: "medium",
  due_date: null,
  position: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("TodoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders todo title", () => {
    render(<TodoItem todo={baseTodo} onEdit={vi.fn()} />);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("shows strikethrough when completed", () => {
    const completedTodo = { ...baseTodo, completed: true };
    render(<TodoItem todo={completedTodo} onEdit={vi.fn()} />);
    const title = screen.getByText("Buy milk");
    expect(title).toHaveClass("line-through");
  });

  it("calls toggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={baseTodo} onEdit={vi.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith({
      id: "todo-1",
      completed: true,
      listId: "list-1",
    });
  });

  it("calls onEdit when title is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<TodoItem todo={baseTodo} onEdit={onEdit} />);

    await user.click(screen.getByText("Buy milk"));

    expect(onEdit).toHaveBeenCalledWith(baseTodo);
  });

  it("shows priority badge for non-medium priority", () => {
    const highTodo = { ...baseTodo, priority: "high" as const };
    render(<TodoItem todo={highTodo} onEdit={vi.fn()} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("does not show priority badge for medium priority", () => {
    render(<TodoItem todo={baseTodo} onEdit={vi.fn()} />);
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
  });
});
