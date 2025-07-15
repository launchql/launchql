-- Revert module-a:extended-a from pg

BEGIN;

DROP TABLE IF EXISTS module_a.extended;

COMMIT;