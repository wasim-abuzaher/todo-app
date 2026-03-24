import { Navigate } from "react-router";
import { useAuth } from "@/providers/auth-provider";
import { AuthForm } from "@/components/auth/auth-form";
import { CheckSquare } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-2 text-primary">
          <CheckSquare className="size-8" />
          <span className="text-2xl font-bold">Todo App</span>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
