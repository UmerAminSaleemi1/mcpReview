# Supabase setup for Phase 2

This repository keeps the local app in explicit demo mode until the owner provides a valid Supabase development project.

## Required local variables

Add the values to a private `.env.local` file, not to source control:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_DEMO_MODE=false
```

Keep `NEXT_PUBLIC_DEMO_MODE=true` only while the app is intentionally using demo fixtures.

## Local database workflow

1. Start Docker if you are using the local Supabase stack.
2. Run the Supabase CLI in the development project to apply migrations.
3. Validate the public RLS and editor/admin permissions before enabling any staging or production data.

Example flow:

```bash
supabase start
supabase db reset
supabase db push
```

## Important guardrails

- Do not share real keys in chat or commit them to Git.
- Use a separate development project for local testing.
- Never run destructive remote resets against production.
- Browser and session-aware server clients should use the public Supabase URL and publishable key, preserving RLS and user sessions.
- A service-role key is only for explicit trusted admin-side operations that intentionally bypass RLS; it is not needed for normal browsing or authenticated page reads.
- Only public rows should be readable by visitors; private drafts and raw evidence remain protected by database policies.
