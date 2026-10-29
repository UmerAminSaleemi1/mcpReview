-- Hosted permission check for a synthetic member identity.
-- This script intentionally uses a non-admin UUID and proves the direct DB path
-- denies role changes and editorial writes without a real editor/admin profile.
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","email":"member-test@example.invalid"}',
  true
);

select auth.uid()::text as auth_uid;
select current_setting('request.jwt.claims', true) as jwt_claims;
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
    RAISE NOTICE 'Role-change attempt: denied by RLS (no rows updated).';
  ELSE
    RAISE NOTICE 'Role-change attempt: unexpected row count %', row_count;
  END IF;
END $$;

DO $$
BEGIN
  INSERT INTO public.audit_events (
    actor_id,
    entity_type,
    entity_id,
    action,
    details
  ) VALUES (
    auth.uid(),
    'permissions_test',
    NULL,
    'member_write_attempt',
    '{"source":"direct_db_access"}'::jsonb
  );

  RAISE NOTICE 'Direct write unexpectedly succeeded.';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Direct write blocked by RLS: %', SQLERRM;
WHEN OTHERS THEN
  RAISE NOTICE 'Direct write blocked by policy: %', SQLERRM;
END $$;
