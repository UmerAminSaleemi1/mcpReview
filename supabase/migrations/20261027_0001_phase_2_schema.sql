create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.app_role as enum ('visitor', 'member', 'developer', 'editor', 'admin');
create type public.server_status as enum ('draft', 'review', 'published', 'archived');
create type public.review_status as enum ('draft', 'in_review', 'published', 'rejected', 'archived');
create type public.test_status as enum ('not_tested', 'unknown', 'passed', 'failed', 'partial');
create type public.evidence_visibility as enum ('private', 'published', 'redacted');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in ('editor', 'admin')
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories to anon, authenticated;
grant select on public.clients, public.collections, public.guides, public.server_categories, public.server_client_support to anon, authenticated;
grant select on public.servers, public.reviews, public.test_runs, public.test_results, public.evidence_files to anon, authenticated;
grant select, insert, update on public.profiles to authenticated, service_role;
grant select, insert, update on public.submissions to authenticated, service_role;
grant select, insert, update on public.audit_events to authenticated, service_role;

grant usage on all sequences in schema public to authenticated, service_role;

grant all on public.categories, public.clients, public.collections, public.evidence_files, public.guides, public.issue_reports, public.review_revisions, public.reviews, public.server_categories, public.server_client_support, public.servers, public.submissions, public.test_results, public.test_runs to service_role;

grant all on public.profiles to service_role;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create table public.servers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  category text not null default 'General',
  hosting text not null default 'Unknown',
  pricing text not null default 'Unknown',
  status server_status not null default 'draft',
  verified_at timestamptz,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create trigger servers_updated_at
before update on public.servers
for each row execute function public.set_updated_at();

create table public.server_categories (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (server_id, category_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table public.server_client_support (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  claimed_support boolean not null default false,
  tested_support boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique (server_id, client_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  version text not null,
  status review_status not null default 'draft',
  editor_id uuid references public.profiles(id) on delete set null,
  summary text not null,
  publisher_claims jsonb not null default '{}'::jsonb,
  verified_outcomes jsonb not null default '{}'::jsonb,
  source_material jsonb not null default '[]'::jsonb,
  tested_at timestamptz,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create table public.review_revisions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  revision_number integer not null default 1,
  summary text not null,
  body text,
  changes jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (review_id, revision_number)
);

create table public.test_runs (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  name text not null,
  environment text,
  scenario_version text,
  status test_status not null default 'not_tested',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger test_runs_updated_at
before update on public.test_runs
for each row execute function public.set_updated_at();

create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  test_run_id uuid not null references public.test_runs(id) on delete cascade,
  metric_name text not null,
  metric_value text,
  score numeric,
  result test_status not null default 'not_tested',
  notes text,
  created_at timestamptz not null default now()
);

create table public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete set null,
  server_id uuid references public.servers(id) on delete set null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  visibility evidence_visibility not null default 'private',
  sha256 text,
  size_bytes bigint,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid references public.profiles(id) on delete set null,
  server_name text not null,
  canonical_url text,
  email text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'needs_changes')),
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger submissions_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

create table public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  category text not null,
  description text not null,
  severity text not null default 'medium',
  status text not null default 'open' check (status in ('open', 'triaged', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status server_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger collections_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  server_id uuid not null references public.servers(id) on delete cascade,
  sort_order integer not null default 0,
  unique (collection_id, server_id)
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body text,
  status server_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger guides_updated_at
before update on public.guides
for each row execute function public.set_updated_at();

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_servers_status_published on public.servers (status, published_at desc);
create index if not exists idx_servers_slug on public.servers (slug);
create index if not exists idx_servers_name on public.servers using gin (name gin_trgm_ops);
create index if not exists idx_reviews_server_id on public.reviews (server_id, checked_at desc);
create index if not exists idx_test_results_run_id on public.test_results (test_run_id);
create index if not exists idx_evidence_server_id on public.evidence_files (server_id);
create index if not exists idx_audit_entity on public.audit_events (entity_type, entity_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.servers enable row level security;
alter table public.server_categories enable row level security;
alter table public.clients enable row level security;
alter table public.server_client_support enable row level security;
alter table public.reviews enable row level security;
alter table public.review_revisions enable row level security;
alter table public.test_runs enable row level security;
alter table public.test_results enable row level security;
alter table public.evidence_files enable row level security;
alter table public.submissions enable row level security;
alter table public.issue_reports enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.guides enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_read_own_record" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own_record" on public.profiles
for insert with check (auth.uid() = id and role = 'member');

create policy "profiles_update_own_record" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id and role = 'member');

create policy "profiles_admin_manage" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

create policy "published_servers_are_public" on public.servers
for select using (status = 'published');

create policy "editor_and_admin_manage_servers" on public.servers
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "public_categories_read" on public.categories
for select using (true);

create policy "editor_and_admin_manage_categories" on public.categories
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "public_review_view_for_published_servers" on public.reviews
for select using (
  exists (
    select 1 from public.servers s
    where s.id = reviews.server_id and s.status = 'published'
  )
);

create policy "editor_and_admin_manage_reviews" on public.reviews
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "public_test_runs_view_for_published_servers" on public.test_runs
for select using (
  exists (
    select 1
    from public.reviews r
    join public.servers s on s.id = r.server_id
    where r.id = test_runs.review_id and s.status = 'published'
  )
);

create policy "editor_and_admin_manage_test_runs" on public.test_runs
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "public_evidence_read_published_only" on public.evidence_files
for select using (visibility = 'published');

create policy "editor_and_admin_manage_evidence" on public.evidence_files
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "submissions_self_read" on public.submissions
for select using (auth.uid() = submitter_id or public.is_editor_or_admin());

create policy "submissions_self_create" on public.submissions
for insert with check (auth.uid() = submitter_id or submitter_id is null);

create policy "editor_and_admin_manage_submissions" on public.submissions
for update using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "public_collections_read" on public.collections
for select using (status = 'published');

create policy "editor_and_admin_manage_collections" on public.collections
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "public_guides_read" on public.guides
for select using (status = 'published');

create policy "editor_and_admin_manage_guides" on public.guides
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "audit_events_editor_read" on public.audit_events
for select using (public.is_editor_or_admin());

create policy "audit_events_admin_write" on public.audit_events
for insert with check (public.is_admin());

comment on table public.servers is 'Published directory entries for MCP servers.';
comment on table public.reviews is 'Editorial reviews and evidence, separate from the daily publication lifecycle.';
comment on table public.evidence_files is 'Public evidence and private raw artifacts with scoped access.';
comment on table public.submissions is 'Pending developer submissions and moderation records.';
comment on table public.audit_events is 'Immutable history for publication and permission-sensitive changes.';

-- Local setup note:
-- A full storage bucket setup should be created in Supabase dashboard or SQL with buckets named public-logos, public-evidence, and private-evidence.
-- Publish only sanitized files and never allow active HTML, SVG, or executable content without a justified sanitization pipeline.
