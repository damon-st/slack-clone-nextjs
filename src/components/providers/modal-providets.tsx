"use client";

import CreateChannelModal from "@/features/channels/components/create-channel-modal";
import CreateWorkSpaceModal from "@/features/workspaces/components/create-workspace-modal";
import { useEffect, useState } from "react";

export default function ModalProviders() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CreateWorkSpaceModal />
      <CreateChannelModal />
    </>
  );
}
