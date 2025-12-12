-- Deploy schemas/status_private/procedures/upsert_achievement to pg

-- requires: schemas/status_private/schema
-- requires: schemas/status_public/tables/user_achievements/table 

BEGIN;

CREATE FUNCTION status_private.upsert_achievement(
  vuser_id uuid, vname text, vcount int
) returns void as $$
BEGIN
    INSERT INTO status_public.user_achievements (user_id, name, count)
    VALUES 
        (vuser_id, vname, GREATEST(vcount, 0))
    ON CONFLICT ON CONSTRAINT user_achievements_unique_key
    DO UPDATE SET 
        -- look ma! you can actually do aliases inside on conflict
        count = user_achievements.count + EXCLUDED.count
    ;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

COMMIT;
