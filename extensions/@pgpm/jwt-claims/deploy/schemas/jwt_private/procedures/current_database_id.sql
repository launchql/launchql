-- Deploy schemas/jwt_private/procedures/current_database_id to pg

-- requires: schemas/jwt_private/schema

BEGIN;

CREATE FUNCTION jwt_private.current_database_id()
  RETURNS uuid
AS $$
DECLARE
  v_identifier_id uuid;
BEGIN
  IF current_setting('jwt.claims.database_id', TRUE)
    IS NOT NULL THEN
    BEGIN
      v_identifier_id = current_setting('jwt.claims.database_id', TRUE)::uuid;
    EXCEPTION
      WHEN OTHERS THEN
      RAISE NOTICE 'Invalid UUID value';
    RETURN NULL;
    END;
    RETURN v_identifier_id;
  ELSE
    RETURN NULL;
  END IF;
END;
$$
LANGUAGE 'plpgsql' STABLE;

COMMIT;
