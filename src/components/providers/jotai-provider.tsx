"use client";

import { Provider } from "jotai";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function JotaiProvider({ children }: Props) {
  return <Provider>{children}</Provider>;
}
