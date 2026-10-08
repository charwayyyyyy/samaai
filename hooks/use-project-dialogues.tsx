"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { EditorProject } from "@/lib/project-data";

export type ProjectDialog = "create" | "rename" | "delete" | null;

interface ProjectDialogContextValue {
  projects: EditorProject[];
  dialog: ProjectDialog;
  selectedProject: EditorProject | null;
  projectName: string;
  isSubmitting: boolean;
  error: string | null;
  slugPreview: string;
  openCreateDialog: () => void;
  openRenameDialog: (project: EditorProject) => void;
  openDeleteDialog: (project: EditorProject) => void;
  closeDialog: () => void;
  setProjectName: (name: string) => void;
  createProject: () => Promise<void>;
  renameProject: () => Promise<void>;
  deleteProject: () => Promise<void>;
}

const ProjectDialogContext =
  createContext<ProjectDialogContextValue | null>(null);

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

async function requestProject(
  url: string,
  options?: RequestInit,
): Promise<{ id: string; name: string }> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const body = (await response.json()) as {
    error?: string;
    project?: { id: string; name: string };
  };

  if (!response.ok || !body.project) {
    throw new Error(body.error || "The project request failed.");
  }

  return body.project;
}

interface ProjectDialogProviderProps {
  children: ReactNode;
  initialProjects: EditorProjects;
}

export interface EditorProjects {
  owned: EditorProject[];
  shared: EditorProject[];
}

export function ProjectDialogProvider({
  children,
  initialProjects,
}: ProjectDialogProviderProps) {
  const router = useRouter();
  const localChanges = useRef(
    new Map<string, EditorProject | null>(),
  );
  const [projects, setProjects] = useState([
    ...initialProjects.owned,
    ...initialProjects.shared,
  ]);
  const [dialog, setDialog] = useState<ProjectDialog>(null);
  const [selectedProject, setSelectedProject] = useState<EditorProject | null>(
    null,
  );
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const serverProjects = [
      ...initialProjects.owned,
      ...initialProjects.shared,
    ];
    const serverProjectsById = new Map(
      serverProjects.map((project) => [project.id, project]),
    );

    for (const [projectId, localProject] of localChanges.current) {
      const serverProject = serverProjectsById.get(projectId);
      if (
        (localProject && serverProject?.name === localProject.name) ||
        (!localProject && !serverProject)
      ) {
        localChanges.current.delete(projectId);
      }
    }

    const reconciledProjects = serverProjects
      .map((project) => localChanges.current.get(project.id) ?? project)
      .filter((project): project is EditorProject => project !== null);

    for (const [projectId, localProject] of localChanges.current) {
      if (localProject && !serverProjectsById.has(projectId)) {
        reconciledProjects.unshift(localProject);
      }
    }

    setProjects(reconciledProjects);
  }, [initialProjects]);

  const openCreateDialog = () => {
    setSelectedProject(null);
    setProjectName("");
    setError(null);
    setDialog("create");
  };

  const openRenameDialog = (project: EditorProject) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setError(null);
    setDialog("rename");
  };

  const openDeleteDialog = (project: EditorProject) => {
    setSelectedProject(project);
    setError(null);
    setDialog("delete");
  };

  const closeDialog = () => {
    if (!isSubmitting) {
      setDialog(null);
      setSelectedProject(null);
      setError(null);
    }
  };

  const createProject = async () => {
    const name = projectName.trim();
    if (!name) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const project = await requestProject("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const createdProject = { ...project, slug: slugify(name), isOwned: true };
      localChanges.current.set(createdProject.id, createdProject);
      setProjects((current) => [createdProject, ...current]);
      setDialog(null);
      setSelectedProject(null);
      router.push(`/editor/${project.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The project could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renameProject = async () => {
    const name = projectName.trim();
    if (!selectedProject || !name) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const project = await requestProject(
        `/api/projects/${selectedProject.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name }),
        },
      );
      const renamedProject = {
        ...selectedProject,
        name: project.name,
        slug: slugify(project.name),
      };
      localChanges.current.set(project.id, renamedProject);
      setProjects((current) =>
        current.map((item) => (item.id === project.id ? renamedProject : item)),
      );
      setDialog(null);
      setSelectedProject(null);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The project could not be renamed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async () => {
    if (!selectedProject) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "The project could not be deleted.");
      }
      localChanges.current.set(selectedProject.id, null);
      setProjects((current) =>
        current.filter((item) => item.id !== selectedProject.id),
      );
      setDialog(null);
      setSelectedProject(null);
      router.push("/editor");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The project could not be deleted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProjectDialogContext.Provider
      value={{
        projects,
        dialog,
        selectedProject,
        projectName,
        isSubmitting,
        error,
        slugPreview: slugify(projectName),
        openCreateDialog,
        openRenameDialog,
        openDeleteDialog,
        closeDialog,
        setProjectName,
        createProject,
        renameProject,
        deleteProject,
      }}
    >
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
