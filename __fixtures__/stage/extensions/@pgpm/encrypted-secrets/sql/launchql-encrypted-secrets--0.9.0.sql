\echo Use "CREATE EXTENSION launchql-encrypted-secrets" to load this file. \quit
CREATE SCHEMA encrypted_secrets;

CREATE FUNCTION encrypted_secrets.encrypt_field_bytea_to_text(secret_value bytea) RETURNS text AS $EOFCODE$
  SELECT
    convert_from(encrypt_field_bytea_to_text.secret_value, 'SQL_ASCII');
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION encrypted_secrets.encrypt_field_crypt_verify(secrets_owned_field uuid, secret_value_field text, secret_verify_value text) RETURNS bool AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION encrypted_secrets.encrypt_field_crypt() RETURNS trigger AS $EOFCODE$
BEGIN
    NEW.field_name = crypt(NEW.field_name::text, gen_salt('bf'));
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION encrypted_secrets.encrypt_field_pgp_get(secret_value bytea, secret_encode text) RETURNS text AS $EOFCODE$
  SELECT
    convert_from(decode(pgp_sym_decrypt(encrypt_field_pgp_get.secret_value, encrypt_field_pgp_get.secret_encode), 'hex'), 'SQL_ASCII');
$EOFCODE$ LANGUAGE sql;

CREATE FUNCTION encrypted_secrets.encrypt_field_pgp_getter(secrets_owned_field uuid, secret_value_field text, secret_encode_field text) RETURNS text AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION encrypted_secrets.encrypt_field_pgp() RETURNS trigger AS $EOFCODE$
BEGIN
    NEW.field_name = pgp_sym_encrypt(encode(NEW.field_name::bytea, 'hex'), NEW.encode_field::text, 'compress-algo=1, cipher-algo=aes256');
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION encrypted_secrets.encrypt_field_set(secret_value text) RETURNS bytea AS $EOFCODE$
  SELECT encrypt_field_set.secret_value::bytea;
$EOFCODE$ LANGUAGE sql;

CREATE FUNCTION encrypted_secrets.secrets_getter(secrets_owned_field uuid, secret_name text, default_value text DEFAULT NULL) RETURNS text AS $EOFCODE$
DECLARE
  v_secret secrets_schema.secrets_table;
BEGIN
  SELECT
    *
  FROM
    secrets_schema.secrets_table s
  WHERE
    s.name = secrets_getter.secret_name
    AND s.secrets_owned_field = secrets_getter.secrets_owned_field
  INTO v_secret;

  IF (NOT FOUND OR v_secret IS NULL) THEN
    RETURN secrets_getter.default_value;
  END IF;
  
  IF (v_secret.secrets_enc_field = 'crypt') THEN
    RETURN convert_from(v_secret.secrets_value_field, 'SQL_ASCII');
  ELSIF (v_secret.secrets_enc_field = 'pgp') THEN
    RETURN convert_from(decode(pgp_sym_decrypt(v_secret.secrets_value_field, v_secret.secrets_owned_field::text), 'hex'), 'SQL_ASCII');
  END IF;

  RETURN convert_from(v_secret.secrets_value_field, 'SQL_ASCII');

END
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION encrypted_secrets.secrets_upsert(v_secrets_owned_field uuid, secret_name text, secret_value text, field_encoding text DEFAULT 'pgp') RETURNS boolean AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_upsert TO authenticated;

CREATE FUNCTION encrypted_secrets.secrets_verify(secrets_owned_field uuid, secret_name text, secret_value text) RETURNS boolean AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_verify TO authenticated;

CREATE FUNCTION encrypted_secrets.secrets_table_upsert(secrets_owned_field uuid, data pg_catalog.json) RETURNS void AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_table_upsert TO authenticated;

CREATE FUNCTION encrypted_secrets.secrets_delete(secrets_owned_field uuid, secret_name text) RETURNS void AS $EOFCODE$
BEGIN
  DELETE FROM secrets_schema.secrets_table s
  WHERE s.secrets_owned_field = secrets_delete.secrets_owned_field
    AND s.name = secrets_delete.secret_name;
END
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION encrypted_secrets.secrets_delete(secrets_owned_field uuid, secret_names text[]) RETURNS void AS $EOFCODE$
BEGIN
  DELETE FROM secrets_schema.secrets_table s
  WHERE s.secrets_owned_field = secrets_delete.secrets_owned_field
    AND s.name = ANY(secrets_delete.secret_names);
END
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_delete(uuid, text) TO authenticated;

GRANT EXECUTE ON FUNCTION encrypted_secrets.secrets_delete(uuid, text[]) TO authenticated;