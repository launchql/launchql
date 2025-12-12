-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_crypt_verify to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_crypt_verify(
  secrets_owned_field uuid,
  secret_value_field text,
  secret_verify_value text
)
  RETURNS bool
AS $$
    DECLARE
      result bool;
      rec secrets_schema.secrets_table;
      s_value text;
    BEGIN

    SELECT * FROM secrets_schema.secrets_table s
    WHERE s.secrets_owned_field = encrypt_field_crypt_verify.secrets_owned_field
    INTO rec;

    EXECUTE format('SELECT ($1).%s::text', secret_value_field)
    USING rec
    INTO  s_value;

    SELECT
      s_value = crypt(secret_verify_value, s_value)
    INTO result;

    RETURN result;
END;
$$
LANGUAGE 'plpgsql' STABLE;

COMMIT;