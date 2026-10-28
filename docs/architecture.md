# Architecture overview

## Stack direction

The preferred implementation is a TypeScript-based Next.js App Router application with React, Tailwind CSS, and shadcn/ui components. The project should use Supabase for Postgres, Auth, and Storage, with Vercel as the hosting platform for the app and preview deployments.

## Runtime and package manager

- Git: confirmed available.
- Node.js: current supported LTS runtime is in use on this machine.
- npm: available and can reach the registry.
- pnpm: not installed initially; enabled using Corepack in this environment.

The planned project workflow uses pnpm as the package manager once the application is scaffolded in Phase 1.

## Environment boundaries

- Local development: code, local data, and demo fixtures only.
- Staging: controlled non-production environment for preview review.
- Production: live public environment with separate secrets and database resources.

No live production database or DNS changes are allowed during the initial setup work.

## Repository conventions

- Keep implementation docs under `docs/`.
- Keep durable instructions in `AGENTS.md` and link to the detailed spec rather than duplicating it.
- Do not create a second app inside an existing repository.
- Keep the build-playbook and prompts in repository documentation so a new Codex session can continue from the same brief.

## Security and data handling

- Public reads expose only published, non-private records.
- Server-side permission checks must be enforced for privileged operations.
- Browser bundles must never contain private secrets or privileged keys.
- Do not execute submitted packages or arbitrary content fetched from unknown sources.
- Treat imported or user-generated text as untrusted and validate it before rendering.

## Operational goals

- Keep the application easy to run locally.
- Use explicit environments for demo, staging, and production.
- Keep credentials in private environment files and provider secret stores, not in prompts or source control.
- Maintain progress and owner actions in `docs/progress.md` after each phase.
