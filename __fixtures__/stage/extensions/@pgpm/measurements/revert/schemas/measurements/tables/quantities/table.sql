-- Revert schemas/measurements/tables/quantities/table from pg

BEGIN;

DROP TABLE measurements.quantities;

COMMIT;
