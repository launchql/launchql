-- Deploy procedures/list_memberships to pg

BEGIN;

CREATE FUNCTION list_memberships (_user text)
    RETURNS TABLE (rolname text)
AS $$ WITH RECURSIVE cte AS (
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
$$
LANGUAGE 'sql' IMMUTABLE;

COMMIT;
