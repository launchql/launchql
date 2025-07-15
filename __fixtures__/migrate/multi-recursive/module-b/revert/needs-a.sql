-- Revert module-b:needs-a from pg

BEGIN;

DROP TABLE IF EXISTS module_b.integration;

COMMIT;