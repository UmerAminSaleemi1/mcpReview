create table if not exists public.slug_redirects (
  slug text primary key,
  target_slug text not null,
  server_id uuid references public.servers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger slug_redirects_updated_at
before update on public.slug_redirects
for each row execute function public.set_updated_at();

alter table public.slug_redirects enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.slug_redirects to anon, authenticated;
grant insert, update, delete on public.slug_redirects to service_role;

grant select, insert, update, delete on public.slug_redirects to authenticated;

create policy "public_slug_redirects_read" on public.slug_redirects
for select using (true);

create policy "editor_and_admin_manage_slug_redirects" on public.slug_redirects
for all using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

create policy "audit_events_editor_write" on public.audit_events
for insert with check (public.is_editor_or_admin());
