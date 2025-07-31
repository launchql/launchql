-- Revert my-first:table_users from pg

BEGIN;

DROP TABLE myfirstapp.users;

COMMIT;
