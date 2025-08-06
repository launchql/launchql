-- Verify schemas/ctx/procedures/origin  on pg

BEGIN;

SELECT verify_function ('ctx.origin');

ROLLBACK;
