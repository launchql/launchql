-- Deploy schemas/public/domains/email to pg
-- requires: schemas/public/schema

BEGIN;
CREATE DOMAIN email AS citext CHECK (value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$');
COMMENT ON DOMAIN email IS E'@name launchqlInternalTypeEmail';
COMMIT;

