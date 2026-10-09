"use client";

import { Link2, Mail, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useShareDialogue,
  type Collaborator,
} from "@/hooks/use-share-dialogue";

interface ShareDialogueProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Displays a profile image, falling back to a display-name initial if missing or broken. */
function CollaboratorAvatar({
  displayName,
  imageUrl,
}: Pick<Collaborator, "displayName" | "imageUrl">) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!imageUrl || hasImageError) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-xs text-copy-secondary">
        {displayName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      alt={displayName}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
      onError={() => setHasImageError(true)}
      src={imageUrl}
    />
  );
}

/** Displays project access, link copying, and owner-only invite and removal controls. */
export function ShareDialogue({
  projectId,
  open,
  onOpenChange,
}: ShareDialogueProps) {
  const share = useShareDialogue(projectId);
  const { open: loadShareData } = share;

  useEffect(() => {
    if (open) void loadShareData();
  }, [loadShareData, open]);

  /** Propagates visibility changes and refreshes access data when the dialog opens. */
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-xl bg-surface text-copy-primary sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-copy-primary">
            Share project
          </DialogTitle>
          <DialogDescription className="text-copy-secondary">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>
        <section className="rounded-2xl border border-surface-border bg-elevated p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-copy-primary">
                Workspace link
              </h2>
              <p className="mt-1 text-sm text-copy-muted">
                Share a direct link after granting access.
              </p>
            </div>
            <Button
              className="text-copy-primary"
              onClick={() => void share.copyProjectLink()}
              variant="outline"
            >
              <Link2 />
              {share.copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        </section>
        {share.isOwner && (
          <form
            className="flex items-center gap-2 rounded-2xl border border-surface-border bg-elevated p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void share.invite();
            }}
          >
            <Mail className="ml-1 text-copy-muted" />
            <Input
              aria-label="Collaborator email"
              className="h-9 border-surface-border bg-surface text-copy-primary placeholder:text-copy-muted"
              onChange={(event) => share.setEmail(event.target.value)}
              placeholder="teammate@company.com"
              type="email"
              value={share.email}
            />
            <Button
              className="bg-brand text-base hover:bg-brand/80"
              disabled={!share.email.trim() || share.isSubmitting}
              type="submit"
            >
              Invite
            </Button>
          </form>
        )}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-copy-primary">
              People with access
            </p>
            <span className="text-xs text-copy-muted">
              {share.collaborators.length} total
            </span>
          </div>
          {share.isLoading ? (
            <p className="text-sm text-copy-muted">Loading collaborators...</p>
          ) : share.collaborators.length ? (
            share.collaborators.map((collaborator) => (
              <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-elevated p-3" key={collaborator.email}>
                <CollaboratorAvatar
                  displayName={collaborator.displayName}
                  imageUrl={collaborator.imageUrl}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-copy-primary">
                      {collaborator.displayName}
                    </p>
                    {collaborator.isOwner && (
                      <span className="rounded-full border border-brand/40 bg-accent-dim px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-copy-muted">{collaborator.email}</p>
                </div>
                {share.isOwner && !collaborator.isOwner && (
                  <Button
                    aria-label={`Remove ${collaborator.email}`}
                    disabled={share.isSubmitting}
                    onClick={() => void share.remove(collaborator.email)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-copy-muted">No collaborators yet.</p>
          )}
        </div>
        {share.error && <p className="text-sm text-state-error">{share.error}</p>}
        <DialogFooter className="border-surface-border bg-elevated">
          <Button
            className="text-copy-primary"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
