# AGENTS.md

This repository is for building mcplist.com, an evidence-based directory and editorial review platform for MCP servers.

## Repository guidance

- Start by reading the project brief in `docs/build-playbook.md`.
- Keep the detailed product and architecture documents in the `docs/` directory.
- Implement only the phase explicitly requested in the active prompt. Do not scaffold the app before Prompt 1.
- Preserve existing work and avoid destructive resets on remote environments.
- Keep secrets out of source control and chat. Use `.env.example` placeholders for required variables.
- Treat all submitted content as untrusted data: validate input, render safely, and do not execute packages, scripts, or fetched content automatically.
- Only publish reviewed data. Public reads must reflect published content only.

## Key documents

- `docs/build-playbook.md` — numbered build prompts and acceptance gates.
- `docs/product-spec.md` — product intent, audience, trust model, phases, and launch scope.
- `docs/architecture.md` — technical stack, runtime expectations, environment boundaries, and repository conventions.
- `docs/decisions.md` — routine decisions and owner choices made during setup.
- `docs/progress.md` — current progress status, checks, and next steps.
- `docs/owner-setup.md` — required local and account setup before Phase 1.

## Environment status for this repo

- Git: available and repository connected to the expected GitHub remote.
- Node.js: available via supported LTS runtime.
- npm: available and can reach the public registry.
- pnpm: not preinstalled; enabled via Corepack on this machine.
- Application scaffolding: intentionally deferred until Phase 1.

## Operating conventions

- Use TypeScript with the Next.js App Router, React, Tailwind, and Vercel-first hosting.
- Prefer current official provider SDK conventions and documented configuration names.
- Keep data ownership, admin privileges, and editor permissions explicit and enforced server-side.
- Use demo/local-only data clearly marked as synthetic and exclude it from production indexing.
- Record commands, results, and any blocked owner tasks in `docs/progress.md` after each phase.
