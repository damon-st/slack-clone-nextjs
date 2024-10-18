"use client";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "../api/use-get-workspace";
import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import WorkspaceHeader from "./workspace-header";
import SidebarItem from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import WorkSpaceSection from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-members";
import UserItem from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useChannelID } from "@/hooks/use-channel-id";
import { useMemberID } from "@/hooks/use-member-id";

export default function WorkspaceSidebar() {
  const workspaceid = useWorkspaceId();
  const channelId = useChannelID();
  const memberId = useMemberID();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId: workspaceid,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceid,
  });

  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId: workspaceid,
  });

  const { data: members } = useGetMembers({ workspaceId: workspaceid });

  if (workspaceLoading || memberLoading || channelsLoading) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader className="animate-spin size-5 text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className=" size-5 text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-[#5E2C5F]">
      <WorkspaceHeader
        isAdmin={member.role === "admin"}
        workspace={workspace}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SidebarItem label="Drafts & Sent" icon={SendHorizonal} id="drafts" />
      </div>
      <WorkSpaceSection
        label="Channels"
        hint="New channel"
        onNew={member.role == "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            icon={HashIcon}
            key={item._id}
            label={item.name}
            id={item._id}
            variant={channelId == item._id ? "active" : "default"}
          />
        ))}
      </WorkSpaceSection>
      <WorkSpaceSection
        label="Direct Messages"
        hint="New Direct Message"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            label={item.user.name}
            image={item.user.image}
            variant={memberId == item._id ? "active" : "default"}
          />
        ))}
      </WorkSpaceSection>
    </div>
  );
}
