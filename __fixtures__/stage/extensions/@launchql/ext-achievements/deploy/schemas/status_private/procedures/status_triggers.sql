-- Deploy schemas/status_private/procedures/status_triggers to pg

-- requires: schemas/status_private/schema
-- requires: schemas/status_private/procedures/user_completed_step 
-- requires: schemas/status_private/procedures/user_incompleted_step 

BEGIN;

CREATE FUNCTION status_private.tg_achievement ()
  RETURNS TRIGGER
  AS $$
DECLARE
  is_null boolean;
  task_name text;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        task_name = TG_ARGV[1]::text;
        EXECUTE format('SELECT ($1).%s IS NULL', TG_ARGV[0])
        USING NEW INTO is_null;
        IF (is_null IS FALSE) THEN
            PERFORM status_private.user_completed_step(task_name);
        END IF;
        RETURN NEW;
    END IF;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;

CREATE FUNCTION status_private.tg_achievement_toggle ()
  RETURNS TRIGGER
  AS $$
DECLARE
  is_null boolean;
  task_name text;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        task_name = TG_ARGV[1]::text;
        EXECUTE format('SELECT ($1).%s IS NULL', TG_ARGV[0])
        USING NEW INTO is_null;
        IF (is_null IS TRUE) THEN
            PERFORM status_private.user_incompleted_step(task_name);
        ELSE
            PERFORM status_private.user_completed_step(task_name);
        END IF;
        RETURN NEW;
    END IF;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;

CREATE FUNCTION status_private.tg_achievement_boolean ()
  RETURNS TRIGGER
  AS $$
DECLARE
  is_true boolean;
  task_name text;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        task_name = TG_ARGV[1]::text;
        EXECUTE format('SELECT ($1).%s IS TRUE', TG_ARGV[0])
        USING NEW INTO is_true;
        IF (is_true IS TRUE) THEN
            PERFORM status_private.user_completed_step(task_name);
        END IF;
        RETURN NEW;
    END IF;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;

CREATE FUNCTION status_private.tg_achievement_toggle_boolean ()
  RETURNS TRIGGER
  AS $$
DECLARE
  is_true boolean;
  task_name text;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        task_name = TG_ARGV[1]::text;
        EXECUTE format('SELECT ($1).%s IS TRUE', TG_ARGV[0])
        USING NEW INTO is_true;
        IF (is_true IS TRUE) THEN
            PERFORM status_private.user_completed_step(task_name);
        ELSE
            PERFORM status_private.user_incompleted_step(task_name);
        END IF;
        RETURN NEW;
    END IF;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;

-- CREATE FUNCTION app_private.tg_achievement_using_field ()
--   RETURNS TRIGGER
--   AS $$
-- DECLARE
--   is_null boolean;
--   task_name citext;
--   user_id uuid;
-- BEGIN
--     IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
--         task_name = TG_ARGV[1]::citext;
--         EXECUTE format('SELECT ($1).%s IS NULL', TG_ARGV[0])
--         USING NEW INTO is_null;
--         EXECUTE format('SELECT ($1).%s::uuid', TG_ARGV[2])
--         USING NEW INTO user_id;
--         IF (is_null IS FALSE) THEN
--             PERFORM app_private.user_completed_task(task_name, user_id);
--         END IF;
--         RETURN NEW;
--     END IF;
-- END;
-- $$
-- LANGUAGE 'plpgsql'
-- VOLATILE;

-- CREATE FUNCTION app_private.tg_achievement_toggle_using_field ()
--   RETURNS TRIGGER
--   AS $$
-- DECLARE
--   is_null boolean;
--   task_name citext;
--   user_id uuid;
-- BEGIN
--     IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
--         task_name = TG_ARGV[1]::citext;
--         EXECUTE format('SELECT ($1).%s IS NULL', TG_ARGV[0])
--         USING NEW INTO is_null;
--         EXECUTE format('SELECT ($1).%s::uuid', TG_ARGV[2])
--         USING NEW INTO user_id;
--         IF (is_null IS TRUE) THEN
--             PERFORM app_private.user_incompleted_task(task_name, user_id);
--         ELSE
--             PERFORM app_private.user_completed_task(task_name, user_id);
--         END IF;
--         RETURN NEW;
--     END IF;
-- END;
-- $$
-- LANGUAGE 'plpgsql'
-- VOLATILE;


COMMIT;
