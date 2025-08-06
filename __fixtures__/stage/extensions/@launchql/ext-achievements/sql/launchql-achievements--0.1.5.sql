\echo Use "CREATE EXTENSION launchql-achievements" to load this file. \quit
CREATE SCHEMA IF NOT EXISTS status_private;

GRANT USAGE ON SCHEMA status_private TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA status_private 
 GRANT EXECUTE ON FUNCTIONS  TO authenticated;

CREATE SCHEMA IF NOT EXISTS status_public;

GRANT USAGE ON SCHEMA status_public TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA status_public 
 GRANT EXECUTE ON FUNCTIONS  TO authenticated;

CREATE TABLE status_public.user_steps (
 	id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
	user_id uuid NOT NULL,
	name text NOT NULL,
	count int NOT NULL DEFAULT ( 1 ),
	created_at timestamptz NOT NULL DEFAULT ( CURRENT_TIMESTAMP ) 
);

COMMENT ON TABLE status_public.user_steps IS E'The user achieving a requirement for a level. Log table that has every single step ever taken.';

CREATE INDEX ON status_public.user_steps ( user_id, name );

CREATE FUNCTION status_private.user_completed_step ( step text, user_id uuid DEFAULT jwt_public.current_user_id() ) RETURNS void AS $EOFCODE$
  INSERT INTO status_public.user_steps ( name, user_id, count )
  VALUES ( step, user_id, 1 );
$EOFCODE$ LANGUAGE sql VOLATILE SECURITY DEFINER;

CREATE FUNCTION status_private.user_incompleted_step ( step text, user_id uuid DEFAULT jwt_public.current_user_id() ) RETURNS void AS $EOFCODE$
BEGIN
  DELETE FROM status_public.user_steps s
    WHERE s.user_id = user_incompleted_step.user_id
    AND s.name = step;
  DELETE FROM status_public.user_achievements a
    WHERE a.user_id = user_incompleted_step.user_id
    AND a.name = step;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION status_private.tg_achievement (  ) RETURNS trigger AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION status_private.tg_achievement_toggle (  ) RETURNS trigger AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION status_private.tg_achievement_boolean (  ) RETURNS trigger AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE FUNCTION status_private.tg_achievement_toggle_boolean (  ) RETURNS trigger AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE status_public.user_achievements (
 	id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
	user_id uuid NOT NULL,
	name text NOT NULL,
	count int NOT NULL DEFAULT ( 0 ),
	created_at timestamptz NOT NULL DEFAULT ( CURRENT_TIMESTAMP ),
	CONSTRAINT user_achievements_unique_key UNIQUE ( user_id, name ) 
);

COMMENT ON TABLE status_public.user_achievements IS E'This table represents the users progress for particular level requirements, tallying the total count. This table is updated via triggers and should not be updated maually.';

CREATE INDEX ON status_public.user_achievements ( user_id, name );

CREATE FUNCTION status_private.upsert_achievement ( vuser_id uuid, vname text, vcount int ) RETURNS void AS $EOFCODE$
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
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE status_public.levels (
 	name text NOT NULL PRIMARY KEY 
);

COMMENT ON TABLE status_public.levels IS E'Levels for achievement';

GRANT SELECT ON TABLE status_public.levels TO authenticated;

CREATE TABLE status_public.level_requirements (
 	id uuid PRIMARY KEY DEFAULT ( uuid_generate_v4() ),
	name text NOT NULL,
	level text NOT NULL,
	required_count int DEFAULT ( 1 ),
	priority int DEFAULT ( 100 ),
	UNIQUE ( name, level ) 
);

COMMENT ON TABLE status_public.level_requirements IS E'Requirements to achieve a level';

CREATE INDEX ON status_public.level_requirements ( name, level, priority );

GRANT SELECT ON TABLE status_public.levels TO authenticated;

CREATE FUNCTION status_public.steps_required ( vlevel text, vrole_id uuid DEFAULT jwt_public.current_user_id() ) RETURNS SETOF status_public.level_requirements AS $EOFCODE$
BEGIN
  RETURN QUERY
  SELECT 
      level_requirements.id,
      level_requirements.name,
      level_requirements.level,
      -1*(coalesce(user_achievements.count,0)-level_requirements.required_count) as required_count,
      level_requirements.priority
    FROM
      status_public.level_requirements 
    FULL OUTER JOIN status_public.user_achievements ON (
      user_achievements.name = level_requirements.name
      AND user_achievements.user_id =vrole_id
    )	
    JOIN status_public.levels ON (level_requirements.level = levels.name)
  WHERE
    level_requirements.level = vlevel
    AND -1*(coalesce(user_achievements.count,0)-level_requirements.required_count) > 0
  ORDER BY priority ASC
;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION status_public.user_achieved ( vlevel text, vrole_id uuid DEFAULT jwt_public.current_user_id() ) RETURNS boolean AS $EOFCODE$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) FROM
    status_public.steps_required(
      vlevel,
      vrole_id
    )
  INTO c;

  RETURN c <= 0;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

ALTER TABLE status_public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY can_select_user_achievements ON status_public.user_achievements FOR SELECT TO PUBLIC USING ( jwt_public.current_user_id() = user_id );

CREATE POLICY can_insert_user_achievements ON status_public.user_achievements FOR INSERT TO PUBLIC WITH CHECK ( FALSE );

CREATE POLICY can_update_user_achievements ON status_public.user_achievements FOR UPDATE TO PUBLIC USING ( FALSE );

CREATE POLICY can_delete_user_achievements ON status_public.user_achievements FOR DELETE TO PUBLIC USING ( FALSE );

GRANT INSERT ON TABLE status_public.user_achievements TO authenticated;

GRANT SELECT ON TABLE status_public.user_achievements TO authenticated;

GRANT UPDATE ON TABLE status_public.user_achievements TO authenticated;

GRANT DELETE ON TABLE status_public.user_achievements TO authenticated;

CREATE FUNCTION status_private.tg_update_achievements_tg (  ) RETURNS trigger AS $EOFCODE$
DECLARE
BEGIN
    PERFORM status_private.upsert_achievement(NEW.user_id, NEW.name, NEW.count);
    RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE TRIGGER update_achievements_tg 
 AFTER INSERT ON status_public.user_steps 
 FOR EACH ROW
 EXECUTE PROCEDURE status_private. tg_update_achievements_tg (  );