/**
 * webauthn — REST WebAuthn/Passkey authentication routes
 *
 *   POST /auth/webauthn/register/begin   → start passkey registration
 *   POST /auth/webauthn/register/finish  → complete passkey registration
 *   POST /auth/webauthn/sign-in/begin    → start passkey authentication
 *   POST /auth/webauthn/sign-in/finish   → complete passkey authentication
 *
 * These routes orchestrate the WebAuthn ceremony between browser and database:
 *   1. Browser calls /begin to get challenge + options
 *   2. Browser calls navigator.credentials.create/get
 *   3. Browser calls /finish with attestation/assertion
 *   4. Server verifies with @simplewebauthn/server
 *   5. Server calls DB procedures to store/verify credentials
 *
 * All queries run through req.constructive.withPgClient with RLS enforced.
 */

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON
} from '@simplewebauthn/types';
import { Logger } from '@pgpmjs/logger';
import crypto from 'crypto';
import express, { Request, Response, Router } from 'express';
import type { Pool } from 'pg';

const log = new Logger('webauthn');

// Cookie name for anonymous session during WebAuthn sign-in
const WEBAUTHN_SESSION_COOKIE = 'webauthn_session';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BeginRegistrationResponse {
  challenge: string;
  webauthn_user_id: string;
  excludeCredentials: Array<{ id: string; type: string; transports?: string[] }>;
}

interface BeginSignInResponse {
  challenge: string;
  allowCredentials: Array<{ id: string; type: string; transports?: string[] }>;
}

interface FinishSignInResponse {
  user_id: string;
  access_token: string;
  access_token_expires_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const jsonError = (res: Response, status: number, error: string): void => {
  res.status(status).json({ error });
};

const getWebauthnSettings = (req: Request) => {
  return req.api?.webauthnSettings;
};

const getUserId = (req: Request): string | undefined => {
  return req.constructive?.pgSettings?.['jwt.claims.user_id'];
};

const getSessionId = (req: Request): string | undefined => {
  return req.constructive?.pgSettings?.['jwt.claims.session_id'];
};

interface AnonymousSession {
  sessionId: string;
  token: string;
}

async function createAnonymousSession(
  pool: Pool,
  sessionsSchema: string,
  req: Request
): Promise<AnonymousSession> {
  const token = 'cnc_anon_' + crypto.randomBytes(24).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const result = await pool.query<{ id: string }>(
    `INSERT INTO "${sessionsSchema}".sessions (
      user_id,
      is_anonymous,
      auth_method,
      origin,
      ip,
      uagent,
      expires_at
    ) VALUES (
      NULL,
      true,
      'webauthn',
      $1,
      $2::inet,
      $3,
      now() + interval '10 minutes'
    ) RETURNING id`,
    [
      req.headers.origin || null,
      req.clientIp || null,
      req.headers['user-agent'] || null
    ]
  );

  const sessionId = result.rows[0].id;

  await pool.query(
    `INSERT INTO "${sessionsSchema}".session_credentials (
      session_id,
      kind,
      secret_hash,
      expires_at
    ) VALUES ($1, 'webauthn_anon', decode($2, 'hex'), now() + interval '10 minutes')`,
    [sessionId, tokenHash]
  );

  return { sessionId, token };
}

// ─── Registration ───────────────────────────────────────────────────────────

async function handleRegisterBegin(req: Request, res: Response): Promise<void> {
  const ctx = req.constructive;
  const settings = getWebauthnSettings(req);

  if (!settings) {
    jsonError(res, 404, 'WebAuthn not configured for this API');
    return;
  }

  const userId = getUserId(req);
  if (!userId) {
    jsonError(res, 401, 'Authentication required');
    return;
  }

  try {
    // Call DB procedure to start registration (creates challenge in session_secrets)
    const dbResult = await ctx.withPgClient(async (client) => {
      const { rows } = await client.query<{ webauthn_begin_registration: BeginRegistrationResponse }>(
        `SELECT "${settings.schema}".webauthn_begin_registration($1::uuid) AS webauthn_begin_registration`,
        [userId]
      );
      return rows[0]?.webauthn_begin_registration;
    });

    if (!dbResult) {
      jsonError(res, 500, 'Failed to start registration');
      return;
    }

    // Generate WebAuthn options using @simplewebauthn/server
    const options = await generateRegistrationOptions({
      rpName: settings.rpName,
      rpID: settings.rpId,
      userName: userId,
      userDisplayName: userId,
      userID: new TextEncoder().encode(dbResult.webauthn_user_id),
      challenge: Buffer.from(dbResult.challenge, 'base64url'),
      attestationType: (settings.attestationType === 'indirect' ? 'direct' : settings.attestationType) as 'none' | 'direct' | 'enterprise',
      excludeCredentials: dbResult.excludeCredentials.map((c) => ({
        id: c.id,
        transports: c.transports as AuthenticatorTransportFuture[]
      })),
      authenticatorSelection: {
        residentKey: settings.residentKey as 'discouraged' | 'preferred' | 'required',
        userVerification: settings.requireUserVerification ? 'required' : 'preferred'
      }
    });

    res.status(200).json(options);
  } catch (err: any) {
    log.error({ event: 'webauthn_register_begin_failed', userId, error: err?.message });
    if (err?.message?.includes('WEBAUTHN_SIGN_UP_DISABLED')) {
      jsonError(res, 403, 'Passkey registration is disabled');
    } else {
      jsonError(res, 500, 'Internal server error');
    }
  }
}

async function handleRegisterFinish(req: Request, res: Response): Promise<void> {
  const ctx = req.constructive;
  const settings = getWebauthnSettings(req);

  if (!settings) {
    jsonError(res, 404, 'WebAuthn not configured for this API');
    return;
  }

  const userId = getUserId(req);
  if (!userId) {
    jsonError(res, 401, 'Authentication required');
    return;
  }

  const response = req.body as RegistrationResponseJSON;
  if (!response?.id || !response?.response) {
    jsonError(res, 400, 'Invalid registration response');
    return;
  }

  const sessionId = req.token?.session_id;
  if (!sessionId) {
    jsonError(res, 401, 'Session required');
    return;
  }

  try {
    // Get the stored challenge from session (using pool directly to bypass RLS)
    const challengeResult = await ctx.pool.query<{ value: string }>(
      `SELECT value FROM "${settings.sessionSecretsSchema}".session_secrets
       WHERE session_id = $1 AND name = 'webauthn_register_challenge' LIMIT 1`,
      [sessionId]
    );
    const storedChallenge = challengeResult.rows[0]?.value;

    if (!storedChallenge) {
      jsonError(res, 400, 'Challenge expired or not found');
      return;
    }

    // Determine expected origin
    const origin = req.headers.origin || `https://${settings.rpId}`;
    const expectedOrigin = settings.originAllowlist?.length
      ? settings.originAllowlist
      : origin;

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: storedChallenge,
      expectedOrigin,
      expectedRPID: settings.rpId
    });

    if (!verification.verified || !verification.registrationInfo) {
      jsonError(res, 400, 'Verification failed');
      return;
    }

    const { credential } = verification.registrationInfo;

    // Store credential via DB procedure
    await ctx.withPgClient(async (client) => {
      await client.query(
        `SELECT "${settings.schema}".webauthn_finish_registration(
           credential_id          := $1,
           public_key             := $2,
           sign_count             := $3::bigint,
           transports             := $4,
           credential_device_type := $5,
           backup_eligible        := $6,
           backup_state           := $7,
           webauthn_user_id       := $8,
           user_id                := $9
         )`,
        [
          response.id,
          Buffer.from(credential.publicKey),
          credential.counter,
          response.response.transports || [],
          verification.registrationInfo.credentialDeviceType,
          verification.registrationInfo.credentialBackedUp,
          verification.registrationInfo.credentialBackedUp,
          Buffer.from(credential.id).toString('base64url'),
          userId
        ]
      );
    });

    res.status(200).json({ success: true, credentialId: response.id });
  } catch (err: any) {
    log.error({ event: 'webauthn_register_finish_failed', userId, error: err?.message });
    jsonError(res, 500, 'Internal server error');
  }
}

// ─── Authentication ─────────────────────────────────────────────────────────

async function handleSignInBegin(req: Request, res: Response): Promise<void> {
  const ctx = req.constructive;
  const settings = getWebauthnSettings(req);

  if (!settings) {
    jsonError(res, 404, 'WebAuthn not configured for this API');
    return;
  }

  // userId is optional for usernameless/discoverable credential flow
  const userId = req.body?.userId || null;

  try {
    // Check if we have a session, if not create anonymous session
    let sessionId = getSessionId(req);
    let anonToken: string | null = null;

    if (!sessionId) {
      const anon = await createAnonymousSession(ctx.pool, settings.sessionsSchema, req);
      sessionId = anon.sessionId;
      anonToken = anon.token;
      log.info({ event: 'webauthn_anonymous_session_created', sessionId });
    }

    // Generate challenge and store in session_secrets (bypass RLS with pool)
    const challenge = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await ctx.pool.query(
      `INSERT INTO "${settings.sessionSecretsSchema}".session_secrets (
        session_id, name, value, expires_at
      ) VALUES ($1, 'webauthn_sign_in_challenge', $2, $3)
      ON CONFLICT (session_id, name) DO UPDATE SET
        value = EXCLUDED.value,
        expires_at = EXCLUDED.expires_at`,
      [sessionId, challenge, expiresAt]
    );

    // Get allowed credentials if userId provided
    let allowCredentials: Array<{ id: string; transports?: string[] }> = [];
    if (userId) {
      const credResult = await ctx.pool.query<{ credential_id: string; transports: string[] }>(
        `SELECT credential_id, transports
         FROM "${settings.credentialsSchema}".webauthn_credentials
         WHERE owner_id = $1`,
        [userId]
      );
      allowCredentials = credResult.rows.map((c) => ({
        id: c.credential_id,
        transports: c.transports
      }));
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: settings.rpId,
      challenge: Buffer.from(challenge, 'base64url'),
      userVerification: settings.requireUserVerification ? 'required' : 'preferred',
      allowCredentials: allowCredentials.map((c) => ({
        id: c.id,
        transports: c.transports as AuthenticatorTransportFuture[]
      }))
    });

    // Return session token in response for cross-origin scenarios
    const responseData: any = { ...options };
    if (anonToken) {
      responseData.sessionToken = anonToken;
    }

    res.status(200).json(responseData);
  } catch (err: any) {
    log.error({ event: 'webauthn_sign_in_begin_failed', userId, error: err?.message });
    if (err?.message?.includes('WEBAUTHN_SIGN_IN_DISABLED')) {
      jsonError(res, 403, 'Passkey sign-in is disabled');
    } else {
      jsonError(res, 500, 'Internal server error');
    }
  }
}

async function handleSignInFinish(req: Request, res: Response): Promise<void> {
  const ctx = req.constructive;
  const settings = getWebauthnSettings(req);

  if (!settings) {
    jsonError(res, 404, 'WebAuthn not configured for this API');
    return;
  }

  const response = req.body as AuthenticationResponseJSON;
  if (!response?.id || !response?.response) {
    jsonError(res, 400, 'Invalid authentication response');
    return;
  }

  try {
    // Get session_id from authenticated session, request body, or cookie
    let sessionId = getSessionId(req);

    if (!sessionId) {
      const anonToken = req.body?.sessionToken || req.cookies?.[WEBAUTHN_SESSION_COOKIE];
      if (!anonToken) {
        jsonError(res, 400, 'Session expired');
        return;
      }

      const tokenHash = crypto.createHash('sha256').update(anonToken).digest('hex');
      const sessionResult = await ctx.pool.query<{ session_id: string }>(
        `SELECT sc.session_id FROM "${settings.sessionsSchema}".session_credentials sc
         JOIN "${settings.sessionsSchema}".sessions s ON sc.session_id = s.id
         WHERE sc.secret_hash = decode($1, 'hex')
           AND sc.kind = 'webauthn_anon'
           AND sc.expires_at > now()
           AND s.is_anonymous = true
         LIMIT 1`,
        [tokenHash]
      );

      if (!sessionResult.rows[0]) {
        jsonError(res, 400, 'Invalid or expired session');
        return;
      }
      sessionId = sessionResult.rows[0].session_id;
    }

    // Look up the credential (using pool to bypass RLS)
    const credResult = await ctx.pool.query<{
      credential_id: string;
      public_key: Buffer;
      sign_count: string;
      transports: string[];
      owner_id: string;
    }>(
      `SELECT credential_id, public_key, sign_count, transports, owner_id
       FROM "${settings.credentialsSchema}".webauthn_credentials
       WHERE credential_id = $1`,
      [response.id]
    );
    const credential = credResult.rows[0];

    if (!credential) {
      jsonError(res, 400, 'Credential not found');
      return;
    }

    // Get stored challenge
    const challengeResult = await ctx.pool.query<{ value: string }>(
      `SELECT value FROM "${settings.sessionSecretsSchema}".session_secrets
       WHERE session_id = $1 AND name = 'webauthn_sign_in_challenge'
       AND (expires_at IS NULL OR expires_at > now())
       LIMIT 1`,
      [sessionId]
    );
    const storedChallenge = challengeResult.rows[0]?.value;

    if (!storedChallenge) {
      jsonError(res, 400, 'Challenge expired or not found');
      return;
    }

    // Determine expected origin
    const origin = req.headers.origin || `https://${settings.rpId}`;
    const expectedOrigin = settings.originAllowlist?.length
      ? settings.originAllowlist
      : origin;

    // Verify the authentication response
    const publicKeyBytes = new Uint8Array(credential.public_key);

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: storedChallenge,
      expectedOrigin,
      expectedRPID: settings.rpId,
      credential: {
        id: credential.credential_id,
        publicKey: publicKeyBytes,
        counter: Number(credential.sign_count),
        transports: credential.transports as AuthenticatorTransportFuture[]
      }
    });

    if (!verification.verified) {
      jsonError(res, 400, 'Verification failed');
      return;
    }

    // Update sign count
    await ctx.pool.query(
      `UPDATE "${settings.credentialsSchema}".webauthn_credentials
       SET sign_count = $1, updated_at = now()
       WHERE credential_id = $2`,
      [verification.authenticationInfo.newCounter, response.id]
    );

    // Create session and credential using same pattern as sign_in function
    const newSessionResult = await ctx.pool.query<{
      id: string;
      expires_at: string;
      access_token: string;
    }>(
      `WITH new_session AS (
        INSERT INTO "${settings.sessionsSchema}".sessions (
          user_id, is_anonymous, auth_method, origin, ip, uagent
        ) VALUES ($1, false, 'webauthn', $2, $3::inet, $4)
        RETURNING id, expires_at
      ),
      new_token AS (
        SELECT 'cnc_live_wa_' || translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_') as token
      ),
      new_cred AS (
        INSERT INTO "${settings.sessionsSchema}".session_credentials (
          session_id, kind, secret_hash, expires_at
        )
        SELECT s.id, 'bearer', digest(t.token, 'sha256'), s.expires_at
        FROM new_session s, new_token t
        RETURNING session_id
      )
      SELECT new_session.id, new_session.expires_at::text, new_token.token as access_token
      FROM new_session, new_token`,
      [
        credential.owner_id,
        req.headers.origin || null,
        req.clientIp || null,
        req.headers['user-agent'] || null
      ]
    );

    const newSession = newSessionResult.rows[0];
    const accessToken = newSession?.access_token;

    if (!newSession) {
      jsonError(res, 500, 'Failed to create session');
      return;
    }

    // Clean up anonymous session and challenge
    await ctx.pool.query(
      `DELETE FROM "${settings.sessionSecretsSchema}".session_secrets
       WHERE session_id = $1 AND name = 'webauthn_sign_in_challenge'`,
      [sessionId]
    );

    // Delete anonymous session if it was used
    if (!getSessionId(req)) {
      await ctx.pool.query(
        `DELETE FROM "${settings.sessionsSchema}".sessions
         WHERE id = $1 AND is_anonymous = true`,
        [sessionId]
      );
    }

    // Clear anonymous session cookie
    res.clearCookie(WEBAUTHN_SESSION_COOKIE);

    res.status(200).json({
      userId: credential.owner_id,
      accessToken: accessToken,
      expiresAt: newSession.expires_at
    });
  } catch (err: any) {
    log.error({ event: 'webauthn_sign_in_finish_failed', error: err?.message });
    jsonError(res, 500, 'Internal server error');
  }
}

// ─── Router ─────────────────────────────────────────────────────────────────

export function createWebauthnRouter(): Router {
  const router = Router();

  router.use('/auth/webauthn', express.json());
  router.post('/auth/webauthn/register/begin', handleRegisterBegin);
  router.post('/auth/webauthn/register/finish', handleRegisterFinish);
  router.post('/auth/webauthn/sign-in/begin', handleSignInBegin);
  router.post('/auth/webauthn/sign-in/finish', handleSignInFinish);

  return router;
}
