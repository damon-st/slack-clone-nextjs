import SidebarWorkspace from "@/features/workspaces/components/sidebar-workspace";
import ToolbarWorkspace from "@/features/workspaces/components/toolbar-workspace";
import { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceSidebar from "@/features/workspaces/components/workspace-sidebar";
import PanelMessageIdWorkspace from "@/features/workspaces/components/panel-messageid-workspace";

type Props = {
  children: ReactNode;
};

export default function WorkspaceIdLayout({ children }: Props) {
  return (
    <div className="h-full">
      <ToolbarWorkspace />
      <div className="flex h-[calc(100vh-40px)]">
        <SidebarWorkspace />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="ca-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20} defaultSize={80}>
            {children}
          </ResizablePanel>
          <PanelMessageIdWorkspace />
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
