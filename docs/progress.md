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

## Phase 2 — Hosted connectivity verified; migration review still blocked by local CLI and policy review

### Implemented
- Secure environment contract prepared for the supported Supabase browser and session-aware server flow.
- Supabase client/server utility layer created in `lib/supabase.ts` using the public project URL and publishable key, with cookie-based session handling and a demo-mode fallback.
- Initial migration SQL drafted in `supabase/migrations/20261027_0001_phase_2_schema.sql` for servers, reviews, evidence, auth roles, and RLS-oriented policies.
- Local guidance updated in `supabase/README.md` and `.env.example` to avoid legacy key names and keep privileged credentials out of source control.
- The migration SQL has been tightened to add explicit grants and to prevent self-role escalation in `public.profiles`.

### Configured
- The linked development project is confirmed as `mcplist-dev` with project ref `nazwprdnswjzsqiumyrd`.
- `.env.local` is present and ignored by Git; its values were not printed.
- Demo mode in the local environment is disabled, so the app is attempting to use the database-backed path rather than local demo fixtures.
- Hosted connectivity is verified through the linked project commands: `migration list --linked` reported only the local migration as pending, and `db push --linked --dry-run` reported that `20261027_0001_phase_2_schema.sql` would be pushed.

### Verified
- The project link succeeded via `npx supabase link --project-ref nazwprdnswjzsqiumyrd` and returned a successful project_ref response.
- `.env.local` is populated and the repo confirms it is ignored by Git (`git check-ignore -v .env.local` reported `.gitignore:27:.env*.local`), without exposing any values.
- The app uses the supported public URL + publishable key flow and the `@supabase/ssr` cookie integration for authenticated server-side requests.
- The project still passes local lint, typecheck, and production build validation in the app code itself.
- No remote reset or destructive migration has been executed.

### Blocked / not yet complete
- Local Docker startup is a separate issue from the hosted project connection: `npx supabase status --debug` fails with `NotFound: FileSystem.readFile (C:\Users\Dell\.supabase\profile)` and `No such container: supabase_db_mcplist-local`.
- `npx supabase db dump --linked --schema public` and `db diff --linked --schema public` remain blocked by the local Docker/CLI startup issue, so the actual live schema and policy contents cannot be fully compared against the migration file from this machine.
- The migration review identified a real policy gap in the original SQL: a user could self-update their own `public.profiles.role` to a higher privilege because the update policy only checked `auth.uid() = id` and not the role value. That has been corrected in the migration file before any remote apply.
- Because the remote schema cannot be inspected from this environment while the local Docker-backed diff is failing, this Phase 2 review is intentionally not treated as fully verified.

## Remaining owner actions before Phase 2 completion
- Repair the local Supabase CLI profile/container initialization so the local Docker-backed shadow database can start successfully.
- Re-run the linked schema diff and verify the actual remote tables, grants, and RLS policies. Empty migration history does not prove empty schema.
- Once the diff is clean and the role-escalation issue is confirmed resolved, push the reviewed migration to the linked `mcplist-dev` project using `npx supabase db push --linked`.
- Validate visitors, ordinary members, editors, and admins with allow/deny checks after the migration is applied.

## Exact commands to run once the local Supabase profile/container issue is fixed
```bash
npx supabase start --debug
npx supabase status
npx supabase db diff --linked --schema public
npx supabase db lint --linked
npx supabase db push --linked
```

Do not run a reset. These commands are for the linked development project only and must remain non-destructive.
