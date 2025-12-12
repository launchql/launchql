-- Revert roles/authenticated/role from pg

BEGIN;

DO $revert$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REASSIGN OWNED BY authenticated TO CURRENT_USER;
    DROP OWNED BY authenticated CASCADE;
    BEGIN
      DROP ROLE authenticated;
    EXCEPTION
      WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Skipping drop of authenticated role because dependent objects remain elsewhere';
    END;
  END IF;
END;
$revert$;

COMMIT;
