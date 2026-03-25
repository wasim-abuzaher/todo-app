import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  useShareInvites,
  useCreateInvite,
  useDeleteInvite,
} from "@/hooks/use-sharing";
import { CollaboratorList } from "./collaborator-list";
import { Check, Copy, Link, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TodoList } from "@/types";

interface ShareDialogProps {
  list: TodoList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ list, open, onOpenChange }: ShareDialogProps) {
  const [role, setRole] = useState<"viewer" | "editor">("editor");
  const [copied, setCopied] = useState<string | null>(null);
  const { data: invites } = useShareInvites(list.id);
  const createInvite = useCreateInvite();
  const deleteInvite = useDeleteInvite();

  const handleCreateLink = async () => {
    const invite = await createInvite.mutateAsync({
      listId: list.id,
      role,
    });
    await copyToClipboard(invite.token);
  };

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(token);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{list.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generate link */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Create invite link</h4>
            <div className="flex items-center gap-2">
              <Select
                value={role}
                onValueChange={(v: "viewer" | "editor") => setRole(v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleCreateLink}
                disabled={createInvite.isPending}
                className="flex-1"
              >
                {createInvite.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Link />
                )}
                Generate Link
              </Button>
            </div>
          </div>

          {/* Active invite links */}
          {invites && invites.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Active links</h4>
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="flex-1 truncate text-muted-foreground">
                        {invite.role} link
                      </span>
                      <span className="text-xs text-muted-foreground">
                        expires{" "}
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => copyToClipboard(invite.token)}
                      >
                        {copied === invite.token ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          deleteInvite.mutate({
                            id: invite.id,
                            listId: list.id,
                          })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Collaborators */}
          <Separator />
          <CollaboratorList listId={list.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
