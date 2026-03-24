import { useState } from "react";
import { useTodoLists } from "@/hooks/use-todo-lists";
import { ListCard } from "@/components/lists/list-card";
import { ListForm } from "@/components/lists/list-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { data: lists, isLoading } = useTodoLists();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Lists</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus />
          New List
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && lists?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">
            No lists yet. Create your first one!
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus />
            Create List
          </Button>
        </div>
      )}

      {lists && lists.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <ListForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
