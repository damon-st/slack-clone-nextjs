"use client";
import { UserButton } from "@/features/auth/components/user-button";
import WorkspaceSwitcher from "./workspace-switcher";
import SidebarButtonWorkspace from "./sidebar-button-workspace";
import { Bell, Home, MessagesSquare, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

export default function SidebarWorkspace() {
  const pathname = usePathname();
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-[4px]">
      <WorkspaceSwitcher />
      <SidebarButtonWorkspace
        icon={Home}
        label="Home"
        isActive={pathname.includes("/workspace")}
      />
      <SidebarButtonWorkspace icon={MessagesSquare} label="DMs" />
      <SidebarButtonWorkspace icon={Bell} label="Activity" />
      <SidebarButtonWorkspace icon={MoreHorizontal} label="More" />
      <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
        <UserButton />
      </div>
    </aside>
  );
}