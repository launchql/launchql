-- Deploy schemas/encrypted_secrets/procedures/secrets_verify to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.secrets_verify(
  secrets_owned_field uuid,
  secret_name text,
  secret_value text
)
  RETURNS boolean
  AS $$
DECLARE
  v_secret_text text;
  v_secret secrets_schema.secrets_table;
BEGIN
  SELECT
    *
  FROM
    encrypted_secrets.secrets_getter (secrets_verify.secrets_owned_field, secrets_verify.secret_name)
  INTO v_secret_text;

  SELECT
    *
  FROM
    secrets_schema.secrets_table s
  WHERE
    s.name = secrets_verify.secret_name
    AND s.secrets_owned_field = secrets_verify.secrets_owned_field INTO v_secret;

  IF (v_secret.secrets_enc_field = 'crypt') THEN
    RETURN v_secret_text = crypt(secrets_verify.secret_value::bytea::text, v_secret_text);
  ELSIF (v_secret.secrets_enc_field = 'pgp') THEN
    RETURN secrets_verify.secret_value = v_secret_text;
  END IF;

  RETURN secrets_verify.secret_value = v_secret_text;
END
$$
LANGUAGE 'plpgsql'
STABLE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_verify TO authenticated;

COMMIT;
