import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface CurrentIdentity {
  userId: string;
  email: string | undefined;
}

/** Returns the Clerk user's ID and optional primary email, or null when signed out. */
export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.primaryEmailAddress?.emailAddress,
  };
}

/**
 * Returns project metadata when the identity owns it or its email is a collaborator.
 * Returns null for a missing project or an identity without access.
 */
export async function getProjectForIdentity(
  roomId: string,
  identity: CurrentIdentity,
) {
  return prisma.project.findFirst({
    where: {
      id: roomId,
      OR: [
        { ownerId: identity.userId },
        ...(identity.email
          ? [{ collaborators: { some: { email: identity.email } } }]
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
