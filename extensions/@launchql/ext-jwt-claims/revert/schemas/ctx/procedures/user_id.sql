-- Revert schemas/ctx/procedures/user_id from pg

BEGIN;

DROP FUNCTION ctx.user_id;

COMMIT;
