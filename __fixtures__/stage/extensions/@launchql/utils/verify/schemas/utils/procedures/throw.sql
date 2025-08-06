-- Verify schemas/utils/procedures/throw  on pg

BEGIN;

SELECT verify_function ('utils.throw');

ROLLBACK;
