-- WebAuthn fixture: stand-in `webauthn_*` procedures with the generated
-- signatures and grants, so WebauthnPlugin's ceremony, lanes and RP policy run
-- end to end. Challenges and credentials live in fixture tables; the real
-- procedures (session secrets, credentials module, session minting) are
-- exercised by constructive-db's suites.
--
-- Compose after auth-cookie/schema.sql (its `authenticate` accepts the
-- `session-token` that `webauthn_finish_sign_in` hands out).

CREATE TABLE "simple-pets-auth-private".webauthn_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  challenge text NOT NULL,
  user_id uuid,
  consumed boolean NOT NULL DEFAULT false
);

CREATE TABLE "simple-pets-auth-private".webauthn_credentials (
  credential_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  public_key bytea NOT NULL,
  sign_count bigint NOT NULL,
  transports text[] NOT NULL,
  webauthn_user_id text NOT NULL,
  name text
);

CREATE FUNCTION "simple-pets-auth-private".webauthn_begin_registration(user_id uuid)
RETURNS jsonb AS $$
  WITH c AS (
    INSERT INTO "simple-pets-auth-private".webauthn_challenges (name, challenge, user_id)
    VALUES ('webauthn_register_challenge', replace(gen_random_uuid()::text, '-', ''), user_id)
    RETURNING challenge
  )
  SELECT jsonb_build_object(
    'challenge', c.challenge,
    'webauthn_user_id', 'handle-' || user_id::text,
    'excludeCredentials', coalesce((
      SELECT jsonb_agg(jsonb_build_object('id', w.credential_id, 'transports', to_jsonb(w.transports)))
      FROM "simple-pets-auth-private".webauthn_credentials w
      WHERE w.user_id = webauthn_begin_registration.user_id
    ), '[]'::jsonb)
  )
  FROM c;
$$ LANGUAGE sql VOLATILE SECURITY DEFINER;

CREATE FUNCTION "simple-pets-auth-private".webauthn_challenge_matches(
  challenge_name text, challenge text, challenge_id uuid DEFAULT NULL
) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM "simple-pets-auth-private".webauthn_challenges c
    WHERE c.name = challenge_name
      AND c.challenge = webauthn_challenge_matches.challenge
      AND NOT c.consumed
      AND (challenge_id IS NULL OR c.id = challenge_id)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE FUNCTION "simple-pets-auth-private".webauthn_finish_registration(
  credential_id text, public_key bytea, sign_count bigint, transports text[],
  credential_device_type text, backup_eligible boolean, backup_state boolean,
  webauthn_user_id text, user_id uuid, challenge text, name text DEFAULT NULL
) RETURNS text AS $$
DECLARE
  v_credential_id text;
BEGIN
  UPDATE "simple-pets-auth-private".webauthn_challenges c SET consumed = true
  WHERE c.name = 'webauthn_register_challenge'
    AND c.user_id = webauthn_finish_registration.user_id
    AND c.challenge = webauthn_finish_registration.challenge
    AND NOT c.consumed;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WEBAUTHN_REGISTER_CHALLENGE_NOT_FOUND_OR_EXPIRED' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO "simple-pets-auth-private".webauthn_credentials
    (credential_id, user_id, public_key, sign_count, transports, webauthn_user_id, name)
  VALUES (credential_id, user_id, public_key, sign_count, transports, webauthn_user_id, name)
  RETURNING webauthn_credentials.credential_id INTO v_credential_id;
  RETURN v_credential_id;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE FUNCTION "simple-pets-auth-private".webauthn_begin_sign_in(user_id uuid DEFAULT NULL)
RETURNS jsonb AS $$
  WITH c AS (
    INSERT INTO "simple-pets-auth-private".webauthn_challenges (name, challenge, user_id)
    VALUES ('webauthn_sign_in_challenge', replace(gen_random_uuid()::text, '-', ''), user_id)
    RETURNING id, challenge
  )
  SELECT jsonb_build_object('challenge', c.challenge, 'challengeId', c.id, 'allowCredentials', '[]'::jsonb)
  FROM c;
$$ LANGUAGE sql VOLATILE SECURITY DEFINER;

CREATE FUNCTION "simple-pets-auth-private".webauthn_credential_for_assertion(
  credential_id text, challenge_id uuid DEFAULT NULL
) RETURNS TABLE (public_key bytea, sign_count bigint, transports text[]) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "simple-pets-auth-private".webauthn_challenges c
    WHERE c.id = challenge_id AND c.name = 'webauthn_sign_in_challenge' AND NOT c.consumed
  ) THEN
    RAISE EXCEPTION 'WEBAUTHN_SIGN_IN_CHALLENGE_NOT_FOUND_OR_EXPIRED' USING ERRCODE = 'P0001';
  END IF;
  RETURN QUERY
    SELECT w.public_key, w.sign_count, w.transports
    FROM "simple-pets-auth-private".webauthn_credentials w
    WHERE w.credential_id = webauthn_credential_for_assertion.credential_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WEBAUTHN_CREDENTIAL_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE FUNCTION "simple-pets-auth-private".webauthn_finish_sign_in(
  credential_id text, new_sign_count bigint, new_backup_state boolean,
  credential_kind text DEFAULT 'access_token', challenge_id uuid DEFAULT NULL,
  OUT user_id uuid, OUT access_token text, OUT access_token_expires_at timestamptz
) AS $$
BEGIN
  UPDATE "simple-pets-auth-private".webauthn_challenges c SET consumed = true
  WHERE c.id = challenge_id AND c.name = 'webauthn_sign_in_challenge' AND NOT c.consumed;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WEBAUTHN_SIGN_IN_CHALLENGE_NOT_FOUND_OR_EXPIRED' USING ERRCODE = 'P0001';
  END IF;
  UPDATE "simple-pets-auth-private".webauthn_credentials w SET sign_count = new_sign_count
  WHERE w.credential_id = webauthn_finish_sign_in.credential_id
  RETURNING w.user_id INTO user_id;
  access_token := 'session-token';
  access_token_expires_at := now() + interval '1 hour';
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- The grants the generated module ends with: ceremony starts and the
-- signed-in user's own registration on the request lane, the procedures that
-- trust a verified signature on the server's lane only.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA "simple-pets-auth-private" FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".authenticate(text) TO administrator, authenticated, anonymous;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".webauthn_begin_registration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".webauthn_finish_registration(text, bytea, bigint, text[], text, boolean, boolean, text, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".webauthn_begin_sign_in(uuid) TO anonymous, authenticated;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".webauthn_challenge_matches(text, text, uuid) TO administrator;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".webauthn_credential_for_assertion(text, uuid) TO administrator;
GRANT EXECUTE ON FUNCTION "simple-pets-auth-private".webauthn_finish_sign_in(text, bigint, boolean, text, uuid) TO administrator;

-- ─── Routing-plane policy ────────────────────────────────────────────────────

SET session_replication_role TO replica;

INSERT INTO routing_public.webauthn_settings
  (id, database_id, schema_id, rp_id, rp_name, origin_allowlist, attestation_type,
   require_user_verification, resident_key, challenge_expiry_seconds)
VALUES
  ('6dba0004-0000-4000-8000-000000000001', '80a2eaaf-f77e-4bfe-8506-df929ef1b8d9',
   '6dba0001-0000-4000-8000-000000000001', 'example.com', 'Example', ARRAY['https://example.com'],
   'none', false, 'required', 300)
ON CONFLICT (id) DO NOTHING;

SET session_replication_role TO DEFAULT;
