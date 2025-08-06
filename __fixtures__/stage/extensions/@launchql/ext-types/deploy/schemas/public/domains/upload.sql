-- Deploy schemas/public/domains/upload to pg

-- requires: schemas/public/schema

BEGIN;

CREATE DOMAIN upload AS jsonb CHECK (
  value ?& ARRAY['url', 'mime']
  AND
  value->>'url' ~ '^(https?)://[^\s/$.?#].[^\s]*$'
);
COMMENT ON DOMAIN upload IS E'@name launchqlInternalTypeUpload';

COMMIT;
