import React, { useCallback, useMemo } from "react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "../hint";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Thumbnail from "../thumbnail";
import ToolbarMessage from "@/features/messages/components/toolbar-message";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import Reactions from "@/features/reactions/components/reactions";
import { usePanel } from "@/hooks/use-panel";
import ThreadBar from "@/features/messages/components/thread-bar";

const Renderer = dynamic(() => import("@/components/renderer/index"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full h-20 my-5 rounded-md bg-gray-200" />
  ),
});

const Editor = dynamic(() => import("@/components/editor/index"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full h-20 my-5 rounded-md bg-gray-200" />
  ),
});

type Props = {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: string;
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  thradName?: string;
};

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
};

export default function Message({
  id,
  isAuthor,
  authorImage,
  authorName = "Member",
  reactions,
  body,
  createdAt,
  image,
  isEditing,
  setEditingId,
  updatedAt,
  hideThreadButton,
  isCompact,
  threadCount,
  threadImage,
  threadTimestamp,
  thradName,
  memberId,
}: Props) {
  const { onOpenMessage, parentMessageId, onClose, onOpenProfile } = usePanel();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message",
    "Are you sure you want to delete this message? This cannot be undone."
  );
  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();

  const { mutate: removeMessage, isPending: isRemoveMessage } =
    useRemoveMessage();

  const { mutate: toggleReaction, isPending: isTogglingReaction } =
    useToggleReaction();

  const isPending = isUpdatingMessage || isRemoveMessage || isTogglingReaction;

  const handleReaction = useCallback(
    (value: string) => {
      toggleReaction(
        { messageId: id, value },
        {
          onError() {
            toast.error("Failed to toggle reaction");
          },
        }
      );
    },
    [id, toggleReaction]
  );

  const handleDelete = useCallback(async () => {
    const ok = await confirm();
    if (!ok) return;
    removeMessage(
      { id },
      {
        onSuccess(id) {
          toast.success("Message deleted", { closeButton: true });
          if (parentMessageId === id) {
            onClose();
          }
        },
        onError() {
          toast.error("Failed to delete message", { closeButton: true });
        },
      }
    );
  }, [confirm, id, onClose, parentMessageId, removeMessage]);

  const handleUpdate = useCallback(
    ({ body }: { body: string }) => {
      updateMessage(
        { id, body },
        {
          onSuccess() {
            toast.success("Message updated", { closeButton: true });
            setEditingId(null);
          },
          onError() {
            toast.error("Failed to update message", { closeButton: true });
          },
        }
      );
    },
    [id, setEditingId, updateMessage]
  );

  const avatarFallback = authorName?.charAt(0).toUpperCase();

  const toolbar = useMemo(() => {
    return !isEditing ? (
      <ToolbarMessage
        isAuthor={isAuthor}
        isPending={false}
        handleEdit={() => setEditingId(id)}
        handleThread={() => onOpenMessage(id)}
        handleDelete={handleDelete}
        handleReaction={handleReaction}
        hideThreadButton={hideThreadButton}
      />
    ) : null;
  }, [
    isEditing,
    isAuthor,
    handleDelete,
    handleReaction,
    hideThreadButton,
    setEditingId,
    id,
    onOpenMessage,
  ]);

  const threadBar = useMemo(() => {
    return (
      <ThreadBar
        count={threadCount}
        image={threadImage}
        timestamp={threadTimestamp}
        onClick={() => onOpenMessage(id)}
        name={thradName}
      />
    );
  }, [id, onOpenMessage, thradName, threadCount, threadImage, threadTimestamp]);

  const handleMember = useCallback(() => {
    onOpenProfile(memberId);
  }, [memberId, onOpenProfile]);

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col w-full gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
            isRemoveMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full ">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full ">
                <Renderer value={body} />
                <Thumbnail url={image} />

                {updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                )}
                <Reactions data={reactions} onChange={handleReaction} />
                {threadBar}
              </div>
            )}
          </div>
          {toolbar}
        </div>
      </>
    );
  }
  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col w-full gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemoveMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button onClick={handleMember}>
            <Avatar className=" rounded-md ">
              <AvatarImage src={authorImage} className="rounded-md" />
              <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={handleMember}
                  className="font-bold text-primary hover:underline"
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs to-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>

              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
              {threadBar}
            </div>
          )}
        </div>
        {toolbar}
      </div>
    </>
  );
}
