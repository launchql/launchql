-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_pgp_getter to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_pgp_getter(
  secrets_owned_field uuid,
  secret_value_field text,
  secret_encode_field text
)
  RETURNS text
AS $$
    DECLARE
      result text;
      rec secrets_schema.secrets_table;
      s_value bytea;
      s_enc text;
    BEGIN

    SELECT * FROM secrets_schema.secrets_table s
    WHERE s.secrets_owned_field = encrypt_field_pgp_getter.secrets_owned_field
    INTO rec;

    EXECUTE format('SELECT ($1).%s::text', secret_value_field)
    USING rec
    INTO  s_value;

    EXECUTE format('SELECT ($1).%s::text', secret_encode_field)
    USING rec
    INTO  s_enc;

    SELECT
    convert_from(decode(pgp_sym_decrypt(s_value, s_enc), 'hex'), 'SQL_ASCII')
    INTO result;

    RETURN result;
END;
$$
LANGUAGE 'plpgsql' STABLE;

COMMIT;
