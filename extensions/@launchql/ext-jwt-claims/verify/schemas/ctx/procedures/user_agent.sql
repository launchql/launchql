-- Verify schemas/ctx/procedures/user_agent  on pg

BEGIN;

SELECT verify_function ('ctx.user_agent');

ROLLBACK;
