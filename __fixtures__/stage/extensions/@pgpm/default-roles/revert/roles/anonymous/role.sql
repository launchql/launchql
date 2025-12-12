-- Revert roles/anonymous/role from pg

BEGIN;

DO $revert$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
    REASSIGN OWNED BY anonymous TO CURRENT_USER;
    DROP OWNED BY anonymous CASCADE;
    BEGIN
      DROP ROLE anonymous;
    EXCEPTION
      WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Skipping drop of anonymous role because dependent objects remain elsewhere';
    END;
  END IF;
END;
$revert$;

COMMIT;
