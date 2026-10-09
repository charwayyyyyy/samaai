import { NextResponse } from "next/server";

import { getProjectCollaborators } from "@/lib/collaborators";
import {
  getCurrentIdentity,
  getProjectForIdentity,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { isJsonObject, jsonError, readJsonBody } from "@/lib/project-api";

interface CollaboratorRouteContext {
  params: Promise<{ projectId: string }>;
}

async function getProjectAccess(projectId: string) {
  const identity = await getCurrentIdentity();
  if (!identity) return null;
  return {
    identity,
    project: await getProjectForIdentity(projectId, identity),
  };
}

export async function GET(
  _request: Request,
  context: CollaboratorRouteContext,
) {
  const access = await getProjectAccess((await context.params).projectId);
  if (!access) return jsonError("Authentication required.", 401);
  const { identity, project } = access;
  if (!project) return jsonError("Project not found.", 404);

  const isOwner = project.ownerId === identity.userId;
  let collaborators;

  try {
    collaborators = await getProjectCollaborators(
      project.id,
      project.ownerId,
      identity.email,
    );
  } catch (error) {
    console.error("Unable to load project collaborators.", error);
    collaborators = isOwner
      ? [
          {
            email: identity.email || "Project owner",
            displayName: identity.email || "Project owner",
            imageUrl: null,
            createdAt: new Date(0).toISOString(),
            isOwner: true,
          },
        ]
      : [];
  }

  return NextResponse.json({
    collaborators,
    isOwner,
  });
}

export async function POST(
  request: Request,
  context: CollaboratorRouteContext,
) {
  const access = await getProjectAccess((await context.params).projectId);
  if (!access) return jsonError("Authentication required.", 401);
  const { identity, project } = access;
  if (!project) return jsonError("Project not found.", 404);
  if (project.ownerId !== identity.userId) {
    return jsonError("Only the project owner can invite collaborators.", 403);
  }

  const body = await readJsonBody(request);
  if (!isJsonObject(body) || typeof body.email !== "string") {
    return jsonError("A collaborator email is required.", 400);
  }

  const email = body.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return jsonError("Enter a valid collaborator email.", 400);
  }

  const collaborator = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId: project.id, email } },
    create: { projectId: project.id, email },
    update: {},
  });

  return NextResponse.json({ collaborator }, { status: 201 });
}

export async function DELETE(
  request: Request,
  context: CollaboratorRouteContext,
) {
  const access = await getProjectAccess((await context.params).projectId);
  if (!access) return jsonError("Authentication required.", 401);
  const { identity, project } = access;
  if (!project) return jsonError("Project not found.", 404);
  if (project.ownerId !== identity.userId) {
    return jsonError("Only the project owner can remove collaborators.", 403);
  }

  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) return jsonError("A collaborator email is required.", 400);

  await prisma.projectCollaborator.deleteMany({
    where: { projectId: project.id, email },
  });

  return new NextResponse(null, { status: 204 });
}
