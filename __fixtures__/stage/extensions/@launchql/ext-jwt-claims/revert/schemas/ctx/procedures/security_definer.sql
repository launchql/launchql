-- Revert schemas/ctx/procedures/security_definer from pg

BEGIN;

DROP FUNCTION ctx.security_definer;

COMMIT;
