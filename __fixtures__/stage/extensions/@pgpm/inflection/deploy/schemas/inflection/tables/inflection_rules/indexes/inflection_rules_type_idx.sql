-- Deploy schemas/inflection/tables/inflection_rules/indexes/inflection_rules_type_idx to pg

-- requires: schemas/inflection/schema
-- requires: schemas/inflection/tables/inflection_rules/table

BEGIN;

CREATE INDEX inflection_rules_type_idx ON inflection.inflection_rules (
 type
);

COMMIT;
