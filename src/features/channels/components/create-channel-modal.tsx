"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateChannelModal() {
  const workspaceId = useWorkspaceId();

  const { push } = useRouter();

  const { mutate, isPending } = useCreateChannel();

  const [open, setOpen] = useCreateChannelModal();

  const [name, setName] = useState("");

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  }, []);

  const handleClose = useCallback(() => {
    setName("");
    setOpen(false);
  }, [setOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { name, workspaceId },
      {
        onSuccess: (id) => {
          push(`/workspace/${workspaceId}/channel/${id}`);
          handleClose();
          toast.success("Success create channel", { closeButton: true });
        },
        onError() {
          toast.error("Error in crearte channel", { closeButton: true });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add channel</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            disabled={isPending}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="e.g. plang-buget"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
