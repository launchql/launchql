-- Verify schemas/stamps/procedures/utils  on pg

BEGIN;

SELECT verify_function ('stamps.utils');

ROLLBACK;
