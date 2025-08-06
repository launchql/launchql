-- Verify schemas/ctx/procedures/security_definer  on pg

BEGIN;

SELECT verify_function ('ctx.security_definer');

ROLLBACK;
