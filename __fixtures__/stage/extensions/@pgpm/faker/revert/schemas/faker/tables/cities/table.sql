-- Revert schemas/faker/tables/cities/table from pg

BEGIN;

DROP TABLE faker.cities;

COMMIT;
