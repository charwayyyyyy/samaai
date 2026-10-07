import { auth } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

interface EditorLayoutProps {
  children: ReactNode;
}

export default async function EditorRouteLayout({
  children,
}: EditorLayoutProps) {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    await redirectToSignIn();
  }

  return children;
}
