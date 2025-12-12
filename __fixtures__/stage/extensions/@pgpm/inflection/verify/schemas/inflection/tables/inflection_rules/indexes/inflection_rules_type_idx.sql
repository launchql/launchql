-- Verify schemas/inflection/tables/inflection_rules/indexes/inflection_rules_type_idx  on pg

BEGIN;

SELECT verify_index ('inflection.inflection_rules', 'inflection_rules_type_idx');

ROLLBACK;
