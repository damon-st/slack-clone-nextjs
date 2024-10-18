"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { Loader2, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export const UserButton = () => {
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();

  const handleLogout = () => {
    signOut().then(() => {
      window.location.reload();
    });
  };

  if (isLoading) {
    return (
      <Loader2 className="animate-spin text-muted-foreground size-8"></Loader2>
    );
  }
  if (!data) {
    return null;
  }

  const { name, image } = data;

  const avatarFallBack = name?.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="rounded-md size-10 hover:opacity-75 transition">
          <AvatarImage className="rounded-md" alt={name} src={image} />
          <AvatarFallback className="rounded-md bg-sky-500 text-white">
            {avatarFallBack}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60">
        <DropdownMenuItem onClick={handleLogout} className="h-10">
          <LogOut className="size-4 mr-2" /> Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
