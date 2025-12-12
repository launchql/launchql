-- Revert roles/administrator/role from pg

BEGIN;

DO $revert$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'administrator') THEN
    REVOKE anonymous FROM administrator;
    REVOKE authenticated FROM administrator;
    REASSIGN OWNED BY administrator TO CURRENT_USER;
    DROP OWNED BY administrator CASCADE;
    BEGIN
      DROP ROLE administrator;
    EXCEPTION
      WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Skipping drop of administrator role because dependent objects remain elsewhere';
    END;
  END IF;
END;
$revert$;

COMMIT;
