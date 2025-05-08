-- Verify schemas/utils/procedures/ensure_singleton  on pg

BEGIN;

SELECT verify_function ('utils.ensure_singleton');

ROLLBACK;
