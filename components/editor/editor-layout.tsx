"use client";

import { useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogues } from "@/components/editor/project-dialogues";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialogue } from "@/components/editor/share-dialogue";
import {
  ProjectDialogProvider,
  type EditorProjects,
} from "@/hooks/use-project-dialogues";

interface EditorLayoutProps {
  children: ReactNode;
  initialProjects: EditorProjects;
  activeProjectId?: string;
  projectName?: string;
}

export function EditorLayout({
  children,
  initialProjects,
  activeProjectId,
  projectName,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <ProjectDialogProvider initialProjects={initialProjects}>
      <div className="min-h-screen bg-base">
        <EditorNavbar
          isAISidebarOpen={isAISidebarOpen}
          isSidebarOpen={isSidebarOpen}
          onAIToggle={() => setIsAISidebarOpen((open) => !open)}
          onShare={() => setIsShareDialogOpen(true)}
          onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
          projectName={projectName}
        />
        <ProjectSidebar
          activeProjectId={activeProjectId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        {projectName && activeProjectId && (
          <ShareDialogue
            onOpenChange={setIsShareDialogOpen}
            open={isShareDialogOpen}
            projectId={activeProjectId}
          />
        )}
        <main className="min-h-screen pt-14">{children}</main>
        {projectName && (
          <aside
            aria-hidden={!isAISidebarOpen}
            className={`fixed bottom-0 right-0 top-14 z-30 w-80 border-l border-surface-border bg-surface transition-transform duration-200 ${
              isAISidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="border-b border-surface-border px-4 py-4">
              <h2 className="text-sm font-medium text-copy-primary">
                AI assistant
              </h2>
            </div>
            <p className="px-4 py-6 text-sm text-copy-muted">
              AI chat will be available here.
            </p>
          </aside>
        )}
        <ProjectDialogues />
      </div>
    </ProjectDialogProvider>
  );
}
