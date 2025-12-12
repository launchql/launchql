-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_set to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_set(
  secret_value text
)
  RETURNS bytea
AS $$
  SELECT encrypt_field_set.secret_value::bytea;
$$
LANGUAGE 'sql';

COMMIT;
