BEGIN;
DO $do$
BEGIN
    IF NOT EXISTS (
        SELECT
        FROM
            pg_catalog.pg_roles
        WHERE
            rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'app_password';
END IF;
    IF NOT EXISTS (
        SELECT
        FROM
            pg_catalog.pg_roles
        WHERE
            rolname = 'app_admin') THEN
    CREATE ROLE app_admin LOGIN PASSWORD 'admin_password';
END IF;
END
$do$;

GRANT anonymous TO app_user;
GRANT authenticated TO app_user;
GRANT anonymous TO administrator;
GRANT authenticated TO administrator;
GRANT administrator TO app_admin;
COMMIT;
