-- Deploy schemas/uuids/procedures/pseudo_order_uuid to pg

-- requires: schemas/uuids/schema

BEGIN;

CREATE FUNCTION uuids.pseudo_order_uuid()
    RETURNS uuid
AS $$
DECLARE
    new_uuid char(36);
    md5_str char(32);
    md5_str2 char(32);
BEGIN
    md5_str := md5(concat(random(), now()));
    md5_str2 := md5(concat(random(), now()));
    new_uuid := concat(
    LEFT (md5(concat(extract(year FROM now()), extract(week FROM now()))), 4),
    LEFT (md5_str, 4), '-', substring(md5_str, 5, 4), '-4', substring(md5_str2, 9, 3), '-', substring(md5_str, 13, 4), '-', substring(md5_str2, 17, 12));
    RETURN new_uuid;
END;
$$
LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION uuids.pseudo_order_seed_uuid IS 'Pseudo Ordered UUID';

COMMIT;
