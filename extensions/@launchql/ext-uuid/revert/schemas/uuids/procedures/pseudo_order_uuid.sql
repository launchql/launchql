-- Revert schemas/uuids/procedures/pseudo_order_uuid from pg

BEGIN;

DROP FUNCTION uuids.pseudo_order_uuid;

COMMIT;
