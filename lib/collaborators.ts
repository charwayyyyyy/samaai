import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface ProjectCollaboratorView {
  email: string;
  displayName: string;
  imageUrl: string | null;
  createdAt: string;
  isOwner?: boolean;
}

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
  let users: { data: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>>["data"] } = {
    data: [],
  };

  try {
    const client = await clerkClient();
    owner = await client.users.getUser(ownerId);
    if (collaborators.length) {
      users = await client.users.getUserList({
        emailAddress: collaborators.map(({ email }) => email),
        limit: collaborators.length,
      });
    }
  } catch (error) {
    // Database access data remains useful when Clerk profile enrichment is unavailable.
    console.error("Unable to enrich project collaborators with Clerk profiles.", error);
  }

  const usersByEmail = new Map(
    users.data.flatMap((user) =>
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
