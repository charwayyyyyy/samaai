import { NextResponse } from "next/server";

import { getProjectCollaborators } from "@/lib/collaborators";
import {
  getCurrentIdentity,
  getProjectForIdentity,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { isJsonObject, jsonError, readJsonBody } from "@/lib/project-api";

interface CollaboratorRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Resolves the signed-in identity and the project it can access.
 * Returns null when signed out, or a null project when access is unavailable.
 */
async function getProjectAccess(projectId: string) {
  const identity = await getCurrentIdentity();
  if (!identity) return null;
  return {
    identity,
    project: await getProjectForIdentity(projectId, identity),
  };
}

/**
 * Lists project access entries for an authenticated owner or collaborator.
 * Falls back to the owner's identity (or an empty list for collaborators) if loading fails.
 */
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

/**
 * Grants collaborator access by email after authenticating the project owner.
 * Normalizes and validates the email, then returns the existing or created record.
 */
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

  let storedEmail = email;
  try {
    const client = await clerkClient();
    const matchingUsers = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });
    const primaryEmail =
      matchingUsers.data[0]?.primaryEmailAddress?.emailAddress;
    if (primaryEmail) {
      storedEmail = primaryEmail.trim().toLowerCase();
    }
  } catch (error) {
    console.error("Unable to resolve invited collaborator profile.", error);
  }

  const collaborator = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId: project.id, email: storedEmail } },
    create: { projectId: project.id, email: storedEmail },
    update: {},
  });

  return NextResponse.json({ collaborator }, { status: 201 });
}

/**
 * Removes access for the email query parameter after authenticating the owner.
 * Returns an empty 204 response even when no matching collaborator exists.
 */
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
