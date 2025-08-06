-- Deploy schemas/public/domains/multiple_select to pg
-- requires: schemas/public/schema

BEGIN;
CREATE DOMAIN multiple_select AS jsonb CHECK (value ?& ARRAY['value']);
COMMENT ON DOMAIN multiple_select IS E'@name launchqlInternalTypeMultipleSelect';
COMMIT;

