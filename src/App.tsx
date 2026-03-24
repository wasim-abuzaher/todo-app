import { Routes, Route } from "react-router";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppLayout } from "@/components/layout/app-layout";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ListPage from "@/pages/list-page";
import InvitePage from "@/pages/invite-page";
import NotFoundPage from "@/pages/not-found-page";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lists/:listId" element={<ListPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
