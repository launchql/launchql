-- Deploy schemas/encrypted_secrets/procedures/encrypt_field_crypt to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.encrypt_field_crypt()
RETURNS TRIGGER
AS $CODEZ$
BEGIN
    NEW.field_name = crypt(NEW.field_name::text, gen_salt('bf'));
    RETURN NEW;
END;
$CODEZ$
LANGUAGE plpgsql VOLATILE;

COMMIT;
