-- Verify schemas/inflection/tables/inflection_rules/table on pg

BEGIN;

SELECT verify_table ('inflection.inflection_rules');

ROLLBACK;
