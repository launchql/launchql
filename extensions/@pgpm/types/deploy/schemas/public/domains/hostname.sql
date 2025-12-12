-- Deploy schemas/public/domains/hostname to pg
-- requires: schemas/public/schema

BEGIN;
CREATE DOMAIN hostname AS text CHECK (VALUE ~ '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$');
COMMENT ON DOMAIN hostname IS E'@name launchqlInternalTypeHostname';
COMMIT;

