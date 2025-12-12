-- Deploy schemas/public/domains/url to pg
-- requires: schemas/public/schema

BEGIN;
CREATE DOMAIN url AS text CHECK (VALUE ~ '^(https?)://[^\s/$.?#].[^\s]*$');
COMMENT ON DOMAIN url IS E'@name launchqlInternalTypeUrl';
COMMIT;

