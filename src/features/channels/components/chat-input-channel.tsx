import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelID } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor/index"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center">
      <Loader className="animate-spin text-muted-foreground size-5" />
    </div>
  ),
});

type Props = {
  placeholder: string;
};

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage">;
};

export default function ChatInputChannel({ placeholder }: Props) {
  const [editorKey, setEditorKey] = useState(0);

  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelID();
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

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
}
