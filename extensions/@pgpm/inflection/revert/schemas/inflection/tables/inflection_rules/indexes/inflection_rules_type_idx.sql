-- Revert schemas/inflection/tables/inflection_rules/indexes/inflection_rules_type_idx from pg

BEGIN;

DROP INDEX inflection.inflection_rules_type_idx;

COMMIT;
