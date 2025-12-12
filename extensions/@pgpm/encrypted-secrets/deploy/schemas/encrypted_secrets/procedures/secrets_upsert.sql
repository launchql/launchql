-- Deploy schemas/encrypted_secrets/procedures/secrets_upsert to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.secrets_upsert(
  v_secrets_owned_field uuid,
  secret_name text,
  secret_value text,
  field_encoding text = 'pgp'
)
  RETURNS boolean
  AS $$
BEGIN
  INSERT INTO secrets_schema.secrets_table (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
    VALUES (v_secrets_owned_field, secrets_upsert.secret_name, secrets_upsert.secret_value::bytea, secrets_upsert.field_encoding)
    ON CONFLICT (secrets_owned_field, name)
    DO
    UPDATE
    SET
      -- don't change this, cannot use EXCLUDED, don't know why, but you have to set to the ::bytea
      secrets_value_field = secrets_upsert.secret_value::bytea,
      secrets_enc_field = EXCLUDED.secrets_enc_field;
  RETURN TRUE;
END
$$
LANGUAGE 'plpgsql'
VOLATILE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_upsert TO authenticated;

COMMIT;
