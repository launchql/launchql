-- Revert schemas/stamps/procedures/utils from pg

BEGIN;

DROP FUNCTION stamps.utils;

COMMIT;
