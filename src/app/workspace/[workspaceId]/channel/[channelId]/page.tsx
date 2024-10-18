"use client";

import MessageList from "@/components/message-list";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import ChatInputChannel from "@/features/channels/components/chat-input-channel";
import HeaderChannel from "@/features/channels/components/header-channel";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useChannelID } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import React from "react";

export default function ChannelIdPage() {
  const channelId = useChannelID();

  const { results, status, loadMore } = useGetMessages({ channelId });

  const { data: channel, isLoading: channelLoading } = useGetChannel({
    id: channelId,
  });

  if (channelLoading || status == "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className=" size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <HeaderChannel title={channel.name} />
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLodingMore={status == "LoadingMore"}
        canLoadMore={status == "CanLoadMore"}
      />
      <ChatInputChannel placeholder={`Message # ${channel?.name}`} />
    </div>
  );
}
