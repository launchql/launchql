-- Verify schemas/uuids/procedures/pseudo_order_uuid  on pg

BEGIN;

SELECT verify_function ('uuids.pseudo_order_uuid');

ROLLBACK;
