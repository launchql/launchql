-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_pgp to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_pgp()
RETURNS TRIGGER
AS $CODEZ$
BEGIN
    NEW.field_name = pgp_sym_encrypt(encode(NEW.field_name::bytea, 'hex'), NEW.encode_field::text, 'compress-algo=1, cipher-algo=aes256');
    RETURN NEW;
END;
$CODEZ$
LANGUAGE plpgsql VOLATILE;

COMMIT;
