import { useParams } from "react-router";

export default function InvitePage() {
  const { token } = useParams();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Accept Invite: {token}</h1>
    </div>
  );
}
