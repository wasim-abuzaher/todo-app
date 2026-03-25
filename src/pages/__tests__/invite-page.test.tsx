import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import InvitePage from "../invite-page";

// Default: not authenticated
const mockUseAuth = vi.fn().mockReturnValue({
  user: null,
  session: null,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
});

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ token: "test-token-123" }),
    useNavigate: () => vi.fn(),
  };
});

describe("InvitePage", () => {
  it("shows auth form when user is not logged in", () => {
    renderWithProviders(<InvitePage />, {
      initialEntries: ["/invite/test-token-123"],
    });

    expect(
      screen.getByText("Sign in or create an account to accept this list invite.")
    ).toBeInTheDocument();
  });

  it("shows loading spinner while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    });

    renderWithProviders(<InvitePage />, {
      initialEntries: ["/invite/test-token-123"],
    });

    // Should not show auth form while loading
    expect(
      screen.queryByText("Sign in or create an account to accept this list invite.")
    ).not.toBeInTheDocument();
  });
});
