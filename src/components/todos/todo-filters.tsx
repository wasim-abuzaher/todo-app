import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFilters, type StatusFilter, type PriorityFilter, type DueFilter, type SortField } from "@/hooks/use-filters";
import { useTags } from "@/hooks/use-tags";
import { X } from "lucide-react";

export function TodoFilters() {
  const { status, priority, due, tag, sort, setFilter, clearFilters, hasActiveFilters } =
    useFilters();
  const { data: tags } = useTags();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(v) => setFilter("status", v as StatusFilter)}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => setFilter("priority", v as PriorityFilter)}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={due} onValueChange={(v) => setFilter("due", v as DueFilter)}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="Due date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All dates</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this-week">This week</SelectItem>
          <SelectItem value="no-date">No date</SelectItem>
        </SelectContent>
      </Select>

      {tags && tags.length > 0 && (
        <Select value={tag} onValueChange={(v) => setFilter("tag", v)}>
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sort} onValueChange={(v) => setFilter("sort", v as SortField)}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="position">Manual order</SelectItem>
          <SelectItem value="due_date">Due date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="created_at">Newest first</SelectItem>
          <SelectItem value="title">Alphabetical</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
          <X className="size-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
