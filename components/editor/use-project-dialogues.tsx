"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export type ProjectDialog = "create" | "rename" | "delete" | null;

const initialProjects: MockProject[] = [
  { id: "samaai-platform", name: "Sama AI Platform", slug: "sama-ai-platform", isOwned: true },
  { id: "payments-rebuild", name: "Payments Rebuild", slug: "payments-rebuild", isOwned: true },
  { id: "commerce-platform", name: "Commerce Platform", slug: "commerce-platform", isOwned: false },
];

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}

interface ProjectDialogContextValue {
  projects: MockProject[];
  dialog: ProjectDialog;
  selectedProject: MockProject | null;
  projectName: string;
  isSubmitting: boolean;
  slugPreview: string;
  openCreateDialog: () => void;
  openRenameDialog: (project: MockProject) => void;
  openDeleteDialog: (project: MockProject) => void;
  closeDialog: () => void;
  setProjectName: (name: string) => void;
  createProject: () => Promise<void>;
  renameProject: () => Promise<void>;
  deleteProject: () => Promise<void>;
}

const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(null);

export function ProjectDialogProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(initialProjects);
  const [dialog, setDialog] = useState<ProjectDialog>(null);
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateDialog = () => {
    setSelectedProject(null);
    setProjectName("");
    setDialog("create");
  };

  const openRenameDialog = (project: MockProject) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setDialog("rename");
  };

  const openDeleteDialog = (project: MockProject) => {
    setSelectedProject(project);
    setDialog("delete");
  };

  const closeDialog = () => {
    if (!isSubmitting) {
      setDialog(null);
      setSelectedProject(null);
    }
  };

  const createProject = async () => {
    const name = projectName.trim();
    const slug = slugify(name);

    if (!name || !slug) return;

    setIsSubmitting(true);
    await Promise.resolve();
    setProjects((current) => [
      ...current,
      { id: `${slug}-${Date.now()}`, name, slug, isOwned: true },
    ]);
    setIsSubmitting(false);
    closeDialog();
  };

  const renameProject = async () => {
    const name = projectName.trim();
    const slug = slugify(name);

    if (!selectedProject || !name || !slug) return;

    setIsSubmitting(true);
    await Promise.resolve();
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? { ...project, name, slug }
          : project
      )
    );
    setIsSubmitting(false);
    closeDialog();
  };

  const deleteProject = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    await Promise.resolve();
    setProjects((current) =>
      current.filter((project) => project.id !== selectedProject.id)
    );
    setIsSubmitting(false);
    closeDialog();
  };

  const value = {
    projects,
    dialog,
    selectedProject,
    projectName,
    isSubmitting,
    slugPreview: slugify(projectName),
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setProjectName,
    createProject,
    renameProject,
    deleteProject,
  };

  return (
    <ProjectDialogContext.Provider value={value}>
      {children}
    </ProjectDialogContext.Provider>
  );
}

export function useProjectDialogues() {
  const context = useContext(ProjectDialogContext);

  if (!context) {
    throw new Error("useProjectDialogues must be used within ProjectDialogProvider");
  }

  return context;
}
