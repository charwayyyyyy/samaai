import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getProjectName,
  isJsonObject,
  jsonError,
  readJsonBody,
} from "@/lib/project-api";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return { response: jsonError("Project not found.", 404) };
  }

  if (project.ownerId !== userId) {
    return { response: jsonError("Only the project owner can modify it.", 403) };
  }

  return { project };
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Authentication required.", 401);
  }

  const { projectId } = await context.params;
  const ownership = await getOwnedProject(projectId, userId);

  if ("response" in ownership) {
    return ownership.response;
  }

  const body = await readJsonBody(request);
  if (!isJsonObject(body)) {
    return jsonError("Request body must be a JSON object.", 400);
  }

  const name = getProjectName(body.name, "");

  if (!name) {
    return jsonError("Project name must be a non-empty string.", 400);
  }

  const project = await prisma.project.update({
    where: { id: ownership.project.id },
    data: { name },
  });

  return NextResponse.json({ project });
}

export async function DELETE(
  _request: Request,
  context: ProjectRouteContext,
) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Authentication required.", 401);
  }

  const { projectId } = await context.params;
  const ownership = await getOwnedProject(projectId, userId);

  if ("response" in ownership) {
    return ownership.response;
  }

  await prisma.project.delete({
    where: { id: ownership.project.id },
  });

  return new NextResponse(null, { status: 204 });
}
