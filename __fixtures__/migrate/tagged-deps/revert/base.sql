-- Revert tagged-deps:base from pg

BEGIN;

DROP TABLE IF EXISTS base_config CASCADE;

COMMIT;