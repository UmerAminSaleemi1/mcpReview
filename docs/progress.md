# Progress

## Phase 0 — Completed

### Implemented
- Repository guidance created in `AGENTS.md`.
- Product brief retained in `docs/product-spec.md`.
- Architecture and environment guidance retained in `docs/architecture.md`.
- Routine decisions recorded in `docs/decisions.md`.
- Build playbook retained in `docs/build-playbook.md`.

### Configured
- Git repository identified and verified.
- Node.js runtime and npm verified.
- pnpm enabled through Corepack.
- npm registry connectivity checked.

### Verified
- `git --version` passed.
- `node --version` passed.
- `npm --version` passed.
- `npm ping --registry=https://registry.npmjs.org` passed.
- `pnpm --version` passed after activation through Corepack.
- `git status --short --branch` confirmed the correct repository and remote.

## Phase 1 — Completed

### Implemented
- Next.js App Router project initialized in the repo root.
- TypeScript, Tailwind, and App Router structure created.
- Shared header/footer, home page, browse page, detail pages, compare page, reviews, guides, collections, submit, and essential legal/info pages added.
- Demo data included and clearly labeled as local-only synthetic content.
- Environment and package configuration recorded in `package.json` with the verified runtime and package-manager versions.

### Configured
- Local dev app and production build commands established.
- Project uses Node-compatible package versions and pnpm-based dependency installs.
- `.env.example` created for local-only environment variables.

### Verified
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- Local dev server starts successfully on `http://localhost:3000` when run with `pnpm dev`.

## Phase 2 — Completed for the implemented scope

### Implemented
- Secure environment contract prepared for the supported Supabase browser and session-aware server flow.
- Supabase client/server utility layer created in `lib/supabase.ts` with explicit empty/error handling and session-aware behavior.
- Real read-path mapping added in `lib/catalog.ts` and the actual DB schema types were regenerated in `types/supabase.ts`.
- Migration SQL reviewed and applied to the linked development project in `supabase/migrations/20261027_0001_phase_2_schema.sql`.
- Storage safety validation added in `lib/storage.ts` and storage buckets/policies created in `supabase/migrations/20261028_0002_phase_2_storage.sql`.
- Demo mode remains explicit and off by default in `.env.example` and the app logic.
- Auth checkpoint implemented for `/auth/login` and `/admin`, with server-side role gating and sign-out support.

### Configured
- The linked development project remains `mcplist-dev` with project ref `nazwprdnswjzsqiumyrd`.
- `.env.local` is present and ignored by Git; values were not printed.
- `NEXT_PUBLIC_DEMO_MODE` is explicitly false unless a local developer intentionally turns it on.
- Connected Supabase project verification remains the authoritative DB state for this machine.

### Verified
- `npx supabase migration list --linked` showed the local migration was applied to the linked dev project.
- `npx supabase db push --linked` completed successfully for the storage migration.
- `npx supabase db lint --linked` reported no schema errors.
- `pnpm test` passed for the catalog, auth-role, and storage-safety checks.
- `pnpm lint` passed after removing the stale TypeScript triple-slash declaration in `next-env.d.ts`.
- `pnpm typecheck` passed.
- `pnpm build` completed successfully.
- Hosted direct SQL checks confirmed the development user profile exists and the member role is `member`.
- Hosted storage permission checks confirmed `private_evidence_storage_visible = 0` for the member-level check.
- No remote reset or destructive migration has been executed.

### Executed Phase 2 checks
- Browser verification: member login, session persistence, denial from `/admin`, sign-out, and anonymous public browsing were confirmed by the owner.
- Security behavior checks: unit tests confirm a non-admin role cannot access admin/editor privileges by logic alone.
- Hosted permission verification: direct DB SQL can be executed against the linked project; role checks are enforced by RLS helpers and profile roles.
- Storage validation: public-safe uploads pass and active HTML/SVG/executable content is rejected by policy and validation logic.

### Remaining blockers
- None at the code or Phase 2 gate level for the current implementation.
- Optional local Docker-based `supabase start` remains a machine-specific tooling issue only if a local shadow database is required; it is not blocking the hosted workflow.

## Phase 2 status
Phase 2 is complete for the implemented scope. The app handles empty, failure, and live DB-backed data states explicitly, the protected admin route is gated by server-side role checks, the storage buckets and evidence protection were added and checked, and the current repo passes build, lint, tests, and typecheck verification.

## Phase 3 — Implemented for the dashboard workflow and review draft logic

### Implemented
- Protected editorial dashboard route kept in place with role gating for editor/admin access.
- Draft creation form added to `/admin` for listing name, summary, category, permissions, setup, review summary, evidence metadata, and validation inputs.
- Server action added at `app/admin/actions.ts` to validate and persist draft data through the existing editor guard.
- Publishing, unpublishing, and test-run helpers were completed in `lib/editor.ts` with explicit access checks and audit logging.
- Validation tests added for publication requirements and unauthorized draft-save attempts.

### Configured
- `next-env.d.ts` was corrected to remove the stale generated route reference that caused the repo-wide lint failure.
- ESLint was configured to ignore generated `.next/` output and the framework entry file.

### Verified
- `pnpm test` passed with 12 passing tests.
- `pnpm lint` passed after the generated Next file fix.
- `pnpm typecheck` passed.
- `pnpm build` completed successfully.

### Remaining limitations
- The Phase 3 implementation is in the dashboard-and-draft workflow stage; it remains a truthful editorial workflow scaffold rather than a fully populated production-content review system.
- No live public publication campaign or production data migration was executed during this stage.
