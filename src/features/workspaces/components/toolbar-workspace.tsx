"use client";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Info, Search } from "lucide-react";
import { useGetWorkspace } from "../api/use-get-workspace";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useState } from "react";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useRouter } from "next/navigation";

export default function ToolbarWorkspace() {
  const workspaceId = useWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });
  const { push } = useRouter();

  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const [open, setOpen] = useState(false);

  const onChanngelClick = (id: string) => {
    setOpen(false);
    push(`/workspace/${workspaceId}/channel/${id}`);
  };
  const onMemberClick = (id: string) => {
    setOpen(false);
    push(`/workspace/${workspaceId}/member/${id}`);
  };

  return (
    <div className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-w-[642px] grow-[2] shrink">
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2"
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-white text-xs">Search {data?.name}</span>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Channels">
              {channels?.map((channel) => (
                <CommandItem
                  key={channel._id}
                  onSelect={() => onChanngelClick(channel._id)}
                >
                  <span>{channel.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {members?.map((meber) => (
                <CommandItem
                  key={meber._id}
                  onSelect={() => onMemberClick(meber._id)}
                >
                  <span>{meber.user.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button type="button" size="iconSm" variant="transparent">
          <Info className="size-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
