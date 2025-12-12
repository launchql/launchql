-- Deploy roles/anonymous/role to pg


BEGIN;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'anonymous') THEN
    CREATE ROLE anonymous;
    COMMENT ON ROLE anonymous IS 'Anonymous group';
    ALTER USER anonymous WITH NOCREATEDB;
    ALTER USER anonymous WITH NOCREATEROLE;
    ALTER USER anonymous WITH NOLOGIN;
    ALTER USER anonymous WITH NOBYPASSRLS;
END IF;
END
$$;
COMMIT;

