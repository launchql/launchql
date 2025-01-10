-- Deploy procedures/get_entity_from_str to pg

BEGIN;

CREATE FUNCTION get_entity_from_str (qualified_name text)
    RETURNS text
AS $$
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
$$
LANGUAGE plpgsql STRICT;

COMMIT;
