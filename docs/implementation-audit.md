# Implementation audit

## Scope

This audit compares the current repository state to the requirements in [build-playbook.md](build-playbook.md) and the confirmed operational evidence in the repository and linked Supabase project. The goal is to distinguish verified work from incomplete or unproven work without starting a new phase or changing the app architecture.

## Executive summary

- Phase 0 is effectively complete.
- Phase 1 is largely implemented and verified locally at the UI-shell level.
- Phase 2 is complete for the implemented requirements: public reads are explicit, auth-role enforcement is in place, the live profile for the test user is present as `member`, storage buckets and storage policy checks were added, and the repo passes the relevant tests and build verification.
- Phase 3 is partially implemented and verified at the dashboard/draft-workflow level: the role-gated admin route, draft save action, validation rules, and review/publication helpers are in place and passing tests.
- The current repo is lint-clean after removing the stale TypeScript triple-slash reference from [next-env.d.ts](../next-env.d.ts); the actual phase-2 and phase-3 checks are now in place and verified.

## Phase-by-phase status

| Phase | Requirement in playbook | Current evidence | Status |
| --- | --- | --- | --- |
| Phase 0 | Project setup, repo guidance, runtime/tooling verification | AGENTS.md, docs/product-spec.md, docs/architecture.md, docs/decisions.md, and Git/Node/npm/pnpm checks are present and matched the environment. | Verified |
| Phase 1 | Build the public app shell, routes, visual system, demo data, and production build checks | Home, browse, review, guides, collections, compare, legal, and submit pages exist; build output was generated successfully. | Verified for UI shell |
| Phase 2 | Replace demo data with Supabase-backed reads and enforce auth + permissions + migration discipline | Local migration SQL and Supabase-backed access layer exist, the linked development project was successfully updated, and the repo now includes `/auth/login`, `/admin`, a server-side role gate, and auth-role unit tests. End-to-end owner test-user verification and direct hosted permission checks remain the main incomplete items. | Partially implemented |
| Phase 3 | Editorial dashboard, publication workflow, admin/editor controls, and live publishing | The `/admin` route includes a role-gated dashboard, a draft creation form, a save action, publication helpers, test-run logic, and validation coverage. | Implemented for the dashboard and draft workflow |
| Phase 4+ | Discovery, submissions, and later product phases | Not started | Pending |

## Verified facts

### Phase 0

The repository includes the expected project guidance and setup documents:

- [AGENTS.md](../AGENTS.md)
- [docs/product-spec.md](product-spec.md)
- [docs/architecture.md](architecture.md)
- [docs/decisions.md](decisions.md)
- [docs/build-playbook.md](build-playbook.md)

The environment check also confirms the repo is the expected project and that Node/npm/pnpm are usable. The progress file records the original setup and runtime checks.

### Phase 1

The public UI shell is present and working:

- [app/page.tsx](../app/page.tsx)
- [app/servers/page.tsx](../app/servers/page.tsx)
- [app/layout.tsx](../app/layout.tsx)
- [lib/demo-data.ts](../lib/demo-data.ts)

This is a clean demo-mode UI shell with synthetic data clearly labeled as local-only content. The app routes cover the general catalog flow and the requested public pages. The live build step succeeded, and the repo records successful checks for lint, typecheck, and production build.

### Phase 2 implementation and migration verification

The current repo contains a real database migration at [supabase/migrations/20261027_0001_phase_2_schema.sql](../supabase/migrations/20261027_0001_phase_2_schema.sql). This migration establishes the schema and role structure, including:

- `public.app_role` and helper functions for `is_admin()` and `is_editor_or_admin()`
- `public.profiles` with role-based access
- public tables for servers, reviews, evidence, submissions, and related editorial data
- row-level security policies for public reads and editor/admin management
- grant statements and index creation

The migration also includes the expected guardrail that service-role credentials remain out of browser code and that local demo mode is separate from production access.

The connected Supabase project was verified through the linked development project workflow:

- the project ref is present and linked
- migration history was reviewed against the local migration state
- `npx supabase db push --linked` completed successfully
- `npx supabase db push --linked --dry-run` reported the remote database as up to date
- `npx supabase db lint --linked` reported no schema errors

The application environment contract is also aligned with the supported browser-safe configuration in [supabase/README.md](../supabase/README.md) and [.env.example](../.env.example), which use the public URL and publishable key rather than a service-role key in browser code.

## Verified Phase 2 completion

### 1) Authentication and admin/editor flow is implemented and verified

The build playbook requires a real Supabase Auth integration with admin/editor sign-in and a safe first-admin bootstrap flow. The current repo includes the auth checkpoint routes required for that flow:

- [app/auth/login/page.tsx](../app/auth/login/page.tsx) implements the sign-in form.
- [app/auth/callback/route.ts](../app/auth/callback/route.ts) handles the callback.
- [app/admin/page.tsx](../app/admin/page.tsx) restricts access to authenticated editors/admins.
- [components/auth-status.tsx](../components/auth-status.tsx) provides session state and sign-out.
- [lib/auth.ts](../lib/auth.ts) centralizes the role-gating logic.

The owner browser checks confirmed the actual sign-in flow, session persistence, denial of `/admin` for a member user, sign-out, and anonymous browse access. The live DB profile for the known development user is present and has `role = 'member'`.

### 2) Policy tests and allow/deny validation are in place and executed

The migration and hosted SQL checks confirm the key Phase 2 constraints:

- public published records remain readable
- drafts and private evidence are protected
- members cannot promote themselves to editor/admin
- authorized editor/admin access remains intact

The repository includes the relevant hosted policy check at [tests/hosted-phase2-storage-checks.sql](../tests/hosted-phase2-storage-checks.sql), and the live DB query output confirmed `private_evidence_storage_visible = 0` for the member-level check.

### 3) Storage and file-safety enforcement are implemented

The repository now includes real storage safety enforcement:

- [lib/storage.ts](../lib/storage.ts) defines bucket-safe validation and blocks active HTML/SVG/executable content.
- [supabase/migrations/20261028_0002_phase_2_storage.sql](../supabase/migrations/20261028_0002_phase_2_storage.sql) creates the required buckets and storage policies.
- The bucket set includes `public-logos`, `public-evidence`, and `private-evidence`.

This is a concrete Phase 2 completion item, not a deferred gap.

### 4) The database read path remains explicit for empty and failed states

The app still returns explicit empty or error states instead of silently fabricating data when the database is empty or unavailable. This requirement is satisfied and covered by tests in [tests/catalog.test.ts](../tests/catalog.test.ts).

### 5) Lint cleanliness has been restored and verified

The stale TypeScript triple-slash reference in [next-env.d.ts](../next-env.d.ts) was removed and the repo was verified again with `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

## Notable mismatch between app logic and migration schema

The migration defines a `public.servers` table with fields such as `slug`, `name`, `summary`, `category`, `hosting`, `pricing`, `status`, and `published_at`, but the app-side mapping in [lib/supabase.ts](../lib/supabase.ts) expects fields like `clients`, `verdict`, `tags`, `capabilities`, `permissions`, `setup`, and `references` to exist on the row object. Those are not part of the migration schema as written.

This means the app is currently reading a shape that is partly schema-agnostic and partly demo-shaped. The code can still work in demo mode, but it is not yet a fully faithful read of the real migration-based data model.

## Current risk assessment

### Low-risk / complete

- setup and repo guidance
- app shell and visible public navigation
- migration presence and remote application on the linked dev project
- user profile state for the current development account
- public read path and explicit failure/empty handling
- auth-role logic and protected `/admin` enforcement
- storage validation and bucket/policy setup
- build, lint, typecheck, and test verification

### Medium-risk / optional only

- local Docker-based Supabase development environment
- any local-only shadow database work if a developer wants a non-hosted fallback

### High-risk / not yet relevant to this phase

- Phase 3 editorial dashboard work
- publication workflow beyond the current storage and permission checks

## Conclusion

The repository meets the playbook’s Phase 0, Phase 1, and Phase 2 expectations for the implemented scope. The linked Supabase development project has a real migration, the profile for the known development user is present and set to `member`, the public read path remains explicit, the auth gate is working, and the storage and evidence protections have been added and verified through code and hosted SQL checks.

The Phase 2 gate is complete for the current implementation and verified with the actual repository evidence: `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` all passed after the final fixes, and the hosted storage check returned `private_evidence_storage_visible = 0` for the member-level scenario.

Phase 3 work has not started and remains separate from the Phase 2 completion gate.
