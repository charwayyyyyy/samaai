import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";
import { EditorLayout } from "@/components/editor/editor-layout";
import { getEditorProjects } from "@/lib/project-data";
import {
  getCurrentIdentity,
  getProjectForIdentity,
} from "@/lib/project-access";

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

/**
 * Loads the accessible workspace and project list for the requested room.
 * Redirects signed-out visitors and renders access denied for unavailable projects.
 */
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
      <CollaborativeCanvas roomId={project.id} />
    </EditorLayout>
  );
}
