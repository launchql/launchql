-- Deploy schemas/secrets_schema/tables/secrets_table/triggers/hash_secrets to pg

-- requires: schemas/secrets_schema/schema
-- requires: schemas/secrets_schema/tables/secrets_table/table

BEGIN;

CREATE FUNCTION secrets_schema.tg_hash_secrets()
RETURNS TRIGGER AS $$
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
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER hash_secrets_update
BEFORE UPDATE ON secrets_schema.secrets_table
FOR EACH ROW
WHEN (NEW.secrets_value_field IS DISTINCT FROM OLD.secrets_value_field)
EXECUTE PROCEDURE secrets_schema.tg_hash_secrets ();

CREATE TRIGGER hash_secrets_insert
BEFORE INSERT ON secrets_schema.secrets_table
FOR EACH ROW
EXECUTE PROCEDURE secrets_schema.tg_hash_secrets ();

COMMIT;
