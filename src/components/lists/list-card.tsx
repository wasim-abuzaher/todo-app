import { Link } from "react-router";
import type { TodoList } from "@/types";
import { ListActions } from "./list-actions";
import { List } from "lucide-react";

interface ListCardProps {
  list: TodoList;
  todoCount?: number;
}

export function ListCard({ list, todoCount }: ListCardProps) {
  return (
    <div className="group relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      <Link to={`/lists/${list.id}`} className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-primary/10 p-2">
            <List className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{list.name}</h3>
            {list.description && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {list.description}
              </p>
            )}
            {todoCount !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                {todoCount} {todoCount === 1 ? "todo" : "todos"}
              </p>
            )}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ListActions list={list} />
        </div>
      </div>
    </div>
  );
}
