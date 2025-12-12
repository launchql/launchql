-- Verify schemas/faker/tables/cities/table on pg

BEGIN;

SELECT verify_table ('faker.cities');

ROLLBACK;
