"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
}: EditorNavbarProps) {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-surface-border bg-surface">
      <div className="flex w-1/3 items-center px-3">
        <Button
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          onClick={onSidebarToggle}
          size="icon"
          variant="ghost"
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
      </div>
      <div className="flex w-1/3 items-center justify-center" />
      <div className="flex w-1/3 items-center justify-end px-3">
        <UserButton />
      </div>
    </nav>
  );
}
