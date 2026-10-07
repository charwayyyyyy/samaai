"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProjectDialogues } from "@/components/editor/use-project-dialogues";

export function ProjectDialogues() {
  const {
    dialog,
    selectedProject,
    projectName,
    isSubmitting,
    slugPreview,
    closeDialog,
    setProjectName,
    createProject,
    renameProject,
    deleteProject,
  } = useProjectDialogues();

  return (
    <>
      <Dialog open={dialog === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="text-copy-primary">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void createProject();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-copy-primary">Create Project</DialogTitle>
              <DialogDescription className="text-copy-secondary">
                Give your architecture workspace a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <label className="text-sm font-medium text-copy-primary" htmlFor="create-project-name">
                Project name
              </label>
              <Input
                autoFocus
                className="text-copy-primary placeholder:text-copy-muted"
                id="create-project-name"
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="My new project"
                value={projectName}
              />
              <p className="text-xs text-copy-muted">
                Slug: <span className="font-mono text-copy-secondary">{slugPreview || "project-slug"}</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={closeDialog} type="button" variant="ghost">
                Cancel
              </Button>
              <Button disabled={!projectName.trim() || isSubmitting} type="submit">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rename"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="text-copy-primary">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void renameProject();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-copy-primary">Rename Project</DialogTitle>
              <DialogDescription className="text-copy-secondary">
                Rename <span className="font-medium text-copy-secondary">{selectedProject?.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="sr-only" htmlFor="rename-project-name">
                Project name
              </label>
              <Input
                autoFocus
                className="text-copy-primary placeholder:text-copy-muted"
                id="rename-project-name"
                onChange={(event) => setProjectName(event.target.value)}
                value={projectName}
              />
            </div>
            <DialogFooter>
              <Button onClick={closeDialog} type="button" variant="ghost">
                Cancel
              </Button>
              <Button disabled={!projectName.trim() || isSubmitting} type="submit">
                Rename Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="text-copy-primary">
          <DialogHeader>
            <DialogTitle className="text-copy-primary">Delete Project</DialogTitle>
            <DialogDescription className="text-copy-secondary">
              Delete <span className="font-medium text-copy-secondary">{selectedProject?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeDialog} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={() => void deleteProject()} variant="destructive">
              <Trash2 />
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
