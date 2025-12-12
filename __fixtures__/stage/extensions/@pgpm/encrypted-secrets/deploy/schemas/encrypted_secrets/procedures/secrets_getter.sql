-- Deploy schemas/encrypted_secrets/procedures/secrets_getter to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.secrets_getter(
  secrets_owned_field uuid,
  secret_name text,
  default_value text default null
)
  RETURNS text
  AS $$
DECLARE
  v_secret secrets_schema.secrets_table;
BEGIN
  SELECT
    *
  FROM
    secrets_schema.secrets_table s
  WHERE
    s.name = secrets_getter.secret_name
    AND s.secrets_owned_field = secrets_getter.secrets_owned_field
  INTO v_secret;

  IF (NOT FOUND OR v_secret IS NULL) THEN
    RETURN secrets_getter.default_value;
  END IF;
  
  IF (v_secret.secrets_enc_field = 'crypt') THEN
    RETURN convert_from(v_secret.secrets_value_field, 'SQL_ASCII');
  ELSIF (v_secret.secrets_enc_field = 'pgp') THEN
    RETURN convert_from(decode(pgp_sym_decrypt(v_secret.secrets_value_field, v_secret.secrets_owned_field::text), 'hex'), 'SQL_ASCII');
  END IF;

  RETURN convert_from(v_secret.secrets_value_field, 'SQL_ASCII');

END
$$
LANGUAGE 'plpgsql'
STABLE;

COMMIT;
