import EmojiPopover from "@/components/emoji-popover";
import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  MessageSquareTextIcon,
  PencilIcon,
  SmileIcon,
  Trash,
} from "lucide-react";
import React from "react";

type Props = {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton?: boolean;
};

export default function ToolbarMessage({
  handleDelete,
  handleEdit,
  handleReaction,
  handleThread,
  isAuthor,
  isPending,
  hideThreadButton,
}: Props) {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelected={(e) => handleReaction(e.native)}
        >
          <Button
            variant="ghost"
            size="iconSm"
            disabled={isPending}
            type="button"
          >
            <SmileIcon className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              onClick={handleThread}
              variant="ghost"
              size="iconSm"
              disabled={isPending}
              type="button"
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit message">
              <Button
                onClick={handleEdit}
                variant="ghost"
                size="iconSm"
                disabled={isPending}
                type="button"
              >
                <PencilIcon className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete message">
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="iconSm"
                disabled={isPending}
                type="button"
              >
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}
