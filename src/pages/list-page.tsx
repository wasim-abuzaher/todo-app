import { useParams } from "react-router";

export default function ListPage() {
  const { listId } = useParams();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">List: {listId}</h1>
    </div>
  );
}
