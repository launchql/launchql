-- Verify schemas/faker/schema  on pg

BEGIN;

SELECT verify_schema ('faker');

ROLLBACK;
