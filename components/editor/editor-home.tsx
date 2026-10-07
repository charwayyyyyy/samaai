"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectDialogues } from "@/components/editor/use-project-dialogues";

export function EditorHome() {
  const { openCreateDialog } = useProjectDialogues();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="mt-3 text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button className="mt-6" onClick={openCreateDialog}>
        <Plus />
        New Project
      </Button>
    </div>
  );
}
