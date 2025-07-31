-- Revert my-second:create_table from pg

BEGIN;

DROP TABLE mysecondapp.users;

COMMIT;
