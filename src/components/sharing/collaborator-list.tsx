import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useListShares,
  useUpdateShareRole,
  useRemoveCollaborator,
} from "@/hooks/use-sharing";
import { X } from "lucide-react";

interface CollaboratorListProps {
  listId: string;
}

export function CollaboratorList({ listId }: CollaboratorListProps) {
  const { data: shares, isLoading } = useListShares(listId);
  const updateRole = useUpdateShareRole();
  const removeCollaborator = useRemoveCollaborator();

  if (isLoading || !shares || shares.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Collaborators</h4>
      <div className="space-y-2">
        {shares.map((share) => {
          const initials = share.shared_with.slice(0, 2).toUpperCase();
          return (
            <div key={share.id} className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm truncate text-muted-foreground">
                {share.shared_with.slice(0, 8)}...
              </span>
              <Select
                value={share.role}
                onValueChange={(role: "viewer" | "editor") =>
                  updateRole.mutate({ id: share.id, role, listId })
                }
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  removeCollaborator.mutate({ id: share.id, listId })
                }
              >
                <X className="size-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
