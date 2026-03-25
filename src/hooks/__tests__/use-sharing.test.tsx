import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useListShares,
  useCreateInvite,
  useDeleteInvite,
  useUpdateShareRole,
  useRemoveCollaborator,
  useAcceptInvite,
} from "../use-sharing";
import { supabase } from "@/lib/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

// Mock useAuth
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com" },
    session: {},
    loading: false,
  }),
}));

// Mock supabase.rpc
const mockRpc = vi.fn();
(supabase as Record<string, unknown>).rpc = mockRpc;

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

const mockShares = [
  {
    id: "share-1",
    list_id: "list-1",
    shared_with: "user-2",
    role: "editor",
    created_at: "2026-01-01T00:00:00Z",
    email: "editor@example.com",
  },
  {
    id: "share-2",
    list_id: "list-1",
    shared_with: "user-3",
    role: "viewer",
    created_at: "2026-01-02T00:00:00Z",
    email: "viewer@example.com",
  },
];

describe("useListShares", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches shares with emails via RPC", async () => {
    mockRpc.mockResolvedValue({ data: mockShares, error: null });

    const { result } = renderHook(() => useListShares("list-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRpc).toHaveBeenCalledWith("get_list_collaborators", {
      p_list_id: "list-1",
    });
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].email).toBe("editor@example.com");
  });
});

describe("useUpdateShareRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a collaborator's role", async () => {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useUpdateShareRole(), {
      wrapper: createWrapper(),
    });
    await result.current.mutateAsync({
      id: "share-1",
      role: "viewer",
      listId: "list-1",
    });

    expect(chain.update).toHaveBeenCalledWith({ role: "viewer" });
  });
});

describe("useRemoveCollaborator", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes a collaborator", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useRemoveCollaborator(), {
      wrapper: createWrapper(),
    });
    await result.current.mutateAsync({ id: "share-1", listId: "list-1" });

    expect(chain.eq).toHaveBeenCalledWith("id", "share-1");
  });
});

describe("useCreateInvite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an invite link", async () => {
    const mockInvite = {
      id: "inv-1",
      list_id: "list-1",
      token: "abc123",
      role: "editor",
      created_by: "user-1",
      expires_at: "2026-01-08T00:00:00Z",
      created_at: "2026-01-01T00:00:00Z",
    };
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockInvite, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useCreateInvite(), {
      wrapper: createWrapper(),
    });
    const invite = await result.current.mutateAsync({
      listId: "list-1",
      role: "editor",
    });

    expect(invite.token).toBe("abc123");
    expect(chain.insert).toHaveBeenCalledWith({
      list_id: "list-1",
      role: "editor",
      created_by: "user-1",
    });
  });
});

describe("useDeleteInvite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes an invite", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useDeleteInvite(), {
      wrapper: createWrapper(),
    });
    await result.current.mutateAsync({ id: "inv-1", listId: "list-1" });

    expect(chain.eq).toHaveBeenCalledWith("id", "inv-1");
  });
});

describe("useAcceptInvite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls the accept_invite RPC", async () => {
    mockRpc.mockResolvedValue({ data: "list-1", error: null });

    const { result } = renderHook(() => useAcceptInvite(), {
      wrapper: createWrapper(),
    });
    const listId = await result.current.mutateAsync("token-abc");

    expect(listId).toBe("list-1");
    expect(mockRpc).toHaveBeenCalledWith("accept_invite", {
      p_token: "token-abc",
    });
  });
});
