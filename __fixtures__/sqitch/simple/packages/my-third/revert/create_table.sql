-- Revert my-third:create_table from pg

BEGIN;

DROP TABLE mythirdapp.customers CASCADE;

COMMIT;
