"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProjectDialogues } from "@/hooks/use-project-dialogues";
import type { EditorProject } from "@/lib/project-data";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectId?: string;
}

/** Renders a project link with active-page highlighting and owner-only rename/delete actions. */
function ProjectItem({
  project,
  onRename,
  onDelete,
  activeProjectId,
}: {
  project: EditorProject;
  onRename: (project: EditorProject) => void;
  onDelete: (project: EditorProject) => void;
  activeProjectId?: string;
}) {
  return (
    <div className={`group flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-subtle ${
      project.id === activeProjectId ? "bg-subtle" : ""
    }`}>
      <Link
        aria-current={project.id === activeProjectId ? "page" : undefined}
        className="min-w-0 flex-1"
        href={`/editor/${project.id}`}
      >
        <p className="truncate text-sm text-copy-primary">{project.name}</p>
        <p className="truncate font-mono text-xs text-copy-muted">{project.slug}</p>
      </Link>
      {project.isOwned && (
        <div className="flex shrink-0 gap-1 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100">
          <Button aria-label={`Rename ${project.name}`} onClick={() => onRename(project)} size="icon-xs" variant="ghost">
            <Pencil />
          </Button>
          <Button aria-label={`Delete ${project.name}`} onClick={() => onDelete(project)} size="icon-xs" variant="ghost">
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}

/** Renders project rows with shared action callbacks and the active project marker. */
function ProjectList({
  projects,
  onRename,
  onDelete,
  activeProjectId,
}: {
  projects: EditorProject[];
  onRename: (project: EditorProject) => void;
  onDelete: (project: EditorProject) => void;
  activeProjectId?: string;
}) {
  return (
    <div className="space-y-1 px-3 py-4">
      {projects.map((project) => (
        <ProjectItem
          activeProjectId={activeProjectId}
          key={project.id}
          onDelete={onDelete}
          onRename={onRename}
          project={project}
        />
      ))}
    </div>
  );
}

/** Displays owned and shared project tabs with creation and management controls. */
export function ProjectSidebar({
  isOpen,
  onClose,
  activeProjectId,
}: ProjectSidebarProps) {
  const { projects, openCreateDialog, openRenameDialog, openDeleteDialog } =
    useProjectDialogues();
  const ownedProjects = projects.filter((project) => project.isOwned);
  const sharedProjects = projects.filter((project) => !project.isOwned);

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close project sidebar"
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        aria-hidden={!isOpen}
        aria-label="Project navigation"
        inert={!isOpen}
        className={`fixed bottom-0 left-0 top-14 z-30 flex w-80 max-w-[calc(100vw-2rem)] flex-col border-r border-surface-border bg-surface shadow-2xl transition-transform duration-200 ${
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
          <TabsContent className="min-h-0 flex-1 overflow-y-auto" value="my-projects">
            {ownedProjects.length ? <ProjectList activeProjectId={activeProjectId} onDelete={openDeleteDialog} onRename={openRenameDialog} projects={ownedProjects} /> : <p className="px-6 py-12 text-center text-sm text-copy-muted">No projects yet</p>}
          </TabsContent>
          <TabsContent className="min-h-0 flex-1 overflow-y-auto" value="shared">
            {sharedProjects.length ? <ProjectList activeProjectId={activeProjectId} onDelete={openDeleteDialog} onRename={openRenameDialog} projects={sharedProjects} /> : <p className="px-6 py-12 text-center text-sm text-copy-muted">No shared projects yet</p>}
          </TabsContent>
        </Tabs>
        <div className="border-t border-surface-border p-4">
          <Button className="w-full" onClick={openCreateDialog}>
            <Plus />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
