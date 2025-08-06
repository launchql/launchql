\echo Use "CREATE EXTENSION launchql-jwt-claims" to load this file. \quit
CREATE SCHEMA ctx;

GRANT USAGE ON SCHEMA ctx TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA ctx 
 GRANT EXECUTE ON FUNCTIONS  TO authenticated;

CREATE FUNCTION ctx.ip_address (  ) RETURNS inet AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.ip_address', true), '')::inet;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION ctx.origin (  ) RETURNS origin AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.origin', true), '')::origin;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION ctx.user_agent (  ) RETURNS text AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.user_agent', true), '');
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION ctx.user_id (  ) RETURNS uuid AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE SCHEMA jwt_private;

GRANT USAGE ON SCHEMA jwt_private TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA jwt_private 
 GRANT EXECUTE ON FUNCTIONS  TO authenticated;

CREATE FUNCTION jwt_private.current_database_id (  ) RETURNS uuid AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.database_id', true), '')::uuid;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION jwt_private.current_token_id (  ) RETURNS uuid AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.token_id', true), '')::uuid;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE SCHEMA jwt_public;

GRANT USAGE ON SCHEMA jwt_public TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA jwt_public 
 GRANT EXECUTE ON FUNCTIONS  TO authenticated;

CREATE FUNCTION jwt_public.current_ip_address (  ) RETURNS inet AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.ip_address', true), '')::inet;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION jwt_public.current_origin (  ) RETURNS origin AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.origin', true), '')::origin;
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION jwt_public.current_user_agent (  ) RETURNS text AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.user_agent', true), '');
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION jwt_public.current_user_id (  ) RETURNS uuid AS $EOFCODE$
  SELECT nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$EOFCODE$ LANGUAGE sql STABLE;

DO $$
  DECLARE
  BEGIN
    EXECUTE format('CREATE FUNCTION ctx.security_definer() returns text as $FUNC$
      SELECT ''%s'';
$FUNC$
LANGUAGE ''sql'';', current_user);
    EXECUTE format('CREATE FUNCTION ctx.is_security_definer() returns bool as $FUNC$
      SELECT ''%s'' = current_user;
$FUNC$
LANGUAGE ''sql'';', current_user);
  END; $$;

GRANT EXECUTE ON FUNCTION ctx.security_definer TO PUBLIC;

GRANT EXECUTE ON FUNCTION ctx.is_security_definer TO PUBLIC;