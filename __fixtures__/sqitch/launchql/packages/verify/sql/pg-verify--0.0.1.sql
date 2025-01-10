\echo Use "CREATE EXTENSION pg-verify" to load this file. \quit
CREATE FUNCTION verify_constraint ( _table text, _name text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
      SELECT c.conname, pg_get_constraintdef(c.oid)
        FROM   pg_constraint c
        WHERE conname=_name
        AND c.conrelid = _table::regclass
) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent constraint --> %s', _name
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_domain ( _type text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                pg_type.typname,
                n.nspname
            FROM
                pg_type,
                pg_catalog.pg_namespace n
            WHERE
                typtype = 'd'
                AND typname = get_entity_from_str(_type) AND nspname = get_schema_from_str(_type)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent type --> %s', _type
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_extension ( _extname text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_available_extensions
        WHERE
            name = _extname
) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent extension --> %s', _extname
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_function ( _name text, _user text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                has_function_privilege(_user, p.oid, 'execute')
            FROM
                pg_catalog.pg_proc p
                JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE
                n.nspname = get_schema_from_str(_name) AND p.proname = get_entity_from_str(_name)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent function --> %s', _name
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_index ( _table text, _index text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                list_indexes (_table, _index)
              ) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent index --> %s', _index
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_membership ( _user text, _role text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                1
            FROM
                list_memberships (_user)
            WHERE
                rolname = _role) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent member --> %s', _user
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_policy ( _policy text, _table text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
        SELECT 1
        	FROM pg_class p
        	JOIN pg_catalog.pg_namespace n ON n.oid = p.relnamespace
        	JOIN pg_policy pol on pol.polrelid = p.relfilenode
        	WHERE
        	   pol.polname = _policy
        	   AND relrowsecurity = 'true'
            AND relname = get_entity_from_str(_table)
            AND nspname = get_schema_from_str(_table)
          ) THEN
        RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent policy or missing relrowsecurity --> %s', _policy
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_role ( _user text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                1
            FROM
                pg_roles
            WHERE
                rolname = _user) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent user --> %s', _user
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_schema ( _schema text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
      select * from pg_catalog.pg_namespace where nspname = _schema) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent schema --> %s', _schema
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_security ( _table text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
      SELECT n.oid, relname, n.nspname
      	FROM pg_class p
      	JOIN pg_catalog.pg_namespace n ON n.oid = p.relnamespace
      	WHERE relrowsecurity = 'true'
          AND relname = get_entity_from_str(_table)
          AND nspname = get_schema_from_str(_table)
) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent security --> %s', _name
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_table_grant ( _table text, _privilege text, _role text ) RETURNS boolean AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_table ( _table text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
      SELECT *
         FROM   information_schema.tables
         WHERE  table_schema = get_schema_from_str(_table)
         AND    table_name = get_entity_from_str(_table)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent table --> %s', _table
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_trigger ( _trigger text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                pg_trigger.tgname,
                n.nspname
            FROM
                pg_trigger,
                pg_catalog.pg_namespace n
            WHERE
                tgname = get_entity_from_str(_trigger) AND nspname = get_schema_from_str(_trigger)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent trigger --> %s', _trigger
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_type ( _type text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
            SELECT
                pg_type.typname,
                n.nspname
            FROM
                pg_type,
                pg_catalog.pg_namespace n
            WHERE
                typname = get_entity_from_str(_type) AND nspname = get_schema_from_str(_type)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent type --> %s', _type
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION verify_view ( _view text ) RETURNS boolean AS $EOFCODE$
BEGIN
    IF EXISTS (
      SELECT *
         FROM   information_schema.views
         WHERE  table_schema = get_schema_from_str(_view)
         AND    table_name = get_entity_from_str(_view)) THEN
            RETURN TRUE;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent view --> %s', _view
            USING HINT = 'Please check';
    END IF;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;