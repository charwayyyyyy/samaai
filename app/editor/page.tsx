import { currentUser } from "@clerk/nextjs/server";

import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorHome } from "@/components/editor/editor-home";
import { getEditorProjects } from "@/lib/project-data";

export default async function EditorPage() {
  const user = await currentUser();
  const initialProjects = await getEditorProjects(
    user?.id ?? "",
    user?.primaryEmailAddress?.emailAddress,
  );

  return (
    <EditorLayout initialProjects={initialProjects}>
      <EditorHome />
    </EditorLayout>
  );
}
