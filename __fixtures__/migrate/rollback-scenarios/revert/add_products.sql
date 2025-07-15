-- Revert rollback-scenarios:add_products from pg
BEGIN;
-- add_products rollback
COMMIT;
