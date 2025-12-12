-- Revert schemas/secrets_schema/tables/secrets_table/table from pg

BEGIN;

DROP TABLE secrets_schema.secrets_table;

COMMIT;
