-- Deploy schemas/public/domains/image to pg
-- requires: schemas/public/schema

BEGIN;
CREATE DOMAIN image AS jsonb CHECK (
  value ?& ARRAY['url', 'mime']
  AND
  value->>'url' ~ '^(https?)://[^\s/$.?#].[^\s]*$'
);
COMMENT ON DOMAIN image IS E'@name launchqlInternalTypeImage';
COMMIT;

