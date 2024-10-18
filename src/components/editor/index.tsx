"use client";
import Quill, { QuillOptions } from "quill";
import { MdSend } from "react-icons/md";
import "quill/dist/quill.snow.css";
import {
  ChangeEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { PiTextAa } from "react-icons/pi";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import Hint from "../hint";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import EmojiPopover from "../emoji-popover";
import Image from "next/image";

type EditorValue = {
  image: File | null;
  body: string;
};

type Props = {
  variant?: "create" | "update";
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
};

export default function Editor({
  variant = "create",
  onSubmit,
  placeholder = "Write something...",
  defaultValue = [],
  disabled = false,
  innerRef,
  onCancel,
}: Props) {
  const continerRef = useRef<HTMLDivElement | null>(null);

  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageElementRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState("");

  const [image, setImage] = useState<File | null>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!continerRef.current) return;

    const container = continerRef.current;
    const editorContaienr = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [
            {
              list: "ordered",
            },
            { list: "bullet" },
          ],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;
                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                if (isEmpty) return;
                const body = JSON.stringify(quill.getContents());
                submitRef.current?.({ body, image: addedImage });
                return;
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };
    const quill = new Quill(editorContaienr, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  const toogleToolbar = useCallback(() => {
    setIsToolbarVisible((c) => !c);
    const toolbarElement = continerRef.current?.querySelector(".ql-toolbar");
    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emojiSelect = useCallback((emoji: any) => {
    const quill = quillRef.current;
    quill?.insertText(quill?.getSelection()?.index ?? 0, emoji.native);
  }, []);

  const handleChangeIamge = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImage(e.target.files![0]);
  }, []);

  const handleClickImage = useCallback(() => {
    imageElementRef.current?.click();
  }, []);

  const handleClearImage = useCallback(() => {
    setImage(null);
    imageElementRef.current!.value = "";
  }, []);

  const imageUrlSelected = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image);
  }, [image]);

  const handleSubmit = useCallback(() => {
    onSubmit({
      body: JSON.stringify(quillRef.current?.getContents()),
      image: image,
    });
  }, [image, onSubmit]);

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageElementRef}
        onChange={handleChangeIamge}
        className="hidden"
      />
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          disabled && "opacity-50"
        )}
      >
        <div ref={continerRef} className="h-full ql-custom"></div>
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  onClick={handleClearImage}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>
              <Image
                src={imageUrlSelected}
                fill
                alt="Uploaded"
                className="rounded-xl overflow-hidden border object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              onClick={toogleToolbar}
              disabled={disabled}
              size="iconSm"
              variant="ghost"
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelected={emojiSelect}>
            <Button
              type="button"
              disabled={disabled}
              size="iconSm"
              variant="ghost"
            >
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant == "create" && (
            <Hint label="Image">
              <Button
                onClick={handleClickImage}
                disabled={disabled}
                size="iconSm"
                variant="ghost"
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant == "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                onClick={handleSubmit}
                size="sm"
                className="ml-auto bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
          {variant == "create" && (
            <Button
              onClick={handleSubmit}
              size="iconSm"
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
              disabled={disabled || isEmpty}
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {variant == "create" && (
        <div
          className={cn(
            "p-2 text-[10px] flex justify-end opacity-0 transition",
            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shint + Return</strong> to add a new Line
          </p>
        </div>
      )}
    </div>
  );
}
