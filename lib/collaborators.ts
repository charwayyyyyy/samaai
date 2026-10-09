import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

const CLERK_EMAIL_BATCH_SIZE = 100;

export interface ProjectCollaboratorView {
  email: string;
  displayName: string;
  imageUrl: string | null;
  createdAt: string;
  isOwner?: boolean;
}

/**
 * Loads the owner followed by collaborators, enriching entries with Clerk profiles.
 * Missing profiles use fallback names and no images; Clerk failures retain database entries.
 * The optional ownerEmail supplies an owner fallback; database errors propagate.
 */
export async function getProjectCollaborators(
  projectId: string,
  ownerId: string,
  ownerEmail?: string,
) {
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    select: { email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  let owner: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>> | null =
    null;
  const users: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]
    >
  >["data"] = [];

  try {
    const client = await clerkClient();
    owner = await client.users.getUser(ownerId);
    if (collaborators.length) {
      for (
        let start = 0;
        start < collaborators.length;
        start += CLERK_EMAIL_BATCH_SIZE
      ) {
        const batch = collaborators.slice(
          start,
          start + CLERK_EMAIL_BATCH_SIZE,
        );
        const result = await client.users.getUserList({
          emailAddress: batch.map(({ email }) => email),
          limit: CLERK_EMAIL_BATCH_SIZE,
        });
        users.push(...result.data);
      }
    }
  } catch (error) {
    // Database access data remains useful when Clerk profile enrichment is unavailable.
    console.error("Unable to enrich project collaborators with Clerk profiles.", error);
  }

  const usersByEmail = new Map(
    users.flatMap((user) =>
      user.emailAddresses.map((email) => [email.emailAddress.toLowerCase(), user]),
    ),
  );

  const collaboratorViews = collaborators.map((collaborator): ProjectCollaboratorView => {
    const user = usersByEmail.get(collaborator.email.toLowerCase());
    return {
      email: collaborator.email,
      displayName:
        user?.fullName ||
        user?.firstName ||
        user?.lastName ||
        collaborator.email,
      imageUrl: user?.imageUrl ?? null,
      createdAt: collaborator.createdAt.toISOString(),
    };
  });

  return [
    {
      email: owner?.primaryEmailAddress?.emailAddress || ownerEmail || "Project owner",
      displayName:
        owner?.fullName ||
        owner?.firstName ||
        owner?.lastName ||
        ownerEmail ||
        "Project owner",
      imageUrl: owner?.imageUrl || null,
      createdAt: new Date(0).toISOString(),
      isOwner: true,
    },
    ...collaboratorViews,
  ];
}
