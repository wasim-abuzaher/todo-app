import { useState } from "react";
import { useTags, useTodoTags, useCreateTag, useAddTodoTag, useRemoveTodoTag } from "@/hooks/use-tags";
import { TagBadge } from "./tag-badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

interface TagPickerProps {
  todoId: string;
  listId: string;
}

export function TagPicker({ todoId }: TagPickerProps) {
  const { data: allTags } = useTags();
  const { data: todoTags } = useTodoTags(todoId);
  const createTag = useCreateTag();
  const addTag = useAddTodoTag();
  const removeTag = useRemoveTodoTag();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  const assignedIds = new Set(todoTags?.map((t) => t.id) ?? []);
  const unassigned = allTags?.filter((t) => !assignedIds.has(t.id)) ?? [];

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag.mutateAsync({ name: newTagName.trim(), color: newTagColor });
    await addTag.mutateAsync({ todoId, tagId: tag.id });
    setNewTagName("");
  };

  return (
    <div className="space-y-2">
      {/* Assigned tags */}
      <div className="flex flex-wrap gap-1">
        {todoTags?.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => removeTag.mutate({ todoId, tagId: tag.id })}
          />
        ))}
        {(!todoTags || todoTags.length === 0) && (
          <span className="text-xs text-muted-foreground">No tags</span>
        )}
      </div>

      {/* Add tag popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Tag className="size-3" />
            Add tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          {/* Existing unassigned tags */}
          {unassigned.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">Existing tags</p>
              <div className="flex flex-wrap gap-1">
                {unassigned.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag.mutate({ todoId, tagId: tag.id })}
                  >
                    <TagBadge tag={tag} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create new tag */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Create new</p>
            <div className="flex gap-1">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCreate}
                disabled={!newTagName.trim() || createTag.isPending}
              >
                <Plus className="size-3" />
              </Button>
            </div>
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "size-5 rounded-full border-2 transition-transform",
                    newTagColor === color ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
