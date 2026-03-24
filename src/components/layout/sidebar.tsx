import { Link, useLocation } from "react-router";
import { useTodoLists } from "@/hooks/use-todo-lists";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, List, Plus } from "lucide-react";
import { useState } from "react";
import { ListForm } from "@/components/lists/list-form";
import { SearchCommand } from "@/components/search/search-command";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { data: lists, isLoading } = useTodoLists();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <CheckSquare className="size-5 text-primary" />
        <Link to="/" className="font-semibold">
          Todo App
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <SearchCommand />
      </div>

      {/* Lists header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Lists
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowCreate(true)}
        >
          <Plus />
        </Button>
      </div>

      {/* List navigation */}
      <nav className="flex-1 overflow-auto px-3 pb-3 space-y-0.5">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        {lists?.map((list) => {
          const isActive = location.pathname === `/lists/${list.id}`;
          return (
            <Link
              key={list.id}
              to={`/lists/${list.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent",
                isActive && "bg-accent font-medium"
              )}
            >
              <List className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{list.name}</span>
            </Link>
          );
        })}
        {!isLoading && lists?.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No lists yet
          </p>
        )}
      </nav>

      {/* User menu */}
      <div className="shrink-0 border-t px-3 py-2">
        <UserMenu />
      </div>

      <ListForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
