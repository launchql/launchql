-- Revert schemas/utils/procedures/ensure_singleton from pg

BEGIN;

DROP FUNCTION utils.ensure_singleton;

COMMIT;
