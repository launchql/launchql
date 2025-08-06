-- Deploy procedures/get_entity_from_str to pg

BEGIN;
CREATE FUNCTION get_entity_from_str (qualified_name text)
    RETURNS text
    AS $$
DECLARE
    parts text[];
BEGIN
    SELECT
        parse_ident(qualified_name) INTO parts;
    IF cardinality(parts) > 1 THEN
        RETURN parts[2];
    ELSE
        RETURN parts[1];
    END IF;
END;
$$
LANGUAGE plpgsql
STRICT;
COMMIT;
