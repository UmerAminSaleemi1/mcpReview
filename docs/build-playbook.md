# mcplist.com — Codex build playbook

Prepared October 27, 2026. This is a build specification and set of prompts, not an already implemented application. Complete one phase at a time. The first public release ends after Phase 5; the later phases are extensions.

## How to use this guide

1. Complete the prerequisites below.
2. Save this file in your project as `docs/build-playbook.md`. If the repository is empty, place it there before starting Codex.
3. Run Prompt 0 once. It creates the durable project brief and operating instructions.
4. Run the next numbered prompt in the same repository. Each prompt is self-contained when combined with the repository documents created by Prompt 0.
5. Review the result and complete the owner's checkpoint before moving on. Commit a working milestone after each phase.
6. In a fresh Codex conversation, use the restart prompt at the end, then give the next numbered prompt.

Do not paste all prompts as a single implementation task. Do not accept a phase as production-ready solely because Codex says it is; use the explicit acceptance checks.

## Prerequisites: what you do before running prompts

### A. Choose the development environment

Recommended beginner route: work in one local project folder using a Codex client that can read files, edit code, and run terminal commands. Install Git, a supported active-LTS Node.js release, and pnpm using the current official instructions for your operating system. Use VS Code if you want a conventional code editor. Sign in to Codex using the authentication method available to your account.

Verify these commands work: `git --version`, `node --version`, and `pnpm --version`. Docker is optional for Phase 0 but required if you choose the Supabase local-development stack in Phase 2. Codex should check current compatibility rather than blindly requiring the newest Node release.

Alternative: use a repository-connected hosted Codex environment with dependency installation and outbound access available. You may still need your own terminal or staging project to run a persistent preview or integrations. Ask Codex to report environment limitations explicitly.

### B. Create the repository

Create a private GitHub repository named `mcplist`. Clone it locally or open it in your selected coding environment. An empty repository with a README is fine. Do not add a second generated Next.js application inside an existing application.

Keep GitHub, hosting, database, email, and domain accounts in your own name or organization. Enable MFA. Give collaborators their own access rather than sharing passwords. Keep domain registration unchanged initially.

### C. Create only the accounts needed now

| Account/service | Needed before | Your action |
| --- | --- | --- |
| GitHub and Codex | Phase 0 | Open the correct repository in Codex |
| Vercel | Phase 5 | Connect repository; create previews before production |
| Supabase | Phase 2 | Choose local Supabase or a separate development project; reserve a separate production project |
| Domain registrar access | Phase 5 | Be ready to add host-provided DNS records |
| Resend | Phase 4 | Verify a sending domain/subdomain and configure DNS |
| Cloudflare Turnstile | Phase 4 | Create a widget; configure allowed development/staging/production hostnames |
| Sentry and Plausible | Phase 5 | Create monitoring/analytics projects |
| Trigger.dev | Phase 7 | Create a project and separate environment credentials |
| AI provider | Phase 7 | Enable API billing and set a budget |
| Isolated execution provider | Phase 8 | Choose and fund an appropriate sandbox or VM platform |
| Stripe | Phase 9 | Confirm country/business availability; start in test mode |

A Cloudflare Turnstile account does not require transferring your domain registration. Do not move DNS providers just to follow this guide.

### D. Prepare a small owner decision sheet

The defaults below let Codex start without a branding interview:

- Name: MCPList; domain: mcplist.com.
- Promise: “Find the right MCP server. See it tested before you connect.”
- Audience: developers and people connecting tools to AI assistants.
- Language: English first. Design data structures so localization can be added later.
- Look: light background, dark text, restrained teal accent, readable typography, clean cards, evidence-focused layouts.
- No paid placements at launch.
- No public user star ratings or open comments at launch.
- No one-click installer or arbitrary package execution from submissions.
- Browse and read without an account.
- Launch with a target of 20–30 verified listings/reviews; a smaller honest collection is preferable to invented evidence.

Before public launch, provide a real contact address, publisher identity, editorial policy, and privacy/terms text appropriate to the actual service and jurisdiction. Draft legal pages are not automatically sufficient.

### E. Keep credentials out of prompts

Let Codex create `.env.example` with names and comments. Enter real values into ignored local environment files and the hosting provider's secret settings. Do not paste production passwords, secret API keys, customer tokens, or recovery codes into chat.

Expected variable names are below. Codex must verify current SDK/provider conventions and document any changes. Only genuinely browser-safe values may use the `NEXT_PUBLIC_` prefix.

| Variable | Visibility | Phase |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public canonical URL | 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL | 2 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public SDK key, protected by database policies | 2 |
| Supabase privileged server key, only if required | Server secret; choose current documented key name | 2 |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EDITOR_NOTIFICATION_EMAIL` | Server configuration | 4 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public widget key | 4 |
| `TURNSTILE_SECRET_KEY` | Server secret | 4 |
| Sentry runtime/build configuration | DSN visibility differs from upload/auth secrets | 5 |
| Plausible site/domain configuration | Public tracking configuration | 5 |
| Trigger.dev environment credentials | Server/worker secrets | 7 |
| AI provider API key and configured model identifier | Server secrets/configuration | 7 |
| Sandbox API credentials | Isolated worker secrets | 8 |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, server-side price IDs | Server secrets/configuration | 9 |

Do not store a database password in browser code. Prefer migrations run through appropriately scoped developer/CI credentials; the web application should not need schema-administration credentials.

## Prompt 0 — Establish the specification and inspect the environment

Paste this once:

```text
You are implementing mcplist.com, an evidence-based directory and editorial review platform for Model Context Protocol (MCP) servers. Read docs/build-playbook.md first. If it is attached instead, save the supplied document there. Inspect the repository and existing instructions before editing. Preserve existing work.

Product: visitors discover servers, inspect independently checked reviews, compare alternatives, and follow client-specific setup instructions. Developers submit listings and later propose updates. Editors control publication. Never invent tests, compatibility, pricing, endorsements, or security conclusions.

Preferred stack: TypeScript, Next.js App Router, React, Tailwind CSS, shadcn/ui, Supabase Postgres/Auth/Storage, Supabase client and SQL functions, Zod, React Hook Form, Postgres full-text search and pg_trgm, Vercel. Later: Resend, Turnstile, Sentry, Plausible, Vitest, Playwright, Trigger.dev, one AI provider, official MCP SDK with isolated workers, Stripe Checkout. Verify current official docs during implementation. Do not add a separate API framework, ORM, CMS, search engine, Redis, or microservices without a concrete need.

Create concise repository guidance in AGENTS.md, plus docs/product-spec.md, docs/architecture.md, docs/decisions.md, docs/progress.md, and docs/owner-setup.md. Keep the detailed brief out of AGENTS.md; link to it there. Describe phases, trust labels, permissions, data ownership, environments, launch scope, and acceptance gates. Record the package manager, supported runtime, and actual commands once determined.

Durable engineering rules:
- Implement only the requested phase. Finish authorized local implementation and verification rather than stopping at a plan.
- Inspect existing code first. Make routine choices and record them. Ask only for genuinely blocking decisions, account actions, or credentials that cannot be supplied securely another way.
- Use local/test data and separate staging/production resources. Never reset a remote production database, change live DNS, charge real money, send bulk email, or launch arbitrary third-party packages without explicit authorization for that operation.
- Public reads expose only published data. Enforce roles server-side and in database grants/policies. Do not derive admin rights from user-editable metadata.
- Keep secrets out of browser bundles, logs, source control, fixtures, and chat. Use .env.example with placeholders.
- Treat developer submissions, imported text, and MCP output as untrusted data. No automatic execution of submitted packages.
- No fabricated real-server reviews. Synthetic fixtures must be visibly marked and excluded from production and indexing.
- All mutations validate input. Render user-controlled text safely. Check permissions on every privileged operation.
- Create meaningful tests for permissions and important behavior. Run applicable lint, type checks, tests, and production build. Do not claim unrun checks passed.
- Update docs/progress.md after each phase: completed work, commands/results, pending owner steps, blockers, and next phase. Clearly separate implemented, configured, and verified.
- Finish each phase with a concise report of what works, how the owner can inspect it, exact owner setup steps, verification, and remaining limitations.

For this phase only: check the runtime, package manager, Git status, dependency/network access, and available browser/test tools. Produce the documents and a phase plan. Do not scaffold the application yet. Do not install optional paid integrations.

Done when the project has a clear durable brief, environment readiness report, and actionable prerequisites for Phase 1.
```

**Owner checkpoint:** confirm Codex is in the right repository and that it identifies any missing runtime/network access. Review `docs/owner-setup.md`. Commit the project documents.

## Prompt 1 — Build the application shell and visual system

```text
Implement Phase 1 of docs/build-playbook.md. Read AGENTS.md and the project documents. Follow the agreed architecture and preserve existing work.

Create or extend the Next.js TypeScript application in the repository root. Use stable compatible dependencies, pnpm, Tailwind, and shadcn/ui. Record runtime/package-manager versions and commit the lockfile. Establish lint, typecheck, test, dev, and build commands.

Design a polished responsive directory: warm light background, dark readable text, teal accent, restrained borders, strong typography, useful information density. Make keyboard focus, labels, contrast, reduced-motion behavior, and mobile navigation work. Avoid decorative charts, fake usage counters, or unsupported trust claims.

Build the shared header/footer, cards, badges, search controls, filter layout, comparison selector, empty/loading/error states, and accessible forms. Implement initial routes: /, /servers, /servers/[slug], /categories/[slug], /compare, /reviews, /collections, /collections/[slug], /guides, /guides/[slug], /submit, /how-we-test, /about, /contact, /privacy, /terms. Empty collections/guides are acceptable until content exists; do not create broken links. Never show success for an unwired form; show a truthful unavailable state.

The server page must cover verdict, capabilities, test evidence, permissions/data access, claimed versus tested compatibility, pricing checked date, setup instructions, alternatives, and review history. Show Unknown/Not tested where appropriate. Keep publication state distinct from test state.

Use a typed fixture repository for this phase so database integration can replace it cleanly. Synthetic examples must say Demo data. Keep this development fixture mode opt-in, noindex, and incapable of appearing as production evidence. No external API credentials are needed now.

Implement basic metadata and responsive layouts. Add .env.example and a beginner README with exact run instructions. Capture representative desktop/mobile views if tools support it; otherwise record the manual visual checks still needed. Verify navigation, empty states, basic keyboard use, typecheck, lint, and production build. Do not connect a live domain.

Done when an owner can run and inspect the complete public UI shell locally, with truthful demo data and no broken navigation. Update progress and owner setup documents.
```

**Owner checkpoint:** view the home, explore, and detail pages on desktop and phone widths. Confirm the design and information hierarchy before building more. Demo pages are not ready for public indexing.

## Prompt 2 — Database, authentication, and permissions

Before this phase: install Docker for local Supabase, or create a dedicated development Supabase project. Production must be separate. Let Codex specify the current supported SDK setup and keys in `.env.example`; enter values privately.

```text
Implement Phase 2. Read the repository instructions and docs. Replace the fixture repository with Supabase-backed production data access while preserving explicit local demo mode.

Use Supabase SQL migrations as the source of schema truth and generate TypeScript database types. Implement servers, categories, server_categories, clients, server_client_support, reviews, review_revisions, test_runs, test_results, evidence_files, submissions, issue_reports, profiles, controlled role assignments, and audit_events. Create simple collection/guide content tables if the existing UI requires them. Define foreign keys, uniqueness, status constraints, timestamps, and appropriate initial indexes.

Preserve historical evidence: reviews must identify the version, test context, and source material they rely on. Separate publisher claims from verified outcomes. Give pricing currency/billing context and checked dates. Never equate untested with failed. Design publication and testing lifecycles independently.

Set up Supabase Auth for admin/editor sign-in using the current official Next.js integration. Establish visitor/member/developer/editor/admin roles; only admin/editor functionality is needed now. Implement a safe first-admin bootstrap procedure outside public sign-up. User-editable metadata cannot assign roles. Use database grants and row-level policies together; expose only published records and public evidence to visitors. Keep private submissions, review drafts, account information, and raw evidence inaccessible. No privileged key in the browser.

Create storage buckets/policies for public logos, approved public evidence, and private raw evidence. Restrict file size/types; do not accept active HTML/SVG uploads or executable content without a justified sanitization pipeline. Raw evidence uses short-lived authorized access, not public URLs.

Add migration and allow/deny policy tests for visitors, ordinary members, editors, and admins. Verify that direct API calls cannot read drafts, assign roles, overwrite another person's data, or expose raw logs. Protect authenticated server-side caching from leaking private data.

Document local reset commands separately from remote migrations. Never run a destructive remote reset. Seed only explicitly synthetic local data. Production with no content must show real empty states. Configure development and staging resources only where credentials/authorization are available. If live verification is blocked, complete and test local paths, explain the exact missing owner step, and do not label the integration verified.

Done when public pages read published database content, authentication works in a test environment, policy tests demonstrate isolation, and migrations reproduce the schema. Update docs and run relevant checks.
```

**Owner checkpoint:** sign in with a test account. Verify an ordinary account cannot access the admin area. Confirm production and development do not share credentials. Review the actual policy test results.

## Prompt 3 — Editorial dashboard and real publishing

```text
Implement Phase 3. Read repository guidance and current progress. Build /admin using the existing application, database, and role system.

Editors need searchable listing/review tables, draft editing, slug management, category/client assignment, pricing and permission fields, setup guides, test-run/result entry, evidence uploads, preview, and publication controls. Admins need role management through a controlled server-side operation. Developers and members must not access these operations.

Use constrained Markdown for editorial content with safe rendering; no arbitrary executable MDX or unsanitized HTML. Handle validation errors, loading, failed uploads, conflicting edits, and unsaved changes. Preview drafts only for authorized sessions or narrowly scoped expiring access. Draft responses must not enter public caches or search indexes.

Implement publication validation. Reviewed labels require relevant evidence and review metadata. Compatibility badges distinguish claimed support and tested support. A documentation summary cannot be marked hands-on reviewed. Redact private data before evidence becomes public. Publishing creates a review revision and audit event atomically where applicable. Keep old slugs redirected after rename.

Allow editors to enter manual test results before automated testing exists. Store test scenario versions and distinguish structured measurements from editorial assessments. Ratings, if used, follow the documented rubric; missing scores remain missing. Do not generate arbitrary numeric ratings.

Implement the methodology page and editorial/sponsorship disclosure drafts. Mark any owner/legal information that needs completion in the setup checklist, not as fake public facts. Create a content-entry template and a repeatable checklist for each real MCP review. Do not scrape or invent 30 reviews to fill the database.

Test draft -> preview -> publish -> public view -> revision -> unpublish. Test unauthorized mutation attempts, sanitization, invalid evidence uploads, and publication requirements. Verify unpublishing invalidates cached public pages. Update docs and run applicable checks.

Done when an editor can publish and revise a truthful evidence-backed listing without editing source code, and unauthorized users cannot perform the same actions.
```

**Owner checkpoint:** publish one real listing with your own verified information in staging. Review how Unknown, Not tested, and Reviewed appear. Confirm you can unpublish it.

## Prompt 4 — Discovery, comparison, submissions, and email

Before this phase: configure Resend and Turnstile test/staging credentials. Configure Supabase authentication email delivery and redirect allowlists according to the current provider documentation. Do not send promotional mail.

```text
Implement Phase 4 using the existing stack.

Build database-backed keyword search with Postgres full-text search, suitable GIN indexes, and pg_trgm name similarity. Use parameterized queries/SQL functions, validated sort fields, pagination, and sensible query limits. Rank exact names highly; search capabilities/use cases too. Add category, client, hosting, price, and review-status filters. Persist filters in shareable URL parameters. Clearly indicate whether compatibility is claimed or tested. Do not add a separate search service or AI search.

Implement comparison of up to three published servers with validated identifiers and a shareable URL. Compare actual structured fields and date-stamped evidence; show Unknown where needed. Ensure mobile and keyboard use work.

Wire /submit and correction reports with Zod validation, server-validated Turnstile, persistent shared rate limits, duplicate detection, and pending moderation. Do not rely on per-process memory limits in serverless production. Keep contact emails private. Acknowledge submission without exposing moderation data. Add moderation queues to /admin. No arbitrary URL fetching or package execution on submission.

Integrate Resend server-side for narrowly scoped transactional acknowledgements/editor notifications. Prevent the form becoming an email relay: fixed templates, bounded content, cooldowns, and verified destinations where needed. Use a persistent outbox or equivalent delivery record with duplicate protection and bounded retries. Website submission should survive temporary email-provider failure. Development defaults to safe test delivery. Do not notify real audiences without an authorized live action.

Make /contact operational or clearly provide the owner's verified address. Add method/access checks and appropriate CSRF/origin protection for cookie-authenticated mutations. Ensure all privileged mutations recheck authorization.

Test search relevance with representative queries, combined filters, malformed input, comparison limits, submission moderation, CAPTCHA failure, rate limits, duplicate submissions, and email failure/retry behavior. Record blocked live tests honestly. Update docs and run relevant checks.

Done when a visitor can discover and compare published servers, submit a proposed listing, and have it reviewed through a real moderation workflow.
```

**Owner checkpoint:** search common task phrases, submit a test listing, and approve it. Test email only to accounts you control. Review the no-results searches for missing content or synonyms.

## Prompt 5 — Launch readiness, hosting, and operational checks

Before this phase: prepare Vercel, production Supabase, email DNS, contact/legal content, Sentry, and Plausible. Check current provider pricing and commercial-use terms. Do not assume a free hobby hosting plan covers a commercial directory.

```text
Implement Phase 5: prepare mcplist.com for an initial public release. Read docs and audit the existing implementation rather than replacing it.

Finish SEO: unique metadata, canonical URLs, sitemap containing only suitable published pages, robots directives, social sharing images, breadcrumbs, internal links, redirects, and structured data supported by visible content. Do not promise search rich results or publish fabricated review markup. Keep account/admin/drafts and low-value filter combinations out of indexing. Handle deleted/unpublished records correctly.

Integrate Sentry with secret/data scrubbing and safe source-map upload configuration; add Plausible with a documented event taxonomy for setup clicks, comparisons, and submissions. Do not collect secrets or raw sensitive search text. Document external uptime checks and alerts. Implement security headers compatible with the app, validate environment variables, review third-party scripts, and verify no privileged secrets enter the browser build.

Add GitHub Actions or equivalent CI for lint, typecheck, relevant unit/policy tests, browser smoke tests where feasible, and production build. Document separate secret scopes for preview, staging, and production. Pin the selected runtime/package manager. Confirm production cannot silently enable demo fixtures or test email bypasses. Add a safe deployment procedure: backward-compatible migrations where needed, app rollout, smoke checks, and rollback limitations. Do not assume app rollback reverses database migrations.

Create docs/launch-checklist.md and docs/runbook.md covering account ownership, MFA, DNS records supplied by the actual host, HTTPS, canonical redirects, auth redirect allowlists, email DNS, billing alerts, monitoring, retention, database backups, separate file backups, restore drill, incident response, and secret rotation. Verify actual backup coverage instead of assuming storage objects are inside a database backup.

Audit keyboard/mobile behavior, broken links, performance, permissions, XSS, upload access, caching of private content, and auth redirects. Fix concrete findings. Test the main public and editorial journeys with Playwright. Record tools/results and any manual checks still required. Test restoration on nonproduction resources.

Create a production-content audit. Clearly list missing owner information, draft legal pages, unverified reviews, demo records, and broken external links. Do not invent publisher identity, legal compliance, evidence, or review volume to clear the gate.

Prepare a preview/staging deployment if hosting access permits. Complete all reviewable build work before requesting any necessary production authorization. Do not change live DNS or publish production solely from this prompt. End with a concrete go/no-go report and exact remaining owner actions, distinguishing code-ready from configuration-ready and launch-ready.

Done when the release is reviewable in staging, required checks pass or are explicitly blocked, and a precise production rollout/rollback procedure exists. Initial MVP scope ends here.
```

**Owner checkpoint:** finish real content and legal/contact review; inspect staging; run the restore drill; resolve launch blockers. Then authorize the exact release action, for example:

```text
Deploy the reviewed release from commit [COMMIT] to the production mcplist Vercel project and apply the reviewed non-destructive migrations to the production Supabase project [PROJECT]. Use existing configured secrets; do not print them. Do not change DNS yet. Verify smoke tests and report the deployment URL and rollback reference.
```

Replace bracketed values with real references. After verifying that deployment, connect the domain using the host's actual DNS instructions. Preserve existing email DNS records. You can authorize Codex to perform that separately if its tools and account permissions support it.

## Prompt 6 — Member accounts and verified developer ownership

Before this phase: validate authentication email delivery and configured URLs. Add GitHub OAuth only if desired; use current provider-specific callback guidance.

```text
Implement Phase 6 without restricting public browsing behind login. Extend the existing Supabase Auth integration with member accounts, bookmarks, follows, and notification preferences. Add secure sign-out, recovery/error states, and account deletion handling appropriate to existing data relationships. Preserve editorial audit history without unnecessarily retaining personal data.

Add ownership_claims and a developer dashboard. Implement one concrete verification method first: preferably a narrowly scoped GitHub integration proving repository administration, or a random expiring DNS TXT challenge for an official domain. A matching display name/email or ownership of any GitHub account is insufficient. If verification requires outbound requests, implement SSRF-resistant allowlisting/validation and bounded timeouts. Bind verification to the exact listing and account, expire challenges, prevent replay, and support admin revocation with audit history.

Verified developers can propose factual listing changes but cannot alter independent reviews, ratings, evidence, or other listings. Route proposed changes through editorial approval; preserve before/after history. Show submission/claim status only to authorized users.

Follows require explicit opt-in and configurable frequency. Store preferences now; send digests only after the durable job system is implemented. Do not send speculative alerts or promotional messages by default.
```
