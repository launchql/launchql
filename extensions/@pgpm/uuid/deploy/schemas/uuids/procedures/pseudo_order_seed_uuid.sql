-- Deploy schemas/uuids/procedures/pseudo_order_seed_uuid to pg

-- requires: schemas/uuids/schema

-- The first 2 characters of the UUID value comes from 
-- the MD5 hash of the uuid_seed. The next
-- 2 characters are the MD5 hash of the concatenation
-- of the current year and week number. This value is,
-- of course, static over a week. The remaining of the
--  UUID value comes from the MD5 of a random value and
-- the current time at a precision of 1us. The third field
-- is prefixed with a “4” to indicate it is a version 4 UUID type.

BEGIN;

CREATE FUNCTION uuids.pseudo_order_seed_uuid(
	seed text
)
    RETURNS uuid
AS $$
DECLARE
    new_uuid char(36);
    md5_str char(32);
    md5_str2 char(32);
    uid text;
BEGIN
    md5_str := md5(concat(random(), now()));
    md5_str2 := md5(concat(random(), now()));
    
    new_uuid := concat(
        LEFT (md5(seed), 2),
        LEFT (md5(concat(extract(year FROM now()), extract(week FROM now()))), 2),
        substring(md5_str, 1, 4),
        '-',
        substring(md5_str, 5, 4),
        '-4',
        substring(md5_str2, 9, 3),
        '-',
        substring(md5_str, 13, 4),
        '-', 
        substring(md5_str2, 17, 12)
    );
    RETURN new_uuid;
END;
$$
LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION uuids.pseudo_order_seed_uuid IS 'Pseudo Ordered UUID with a seed. Good for multi-tenant scenarios, other wise use non-seed.';

COMMIT;
