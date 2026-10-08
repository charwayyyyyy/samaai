import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { EditorLayout } from "@/components/editor/editor-layout";
import { getEditorProject, getEditorProjects } from "@/lib/project-data";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await currentUser();
  const { projectId } = await params;
  const userId = user?.id ?? "";
  const email = user?.primaryEmailAddress?.emailAddress;
  const project = await getEditorProject(projectId, userId, email);

  if (!project) {
    notFound();
  }

  const initialProjects = await getEditorProjects(userId, email);

  return (
    <EditorLayout initialProjects={initialProjects}>
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copy-muted">
            Room {project.id}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-copy-primary">
            {project.name}
          </h1>
          <p className="mt-3 text-sm text-copy-muted">
            Your architecture workspace is ready.
          </p>
        </div>
      </div>
    </EditorLayout>
  );
}
