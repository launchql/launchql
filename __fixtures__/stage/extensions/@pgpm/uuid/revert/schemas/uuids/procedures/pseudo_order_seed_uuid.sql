-- Revert schemas/uuids/procedures/pseudo_order_seed_uuid from pg

BEGIN;

DROP FUNCTION uuids.pseudo_order_seed_uuid;

COMMIT;
