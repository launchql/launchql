-- Verify schemas/stamps/procedures/utils  on pg

BEGIN;

SELECT verify_function ('stamps.peoplestamps');
SELECT verify_function ('stamps.timestamps');

ROLLBACK;
