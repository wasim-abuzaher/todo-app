import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTodoLists, useCreateList, useDeleteList } from "../use-todo-lists";
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

/** Creates a chainable mock where every method returns `this`, except the last awaited call resolves with `result`. */
function mockChain(result: { data: unknown; error: unknown }) {
  let callCount = 0;
  const totalOrderCalls = 2; // .order("position").order("created_at")

  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = new Proxy(chain, {
    get(_target, prop: string) {
      if (!chain[prop]) {
        chain[prop] = vi.fn();
      }
      chain[prop].mockImplementation(() => {
        if (prop === "order") {
          callCount++;
          if (callCount >= totalOrderCalls) {
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

const mockLists = [
  {
    id: "list-1",
    owner_id: "user-1",
    name: "Groceries",
    description: null,
    position: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "list-2",
    owner_id: "user-1",
    name: "Work",
    description: "Work tasks",
    position: 1,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
];

describe("useTodoLists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches lists ordered by position", async () => {
    mockFrom.mockReturnValue(mockChain({ data: mockLists, error: null }));

    const { result } = renderHook(() => useTodoLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith("todo_lists");
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].name).toBe("Groceries");
  });

  it("handles fetch error", async () => {
    mockFrom.mockReturnValue(
      mockChain({ data: null, error: { message: "Network error" } })
    );

    const { result } = renderHook(() => useTodoLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useCreateList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a list with owner_id", async () => {
    const newList = { ...mockLists[0], id: "list-new" };
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newList, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ name: "Groceries" });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Groceries",
        owner_id: "user-1",
      })
    );
  });
});

describe("useDeleteList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a list by id", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("list-1");

    expect(mockFrom).toHaveBeenCalledWith("todo_lists");
    expect(chain.eq).toHaveBeenCalledWith("id", "list-1");
  });
});
