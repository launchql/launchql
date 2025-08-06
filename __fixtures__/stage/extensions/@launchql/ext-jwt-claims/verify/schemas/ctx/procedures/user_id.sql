-- Verify schemas/ctx/procedures/user_id  on pg

BEGIN;

SELECT verify_function ('ctx.user_id');

ROLLBACK;
