import '../middleware/types';

import type { WebauthnSettings } from '@constructive-io/express-context';
import { QuoteUtils } from '@pgsql/quotes';
import {
  type AuthenticationResponseJSON,
  type AuthenticatorSelectionCriteria,
  type AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  type RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type { Request } from 'express';
import { context as grafastContext, lambda, object, type Step } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { SYSTEM_LANE_ROLE } from 'graphile-plugin-utils';
import { extendSchema, gql } from 'graphile-utils';

/**
 * WebAuthn (passkey) registration and sign-in as GraphQL mutations.
 *
 * The tenant's generated `webauthn_*` procedures own the ceremony state —
 * challenges in session secrets, credentials in the credentials table — and
 * this plugin is the verifier between them: it builds the browser options and
 * runs `@simplewebauthn/server` against the tenant's recorded policy. The RP ID
 * and allowed origins come only from that policy (routing-plane
 * `webauthn_settings`), never from the client.
 *
 * Two lanes reach the procedures:
 * - the request lane (the request's own role and claims) begins both
 *   ceremonies — work any caller may ask for as themselves;
 * - the verifier lane (the request's claims under the server's
 *   {@link SYSTEM_LANE_ROLE}) reads the stored challenge and the credential's
 *   public key, persists a verified registration, and mints the session.
 *   Those procedures trust their caller to have verified a signature, so only
 *   the server is granted them — a SQL caller can neither mint a session by
 *   naming a credential nor plant a public key on someone else's account.
 */

interface PgClient {
  query(opts: { text: string; values?: unknown[] }): Promise<{ rows: Array<Record<string, unknown>> }>;
  withTransaction<T>(cb: (tx: PgClient) => Promise<T>): Promise<T>;
}

type WithPgClient = <T>(pgSettings: Record<string, string> | null, cb: (client: PgClient) => Promise<T>) => Promise<T>;

interface WebauthnRequestContext {
  settings?: WebauthnSettings;
  req?: Request;
}

const CONTEXT_KEY = 'constructiveWebauthn';

const REGISTER_CHALLENGE = 'webauthn_register_challenge';
const SIGN_IN_CHALLENGE = 'webauthn_sign_in_challenge';

const MAX_NAME_LENGTH = 256;
const MAX_RESPONSE_BYTES = 64 * 1024;

const getExpressRequest = (
  requestContext: Partial<Grafast.RequestContext> | undefined
): Request | undefined => (requestContext as { expressv4?: { req?: Request } })?.expressv4?.req;

const fail = (code: string, message: string): never => {
  const err = new Error(message) as Error & { extensions?: Record<string, unknown> };
  err.extensions = { code };
  throw err;
};

/** Apply the request's settings transaction-locally, optionally overriding its role. */
const applySettings = async (
  tx: PgClient,
  pgSettings: Record<string, string> | null,
  role?: string
): Promise<void> => {
  const entries = Object.entries(pgSettings ?? {}).filter(([key]) => !role || key !== 'role');
  if (role) entries.push(['role', role]);
  if (entries.length === 0) return;
  await tx.query({
    text: 'SELECT set_config(el->>0, el->>1, true) FROM json_array_elements($1::json) el',
    values: [JSON.stringify(entries)]
  });
};

const withRequestLane = <T>(
  withPgClient: WithPgClient,
  pgSettings: Record<string, string> | null,
  cb: (tx: PgClient) => Promise<T>
): Promise<T> =>
    withPgClient(null, (client) =>
      client.withTransaction(async (tx) => {
        await applySettings(tx, pgSettings);
        return cb(tx);
      })
    );

const withVerifierLane = <T>(
  withPgClient: WithPgClient,
  pgSettings: Record<string, string> | null,
  cb: (tx: PgClient) => Promise<T>
): Promise<T> =>
    withPgClient(null, (client) =>
      client.withTransaction(async (tx) => {
        await applySettings(tx, pgSettings, SYSTEM_LANE_ROLE);
        return cb(tx);
      })
    );

const procedure = (settings: WebauthnSettings, name: string): string =>
  QuoteUtils.quoteQualifiedIdentifier(settings.schema, name);

const requireSettings = (ctx: WebauthnRequestContext | undefined): WebauthnSettings => {
  const settings = ctx?.settings;
  if (!settings) throw new Error('WebauthnPlugin is loaded but the request resolved no webauthnSettings');
  return settings;
};

const requireUserId = (pgSettings: Record<string, string> | null): string => {
  const userId = pgSettings?.['jwt.claims.user_id'];
  if (!userId) fail('UNAUTHENTICATED', 'Passkey registration requires a signed-in user');
  return userId;
};

const payloadObject = (operation: string, value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${operation} returned no payload`);
  }
  return value as Record<string, unknown>;
};

const payloadString = (operation: string, payload: Record<string, unknown>, key: string): string => {
  const value = payload[key];
  if (typeof value !== 'string' || !value) throw new Error(`${operation} returned no ${key}`);
  return value;
};

interface CredentialDescriptor {
  id: string;
  transports: AuthenticatorTransportFuture[];
}

const credentialDescriptors = (operation: string, value: unknown): CredentialDescriptor[] => {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${operation} returned invalid credentials`);
  return value.map((entry) => {
    const descriptor = payloadObject(operation, entry);
    const transports = descriptor.transports ?? [];
    if (!Array.isArray(transports) || !transports.every((t) => typeof t === 'string')) {
      throw new Error(`${operation} returned invalid credential transports`);
    }
    return {
      id: payloadString(operation, descriptor, 'id'),
      transports: transports as AuthenticatorTransportFuture[]
    };
  });
};

const requireJsonObject = <T>(value: unknown, field: string): T => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('BAD_USER_INPUT', `${field} must be a WebAuthn credential JSON object`);
  }
  if (JSON.stringify(value).length > MAX_RESPONSE_BYTES) {
    fail('BAD_USER_INPUT', `${field} is too large`);
  }
  return value as T;
};

const challengeMatches = async (
  tx: PgClient,
  settings: WebauthnSettings,
  challengeName: string,
  challenge: string,
  challengeId: string | null
): Promise<boolean> => {
  const { rows } = await tx.query({
    text: `SELECT ${procedure(settings, 'webauthn_challenge_matches')}($1, $2, $3::uuid) AS matches`,
    values: [challengeName, challenge, challengeId]
  });
  return rows[0]?.matches === true;
};

/**
 * SimpleWebAuthn reports a response that fails verification by throwing; give
 * that a public code. A database error from the challenge lookup inside it
 * keeps its own.
 */
const verifying = async <T>(verify: () => Promise<T>): Promise<T> => {
  try {
    return await verify();
  } catch (err) {
    if (typeof (err as { code?: unknown })?.code === 'string' && (err as { severity?: unknown }).severity) throw err;
    return fail('WEBAUTHN_VERIFICATION_FAILED', (err as Error)?.message ?? String(err));
  }
};

const userVerification = (settings: WebauthnSettings): 'required' | 'preferred' =>
  settings.requireUserVerification ? 'required' : 'preferred';

const lookupCurrentUser = async (
  tx: PgClient,
  req: Request | undefined
): Promise<{ username: string | null; displayName: string | null }> => {
  const surface = await req?.constructive?.useModule('authSurface');
  if (!surface) return { username: null, displayName: null };
  const { rows } = await tx.query({
    text: `SELECT username, display_name FROM ${QuoteUtils.quoteQualifiedIdentifier(surface.publicSchema, 'current_user')}()`
  });
  const row = rows[0];
  return {
    username: typeof row?.username === 'string' ? row.username : null,
    displayName: typeof row?.display_name === 'string' ? row.display_name : null
  };
};

const resolveArgs = (fieldArgs: any): Step<ResolvedArgs> =>
  object({
    input: fieldArgs.getRaw('input'),
    withPgClient: (grafastContext() as any).get('withPgClient'),
    pgSettings: (grafastContext() as any).get('pgSettings'),
    webauthn: (grafastContext() as any).get(CONTEXT_KEY)
  }) as unknown as Step<ResolvedArgs>;

interface ResolvedArgs {
  input: Record<string, unknown> | null;
  withPgClient: WithPgClient;
  pgSettings: Record<string, string> | null;
  webauthn: WebauthnRequestContext | undefined;
}

export const WebauthnPlugin: GraphileConfig.Plugin = {
  ...extendSchema(() => ({
    typeDefs: gql`
      input WebauthnRegisterBeginInput {
        clientMutationId: String
      }

      type WebauthnRegisterBeginPayload {
        """PublicKeyCredentialCreationOptionsJSON for navigator.credentials.create()."""
        options: JSON!
        """The user handle to echo back to webauthnRegisterFinish."""
        webauthnUserId: String!
      }

      input WebauthnRegisterFinishInput {
        """The browser's RegistrationResponseJSON."""
        response: JSON!
        webauthnUserId: String!
        """A label for the passkey."""
        name: String
      }

      type WebauthnRegisterFinishPayload {
        credentialId: String!
      }

      input WebauthnSignInBeginInput {
        clientMutationId: String
      }

      type WebauthnSignInBeginPayload {
        """PublicKeyCredentialRequestOptionsJSON for navigator.credentials.get()."""
        options: JSON!
        """Names the pending challenge; echo it back to webauthnSignInFinish."""
        challengeId: UUID!
      }

      input WebauthnSignInFinishInput {
        """The browser's AuthenticationResponseJSON."""
        response: JSON!
        challengeId: UUID!
      }

      type WebauthnSignInFinishPayload {
        accessToken: String!
        accessTokenExpiresAt: Datetime!
        userId: UUID!
      }

      extend type Mutation {
        """Begin registering a passkey for the signed-in user."""
        webauthnRegisterBegin(input: WebauthnRegisterBeginInput): WebauthnRegisterBeginPayload
        """Verify the browser's registration response and store the passkey."""
        webauthnRegisterFinish(input: WebauthnRegisterFinishInput!): WebauthnRegisterFinishPayload
        """Begin a passkey sign-in (discoverable when signed out)."""
        webauthnSignInBegin(input: WebauthnSignInBeginInput): WebauthnSignInBeginPayload
        """Verify the browser's assertion and mint a session."""
        webauthnSignInFinish(input: WebauthnSignInFinishInput!): WebauthnSignInFinishPayload
      }
    `,
    plans: {
      Mutation: {
        webauthnRegisterBegin(_$mutation: any, fieldArgs: any) {
          return lambda(resolveArgs(fieldArgs), async ({ withPgClient, pgSettings, webauthn }: ResolvedArgs) => {
            const settings = requireSettings(webauthn);
            const userId = requireUserId(pgSettings);
            const { registration, user } = await withRequestLane(withPgClient, pgSettings, async (tx) => {
              const { rows } = await tx.query({
                text: `SELECT ${procedure(settings, 'webauthn_begin_registration')}($1::uuid) AS result`,
                values: [userId]
              });
              const payload = payloadObject('webauthn_begin_registration', rows[0]?.result);
              return {
                registration: {
                  challenge: payloadString('webauthn_begin_registration', payload, 'challenge'),
                  webauthnUserId: payloadString('webauthn_begin_registration', payload, 'webauthn_user_id'),
                  excludeCredentials: credentialDescriptors('webauthn_begin_registration', payload.excludeCredentials)
                },
                user: await lookupCurrentUser(tx, webauthn?.req)
              };
            });

            const authenticatorSelection: AuthenticatorSelectionCriteria = {
              residentKey: settings.residentKey as AuthenticatorSelectionCriteria['residentKey'],
              userVerification: userVerification(settings)
            };
            const options = await generateRegistrationOptions({
              // The tenant mints the challenge already base64url-encoded; a
              // string challenge would be re-encoded as UTF-8 and the browser
              // would echo a value the tenant never stored.
              challenge: isoBase64URL.toBuffer(registration.challenge),
              rpID: settings.rpId,
              rpName: settings.rpName,
              attestationType: settings.attestationType as 'direct' | 'enterprise' | 'none',
              authenticatorSelection,
              excludeCredentials: registration.excludeCredentials,
              timeout: settings.challengeExpirySeconds * 1000,
              userID: new TextEncoder().encode(registration.webauthnUserId),
              userName: user.username ?? userId,
              userDisplayName: user.displayName ?? user.username ?? userId
            });
            return { options, webauthnUserId: registration.webauthnUserId };
          });
        },

        webauthnRegisterFinish(_$mutation: any, fieldArgs: any) {
          return lambda(resolveArgs(fieldArgs), async ({ input, withPgClient, pgSettings, webauthn }: ResolvedArgs) => {
            const settings = requireSettings(webauthn);
            const userId = requireUserId(pgSettings);
            const response = requireJsonObject<RegistrationResponseJSON>(input?.response, 'response');
            const webauthnUserId = input?.webauthnUserId as string;
            const name = (input?.name as string | null | undefined) ?? null;
            if (name !== null && name.length > MAX_NAME_LENGTH) {
              fail('BAD_USER_INPUT', `name must be at most ${MAX_NAME_LENGTH} characters`);
            }

            const verified = await withVerifierLane(withPgClient, pgSettings, (tx) =>
              verifying(() => verifyRegistrationResponse({
                response,
                expectedChallenge: (challenge) => challengeMatches(tx, settings, REGISTER_CHALLENGE, challenge, null),
                expectedOrigin: settings.originAllowlist,
                expectedRPID: settings.rpId,
                requireUserVerification: settings.requireUserVerification
              }))
            );
            if (!verified.verified) fail('WEBAUTHN_VERIFICATION_FAILED', 'WebAuthn registration verification failed');

            const { credential, credentialDeviceType, credentialBackedUp } = verified.registrationInfo;
            const credentialId = await withVerifierLane(withPgClient, pgSettings, async (tx) => {
              const { rows } = await tx.query({
                text: `SELECT ${procedure(settings, 'webauthn_finish_registration')}(
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                ) AS id`,
                values: [
                  credential.id,
                  Buffer.from(credential.publicKey),
                  credential.counter,
                  credential.transports ?? [],
                  credentialDeviceType,
                  // SimpleWebAuthn reports backup eligibility through the
                  // device type; backed-up is the separate current-state flag.
                  credentialDeviceType === 'multiDevice',
                  credentialBackedUp,
                  webauthnUserId,
                  userId,
                  name
                ]
              });
              return payloadString('webauthn_finish_registration', rows[0] ?? {}, 'id');
            });
            return { credentialId };
          });
        },

        webauthnSignInBegin(_$mutation: any, fieldArgs: any) {
          return lambda(resolveArgs(fieldArgs), async ({ withPgClient, pgSettings, webauthn }: ResolvedArgs) => {
            const settings = requireSettings(webauthn);
            const signIn = await withRequestLane(withPgClient, pgSettings, async (tx) => {
              const { rows } = await tx.query({
                text: `SELECT ${procedure(settings, 'webauthn_begin_sign_in')}($1::uuid) AS result`,
                values: [pgSettings?.['jwt.claims.user_id'] ?? null]
              });
              const payload = payloadObject('webauthn_begin_sign_in', rows[0]?.result);
              return {
                challenge: payloadString('webauthn_begin_sign_in', payload, 'challenge'),
                challengeId: payloadString('webauthn_begin_sign_in', payload, 'challengeId'),
                allowCredentials: credentialDescriptors('webauthn_begin_sign_in', payload.allowCredentials)
              };
            });
            const options = await generateAuthenticationOptions({
              challenge: isoBase64URL.toBuffer(signIn.challenge),
              rpID: settings.rpId,
              allowCredentials: signIn.allowCredentials,
              userVerification: userVerification(settings),
              timeout: settings.challengeExpirySeconds * 1000
            });
            return { options, challengeId: signIn.challengeId };
          });
        },

        webauthnSignInFinish(_$mutation: any, fieldArgs: any) {
          return lambda(resolveArgs(fieldArgs), async ({ input, withPgClient, pgSettings, webauthn }: ResolvedArgs) => {
            const settings = requireSettings(webauthn);
            const response = requireJsonObject<AuthenticationResponseJSON>(input?.response, 'response');
            const challengeId = input?.challengeId as string;
            const credentialId = response.id;
            if (typeof credentialId !== 'string' || !credentialId) {
              fail('BAD_USER_INPUT', 'response.id is required');
            }

            // One transaction: the challenge read, the counter check and the
            // session mint see the same state, and a refusal undoes them all.
            const row = await withVerifierLane(withPgClient, pgSettings, async (tx) => {
              const { rows: credentialRows } = await tx.query({
                text: `SELECT public_key, sign_count, transports
                  FROM ${procedure(settings, 'webauthn_credential_for_assertion')}($1, $2::uuid)`,
                values: [credentialId, challengeId]
              });
              const stored = credentialRows[0];
              if (!stored || !(stored.public_key instanceof Uint8Array)) {
                throw new Error('webauthn_credential_for_assertion returned no public key');
              }
              const publicKey = Uint8Array.from(stored.public_key);
              const transports = stored.transports;
              if (!Array.isArray(transports) || !transports.every((t) => typeof t === 'string')) {
                throw new Error('webauthn_credential_for_assertion returned invalid transports');
              }
              const signCount = Number(stored.sign_count);
              if (!Number.isSafeInteger(signCount) || signCount < 0) {
                throw new Error('webauthn_credential_for_assertion returned invalid sign count');
              }

              const verified = await verifying(() => verifyAuthenticationResponse({
                response,
                expectedChallenge: (challenge) =>
                  challengeMatches(tx, settings, SIGN_IN_CHALLENGE, challenge, challengeId),
                expectedOrigin: settings.originAllowlist,
                expectedRPID: settings.rpId,
                credential: {
                  id: credentialId,
                  publicKey,
                  counter: signCount,
                  transports: transports as AuthenticatorTransportFuture[]
                },
                requireUserVerification: settings.requireUserVerification
              }));
              if (!verified.verified) {
                fail('WEBAUTHN_VERIFICATION_FAILED', 'WebAuthn authentication verification failed');
              }

              const { rows } = await tx.query({
                text: `SELECT user_id, access_token, access_token_expires_at
                  FROM ${procedure(settings, 'webauthn_finish_sign_in')}($1, $2, $3, $4, $5::uuid)`,
                values: [
                  credentialId,
                  verified.authenticationInfo.newCounter,
                  verified.authenticationInfo.credentialBackedUp,
                  'bearer',
                  challengeId
                ]
              });
              return rows[0];
            });

            if (!row?.access_token || !row.user_id) {
              throw new Error('webauthn_finish_sign_in minted no session');
            }
            return {
              accessToken: row.access_token,
              accessTokenExpiresAt: row.access_token_expires_at,
              userId: row.user_id
            };
          });
        }
      }
    }
  })),
  name: 'WebauthnPlugin',
  version: '0.0.0',
  description: 'WebAuthn passkey registration and sign-in mutations, verified in the server.',
  grafast: {
    middleware: {
      prepareArgs(next, event) {
        const req = getExpressRequest(event.args.requestContext);
        // Read per request, not baked into the cached schema: a tenant
        // changing its RP ID or origins takes effect with the next request.
        const ctx: WebauthnRequestContext = { settings: req?.api?.webauthnSettings, req };
        (event.args.contextValue as unknown as Record<string, unknown>)[CONTEXT_KEY] = ctx;
        return next();
      }
    }
  }
};
