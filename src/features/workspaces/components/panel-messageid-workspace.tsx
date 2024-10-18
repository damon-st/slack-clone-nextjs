"use client";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import Thread from "@/features/messages/components/thread";
import ProfileMember from "@/features/members/components/profilex";

export default function PanelMessageIdWorkspace() {
  const { parentMessageId, onClose, profileMemberId } = usePanel();

  const showPanel = !!parentMessageId || !!profileMemberId;

  if (!showPanel) return null;
  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={20} defaultSize={29}>
        {parentMessageId ? (
          <Thread
            messageId={parentMessageId as Id<"messages">}
            onClose={onClose}
          />
        ) : profileMemberId ? (
          <ProfileMember
            memberId={profileMemberId as Id<"members">}
            onClose={onClose}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader className="size-5 animate-spin to-muted-foreground" />
          </div>
        )}
      </ResizablePanel>
    </>
  );
}
