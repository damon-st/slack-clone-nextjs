import { useMemberID } from "@/hooks/use-member-id";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { Loader } from "lucide-react";
import HeaderConversation from "./header-conversation";
import ChatInputConversation from "./chat-input-conversation";
import MessageList from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";

type Props = {
  id: Id<"conversations">;
};

export default function Conversation({ id }: Props) {
  const memberId = useMemberID();
  const { data: member, isLoading: memberLoading } = useGetMember({
    id: memberId,
  });

  const { onOpenProfile } = usePanel();

  const { loadMore, results, status } = useGetMessages({ conversationId: id });

  if (memberLoading || status == "LoadingFirstPage") {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <HeaderConversation
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(member!._id)}
      />
      <MessageList
        data={results}
        variant="conversations"
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLodingMore={status == "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInputConversation
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />
    </div>
  );
}
