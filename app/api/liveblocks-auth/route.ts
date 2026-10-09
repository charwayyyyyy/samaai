import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getCurrentIdentity,
  getProjectForIdentity,
} from "@/lib/project-access";
import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    room?: unknown;
  } | null;
  const roomId = typeof body?.room === "string" ? body.room.trim() : "";

  if (!roomId) {
    return NextResponse.json(
      { error: "A project room is required." },
      { status: 400 },
    );
  }

  const project = await getProjectForIdentity(roomId, identity);

  if (!project) {
    return NextResponse.json(
      { error: "You do not have access to this project." },
      { status: 403 },
    );
  }

  const liveblocks = getLiveblocksClient();

  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
  });

  const user = await currentUser();
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.lastName ||
    identity.email ||
    identity.userId;
  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: {
      name: displayName,
      avatar: user?.imageUrl || "",
      color: getCursorColor(identity.userId),
    },
  });

  session.allow(roomId, ["room:write"]);

  const { body: token, status } = await session.authorize();
  return new Response(token, { status });
}
