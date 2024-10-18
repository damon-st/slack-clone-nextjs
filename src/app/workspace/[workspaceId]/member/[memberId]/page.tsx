"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberID } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import Conversation from "@/features/conversations/components/conversation";

export default function MemberIdPage() {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberID();
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const { mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    mutate(
      { workspaceId, memberId },
      {
        onSuccess(id) {
          setConversationId(id);
        },
      }
    );
  }, [memberId, mutate, workspaceId]);

  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="h-full flex flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className=" size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground"> Conversation not found</p>
      </div>
    );
  }

  return <Conversation id={conversationId} />;
}
