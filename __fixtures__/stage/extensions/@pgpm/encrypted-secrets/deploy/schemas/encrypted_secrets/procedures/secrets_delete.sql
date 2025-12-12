-- Deploy schemas/encrypted_secrets/procedures/secrets_delete to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.secrets_delete(
  secrets_owned_field uuid,
  secret_name text
)
  RETURNS void
  AS $$
BEGIN
  DELETE FROM secrets_schema.secrets_table s
  WHERE s.secrets_owned_field = secrets_delete.secrets_owned_field
    AND s.name = secrets_delete.secret_name;
END
$$
LANGUAGE 'plpgsql'
VOLATILE;

CREATE FUNCTION encrypted_secrets.secrets_delete(
  secrets_owned_field uuid,
  secret_names text[]
)
  RETURNS void
  AS $$
BEGIN
  DELETE FROM secrets_schema.secrets_table s
  WHERE s.secrets_owned_field = secrets_delete.secrets_owned_field
    AND s.name = ANY(secrets_delete.secret_names);
END
$$
LANGUAGE 'plpgsql'
VOLATILE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_delete(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_delete(uuid,text[]) TO authenticated;

COMMIT;
