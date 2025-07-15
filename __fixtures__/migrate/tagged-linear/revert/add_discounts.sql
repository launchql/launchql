-- Revert tagged-linear:add_discounts from pg

BEGIN;

ALTER TABLE app.orders DROP COLUMN IF EXISTS discount_id;
DROP TABLE IF EXISTS app.discounts;

COMMIT;