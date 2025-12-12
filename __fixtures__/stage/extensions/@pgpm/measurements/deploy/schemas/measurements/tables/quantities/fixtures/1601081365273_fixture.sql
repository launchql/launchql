-- Deploy schemas/measurements/tables/quantities/fixtures/1601081365273_fixture to pg

-- requires: schemas/measurements/schema
-- requires: schemas/measurements/tables/quantities/table

BEGIN;


INSERT INTO measurements.quantities (id, name, label, unit, unit_desc, description) VALUES
-- these are dimensionless https://en.wikipedia.org/wiki/Parts-per_notation
-- parts per 100 

-- measures of concetration
 (45, 'Percent', 'Percent', '%', 'percentage', 'a number or ratio expressed as a fraction of 100'),
-- parts per 1M 
 (46, 'PartsPerMillion', 'Parts per Million', 'ppm', 'parts per million', 'pseudo-units to describe small values of miscellaneous dimensionless quantities that are pure numbers representing a quantity-per-quantity measure in parts per million'),
-- parts per 1B 
 (47, 'PartsPerBillion', 'Parts per Billion', 'ppb', 'parts per billion', 'pseudo-units to describe small values of miscellaneous dimensionless quantities that are pure numbers representing a quantity-per-quantity measure in parts per billion')
 ;

COMMIT;
