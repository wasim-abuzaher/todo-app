import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useListMembers,
  useListShares,
  useUpdateShareRole,
  useRemoveCollaborator,
} from "@/hooks/use-sharing";
import { useAuth } from "@/providers/auth-provider";
import { X } from "lucide-react";
import type { TodoList } from "@/types";

interface MembersDialogProps {
  list: TodoList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembersDialog({ list, open, onOpenChange }: MembersDialogProps) {
  const { user } = useAuth();
  const { data: members } = useListMembers(list.id);
  const { data: shares } = useListShares(list.id);
  const updateRole = useUpdateShareRole();
  const removeCollaborator = useRemoveCollaborator();
  const isOwner = user?.id === list.owner_id;

  // Build a map from user_id → share.id for remove/update operations
  const shareByUserId = new Map(
    shares?.map((s) => [s.shared_with, s]) ?? []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {members?.map((member) => {
            const initial = (member.email?.[0] ?? "?").toUpperCase();
            const share = shareByUserId.get(member.user_id);

            return (
              <div key={member.user_id} className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm truncate">
                  {member.email}
                </span>

                {member.role === "owner" ? (
                  <Badge variant="secondary" className="text-xs">
                    Owner
                  </Badge>
                ) : isOwner && share ? (
                  <>
                    <Select
                      value={member.role}
                      onValueChange={(role: "viewer" | "editor") =>
                        updateRole.mutate({ id: share.id, role, listId: list.id })
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
                        removeCollaborator.mutate({ id: share.id, listId: list.id })
                      }
                    >
                      <X className="size-3.5" />
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {member.role}
                  </Badge>
                )}
              </div>
            );
          })}

          {(!members || members.length === 0) && (
            <p className="text-sm text-muted-foreground py-2">
              No members found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
