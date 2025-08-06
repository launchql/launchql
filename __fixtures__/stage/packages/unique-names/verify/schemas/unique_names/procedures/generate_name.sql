-- Verify schemas/unique_names/procedures/generate_name  on pg

BEGIN;

SELECT verify_function ('unique_names.generate_name');

ROLLBACK;
