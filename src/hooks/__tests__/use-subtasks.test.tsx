import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSubtasks, useCreateSubtask, useToggleSubtask, useDeleteSubtask } from "../use-subtasks";
import { supabase } from "@/lib/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

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

function mockSelectChain(result: { data: unknown; error: unknown }) {
  let orderCount = 0;
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = new Proxy(chain, {
    get(_target, prop: string) {
      if (!chain[prop]) chain[prop] = vi.fn();
      chain[prop].mockImplementation(() => {
        if (prop === "order") {
          orderCount++;
          if (orderCount >= 2) return Promise.resolve(result);
        }
        return self;
      });
      return chain[prop];
    },
  });
  return self;
}

const mockSubtasks = [
  { id: "sub-1", todo_id: "todo-1", title: "Step 1", completed: false, position: 0, created_at: "2026-01-01T00:00:00Z" },
  { id: "sub-2", todo_id: "todo-1", title: "Step 2", completed: true, position: 1, created_at: "2026-01-01T00:00:00Z" },
];

describe("useSubtasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches subtasks for a todo", async () => {
    mockFrom.mockReturnValue(mockSelectChain({ data: mockSubtasks, error: null }));

    const { result } = renderHook(() => useSubtasks("todo-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith("subtasks");
    expect(result.current.data).toHaveLength(2);
  });
});

describe("useCreateSubtask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a subtask", async () => {
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockSubtasks[0], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useCreateSubtask(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ todo_id: "todo-1", title: "Step 1" });

    expect(chain.insert).toHaveBeenCalledWith({ todo_id: "todo-1", title: "Step 1" });
  });
});

describe("useToggleSubtask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("toggles subtask completion", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useToggleSubtask(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: "sub-1", completed: true, todoId: "todo-1" });

    expect(chain.update).toHaveBeenCalledWith({ completed: true });
  });
});

describe("useDeleteSubtask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a subtask", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useDeleteSubtask(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ id: "sub-1", todoId: "todo-1" });

    expect(chain.eq).toHaveBeenCalledWith("id", "sub-1");
  });
});
