import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getEditorProjects } from "@/lib/project-data";
import { prisma } from "@/lib/prisma";
import {
  getProjectName,
  isJsonObject,
  jsonError,
  readJsonBody,
} from "@/lib/project-api";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Authentication required.", 401);
  }

  const user = await currentUser();
  const projects = await getEditorProjects(
    userId,
    user?.primaryEmailAddress?.emailAddress,
  );

  return NextResponse.json({
    projects: [...projects.owned, ...projects.shared],
    ownedProjects: projects.owned,
    sharedProjects: projects.shared,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Authentication required.", 401);
  }

  const body = await readJsonBody(request);
  if (!isJsonObject(body)) {
    return jsonError("Request body must be a JSON object.", 400);
  }

  const name = getProjectName(body.name);

  if (!name) {
    return jsonError("Project name must be a string.", 400);
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
