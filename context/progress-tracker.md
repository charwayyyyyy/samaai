# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor home wiring complete

## Current Goal

- Continue with the next feature unit from the feature specifications.

## Completed

- Installed and configured shadcn/ui with the Base Nova style.
- Added Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea primitives.
- Added the reusable `cn()` helper in `lib/utils.ts`.
- Added the dark design tokens and shadcn theme mappings to `app/globals.css`.
- Applied the dark theme at the root layout.
- Added the fixed editor navbar with state-aware sidebar toggle icons.
- Added the floating project sidebar with My Projects and Shared tabs.
- Added empty project states and the bottom New Project action.
- Wired the editor navbar and sidebar into the main page.
- Composed the navbar and sidebar into the reusable `EditorLayout`.
- Confirmed the existing dialog primitive supports title, description, and footer actions with token-based styling.
- Installed `@clerk/ui` for the Clerk dark theme.
- Added `ClerkProvider` with app CSS variable overrides.
- Added responsive sign-in and sign-up page shells with Clerk components.
- Added root-level `proxy.ts` protecting all non-auth routes.
- Added authenticated `/editor` route and root auth-state redirect.
- Added Clerk `UserButton` to the editor navbar.

## In Progress

- None.

## Next Up

- Build the next feature unit from the feature specifications.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Design system implementation from `context/feature-specs/01-design-system.md` is complete.
- `npm run lint` and `npm run build` both pass.
- Editor implementation started from `context/feature-specs/02-editor.md`.
- Editor chrome implementation from `context/feature-specs/02-editor.md` is complete.
- The navbar and sidebar are now consumed through `components/editor/editor-layout.tsx`.
- `npm run lint` and `npm run build` pass with the editor chrome.
- Authentication implementation started from `context/feature-specs/03-auth.md`.
- Authentication implementation from `context/feature-specs/03-auth.md` is complete.
- Auth routes: `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`, and protected `/editor`.
- `npm run lint` and `npm run build` pass with Clerk authentication.
- Refined the auth screens to use a 50/50 large-screen split with an AI-accent left panel.
- Explicitly applied Geist Sans and Geist Mono to Clerk UI through the existing font variables.
- Migrated editor route protection from deprecated `createRouteMatcher` middleware checks to resource-based authentication in the editor route layout.
- Confirmed the reported hydration mismatch is caused by the browser extension's injected `data-pip-extension-id` attribute, not application-rendered markup.
- Scoped `suppressHydrationWarning` to the root HTML element to prevent the browser extension's external attribute mutation from producing a hydration error.
- Implemented the project home empty state and mock create, rename, and delete project dialogues.
- Added ownership-gated project actions and a mobile sidebar backdrop.
- Applied explicit dark-theme text tokens to project dialog titles, descriptions, inputs, and content for consistent contrast.
- `npm run lint` and `npm run build` pass with project dialogues.
- Addressed project sidebar review findings for closed-state inertness, non-hover action visibility, and nonempty slug consistency.
- Added Prisma 7 `Project` and `ProjectCollaborator` models with status enum, relations, unique constraints, and required indexes.
- Added the cached Prisma client singleton with direct PostgreSQL and `prisma+postgres` Accelerate branches.
- Applied migration `20261008153621_add_projects_and_collaborators` and generated the Prisma client.
- Added `@prisma/extension-accelerate` for the configured Accelerate branch.
- `npx prisma validate`, `npm run lint`, `npm run build`, and a read-only Prisma project count query pass.
- Added backend-only project REST APIs for listing, creating, renaming, and deleting projects.
- Enforced Clerk authentication and owner checks with `401`, `403`, and `404` responses.
- Added JSON request validation and the `Untitled Project` default name.
- `npx prisma validate`, `npm run lint`, and `npm run build` pass with the project APIs.
- Started wiring editor home to server-loaded owned and shared project data from `context/feature-specs/07-wire-editor-home.md`.
- Added server-side owned/shared project loading with collaborator email access.
- Replaced mock project mutations with authenticated API create, rename, and delete requests.
- Added project workspace navigation and an access-checked `/editor/[projectId]` route.
- `npm run lint` and `npm run build` pass with editor home wiring.
- Normalized legacy PostgreSQL `sslmode=require` URLs to `verify-full` before creating the Prisma adapter, preventing the pg-connection-string security warning while preserving existing TLS behavior.
- Added navigable project links to the sidebar and reconciled refreshed server project data with local create, rename, and delete results.
- Limited PostgreSQL SSL normalization to the exact `sslmode=require` query value without parsing or altering raw connection strings.
