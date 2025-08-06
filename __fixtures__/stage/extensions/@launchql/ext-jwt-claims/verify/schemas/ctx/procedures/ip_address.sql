-- Verify schemas/ctx/procedures/ip_address  on pg

BEGIN;

SELECT verify_function ('ctx.ip_address');

ROLLBACK;
