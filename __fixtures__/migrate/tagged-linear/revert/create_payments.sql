-- Revert tagged-linear:create_payments from pg

BEGIN;

DROP TABLE IF EXISTS app.payments CASCADE;

COMMIT;