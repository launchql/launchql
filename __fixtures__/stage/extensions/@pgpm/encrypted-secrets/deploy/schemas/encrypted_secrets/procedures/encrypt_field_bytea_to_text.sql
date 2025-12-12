-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_bytea_to_text to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_bytea_to_text(
  secret_value bytea
)
  RETURNS text
AS $$
  SELECT
    convert_from(encrypt_field_bytea_to_text.secret_value, 'SQL_ASCII');
$$
LANGUAGE 'sql' IMMUTABLE;

COMMIT;
