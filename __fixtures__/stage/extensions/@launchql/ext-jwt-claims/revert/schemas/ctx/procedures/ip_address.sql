-- Revert schemas/ctx/procedures/ip_address from pg

BEGIN;

DROP FUNCTION ctx.ip_address;

COMMIT;
