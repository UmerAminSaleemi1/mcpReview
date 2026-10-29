-- Hosted Phase 2 storage and permission sanity checks.
-- These statements validate the public/private split and ensure member identities cannot escalate permissions.

-- Public catalog data should still be readable without auth.
select count(*) as public_servers_count from public.servers where status = 'published';
select count(*) as public_evidence_count from public.evidence_files where visibility = 'published';

-- Drafts and private evidence should stay hidden from anonymous reads.
select count(*) as draft_servers_count from public.servers where status <> 'published';
select count(*) as private_evidence_count from public.evidence_files where visibility = 'private';

-- Simulate a member identity and prove it cannot assign itself an editor/admin role.
select set_config(
  'request.jwt.claims',
  '{"sub":"b0b9bd54-dcb2-4944-8eca-99fc2c8eb567","role":"authenticated","email":"test@gmail.com"}',
  true
);

select auth.uid()::text as auth_uid;
select public.is_admin() as is_admin;
select public.is_editor_or_admin() as is_editor_or_admin;

DO $$
DECLARE
  row_count integer;
BEGIN
  UPDATE public.profiles
  SET role = 'editor'
  WHERE id = auth.uid()
  RETURNING 1 INTO row_count;

  IF row_count IS NULL THEN
    RAISE NOTICE 'Member role change blocked by policy: no rows updated.';
  ELSE
    RAISE NOTICE 'Unexpected member role-change success: %', row_count;
  END IF;
END $$;

-- Confirm the published evidence bucket is readable by anonymous callers only when visibility matches 'published'.
select count(*) as public_evidence_storage_visible
from storage.objects so
where so.bucket_id = 'public-evidence'
  and exists (
    select 1
    from public.evidence_files ef
    where ef.storage_path = so.name
      and ef.visibility = 'published'
  );

-- Confirm private evidence is not readable by a member-level identity.
select count(*) as private_evidence_storage_visible
from storage.objects so
where so.bucket_id = 'private-evidence'
  and public.is_editor_or_admin();
