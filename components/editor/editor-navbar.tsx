"use client";

import {
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName?: string;
  isAISidebarOpen?: boolean;
  onAIToggle?: () => void;
  onShare?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  isAISidebarOpen = false,
  onAIToggle,
  onShare,
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
      <div className="flex min-w-0 flex-1 items-center justify-center">
        {projectName && (
          <p className="truncate px-4 text-sm font-medium text-copy-primary">
            {projectName}
          </p>
        )}
      </div>
      <div className="flex w-1/3 items-center justify-end px-3">
        {projectName && (
          <>
            <Button
              aria-label="Share project"
              className="gap-2 text-copy-primary"
              onClick={onShare}
              variant="outline"
            >
              <Share2 />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              aria-label={isAISidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              className="ml-2 gap-2 bg-brand text-base hover:bg-brand/80"
              onClick={onAIToggle}
              variant="default"
            >
              <Bot />
              <span className="hidden sm:inline">AI</span>
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </nav>
  );
}
