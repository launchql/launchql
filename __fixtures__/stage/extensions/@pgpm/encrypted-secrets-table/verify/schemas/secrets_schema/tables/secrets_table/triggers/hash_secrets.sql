-- Verify schemas/secrets_schema/tables/secrets_table/triggers/hash_secrets  on pg

BEGIN;

SELECT verify_function ('secrets_schema.tg_hash_secrets'); 
SELECT verify_trigger ('secrets_schema.hash_secrets_update');
SELECT verify_trigger ('secrets_schema.hash_secrets_insert');

ROLLBACK;
