-- Deploy procedures/verify_table_grant to pg


BEGIN;

CREATE FUNCTION verify_table_grant (_table text, _privilege text, _role text)
    RETURNS boolean
AS $$
BEGIN
    IF EXISTS (
      SELECT grantee, privilege_type
      FROM information_schema.role_table_grants
      WHERE table_schema=get_schema_from_str(_table) AND table_name=get_entity_from_str(_table) AND privilege_type=_privilege AND grantee=_role) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent table grant --> %s', _privilege
            USING HINT = 'Please check';
    END IF;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

COMMIT;
