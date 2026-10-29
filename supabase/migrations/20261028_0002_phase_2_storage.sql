-- Storage buckets and access controls for public logos, public evidence, and private raw evidence.
-- These policies keep private artifacts behind editor/admin access and reject active content types.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-logos', 'public-logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('public-evidence', 'public-evidence', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain', 'application/json', 'text/csv']),
  ('private-evidence', 'private-evidence', false, 20971520, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain', 'application/json', 'text/csv', 'application/zip'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_safe_storage_upload(bucket_id text, object_name text, mime_type text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select case
    when bucket_id = 'public-logos' then
      mime_type in ('image/png', 'image/jpeg', 'image/webp')
      and lower(object_name) !~ '(\.svg|\.html?|\.exe|\.bat|\.cmd|\.ps1|\.sh|\.js|\.mjs|\.cjs|\.jar|\.scr)$'
    when bucket_id = 'public-evidence' then
      mime_type in ('image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain', 'application/json', 'text/csv')
      and lower(object_name) !~ '(\.svg|\.html?|\.exe|\.bat|\.cmd|\.ps1|\.sh|\.js|\.mjs|\.cjs|\.jar|\.scr)$'
    when bucket_id = 'private-evidence' then
      mime_type in ('image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain', 'application/json', 'text/csv', 'application/zip')
      and lower(object_name) !~ '(\.svg|\.html?|\.exe|\.bat|\.cmd|\.ps1|\.sh|\.js|\.mjs|\.cjs|\.jar|\.scr)$'
    else false
  end;
$$;

create policy "public_logos_are_publicly_readable"
on storage.objects
for select
using (bucket_id = 'public-logos');

create policy "public_logos_require_editor_or_admin_write"
on storage.objects
for insert with check (
  bucket_id = 'public-logos'
  and public.is_editor_or_admin()
  and public.is_safe_storage_upload(bucket_id, name, coalesce(metadata->>'mimetype', ''))
);

create policy "public_logos_require_editor_or_admin_update"
on storage.objects
for update using (bucket_id = 'public-logos' and public.is_editor_or_admin())
with check (
  bucket_id = 'public-logos'
  and public.is_editor_or_admin()
  and public.is_safe_storage_upload(bucket_id, name, coalesce(metadata->>'mimetype', ''))
);

create policy "public_logos_require_editor_or_admin_delete"
on storage.objects
for delete using (bucket_id = 'public-logos' and public.is_editor_or_admin());

create policy "public_evidence_is_public_only_when_published"
on storage.objects
for select using (
  bucket_id = 'public-evidence'
  and exists (
    select 1
    from public.evidence_files ef
    where ef.storage_path = storage.objects.name
      and ef.visibility = 'published'
  )
);

create policy "public_evidence_require_editor_or_admin_write"
on storage.objects
for insert with check (
  bucket_id = 'public-evidence'
  and public.is_editor_or_admin()
  and public.is_safe_storage_upload(bucket_id, name, coalesce(metadata->>'mimetype', ''))
);

create policy "public_evidence_require_editor_or_admin_update"
on storage.objects
for update using (bucket_id = 'public-evidence' and public.is_editor_or_admin())
with check (
  bucket_id = 'public-evidence'
  and public.is_editor_or_admin()
  and public.is_safe_storage_upload(bucket_id, name, coalesce(metadata->>'mimetype', ''))
);

create policy "public_evidence_require_editor_or_admin_delete"
on storage.objects
for delete using (bucket_id = 'public-evidence' and public.is_editor_or_admin());

create policy "private_evidence_is_editor_admin_only"
on storage.objects
for select using (
  bucket_id = 'private-evidence'
  and public.is_editor_or_admin()
);

create policy "private_evidence_require_editor_or_admin_write"
on storage.objects
for insert with check (
  bucket_id = 'private-evidence'
  and public.is_editor_or_admin()
  and public.is_safe_storage_upload(bucket_id, name, coalesce(metadata->>'mimetype', ''))
);

create policy "private_evidence_require_editor_or_admin_update"
on storage.objects
for update using (bucket_id = 'private-evidence' and public.is_editor_or_admin())
with check (
  bucket_id = 'private-evidence'
  and public.is_editor_or_admin()
  and public.is_safe_storage_upload(bucket_id, name, coalesce(metadata->>'mimetype', ''))
);

create policy "private_evidence_require_editor_or_admin_delete"
on storage.objects
for delete using (bucket_id = 'private-evidence' and public.is_editor_or_admin());

-- Storage-read checks should be aligned with the evidence visibility table.
-- Regular members may browse published catalog data, but raw private evidence stays behind editor/admin access.
