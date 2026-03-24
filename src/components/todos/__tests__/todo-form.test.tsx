import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoForm } from "../todo-form";

const mockMutateAsync = vi.fn();

vi.mock("@/hooks/use-todos", () => ({
  useCreateTodo: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

describe("TodoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  it("renders input with placeholder", () => {
    render(<TodoForm listId="list-1" />);
    expect(screen.getByPlaceholderText("Add a todo...")).toBeInTheDocument();
  });

  it("creates todo on Enter", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Buy milk{Enter}");

    expect(mockMutateAsync).toHaveBeenCalledWith({
      list_id: "list-1",
      title: "Buy milk",
    });
  });

  it("clears input after creating", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Buy milk{Enter}");

    expect(input).toHaveValue("");
  });

  it("does not create with empty title", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "   {Enter}");

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
