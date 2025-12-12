-- Verify schemas/secrets_schema/tables/secrets_table/table on pg

BEGIN;

SELECT verify_table ('secrets_schema.secrets_table');

ROLLBACK;
