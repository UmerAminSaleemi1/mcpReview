# MCPList

MCPList is an evidence-first directory and editorial review platform for Model Context Protocol (MCP) servers. MCP stands for Model Context Protocol, a standard for connecting AI assistants and other tools to external capabilities. The project exists to make that landscape easier to understand: visitors can browse a directory, read review summaries, compare alternatives, and follow setup instructions without guessing which server is trustworthy.

This repository is the working implementation of the MCPList concept. It is not a production launch claim; it is a codebase with a documented build plan, a testable app shell, and a database-backed foundation for editorial review.

## Table of contents

- [Project overview](#project-overview)
- [Scope and features](#scope-and-features)
- [Technology stack](#technology-stack)
- [Architecture and repository structure](#architecture-and-repository-structure)
- [Current status and roadmap](#current-status-and-roadmap)
- [Local setup](#local-setup)
- [Configuration and data behavior](#configuration-and-data-behavior)
- [Testing and limitations](#testing-and-limitations)
- [Documentation and contribution](#documentation-and-contribution)
- [License and disclosure](#license-and-disclosure)

## Project overview

### What MCP means

An MCP server is a tool endpoint that exposes capabilities to an AI client or assistant using the Model Context Protocol. The ecosystem is growing quickly, so the practical problem is not just discoverability; it is trust and clarity.

MCPList aims to answer questions like:

- What does this server do?
- What is it actually capable of?
- What has been tested versus what is merely claimed by the publisher?
- Which clients are supported, and how is setup handled?
- What permissions or data access does it require?

### The problem it solves

The project addresses the gap between marketing language and verified real-world use. Public directories often mix unverified claims, stale metadata, and incomplete setup guidance. MCPList keeps the core journey evidence-first: discover, inspect, compare, and set up with a clear understanding of what is known and what is not.

### Intended users

- Visitors: developers and teams evaluating MCP servers before integration.
- MCP developers: people publishing server information and updates.
- Editors and admins: people who review evidence and decide what becomes public.

### Core journey

The intended user flow is:

1. Discover a server in the public directory.
2. Read the review, compatibility notes, permissions, and setup instructions.
3. Compare alternatives side-by-side.
4. Understand known limitations, missing evidence, and tested status.
5. Follow setup steps for the relevant client or environment.

## Scope and features

### Public directory and detail pages

The application includes a public UI shell for:

- home and browse pages
- server detail pages
- category pages
- comparison pages
- reviews and guides
- collections and legal pages
- submission and contact flows

The public catalog fetch layer is explicit about empty states and database errors instead of silently fabricating content.

### Evidence-backed reviews and compatibility information

The review model is designed around explicit separation between:

- publisher claims
- verified outcomes
- test evidence
- compatibility support status
- unknown or not-tested states

This project intentionally treats `Unknown` and `Not tested` as legitimate states rather than as failures.

### Authentication and role-based access

The app includes:

- Supabase Auth sign-in flow
- server-side role checks
- editor/admin-only access for administration
- explicit denial for lower-privilege roles

The role model in the migration schema is based on database role helpers rather than a user-editable metadata field.

### Editorial and publishing workflow

The repository also includes authoring logic for:

- draft creation and validation
- review edits
- publish/unpublish actions
- manual evidence and test run entry
- audit tracking and revision-aware workflow

This is implemented in the dashboard route and corresponding server actions.

### Evidence storage and privacy controls

The storage layer includes safeguards for:

- public logos and public evidence
- private evidence and raw files
- file-type and content validation
- rejection of active HTML, SVG, and executable content patterns

The schema and migration files explicitly separate public and private data access.

### Implemented vs planned

| Area | Status |
| --- | --- |
| Public directory shell and page layout | Implemented |
| Supabase-backed read path and explicit empty/error handling | Implemented for the current repo state |
| Auth route and role gating | Implemented |
| Storage validation and bucket policy setup | Implemented |
| Editorial dashboard and draft workflow | Implemented for the current repo state |
| Production-ready domain, launch checklist, and email/Turnstile flows | Planned |
| Discovery search, comparison, moderation, and email workflows | Planned |
| Production launch, monitoring, and rollback procedures | Planned |

## Technology stack

| Area | Installed or configured | Status | Notes |
| --- | --- | --- | --- |
| Frontend | Next.js 15.5.6, React 19, TypeScript | Installed and configured | App Router project in the repo root |
| Server-side/backend | Next.js server components and server actions | Installed and configured | Runs in the same app for page data and auth-protected actions |
| Database | Supabase Postgres | Configured and partially integrated | Schema is defined in migration SQL under `supabase/migrations/` |
| Authentication and authorization | Supabase Auth, SQL role helpers, RLS-oriented checks | Configured and tested in code | Browser-safe keys are kept public; service-role logic is not meant for browser use |
| File storage | Supabase Storage | Configured for buckets and validation | Includes public and private evidence policies |
| Styling and UI | Tailwind CSS, utility functions, Lucide icons | Installed and configured | The project follows a light editorial design system |
| Validation and testing | ESLint, TypeScript, Node test runner (`node --import tsx --test`) | Installed and verified in repo checks | Local tests cover auth roles, catalog behavior, storage validation, and draft rules |
| Development tooling | Node.js, npm, pnpm via Corepack, Supabase CLI | Installed or configured | The repo declares Node 20.11+ and pnpm support |
| Planned hosting and future integrations | Vercel, Resend, Turnstile, Sentry, Plausible, Trigger.dev, Stripe, AI provider | Planned | Not yet configured as real production services in this repository |

### Backend responsibilities: App Router vs Supabase

The split is intentionally simple:

- Next.js handles the application shell, server-side pages, server actions, routing, UI rendering, and session-aware server logic.
- Supabase handles the durable data layer: Postgres schema, row-level policies, authentication sessions, and storage buckets.

This keeps the browser client lean while preserving DB and permission enforcement as the source of truth for privileged operations.

## Architecture and repository structure

### Main application flow

1. A page request reaches the Next.js App Router.
2. Server-side code chooses between local demo mode and real Supabase-backed access.
3. Public pages read published records only; drafts and private evidence stay protected.
4. Authenticated editor/admin pages use grade-appropriate role checks before they allow mutation.
5. Storage uploads are validated before they reach the bucket.
6. Tests cover the behavioral boundaries around access, publication, and data handling.

### Repository structure

```text
.
├── AGENTS.md
├── README.md
├── app/
│   ├── admin/
│   ├── auth/
│   ├── collections/
│   ├── guides/
│   ├── servers/
│   ├── ...
│   └── layout.tsx
├── components/
├── docs/
│   ├── architecture.md
│   ├── build-playbook.md
│   ├── implementation-audit.md
│   ├── owner-setup.md
│   ├── product-spec.md
│   ├── progress.md
│   └── ...
├── lib/
│   ├── auth.ts
│   ├── catalog.ts
│   ├── demo-data.ts
│   ├── editor.ts
│   ├── storage.ts
│   └── supabase.ts
├── supabase/
│   └── migrations/
├── tests/
├── types/
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── next.config.mjs
├── tsconfig.json
└── tailwind.config.ts
```

### Detailed project documents

See the following for the deeper repository context:

- [docs/build-playbook.md](docs/build-playbook.md)
- [docs/product-spec.md](docs/product-spec.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/progress.md](docs/progress.md)
- [docs/implementation-audit.md](docs/implementation-audit.md)
- [docs/owner-setup.md](docs/owner-setup.md)
- [AGENTS.md](AGENTS.md)

## Current status and roadmap

As of 2026-10-29.

| Phase | Scope | Status | Completed work | Remaining work or verification |
| --- | --- | --- | --- | --- |
| Phase 0 | Repo guidance, environment verification | Verified | Repository documents, runtime checks, and Git/package-manager setup were recorded. | No blocking gap for this phase. |
| Phase 1 | App shell and public UI | Verified for the UI shell | Shared layout, public pages, demo data, and build checks are present. | Some design polish and browser walkthrough details remain as future validation items. |
| Phase 2 | Database, auth, permissions, storage | Partial / code-verified | Real schema, role checks, public read gating, Supabase client setup, and storage validation are present. | Owner/browser verification and host-side policy checks are not fully documented as a completed end-to-end owner flow. |
| Phase 3 | Editorial dashboard and publishing workflow | Implemented but unverified in final browser flow | Role-gated `/admin` flow, validation logic, draft save/publish actions, and review helpers are implemented. | A real owner-admin browser walkthrough and publication verification remain pending. |
| Phase 4 | Search, comparison, submissions, email | Not started | No implemented discovery or moderation pipeline for this phase. | Needs work and verification before calling it complete. |
| Phase 5+ | Launch, operations, production readiness | Not started | No production launch controls or hosting pipeline are described as active here. | Requires separate owner authorization and verified deployment configuration. |

This status is intentionally conservative. The code includes a meaningful amount of working functionality, but the repository does not claim a production-ready release without explicit launch verification.

## Local setup

### Prerequisites

- Supported Node.js runtime for the project: 20.11+ is declared in [package.json](package.json)
- pnpm available through Corepack or an existing installation
- Git access to the repository
- A Supabase project or linked dev environment for live database/auth work
- Docker only if using a local Supabase stack; it is not required for working against a hosted development project

### Install dependencies

```bash
corepack enable
corepack pnpm install
```

If `pnpm` is already available on your PATH, this also works:

```bash
pnpm install
```

### Environment configuration

Start from [.env.example](.env.example) and create a local environment file that is not committed.

Required and commonly used names include:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_DEMO_MODE=false
```

Notes:

- Keep browser-safe values public and server-only secrets out of the browser bundle.
- Do not put service-role or admin credentials in a browser-visible file.
- `NEXT_PUBLIC_DEMO_MODE` is intentionally off by default because the project prefers explicit demo mode over fake live data.

### Run the development server

```bash
pnpm dev
```

Then check the actual port printed by the Next.js output. The app may fall back to another free port if 3000 is already in use.

### Database migrations and linked dev project

The repository includes migration files under [supabase/migrations](supabase/migrations). Use the Supabase CLI against the correct project and do not treat remote migration history as something to reset casually.

Examples:

```bash
npx supabase db push --linked
npx supabase migration list --linked
npx supabase db lint --linked
```

If you are running a local Supabase environment, Docker-based local startup may be required. That path is optional and machine-dependent; the project has also been used with a hosted development project, which is the most reliable current workflow in this repo state.

### Authentication and owner-admin setup

The build-playbook and owner setup doc explain the controlled admin bootstrap path. The codebase expects a real Supabase Auth user plus a profile row that is granted the desired role. Keep the owner-admin account separate from ordinary member testing and do not commit any real private evidence or credentials.

See:

- [docs/owner-setup.md](docs/owner-setup.md)
- [app/auth/login/page.tsx](app/auth/login/page.tsx)
- [app/admin/page.tsx](app/admin/page.tsx)

### Commands for code quality and verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

These match the scripts in [package.json](package.json). The repo includes tests for catalog behavior, auth-role enforcement, storage safety, and editorial validation.

## Configuration and data behavior

### Environment variables

The repo keeps the environment contract in [.env.example](.env.example). The most relevant names are:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes for a local browser experience | Canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes for live data/auth | Public project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes for browser-safe client access | Public key for the app |
| `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` | Recommended | Callback URL for auth flow |
| `NEXT_PUBLIC_DEMO_MODE` | Optional | Explicit demo data toggle |
| server-side secrets | Only on a real deployment or backend setup | Keep out of the browser and out of source control |

### Explicit demo mode and empty states

The app has a deliberate pattern for empty and unavailable data:

- Demo mode is only enabled in non-production contexts.
- Demo data is clearly marked as synthetic and local-only.
- Empty tables do not get replaced with invented placeholder records.
- Database failures result in an explicit error state rather than fake success data.

This is covered in the catalog and auth tests under [tests](tests).

### Data access and permissions

The app’s trust model is built around a few principles:

- public reads only expose published data
- drafts and private evidence remain protected
- admin/editor permissions are enforced by backend and database logic
- the browser never holds privileged service-key material

The schema migrations and helper functions in [supabase](supabase) show this as the intended model.

### Database migrations

The repo uses SQL migrations as the source of schema truth. The migration files live under [supabase/migrations](supabase/migrations) and should be reviewed before applying changes to a shared environment.

Do not assume a remote reset is safe or appropriate. The repo guidance explicitly warns against destructive remote resets and expects controlled changes only.

## Testing and limitations

### What the current tests cover

The repository currently includes tests for:

- role checks and access boundaries
- demo mode and public catalog mapping
- database empty/error states
- upload validation and malicious content rejection
- editorial validation and unauthorized draft-save attempts

See [tests](tests).

### What is not yet fully proven

The repo is honest about the gap between code-level checks and hosted/browser verification. The current implementation includes real workflow logic, but the following items are still best described as pending or unverified unless a specific owner walkthrough is completed:

- end-to-end owner-admin browser publication flow
- direct live publication on a verified public deployment
- real production content and legal review
- email, CAPTCHA, and moderation workflows for later phases

### Known limitations

- This is not a production-ready launch announcement.
- The project has not been verified as a public deployment.
- There is no license file in the repository root, so license status should not be assumed.
- Future phases such as search, submissions, and launch hardening are intentionally separate from the current implementation.

## Documentation and contribution

The project keeps the detailed implementation notes in the docs folder:

- [docs/build-playbook.md](docs/build-playbook.md)
- [docs/product-spec.md](docs/product-spec.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/progress.md](docs/progress.md)
- [docs/implementation-audit.md](docs/implementation-audit.md)
- [docs/owner-setup.md](docs/owner-setup.md)

Contributions should:

- follow the build-playbook and current phase boundaries
- preserve the project’s evidence-first principle
- avoid fabricated reviews, fake metrics, or privileged key exposure
- keep credentials, sample secrets, and private evidence out of the repository
- run the relevant local checks before proposing changes

## License and disclosure

There is no `LICENSE` file in this repository at the moment. Because of that, the project should not be described as open-source under a specific license without one being added by the repository owner.

The project also does not claim a verified live deployment to `mcplist.com` from this repository snapshot alone. The intended domain is still `mcplist.com`, but the production launch status must be confirmed separately.

## Summary

This README is intentionally grounded in the repository as it exists today: a Next.js + Supabase-based app with a real schema, public app shell, auth gating, storage validation, and an editorial workflow scaffold. It is a meaningful implementation, but it is still a strategy and product-in-progress rather than a production-ready public directory.

The most important factual gap is the lack of a completed owner-verified browser walkthrough for the final publication flow and a live hosted deployment. Those are clearly called out in the status and limitations sections rather than being implied.
