-- Revert schemas/ctx/procedures/user_agent from pg

BEGIN;

DROP FUNCTION ctx.user_agent;

COMMIT;
