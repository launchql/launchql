-- Revert schemas/utils/procedures/throw from pg

BEGIN;

DROP FUNCTION utils.throw;

COMMIT;
