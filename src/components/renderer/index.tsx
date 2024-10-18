"use client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
};

export default function Renderer({ value }: Props) {
  const [isEmpty, setIsEmpty] = useState(false);
  const renderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!renderRef.current) return;
    const container = renderRef.current;
    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });
    quill.enable(false);
    const contents = JSON.parse(value);
    quill.setContents(contents);
    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, "")
        .trim().length === 0;
    setIsEmpty(isEmpty);
    container.innerHTML = quill.root.innerHTML;
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [value]);

  return <div ref={renderRef} className="ql-editor ql-renderer"></div>;
}
