import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface CurrentIdentity {
  userId: string;
  email: string | undefined;
}

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase();
}

export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: normalizeEmail(user.primaryEmailAddress?.emailAddress),
  };
}

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
