-- Deploy schemas/public/domains/origin to pg

-- requires: schemas/public/schema

BEGIN;

CREATE DOMAIN origin AS text CHECK (VALUE = substring(VALUE from '^(https?://[^/]*)') );
COMMENT ON DOMAIN origin IS E'@name launchqlInternalTypeOrigin';

COMMIT;
