"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "../api/use-get-workspace";
import { useGetWorkspaces } from "../api/use-get-workspaces";
import { useCreateWorkSapceModal } from "../store/use-create-workspace-modal";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_open, setOpen] = useCreateWorkSapceModal();
  const { data: workspaces, isLoading: wokspacesLoading } = useGetWorkspaces();

  const { data: workspace, isLoading: woskapceLoding } = useGetWorkspace({
    id: workspaceId,
  });

  const filtetWorkspaces = workspaces?.filter(
    (work) => work?._id !== workspaceId
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-9 relative overflow-hidden bg-[#ABABAD] hover:bg-[#ABABAD]/80 text-slate-800 font-semibold text-xl">
          {woskapceLoding ? (
            <Loader2 className="animate-spin size-5 shrink-0"></Loader2>
          ) : (
            workspace?.name.charAt(0).toUpperCase()
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-64">
        <DropdownMenuItem
          onClick={() => router.push(`/workspace/${workspace?._id}`)}
          className=" cursor-pointer flex-col justify-start items-start capitalize"
        >
          {workspace?.name}
          <span className="text-xs text-muted-foreground">
            Active wrokspace
          </span>
        </DropdownMenuItem>
        {wokspacesLoading && (
          <div className="w-full flex items-center justify-center">
            <Loader2 className="size-10 animate-spin" />
          </div>
        )}
        {filtetWorkspaces?.map((work) => (
          <DropdownMenuItem
            key={work._id}
            onClick={() => router.push(`/workspace/${work?._id}`)}
            className=" cursor-pointer items-center capitalize overflow-hidden truncate"
          >
            <div className="shrink-0  size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-lg rounded-md flex items-center justify-center mr-2">
              {work?.name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate">{work?.name}</p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="size-9 relative overflow-hidden bg-[#F2F2F2] text-slate-800 font-semibold text-lg rounded-md flex items-center justify-center mr-2">
            <Plus />
          </div>
          Create a new workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
