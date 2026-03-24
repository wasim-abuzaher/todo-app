import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from "../use-todos";
import { supabase } from "@/lib/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ user: { id: "user-1", email: "test@test.com" } }),
}));

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/** Creates a chainable mock where the second .order() call resolves with `result`. */
function mockSelectChain(result: { data: unknown; error: unknown }) {
  let orderCount = 0;
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = new Proxy(chain, {
    get(_target, prop: string) {
      if (!chain[prop]) {
        chain[prop] = vi.fn();
      }
      chain[prop].mockImplementation(() => {
        if (prop === "order") {
          orderCount++;
          if (orderCount >= 2) {
            return Promise.resolve(result);
          }
        }
        return self;
      });
      return chain[prop];
    },
  });
  return self;
}

const mockTodos = [
  {
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
  },
  {
    id: "todo-2",
    list_id: "list-1",
    created_by: "user-1",
    title: "Buy eggs",
    description: null,
    completed: true,
    completed_at: "2026-01-01T12:00:00Z",
    priority: "low",
    due_date: null,
    position: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("useTodos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches todos for a list", async () => {
    mockFrom.mockReturnValue(
      mockSelectChain({ data: mockTodos, error: null })
    );

    const { result } = renderHook(() => useTodos("list-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith("todos");
    expect(result.current.data).toHaveLength(2);
  });

  it("does not fetch when listId is empty", () => {
    const { result } = renderHook(() => useTodos(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a todo with created_by set to current user", async () => {
    const newTodo = { ...mockTodos[0], id: "todo-new" };
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newTodo, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      list_id: "list-1",
      title: "Buy milk",
    });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        list_id: "list-1",
        title: "Buy milk",
        created_by: "user-1",
      })
    );
  });
});

describe("useToggleTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates completed status", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useToggleTodo(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: "todo-1",
      completed: true,
      listId: "list-1",
    });

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true })
    );
    expect(chain.update.mock.calls[0][0].completed_at).toBeTruthy();
  });

  it("clears completed_at when uncompleting", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useToggleTodo(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: "todo-1",
      completed: false,
      listId: "list-1",
    });

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false, completed_at: null })
    );
  });
});

describe("useDeleteTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a todo by id", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ id: "todo-1", listId: "list-1" });

    expect(mockFrom).toHaveBeenCalledWith("todos");
    expect(chain.eq).toHaveBeenCalledWith("id", "todo-1");
  });
});
