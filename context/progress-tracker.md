# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Base collaborative canvas complete

## Current Goal

- Build the next feature unit from the feature specifications.

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

- Connect the authenticated Liveblocks room to the editor canvas.

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
- Started the editor workspace shell from `context/feature-specs/08-editor-workspace-shell.md`.
- Added server-side Clerk identity and owner/collaborator project access helpers.
- Added `AccessDenied` for missing or unauthorized workspaces.
- Added the authenticated `/editor/[roomId]` workspace shell with project context, active sidebar highlighting, navbar actions, canvas placeholder, and AI sidebar placeholder.
- `npm run lint` and `npm run build` pass with the workspace shell.
- Improved the share dialogue to match the dark workspace reference, including explicit readable text tokens, workspace-link copying, owner badges, and visible owner invite controls.
- Included the project owner in the access list while retaining Clerk-enriched collaborator profiles and owner-only management actions.
- Refined the workspace chrome with labeled Share and AI actions to match the share/workspace reference interface.
- Fixed share access loading so Clerk profile enrichment failures do not hide the owner invite form or access rows.
- Added owner/email fallbacks and resilient collaborator avatar rendering for unavailable Clerk profile images.
- Hardened the collaborators GET response with an owner fallback and no-store client loading so the owner invite field and access row cannot be hidden by optional enrichment failures.
- Isolated the Clerk `UserButton` from server rendering with a stable loading placeholder to prevent editor-navbar hydration mismatches.
- Fixed share loading from the navbar, synchronized the project sidebar tab with the active project, batched Clerk profile lookups, and normalized invited/current collaborator emails for access checks.
- Started the share dialogue implementation from `context/feature-specs/09-share-dialogue.md`.
- Added collaborator list, invite, and remove APIs with server-side owner enforcement.
- Added Clerk profile enrichment with email-only fallback for unknown users.
- Added the workspace share dialogue with read-only collaborator access, owner controls, and temporary copied-link feedback.
- `npm run lint` and `npm run build` pass with the share dialogue.
- Added JSDoc for workspace and sharing functions to address PR #6 docstring coverage.
- Started Liveblocks setup from `context/feature-specs/10-liveblocks-setup.md`.
- Added typed Presence and UserMeta definitions, a cached Liveblocks server client, deterministic cursor colors, and a Clerk/project-access protected Liveblocks auth route.
- Added `@liveblocks/node` for server-side room creation and session authorization.
- Liveblocks setup from `context/feature-specs/10-liveblocks-setup.md` is complete; `npm run lint` and `npm run build` pass.
- Started the base canvas implementation from `context/feature-specs/11-base-canvas.md`.
- Replaced the workspace placeholder with a Liveblocks RoomProvider and typed React Flow canvas.
- Added typed canvas node and edge contracts, empty synchronized graph state, loose connections, fit-to-view, MiniMap, dot background, loading fallback, and connection error fallback.
- Base canvas implementation from `context/feature-specs/11-base-canvas.md` is complete.
- Fixed the runtime canvas connection error by mounting `RoomProvider` under `LiveblocksProvider` with the authenticated `/api/liveblocks-auth` endpoint.
- Upgraded the collaborative canvas to a functional React Flow workspace with synced custom nodes, draggable/pannable/zoomable navigation, double-click and toolbar node creation, connectable handles, synced deletion, React Flow controls, and a pannable/zoomable minimap.
- Added the required `ReactFlowProvider` ancestor so the interactive canvas navigation context is available to `useReactFlow`.
- Hardened share-dialogue collaborator requests so API failures return JSON and non-JSON responses are handled without a parsing crash.
- Implemented the shape panel from `context/feature-specs/12-shape-panel.md` with draggable shape payloads, drop-to-create nodes, default sizes, shape-based timestamp/counter IDs, and the basic bordered node renderer.
- Fixed canvas visibility by giving the React Flow surface an explicit positioned height and rendering the shape toolbar as a guaranteed bottom-center overlay inside the canvas wrapper.
- Fixed the zero-height workspace chain by making the editor shell viewport-sized and allowing the canvas to fill the available area behind the fixed sidebars.
- Corrected the shape toolbar containing block so it stays at the bottom of the canvas rather than appearing at the top of the React Flow renderer.
- Forced React Flow and the minimap to use the dark color mode and surface styling for readable canvas chrome.
- Browser verification confirms the toolbar is visible at the bottom, the dotted canvas and nodes render, and `npm run build` passes.
- Hardened shape dragging with an explicit canvas-node payload type, dual MIME payload support, runtime payload validation, and capture-phase canvas drag handlers so React Flow cannot intercept the drop before node creation.
- Updated the canvas node renderer to use each synchronized node's `data.shape`, rendering distinct rectangle, pill, circle, diamond, cylinder, and hexagon geometry instead of displaying every dropped node as a rectangle.
- Browser verification confirms cylinder, circle, hexagon, diamond, and rectangle drops retain their individual shape metadata and render the corresponding geometry.
