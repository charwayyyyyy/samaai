import { LockKeyhole } from "lucide-react";
import Link from "next/link";

/** Shows the unavailable-project message and a link back to the project list. */
export function AccessDenied() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-base px-6 text-center">
      <div className="max-w-md">
        <LockKeyhole className="mx-auto h-10 w-10 text-copy-muted" />
        <h1 className="mt-5 text-2xl font-semibold text-copy-primary">
          Access denied
        </h1>
        <p className="mt-3 text-sm text-copy-muted">
          This project does not exist or you do not have access to it.
        </p>
        <Link
          className="mt-6 inline-flex text-sm font-medium text-brand hover:underline"
          href="/editor"
        >
          Back to projects
        </Link>
      </div>
    </div>
  );
}
