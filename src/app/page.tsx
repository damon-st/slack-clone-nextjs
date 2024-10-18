"use client";
import { UserButton } from "@/features/auth/components/user-button";
import { useCreateWorkSapceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { replace } = useRouter();
  const [open, setOpen] = useCreateWorkSapceModal();
  const { data, isLoading } = useGetWorkspaces();
  const worksPaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;
    if (worksPaceId) {
      replace(`/workspace/${worksPaceId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [isLoading, open, replace, setOpen, worksPaceId]);

  return (
    <div>
      <UserButton />
    </div>
  );
}
