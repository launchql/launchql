-- Deploy schemas/encrypted_secrets/procedures/secrets_table_upsert to pg

-- requires: schemas/encrypted_secrets/schema

BEGIN;

CREATE FUNCTION encrypted_secrets.secrets_table_upsert(
  secrets_owned_field uuid,
  data json
)
  RETURNS void
AS $$
DECLARE
  rec secrets_schema.secrets_table;
  _sql text;
  key text;

  fields text[] = ARRAY[]::text[];
  values text[] = ARRAY[]::text[];
  pairs text[] = ARRAY[]::text[];
BEGIN

    SELECT * FROM secrets_schema.secrets_table s
    WHERE s.secrets_owned_field = secrets_table_upsert.secrets_owned_field
    INTO rec;

    IF (FOUND) THEN

        FOR key IN SELECT json_object_keys(data)
        LOOP
            pairs = array_append(pairs, format('%s=%s', key, quote_literal(data->>key)));
        END LOOP;

        _sql = 'UPDATE secrets_schema.secrets_table SET '; -- it's already quoted! look at I above...
        _sql = _sql || format('%s', array_to_string(pairs, ','));
        _sql = _sql || ' WHERE secrets_owned_field=';
        _sql = _sql || quote_literal(secrets_owned_field);
        _sql = _sql || ';';

    ELSE

        values = array_append(values, quote_literal(secrets_owned_field));
        fields = array_append(fields, 'secrets_owned_field');

        FOR key IN SELECT json_object_keys(data)
        LOOP
            values = array_append(values, quote_literal(data->>key));
            fields = array_append(fields, key);
        END LOOP;

        _sql = 'INSERT INTO secrets_schema.secrets_table ('; -- it's already quoted! look at I above...
        _sql = _sql || format('%s)', array_to_string(fields, ','));
        _sql = _sql || ' VALUES (';
        _sql = _sql || format('%s)', array_to_string(values, ','));
        _sql = _sql || ';';

    END IF;

    EXECUTE _sql;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_table_upsert TO authenticated;

COMMIT;
