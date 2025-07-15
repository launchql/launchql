-- Revert tagged-linear:create_orders from pg

BEGIN;

DROP TABLE IF EXISTS app.orders CASCADE;

COMMIT;