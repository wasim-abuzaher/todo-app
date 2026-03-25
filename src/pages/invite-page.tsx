import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/providers/auth-provider";
import { useAcceptInvite } from "@/hooks/use-sharing";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { CheckSquare, Loader2 } from "lucide-react";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const acceptInvite = useAcceptInvite();
  const navigate = useNavigate();
  const hasAccepted = useRef(false);

  // Auto-accept when user is authenticated
  useEffect(() => {
    if (user && token && !hasAccepted.current) {
      hasAccepted.current = true;
      acceptInvite.mutate(token, {
        onSuccess: (listId) => {
          navigate(`/lists/${listId}`, { replace: true });
        },
      });
    }
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in — show auth form with invite context
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckSquare className="size-6" />
            <span className="text-lg font-semibold">Todo App</span>
          </div>
          <div className="rounded-lg border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
            Sign in or create an account to accept this list invite.
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  // Accepting...
  if (acceptInvite.isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Accepting invite...</p>
      </div>
    );
  }

  // Error
  if (acceptInvite.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-destructive">
          {acceptInvite.error?.message ?? "This invite is invalid or has expired."}
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
