"use client";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-28 bg-gray-300 rounded-md" />,
});

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

type Props = {
  children: ReactNode;
  hint?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEmojiSelected: (emoji: any) => void;
};

export default function EmojiPopover({
  children,
  onEmojiSelected,
  hint = "Emoji",
}: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelect = (emoji: any) => {
    onEmojiSelected({ ...emoji, native: emoji?.emoji });
    setPopoverOpen(false);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 500);
  };

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={setTooltipOpen}
          delayDuration={50}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className="bg-black text-white border-white/5">
            <p className="font-medium text-xs">{hint}</p>
          </TooltipContent>
        </Tooltip>
        l8hl3r
        <PopoverContent className="p-0 w-full border-none shadow-none">
          <EmojiPicker lazyLoadEmojis onEmojiClick={onSelect} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
