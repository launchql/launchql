-- Revert tagged-deps:add_features from pg

BEGIN;

DROP TABLE IF EXISTS features CASCADE;

COMMIT;