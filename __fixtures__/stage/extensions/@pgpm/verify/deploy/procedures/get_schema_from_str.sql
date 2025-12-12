-- Deploy procedures/get_schema_from_str to pg
BEGIN;
CREATE FUNCTION get_schema_from_str (qualified_name text)
    RETURNS text
    AS $$
DECLARE
    parts text[];
BEGIN
    SELECT
        parse_ident(qualified_name) INTO parts;
    IF cardinality(parts) > 1 THEN
        RETURN parts[1];
    ELSE
        RETURN 'public';
    END IF;
END;
$$
LANGUAGE plpgsql
STRICT;
COMMIT;

