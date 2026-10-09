import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#00c8d4",
  "#6457f9",
  "#34d399",
  "#fbbf24",
  "#ff4d4f",
  "#8b82ff",
] as const;

function getLiveblocksSecret() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY must be configured.");
  }

  return secret;
}

function createLiveblocksClient() {
  return new Liveblocks({
    secret: getLiveblocksSecret(),
  });
}

type LiveblocksClient = ReturnType<typeof createLiveblocksClient>;

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocks?: LiveblocksClient;
};

export function getLiveblocksClient() {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = createLiveblocksClient();
  }

  return globalForLiveblocks.liveblocks;
}

export function getCursorColor(userId: string) {
  let hash = 0;

  for (const character of userId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
