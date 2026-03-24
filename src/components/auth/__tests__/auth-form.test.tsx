import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthForm } from "../auth-form";
import { MemoryRouter } from "react-router";

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
  }),
}));

function renderAuthForm() {
  return render(
    <MemoryRouter>
      <AuthForm />
    </MemoryRouter>
  );
}

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in form by default", () => {
    renderAuthForm();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("toggles to sign up mode", async () => {
    const user = userEvent.setup();
    renderAuthForm();

    await user.click(screen.getByText("Sign up"));

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("calls signIn on submit in sign in mode", async () => {
    mockSignIn.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderAuthForm();

    await user.type(screen.getByPlaceholderText("Email"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(mockSignIn).toHaveBeenCalledWith("test@test.com", "password123");
  });

  it("calls signUp on submit in sign up mode", async () => {
    mockSignUp.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderAuthForm();

    await user.click(screen.getByText("Sign up"));
    await user.type(screen.getByPlaceholderText("Email"), "new@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mockSignUp).toHaveBeenCalledWith("new@test.com", "password123");
  });

  it("toggles back to sign in mode", async () => {
    const user = userEvent.setup();
    renderAuthForm();

    await user.click(screen.getByText("Sign up"));
    expect(screen.getByText("Create an account")).toBeInTheDocument();

    await user.click(screen.getByText("Sign in"));
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });
});
