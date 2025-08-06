-- Deploy schemas/status_public/tables/user_steps/triggers/update_achievements_tg to pg

-- requires: schemas/status_public/schema
-- requires: schemas/status_public/tables/user_steps/table
-- requires: schemas/status_public/tables/user_achievements/table 
-- requires: schemas/status_private/procedures/upsert_achievement

BEGIN;

CREATE FUNCTION status_private.tg_update_achievements_tg()
RETURNS TRIGGER AS $$
DECLARE
BEGIN
    PERFORM status_private.upsert_achievement(NEW.user_id, NEW.name, NEW.count);
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql' VOLATILE SECURITY DEFINER;

CREATE TRIGGER update_achievements_tg
AFTER INSERT ON status_public.user_steps
FOR EACH ROW
EXECUTE PROCEDURE status_private.tg_update_achievements_tg ();

COMMIT;
