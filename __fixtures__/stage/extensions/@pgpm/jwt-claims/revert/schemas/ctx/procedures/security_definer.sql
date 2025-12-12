-- Revert schemas/ctx/procedures/security_definer from pg

BEGIN;

DROP FUNCTION ctx.security_definer;
DROP FUNCTION ctx.is_security_definer;

COMMIT;

