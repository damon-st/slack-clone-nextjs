"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "lucide-react";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useUpdateChannel } from "../api/use-update-channel";
import { useChannelID } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useRemoveChannel } from "../api/use-remove-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";

type Props = {
  title: string;
};

export default function HeaderChannel({ title }: Props) {
  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);
  const channelId = useChannelID();
  const workspaceId = useWorkspaceId();

  const { push } = useRouter();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this channel",
    "This acction is irreversible"
  );

  const { data: member } = useCurrentMember({ workspaceId });

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") return;
    setEditOpen(value);
  };

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();

  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      updateChannel(
        { id: channelId, name: value },
        {
          onSuccess() {
            toast.success("Channel update");
            setEditOpen(false);
            setValue("");
          },
          onError() {
            toast.error("Error update channel");
          },
        }
      );
    },
    [channelId, updateChannel, value]
  );

  const handleDelete = useCallback(async () => {
    const ok = await confirm();
    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess() {
          toast.success("Channel deleted");
          push(`/workspace/${workspaceId}`);
        },
        onError() {
          toast.error("Failed to delete channel");
        },
      }
    );
  }, [channelId, confirm, push, removeChannel, workspaceId]);

  return (
    <>
      <ConfirmDialog />
      <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
              size="sm"
            >
              <span className="truncate"># {title}</span>
              <FaChevronDown className="size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogDescription></DialogDescription>
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle># {title}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Channel name</p>
                      {member?.role === "admin" && (
                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                          Edit
                        </p>
                      )}
                    </div>
                    <p className="text-sm"># {title}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename this channel</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={value}
                      disabled={isUpdatingChannel}
                      required
                      onChange={handleChange}
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      placeholder="e.g plan-budget"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUpdatingChannel}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={isUpdatingChannel}>Save</Button>
                    </DialogFooter>
                  </form>
                  <DialogDescription></DialogDescription>
                </DialogContent>
              </Dialog>
              {member?.role === "admin" && (
                <button
                  disabled={isRemovingChannel}
                  onClick={handleDelete}
                  type="button"
                  className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
                >
                  <TrashIcon className="size-4" />
                  <p className="text-sm font-semibold">Delete channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
