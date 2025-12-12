-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_pgp_get to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_pgp_get(
  secret_value bytea,
  secret_encode text
)
  RETURNS text
AS $$
  SELECT
    convert_from(decode(pgp_sym_decrypt(encrypt_field_pgp_get.secret_value, encrypt_field_pgp_get.secret_encode), 'hex'), 'SQL_ASCII');
$$
LANGUAGE 'sql';

COMMIT;
