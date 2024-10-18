"use client";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import Message from "@/components/message-list/message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import Quill from "quill";
import { useCreateMessage } from "../api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelID } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useGetMessages } from "../api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

const TIME_THRESHOLD = 5;

const Editor = dynamic(() => import("@/components/editor/index"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-28 bg-gray-300 rounded-md" />,
});

type Props = {
  messageId: Id<"messages">;
  onClose: () => void;
};

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage">;
};

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "EEEE, MMMM d");
};

export default function Thread({ messageId, onClose }: Props) {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelID();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });

  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const [editorKey, setEditorKey] = useState(0);

  const [isPending, setIsPending] = useState(false);
  const editorRef = useRef<Quill | null>(null);

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined,
        parentMessageId: messageId,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        if (!url) {
          throw new Error("Url not found");
        }
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload url");
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, {
        throwError: true,
      });
      setEditorKey((p) => p + 1);
    } catch {
      toast.error("Failed to send message", { closeButton: true });
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message?._creationTime ?? 0);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (loadingMessage || status == "LoadingFirstPage") {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4 h-[49px] border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size="iconSm" variant="ghost" type="button">
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      {!message ? (
        <div className="h-full flex flex-col gap-y-2 items-center justify-center">
          <AlertTriangle className=" size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
            {Object.entries(groupedMessages || {}).map(
              ([dateKey, messages]) => (
                <div key={dateKey}>
                  <div className="text-center my-2 relative">
                    <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                    <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                      {formatDateLabel(dateKey)}
                    </span>
                  </div>
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const isCompact =
                      prevMessage &&
                      prevMessage.user._id === message.user._id &&
                      differenceInMinutes(
                        new Date(message._creationTime),
                        new Date(prevMessage._creationTime)
                      ) < TIME_THRESHOLD;
                    return (
                      <Message
                        key={message?._id}
                        id={message?._id}
                        memberId={message?.memberId}
                        authorImage={message?.user.image}
                        authorName={message?.user.name}
                        reactions={message?.reactions}
                        body={message?.body}
                        image={message?.image}
                        updatedAt={message?.updatedAt}
                        createdAt={message?._creationTime}
                        threadCount={message?.threadCount}
                        threadImage={message?.threadImage}
                        threadTimestamp={message?.threadTimestamp}
                        isEditing={editingId === message._id}
                        setEditingId={setEditingId}
                        isCompact={isCompact}
                        hideThreadButton
                        isAuthor={message.memberId === currentMember?._id}
                        thradName={message.threadName}
                      />
                    );
                  })}
                </div>
              )
            )}
            <div
              className="h-1"
              ref={(el) => {
                if (el) {
                  const observer = new IntersectionObserver(
                    ([entry]) => {
                      if (entry.isIntersecting && canLoadMore) {
                        loadMore();
                      }
                    },
                    { threshold: 1.0 }
                  );
                  observer.observe(el);
                  return () => observer.disconnect();
                }
              }}
            />
            {isLoadingMore && (
              <div className="text-center my-2 relative">
                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                  <Loader className="size-4 animate-spin" />
                </span>
              </div>
            )}
            <Message
              hideThreadButton
              memberId={message.memberId}
              authorImage={message.user.image}
              authorName={message.user.name}
              isAuthor={message.memberId === currentMember?._id}
              body={message.body}
              image={message.image}
              createdAt={message._creationTime}
              updatedAt={message.updatedAt}
              id={message._id}
              reactions={message.reactions}
              isEditing={editingId === message._id}
              setEditingId={setEditingId}
            />
          </div>
          <div className="px-4">
            <Editor
              key={editorKey}
              innerRef={editorRef}
              onSubmit={handleSubmit}
              disabled={isPending}
              placeholder="Reply..."
            />
          </div>
        </>
      )}
    </div>
  );
}
