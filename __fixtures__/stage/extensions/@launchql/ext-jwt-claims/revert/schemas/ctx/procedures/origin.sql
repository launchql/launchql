-- Revert schemas/ctx/procedures/origin from pg

BEGIN;

DROP FUNCTION ctx.origin;

COMMIT;
