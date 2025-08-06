-- Deploy schemas/public/domains/attachment to pg
-- requires: schemas/public/schema

BEGIN;


CREATE DOMAIN attachment AS text CHECK (VALUE ~ '^(https?)://[^\s/$.?#].[^\s]*$');
COMMENT ON DOMAIN attachment IS E'@name launchqlInternalTypeAttachment';

COMMIT;

