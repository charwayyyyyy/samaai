"use client";

import { useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogues } from "@/components/editor/project-dialogues";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  ProjectDialogProvider,
  type EditorProjects,
} from "@/hooks/use-project-dialogues";

interface EditorLayoutProps {
  children: ReactNode;
  initialProjects: EditorProjects;
}

export function EditorLayout({ children, initialProjects }: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProjectDialogProvider initialProjects={initialProjects}>
      <div className="min-h-screen bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-h-screen pt-14">{children}</main>
        <ProjectDialogues />
      </div>
    </ProjectDialogProvider>
  );
}
