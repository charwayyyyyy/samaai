import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorLayout } from "@/components/editor/editor-layout";
import { getEditorProjects } from "@/lib/project-data";
import {
  getCurrentIdentity,
  getProjectForIdentity,
} from "@/lib/project-access";

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

  const { roomId } = await params;
  const project = await getProjectForIdentity(roomId, identity);

  if (!project) {
    return <AccessDenied />;
  }

  const initialProjects = await getEditorProjects(
    identity.userId,
    identity.email,
  );

  return (
    <EditorLayout
      activeProjectId={project.id}
      initialProjects={initialProjects}
      projectName={project.name}
    >
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-base px-6 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copy-muted">
            Room {project.id}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-copy-primary">
            Canvas workspace
          </h1>
          <p className="mt-3 text-sm text-copy-muted">
            The collaborative canvas will appear here.
          </p>
        </div>
      </div>
    </EditorLayout>
  );
}
