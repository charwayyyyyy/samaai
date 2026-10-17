"use client";

import { useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogues } from "@/components/editor/project-dialogues";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialogue } from "@/components/editor/share-dialogue";
import { StarterTemplatesProvider, useStarterTemplates } from "@/components/editor/starter-templates-modal";
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

/**
 * Wraps editor content with project dialogs, navigation, and sidebar state.
 * Adds sharing controls and the AI placeholder when project context is supplied.
 */
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
      <StarterTemplatesProvider>
        <EditorLayoutContent
          activeProjectId={activeProjectId}
          isAISidebarOpen={isAISidebarOpen}
          isSidebarOpen={isSidebarOpen}
          onAIToggle={() => setIsAISidebarOpen((open) => !open)}
          onShare={() => setIsShareDialogOpen(true)}
          onSidebarClose={() => setIsSidebarOpen(false)}
          onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
          projectName={projectName}
          isShareDialogOpen={isShareDialogOpen}
          setIsShareDialogOpen={setIsShareDialogOpen}
        >
          {children}
        </EditorLayoutContent>
      </StarterTemplatesProvider>
    </ProjectDialogProvider>
  );
}

interface EditorLayoutContentProps {
  children: ReactNode;
  activeProjectId?: string;
  projectName?: string;
  isSidebarOpen: boolean;
  isAISidebarOpen: boolean;
  isShareDialogOpen: boolean;
  onSidebarToggle: () => void;
  onAIToggle: () => void;
  onShare: () => void;
  onSidebarClose: () => void;
  setIsShareDialogOpen: (open: boolean) => void;
}

/**
 * Renders the editor navbar, sidebar, share dialog, and AI placeholder,
 * wiring the starter templates action into the navbar.
 */
function EditorLayoutContent({
  activeProjectId,
  children,
  isAISidebarOpen,
  isShareDialogOpen,
  isSidebarOpen,
  onAIToggle,
  onShare,
  onSidebarClose,
  onSidebarToggle,
  projectName,
  setIsShareDialogOpen,
}: EditorLayoutContentProps) {
  const { openTemplates } = useStarterTemplates();

  return (
    <div className="overflow-hidden bg-base" style={{ height: "100dvh" }}>
      <EditorNavbar
        isAISidebarOpen={isAISidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onAIToggle={onAIToggle}
        onShare={onShare}
        onSidebarToggle={onSidebarToggle}
        onStarterTemplates={openTemplates}
        projectName={projectName}
      />
      <ProjectSidebar
        activeProjectId={activeProjectId}
        isOpen={isSidebarOpen}
        onClose={onSidebarClose}
      />
      {projectName && activeProjectId && (
        <ShareDialogue
          onOpenChange={setIsShareDialogOpen}
          open={isShareDialogOpen}
          projectId={activeProjectId}
        />
      )}
      <main className="min-w-0 overflow-hidden pt-14" style={{ height: "100dvh" }}>
        {children}
      </main>
      {projectName && (
        <aside
          aria-hidden={!isAISidebarOpen}
          className={`fixed bottom-0 right-0 top-14 z-30 w-80 border-l border-surface-border bg-surface transition-transform duration-200 ${
            isAISidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-b border-surface-border px-4 py-4">
            <h2 className="text-sm font-medium text-copy-primary">AI assistant</h2>
          </div>
          <p className="px-4 py-6 text-sm text-copy-muted">
            AI chat will be available here.
          </p>
        </aside>
      )}
      <ProjectDialogues />
    </div>
  );
}
