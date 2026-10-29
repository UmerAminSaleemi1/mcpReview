# Phase 2 diagnosis

## Why Phase 2 is still incomplete

Phase 2 is partly implemented, but not complete. The repository contains the code path for browser login, server-side session lookup, and a role gate for protected routes, and the hosted Supabase project is configured and migrated. The gap is not an obvious application bug in the auth flow; the first unresolved issue is the lack of completed owner-side browser validation with a real development account and the missing storage safety implementation. The acceptance criteria still require real end-to-end proof and storage policy enforcement, not just passing code/build checks.

## Real flow: login -> Supabase auth -> cookies -> profile lookup -> role check -> protected route

The current code implements the expected path:

- Login page: [app/auth/login/page.tsx](../app/auth/login/page.tsx)
  - Uses `createBrowserSupabaseClient()`.
  - Calls `supabase.auth.signInWithPassword({ email, password })`.
  - Redirects to the requested `next` route after success.

- Session/cookie handling: [lib/supabase.ts](../lib/supabase.ts)
  - `createServerSupabaseClient()` reads the cookie store with `next/headers` and creates a server-side Supabase client.
  - This is the session-aware path used by server components.

- Callback handling: [app/auth/callback/route.ts](../app/auth/callback/route.ts)
  - Reads the OAuth code from the URL.
  - Calls `supabase.auth.exchangeCodeForSession(code)`.
  - Redirects back to the requested page.

- Profile lookup and role resolution: [lib/auth.ts](../lib/auth.ts)
  - `getSessionProfile()` calls `supabase.auth.getUser()`.
  - It checks `public.profiles` for a row whose `id` equals `auth.uid()`.
  - If no row exists, it inserts a row with `role = 'member'` and the current email.
  - It returns `role` and `isLoggedIn` for the server-side route gate.

- Protected route: [app/admin/page.tsx](../app/admin/page.tsx)
  - Denies access unless `isLoggedIn` is true and `canManageEditors({ role })` returns true.
  - That means only `editor` and `admin` can reach the protected editor/admin lane.

This is implemented as intended. The remaining problem is verification, not a clear bug in the server-side logic itself.

## Live profile status for the known test user

The known development Auth user is:

- `b0b9bd54-dcb2-4944-8eca-99fc2c8eb567`

Read-only query executed against the linked hosted Supabase project:

```sql
select id, email, role
from public.profiles
where id = 'b0b9bd54-dcb2-4944-8eca-99fc2c8eb567';
```

Result:

```json
{
  "rows": [
    {
      "email": "test@gmail.com",
      "id": "b0b9bd54-dcb2-4944-8eca-99fc2c8eb567",
      "role": "member"
    }
  ]
}
```

This confirms the matching profile row exists and the role is `member`. No password or token was exposed.

## First failing or unverified step

The first remaining step is not a reproduced code failure. It is an unverified real-world auth and browser-session check:

- sign in with the actual owner-controlled Auth user in the app
- confirm the browser receives and sends the session cookies
- confirm `/admin` denies access for `member`
- confirm the session is still valid after refresh and sign-out

Why this is still the first blocker:

- The code path is implemented and consistent with the schema in [supabase/migrations/20261027_0001_phase_2_schema.sql](../supabase/migrations/20261027_0001_phase_2_schema.sql).
- The live profile row exists with `role = 'member'`.
- No direct application error was reproduced in the repository or against the linked project during diagnosis.
- The missing end-to-end proof is therefore reported as `unverified`, not as an invented code defect.

## Requirement-by-requirement diagnosis

| Requirement | Actual evidence | Status | Exact fix | Who can perform it |
| --- | --- | --- | --- | --- |
| Public database reads are explicit and safe | [lib/supabase.ts](../lib/supabase.ts), [lib/catalog.ts](../lib/catalog.ts), and the repo’s catalog tests cover demo mode, empty-db, and error handling. | Implemented and documented | Keep current explicit empty/error behavior; no code change needed for this requirement. | Developer |
| Login page -> Supabase auth -> session cookies | [app/auth/login/page.tsx](../app/auth/login/page.tsx), [app/auth/callback/route.ts](../app/auth/callback/route.ts), [lib/supabase.ts](../lib/supabase.ts) | Implemented in code; end-to-end browser proof still missing | Verify sign-in in a real browser with the owner-controlled development account and confirm cookies/session round-trip. | Owner with Supabase Auth access |
| Profile lookup by user ID and role check | [lib/auth.ts](../lib/auth.ts), live query result showing `role = 'member'` for the test user | Implemented and live DB state matches expectation | No code fix required; keep member role unless an owner explicitly changes it for a controlled bootstrap. | Owner / developer |
| Protected route enforcement | [app/admin/page.tsx](../app/admin/page.tsx), [lib/auth.ts](../lib/auth.ts) | Implemented in code; browser proof still unverified | Sign in as `member` and confirm access is denied. Sign in as a `editor/admin` user only in a controlled future test. | Owner |
| Safe first-admin bootstrap outside public sign-up | The schema and helper functions are present in [supabase/migrations/20261027_0001_phase_2_schema.sql](../supabase/migrations/20261027_0001_phase_2_schema.sql); the actual bootstrap procedure is not yet validated in a browser flow | Partially implemented; bootstrap not yet proven | Use an owner-controlled Supabase dashboard or SQL workflow to grant a controlled admin/editor session only when explicitly authorized; keep it out of public sign-up. | Owner |
| Storage buckets and policies for public logos, public evidence, and private evidence | The migration includes a comment noting the intended buckets, but no bucket creation, upload validation, or policies are implemented in the repository or linked project | Missing implementation | Create `public-logos`, `public-evidence`, and `private-evidence` buckets; add MIME/size validation; reject HTML/SVG/executable uploads; add private signed-URL access for proof artifacts. | Owner + Supabase admin |
| Public/private evidence access control | [supabase/migrations/20261027_0001_phase_2_schema.sql](../supabase/migrations/20261027_0001_phase_2_schema.sql) includes RLS for `public.evidence_files`, but storage policies and real upload tests are not present | Missing implementation / not yet proven | Add storage policies and run hosted deny/allow checks for public vs private artifacts. | Owner + Supabase admin |
| Policy tests for visitors, members, editors, admins | Some migration and logic checks exist, but the full allow/deny verification is incomplete | Incomplete / unverified | Run direct SQL and browser-based policy checks against the hosted project with real auth identities. | Owner |
| Local Supabase Docker startup | Local Supabase start is blocked by environment/tooling issues; this does not block the hosted-progress workflow | Optional local tooling problem | Ignore unless the owner needs a local shadow environment; current hosted path is the authoritative workflow. | Owner |

## Missing implementation vs. incorrect code vs. config vs. tests

### Missing implementation

- Storage buckets and storage policies for public/private evidence are still missing.
- Real hosted file-safety policy tests for upload rejection and private access are not present.

### Incorrect application code

- No reproducible incorrect code path was found in the current login/profile/role flow during this read-only diagnosis.
- The code is internally consistent with the schema and the current role logic.

### Missing account/profile/configuration

- The known auth user profile used in the app must continue to be validated in the real browser flow.
- The app will only function as intended when the owner-controlled Auth user and profile row are confirmed in the live hosted project.

### Tests not yet executed

- Browser end-to-end sign-in and `/admin` role denial for a real member account.
- Hosted SQL/permission tests for `private` vs `published` evidence access.
- Storage upload validation and deny/allow checks.

### Optional local tooling problems

- Local Docker-based Supabase startup is a tooling/environment issue and is not the first blocker for the hosted workflow.
- The repo’s linked hosted Supabase project is the authoritative environment for Phase 2 verification.

## Phase 2 acceptance criteria check

The Phase 2 acceptance checklist still includes required work that is either incomplete or unproven:

1. Public pages read published database content.
   - Implemented in code and database access layer.
   - Status: largely satisfied.

2. Authentication works in the test environment.
   - Auth routes and role-gate logic are implemented.
   - Status: code complete, browser verification still unverified.

3. Policy tests demonstrate isolation.
   - Migration-level policies exist.
   - Status: incomplete without direct hosted proof.

4. Migrations reproduce the schema.
   - Migration is present and applied to the linked project.
   - Status: satisfied.

5. Storage buckets/policies exist for public and private evidence.
   - Not implemented.
   - Status: missing.

6. Private/raw evidence is not publicly readable or globally exposed.
   - Not implemented in storage policy controls.
   - Status: missing.

7. No privileged service-role key is exposed in browser code.
   - The current codebase follows the intended pattern.
   - Status: satisfied.

8. Data is kept separate from demo mode.
   - Current code explicitly keeps demo mode opt-in and off by default.
   - Status: satisfied.

9. The editor/admin lane is restricted to the correct roles.
   - Code-level implementation exists.
   - Status: implemented, but real owner-auth validation remains unverified.

## Smallest ordered plan to finish Phase 2

1. Owner signs in to the hosted Supabase project and confirms the real Auth user for `b0b9bd54-dcb2-4944-8eca-99fc2c8eb567` exists and is usable in the app.
2. In a browser, prove the member role cannot access `/admin` and that a valid session persists through refresh.
3. In the Supabase project, create the storage buckets and policies for `public-logos`, `public-evidence`, and `private-evidence`.
4. Run direct SQL and upload-policy checks to confirm private evidence is not public and hostile files are rejected.
5. Record the final owner-verified completion result and close out Phase 2 before starting Phase 3.

## Owner-only actions that cannot be completed from this code environment

- Real browser sign-in of the owner-controlled Auth user and confirmation of the cookie/session flow.
- Final hosted Supabase Dashboard configuration for storage buckets and exact policies.
- Final allow/deny verification against the live database using real owner identities.
- Any explicit admin/editor bootstrap action that changes a role in a production or development project.

No additional code or role changes were made during this diagnosis.
