import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-base font-sans lg:grid-cols-2">
      <section className="hidden flex-col justify-center bg-ai px-12 py-16 lg:flex xl:px-24">
        <div className="max-w-md">
          <div className="mb-12 text-lg font-semibold tracking-tight text-copy-primary">
            samaAl
          </div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-copy-primary/70">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-copy-primary">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-copy-primary/80">
            {description}
          </p>
          <ul className="mt-10 space-y-3 text-sm text-copy-primary/70">
            <li>Design systems together in real time.</li>
            <li>Turn architecture ideas into clear specifications.</li>
            <li>Keep every project organized in one workspace.</li>
          </ul>
        </div>
      </section>
      <section className="flex items-center justify-center bg-base px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
