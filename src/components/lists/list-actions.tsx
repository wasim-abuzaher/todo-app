import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteList } from "@/hooks/use-todo-lists";
import { useAuth } from "@/providers/auth-provider";
import { ListForm } from "./list-form";
import { ShareDialog } from "@/components/sharing/share-dialog";
import { MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import type { TodoList } from "@/types";

interface ListActionsProps {
  list: TodoList;
}

export function ListActions({ list }: ListActionsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const deleteList = useDeleteList();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOwner = user?.id === list.owner_id;

  const handleDelete = async () => {
    await deleteList.mutateAsync(list.id);
    setShowDelete(false);
    if (location.pathname === `/lists/${list.id}`) {
      navigate("/");
    }
  };

  if (!isOwner) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowShare(true)}>
            <Share2 />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ListForm open={showEdit} onOpenChange={setShowEdit} list={list} />
      <ShareDialog list={list} open={showShare} onOpenChange={setShowShare} />

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{list.name}"?</DialogTitle>
            <DialogDescription>
              This will permanently delete the list and all its todos. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteList.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
