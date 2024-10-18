"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { CopyIcon, RefreshCcw } from "lucide-react";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { useNewJoinCodeWorkspace } from "../api/use-new-join-workspace";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  name: string;
  joinCode: string;
};

export default function InviteModalWorskpace({
  open,
  setOpen,
  joinCode,
  name,
}: Props) {
  const workspaceId = useWorkspaceId();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will desacrtivate the current invite code and generate a new one"
  );

  const { mutate, isPending } = useNewJoinCodeWorkspace();

  const handleNewCode = async () => {
    const ok = await confirm();
    if (!ok) return;
    mutate(
      { workspaceId },
      {
        onSuccess() {
          toast.success("Invite code generated");
        },
        onError() {
          toast.error("Failed to regenerated invite code");
        },
      }
    );
  };

  const handleCopy = useCallback(() => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() =>
        toast.success("Invite link copy to clipboard", { closeButton: true })
      );
  }, [workspaceId]);

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Use the code below to invite peple yo your workspace
          </DialogDescription>
          <div className="flex flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button
              onClick={handleCopy}
              type="button"
              variant="ghost"
              size="sm"
            >
              Copy Link <CopyIcon className="size-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              type="button"
              onClick={handleNewCode}
              variant="outline"
            >
              New code
              <RefreshCcw
                className={cn("size-4 ml-2", isPending && "animate-spin")}
              />
            </Button>
            <DialogClose disabled={isPending} asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
