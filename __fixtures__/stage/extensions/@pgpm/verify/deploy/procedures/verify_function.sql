-- Deploy procedures/verify_function to pg

-- requires: procedures/get_entity_from_str 
-- requires: procedures/get_schema_from_str 

BEGIN;
CREATE FUNCTION verify_function (_name text, _user text DEFAULT NULL)
  RETURNS boolean
  AS $$
DECLARE
  check_user text;
  func_oid oid;
BEGIN
  IF (_user IS NOT NULL) THEN
    check_user = _user;
  ELSE
    check_user = CURRENT_USER;
  END IF;
  IF position('(' IN _name) > 0 THEN
    func_oid = to_regprocedure(_name);
    IF func_oid IS NULL THEN
      RAISE EXCEPTION 'Nonexistent function --> %', _name
        USING HINT = 'Please check';
    END IF;
    IF has_function_privilege(check_user, func_oid, 'execute') THEN
      RETURN TRUE;
    ELSE
      RAISE EXCEPTION 'Nonexistent function --> %', _name
        USING HINT = 'Please check';
    END IF;
  END IF;
  IF EXISTS (
    SELECT
      has_function_privilege(check_user, p.oid, 'execute')
    FROM
      pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE
      n.nspname = get_schema_from_str (_name)
      AND p.proname = get_entity_from_str (_name)) THEN
  RETURN TRUE;
ELSE
  RAISE EXCEPTION 'Nonexistent function --> %', _name
    USING HINT = 'Please check';
END IF;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE;
COMMIT;
