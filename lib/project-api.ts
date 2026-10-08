import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function getProjectName(value: unknown, fallback = "Untitled Project") {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim();
  return name || null;
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}
