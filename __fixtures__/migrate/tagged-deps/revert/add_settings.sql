-- Revert tagged-deps:add_settings from pg

BEGIN;

DROP TABLE IF EXISTS settings CASCADE;

COMMIT;