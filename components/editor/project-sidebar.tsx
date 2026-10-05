"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function EmptyProjectsState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-copy-muted">
      No projects yet
    </div>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="Project navigation"
      className={`fixed bottom-0 left-0 top-14 z-30 flex w-80 flex-col border-r border-surface-border bg-surface shadow-2xl transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-surface-border px-4">
        <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
        <Button aria-label="Close project sidebar" onClick={onClose} size="icon" variant="ghost">
          <X />
        </Button>
      </div>

      <Tabs className="flex min-h-0 flex-1" defaultValue="my-projects">
        <TabsList className="mx-4 mt-4 w-auto shrink-0 bg-subtle">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent className="flex min-h-0 flex-1" value="my-projects">
          <EmptyProjectsState />
        </TabsContent>
        <TabsContent className="flex min-h-0 flex-1" value="shared">
          <EmptyProjectsState />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full" variant="default">
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  );
}
