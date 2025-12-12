-- Verify schemas/measurements/tables/quantities/table on pg

BEGIN;

SELECT verify_table ('measurements.quantities');

ROLLBACK;
