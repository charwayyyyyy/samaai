import { prisma } from "@/lib/prisma";

export interface EditorProject {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export interface EditorProjects {
  owned: EditorProject[];
  shared: EditorProject[];
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase();
}

function toEditorProject(
  project: { id: string; name: string },
  isOwned: boolean,
): EditorProject {
  return {
    id: project.id,
    name: project.name,
    slug: slugify(project.name),
    isOwned,
  };
}

export async function getEditorProjects(
  userId: string,
  email?: string,
): Promise<EditorProjects> {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        ...(normalizeEmail(email)
          ? [{ collaborators: { some: { email: normalizeEmail(email) } } }]
          : []),
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    owned: projects
      .filter((project) => project.ownerId === userId)
      .map((project) => toEditorProject(project, true)),
    shared: projects
      .filter((project) => project.ownerId !== userId)
      .map((project) => toEditorProject(project, false)),
  };
}

export async function getEditorProject(
  projectId: string,
  userId: string,
  email?: string,
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        ...(normalizeEmail(email)
          ? [{ collaborators: { some: { email: normalizeEmail(email) } } }]
          : []),
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });
}
