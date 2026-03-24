import { Routes, Route } from "react-router";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ListPage from "@/pages/list-page";
import InvitePage from "@/pages/invite-page";
import NotFoundPage from "@/pages/not-found-page";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/lists/:listId" element={<ListPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
