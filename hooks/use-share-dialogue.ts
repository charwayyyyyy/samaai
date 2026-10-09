"use client";

import { useCallback, useState } from "react";

import { readJsonResponse } from "@/lib/http";

export interface Collaborator {
  email: string;
  displayName: string;
  imageUrl: string | null;
  createdAt: string;
  isOwner?: boolean;
}

/**
 * Manages collaborator loading, mutations, and clipboard feedback for a project.
 * Exposes form state, loading and error state, and sharing action callbacks.
 */
export function useShareDialogue(projectId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const open = useCallback(async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    setCollaborators([]);
    setIsOwner(false);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        cache: "no-store",
      });
      const body = (await readJsonResponse(response)) as {
        collaborators?: Collaborator[];
        isOwner?: boolean;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error || "Unable to load collaborators.");
      setCollaborators(body.collaborators ?? []);
      setIsOwner(Boolean(body.isOwner));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load collaborators.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const invite = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await readJsonResponse(response)) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to invite collaborator.");
      setEmail("");
      await open();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to invite collaborator.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, open, projectId]);

  /** Revokes access for the given email and removes its local row, or records the request error. */
  const remove = async (collaboratorEmail: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators?email=${encodeURIComponent(collaboratorEmail)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const body = (await readJsonResponse(response)) as { error?: string };
        throw new Error(body.error || "Unable to remove collaborator.");
      }
      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.email !== collaboratorEmail),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to remove collaborator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Copies the workspace URL and shows copied feedback for 1.5 seconds; clipboard errors propagate. */
  const copyProjectLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/editor/${projectId}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return {
    isOpen,
    setIsOpen,
    collaborators,
    isOwner,
    email,
    setEmail,
    isLoading,
    isSubmitting,
    error,
    copied,
    open,
    invite,
    remove,
    copyProjectLink,
  };
}
