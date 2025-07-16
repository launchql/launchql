-- Revert my-first:table_users from pg

BEGIN;

DROP TABLE myapp.users CASCADE;

COMMIT;
