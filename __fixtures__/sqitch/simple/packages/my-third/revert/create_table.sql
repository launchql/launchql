-- Revert my-third:create_table from pg

BEGIN;

DROP TABLE metaschema.customers;

COMMIT;
