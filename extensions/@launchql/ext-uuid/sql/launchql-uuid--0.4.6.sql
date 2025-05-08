\echo Use "CREATE EXTENSION launchql-uuid" to load this file. \quit
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO PUBLIC;

CREATE SCHEMA uuids;

GRANT USAGE ON SCHEMA uuids TO PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA uuids 
 GRANT EXECUTE ON FUNCTIONS  TO PUBLIC;

CREATE FUNCTION uuids.pseudo_order_seed_uuid ( seed text ) RETURNS uuid AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION uuids.pseudo_order_seed_uuid IS E'Pseudo Ordered UUID with a seed. Good for multi-tenant scenarios, other wise use non-seed.';

CREATE FUNCTION uuids.pseudo_order_uuid (  ) RETURNS uuid AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION uuids.pseudo_order_seed_uuid IS E'Pseudo Ordered UUID';

CREATE FUNCTION uuids.trigger_set_uuid_related_field (  ) RETURNS trigger AS $EOFCODE$
DECLARE
    _seed_column text := to_json(NEW) ->> TG_ARGV[1];
BEGIN
    IF _seed_column IS NULL THEN
        RAISE EXCEPTION 'UUID seed is NULL on table %', TG_TABLE_NAME;
    END IF;
    NEW := NEW #= (TG_ARGV[0] || '=>' || uuids.pseudo_order_seed_uuid(_seed_column))::hstore;
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION uuids.trigger_set_uuid_seed (  ) RETURNS trigger AS $EOFCODE$
BEGIN
    NEW := NEW #= (TG_ARGV[0] || '=>' || uuids.pseudo_order_seed_uuid(TG_ARGV[1]))::hstore;
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE;