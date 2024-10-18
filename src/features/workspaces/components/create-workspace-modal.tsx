"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateWorkSapceModal } from "../store/use-create-workspace-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspaces";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateWorkSpaceModal() {
  const { push } = useRouter();
  const [open, setOpen] = useCreateWorkSapceModal();

  const [name, setName] = useState("");

  const { mutate, isPending } = useCreateWorkspace();

  const handleClose = () => {
    setOpen(false);
    //TODO: Clear Form
    setName("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { name: name },
      {
        onSuccess(id) {
          toast.success("Create success", { closeButton: true });
          push(`/workspace/${id}`);
          handleClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogDescription></DialogDescription>
        <DialogHeader>
          <DialogTitle>Add a worskpace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name example: Personal,Work,Home"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
