\echo Use "CREATE EXTENSION pg-utilities" to load this file. \quit
CREATE FUNCTION get_entity_from_str ( qualified_name text ) RETURNS text AS $EOFCODE$
DECLARE
    parts text[];
    BEGIN
    SELECT
        * INTO parts
    FROM
        regexp_split_to_array(qualified_name, E'\\.');

    IF cardinality(parts) > 1 THEN
        RETURN parts[2];
    ELSE
        RETURN parts[1];
        END IF;
END;
$EOFCODE$ LANGUAGE plpgsql STRICT;

CREATE FUNCTION get_schema_from_str ( qualified_name text ) RETURNS text AS $EOFCODE$
DECLARE
    parts text[];
    BEGIN
    SELECT
        * INTO parts
    FROM
        regexp_split_to_array(qualified_name, E'\\.');

    IF cardinality(parts) > 1 THEN
        RETURN parts[1];
    ELSE
        RETURN 'public';
        END IF;
END;
$EOFCODE$ LANGUAGE plpgsql STRICT;

CREATE FUNCTION drop_function ( _functionname text, OUT func_drops int ) AS $EOFCODE$
DECLARE
    _sql text;
BEGIN
    SELECT
        count(*)::int,
        string_agg(format('DROP FUNCTION %s(%s);', p.oid::regproc, pg_get_function_identity_arguments(p.oid)), ' ')
    FROM
        pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE
        n.nspname = get_schema_from_str (_functionname)
        AND p.proname = get_entity_from_str (_functionname) INTO func_drops, _sql;
    IF func_drops > 0 THEN
        EXECUTE _sql;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent function --> %s', _functionname
            USING HINT = 'Please check';
    END IF;
END
$EOFCODE$ LANGUAGE plpgsql;

CREATE FUNCTION grant_execute_on_function ( _functionname text, _role text, OUT func_grants int ) AS $EOFCODE$
DECLARE
    _sql text;
BEGIN
    SELECT
        count(*)::int,
        string_agg(format('GRANT EXECUTE ON FUNCTION %s(%s) TO %s;', p.oid::regproc, pg_get_function_identity_arguments(p.oid), _role), ' ')
    FROM
        pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE
        n.nspname = get_schema_from_str (_functionname)
        AND p.proname = get_entity_from_str (_functionname) INTO func_grants, _sql;
    IF func_grants > 0 THEN
        EXECUTE _sql;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent function --> %s', _functionname
            USING HINT = 'Please check';
    END IF;
END
$EOFCODE$ LANGUAGE plpgsql;

CREATE FUNCTION list_indexes ( _table text, _index text ) RETURNS TABLE ( schema_name text, table_name text, index_name text ) AS $EOFCODE$
SELECT
    n.nspname::text AS schema_name,
    t.relname::text AS table_name,
    i.relname::text AS index_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_catalog.pg_namespace n
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND n.oid = i.relnamespace
    AND n.nspname = get_schema_from_str(_table)
    AND i.relname = _index
    AND t.relname = get_entity_from_str(_table);
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION list_memberships ( _user text ) RETURNS TABLE ( rolname text ) AS $EOFCODE$ WITH RECURSIVE cte AS (
    SELECT
        oid
    FROM
        pg_roles
    WHERE
        rolname = _user
    UNION ALL
    SELECT
        m.roleid
    FROM
        cte
        JOIN pg_auth_members m ON m.member = cte.oid
)
SELECT
    pg_roles.rolname::text AS rolname
FROM
    cte c,
    pg_roles
WHERE
    pg_roles.oid = c.oid;
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION revoke_execute_on_function ( _functionname text, _role text, OUT func_revocations int ) AS $EOFCODE$
DECLARE
    _sql text;
BEGIN
    SELECT
        count(*)::int,
        string_agg(format('REVOKE EXECUTE ON FUNCTION %s(%s) FROM %s;', p.oid::regproc, pg_get_function_identity_arguments(p.oid), _role), ' ')
    FROM
        pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE
        n.nspname = get_schema_from_str (_functionname)
        AND p.proname = get_entity_from_str (_functionname) INTO func_revocations, _sql;
    IF func_revocations > 0 THEN
        EXECUTE _sql;
    ELSE
        RAISE
        EXCEPTION 'Nonexistent function --> %s', _functionname
            USING HINT = 'Please check';
    END IF;
END
$EOFCODE$ LANGUAGE plpgsql;

CREATE FUNCTION tg_update_timestamps (  ) RETURNS trigger AS $EOFCODE$
BEGIN
    -- cheap way to ensure created_at is immutable
    NEW.created_at = OLD.created_at;

    -- updated_at
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql;
