-- Revert schemas/inflection/tables/inflection_rules/table from pg

BEGIN;

DROP TABLE inflection.inflection_rules;

COMMIT;
