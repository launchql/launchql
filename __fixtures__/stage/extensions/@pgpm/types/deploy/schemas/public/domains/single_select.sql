-- Deploy schemas/public/domains/single_select to pg

-- requires: schemas/public/schema

BEGIN;

CREATE DOMAIN single_select AS jsonb CHECK (
  value ?& ARRAY['value']
);
COMMENT ON DOMAIN single_select IS E'@name launchqlInternalTypeSingleSelect';

COMMIT;
