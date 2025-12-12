\echo Use "CREATE EXTENSION launchql-encrypted-secrets-table" to load this file. \quit
CREATE SCHEMA secrets_schema;

CREATE TABLE secrets_schema.secrets_table (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  secrets_owned_field uuid NOT NULL,
  name text NOT NULL,
  secrets_value_field bytea NULL,
  secrets_enc_field text NULL,
  UNIQUE (secrets_owned_field, name)
);

CREATE FUNCTION secrets_schema.tg_hash_secrets() RETURNS trigger AS $EOFCODE$
BEGIN
    IF (NEW.secrets_enc_field = 'crypt') THEN
        NEW.secrets_value_field = crypt(NEW.secrets_value_field::text, gen_salt('bf'));
    ELSIF (NEW.secrets_enc_field = 'pgp') THEN
        NEW.secrets_value_field = pgp_sym_encrypt(encode(NEW.secrets_value_field::bytea, 'hex'), NEW.secrets_owned_field::text, 'compress-algo=1, cipher-algo=aes256');
    ELSE
        NEW.secrets_enc_field = 'none';
    END IF;
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER hash_secrets_update
  BEFORE UPDATE
  ON secrets_schema.secrets_table
  FOR EACH ROW
  WHEN (new.secrets_value_field IS DISTINCT FROM old.secrets_value_field)
  EXECUTE PROCEDURE secrets_schema.tg_hash_secrets();

CREATE TRIGGER hash_secrets_insert
  BEFORE INSERT
  ON secrets_schema.secrets_table
  FOR EACH ROW
  EXECUTE PROCEDURE secrets_schema.tg_hash_secrets();