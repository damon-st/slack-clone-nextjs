import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import React from "react";

type Props = {
  count?: number;
  image?: string;
  timestamp?: number;
  onClick?: () => void;
  name?: string;
};

export default function ThreadBar({
  count,
  image,
  onClick,
  timestamp,
  name = "Member",
}: Props) {
  if (!count || !timestamp) {
    return null;
  }
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      type="button"
      className="p-1 rounded-md hover:bg-white border border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar>
          <AvatarImage src={image} />
          <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-xs text-sky-700 hover:underline font-bold truncate">
          {count} {count > 1 ? "replies" : "reply"}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block">
          Last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden">
          View thread
        </span>
      </div>

      <ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
    </Button>
  );
}
