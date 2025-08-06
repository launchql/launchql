-- Verify schemas/uuids/procedures/pseudo_order_seed_uuid  on pg

BEGIN;

SELECT verify_function ('uuids.pseudo_order_seed_uuid');

ROLLBACK;
