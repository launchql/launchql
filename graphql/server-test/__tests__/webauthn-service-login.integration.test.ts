/**
 * Passkey sign-in with the server connected as a single service login that is
 * not a member of `administrator` (constructive-planning#2260). The verifier
 * lane must call the signature-trusting procedures as that login, which holds
 * EXECUTE on them, while the request roles stay without it.
 */

import { getEnvOptions } from '@constructive-io/graphql-env';
import { generateCreateUserSQL } from '@pgpmjs/core';
import { randomBytes } from 'crypto';
import path from 'path';
import { pgCache } from 'pg-cache';
import { getConnections } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import supertest from 'supertest';

import { createTestServer, seed } from '../src';
import type { ServerInfo } from '../src/types';
import { createSoftwareAuthenticator } from './webauthn-authenticator';

jest.setTimeout(120000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const localSeedRoot = path.join(__dirname, '..', '__fixtures__', 'seed');
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const metaSchemas = [
  'catalog_private',
  'routing_public',
  'apps_public',
  'metaschema_public',
  'metaschema_modules_public'
];

const HOST = 'app.test.constructive.io';
const ORIGIN = 'https://example.com';
const SESSION = { Authorization: 'Bearer session-token' };
const AUTH_PRIVATE = 'simple-pets-auth-private';
const VERIFIER_PROCEDURES = [
  `"${AUTH_PRIVATE}".webauthn_challenge_matches(text, text, uuid)`,
  `"${AUTH_PRIVATE}".webauthn_credential_for_assertion(text, uuid)`,
  `"${AUTH_PRIVATE}".webauthn_finish_sign_in(text, bigint, boolean, text, uuid)`
];
const LOGIN = `server_test_login_${randomBytes(8).toString('hex')}`;
const PASSWORD = randomBytes(24).toString('base64url');

const REGISTER_BEGIN = `mutation { webauthnRegisterBegin(input: {}) { options webauthnUserId } }`;
const REGISTER_FINISH = `
  mutation ($response: JSON!, $webauthnUserId: String!) {
    webauthnRegisterFinish(input: { response: $response, webauthnUserId: $webauthnUserId, name: "laptop" }) {
      credentialId
    }
  }
`;
const SIGN_IN_BEGIN = `mutation { webauthnSignInBegin(input: {}) { options challengeId } }`;
const SIGN_IN_FINISH = `
  mutation ($response: JSON!, $challengeId: UUID!) {
    webauthnSignInFinish(input: { response: $response, challengeId: $challengeId }) {
      accessToken userId
    }
  }
`;

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;
let server: ServerInfo;
let request: supertest.Agent;

const post = (query: string, variables: Record<string, unknown> = {}, headers: Record<string, string> = {}) => {
  let req = request.post('/graphql').set('Host', HOST);
  for (const [name, value] of Object.entries(headers)) req = req.set(name, value);
  return req.send({ query, variables });
};

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections({}, [
    seed.pgpm(pgpmWorkspace),
    seed.sqlfile([
      path.join(sharedSeedRoot, 'app-schemas', 'simple-pets', 'schema.sql'),
      path.join(sharedSeedRoot, 'scoped', 'test-data.sql'),
      path.join(localSeedRoot, 'auth-cookie', 'schema.sql'),
      path.join(localSeedRoot, 'webauthn', 'schema.sql')
    ])
  ]));
  // The seed's pg-cache entry must not supply the server an admin connection.
  pgCache.delete(pg.config.database);
  await pgCache.waitForDisposals();

  // The service login: BYPASSRLS, inherits the request roles, and holds its
  // own EXECUTE on the verifier procedures — never administrator membership.
  const roles = { anonymous: 'anonymous', authenticated: 'authenticated' };
  await pg.query(generateCreateUserSQL(LOGIN, PASSWORD, roles, { bypassRls: true }));
  await pg.query(`
    GRANT CONNECT ON DATABASE "${pg.config.database}" TO "${LOGIN}";
    DO $grant$
    DECLARE s text;
    BEGIN
      FOR s IN
        SELECT nspname FROM pg_namespace
        WHERE nspname NOT LIKE 'pg\\_%' AND nspname NOT IN ('information_schema', '${AUTH_PRIVATE}')
      LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', s, '${LOGIN}');
        EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO %I', s, '${LOGIN}');
        EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO %I', s, '${LOGIN}');
      END LOOP;
    END
    $grant$;
    GRANT USAGE ON SCHEMA "${AUTH_PRIVATE}" TO "${LOGIN}";
    ${VERIFIER_PROCEDURES.map((fn) => `GRANT EXECUTE ON FUNCTION ${fn} TO "${LOGIN}";`).join('\n')}
  `);

  server = await createTestServer(getEnvOptions({
    pg: { ...pg.config, user: LOGIN, password: PASSWORD },
    api: {
      isPublic: true,
      metaSchemas,
      exposedSchemas: ['simple-pets-public', 'simple-pets-pets-public'],
      anonRole: 'anonymous',
      roleName: 'anonymous'
    }
  }));
  request = supertest.agent(server.httpServer);
});

afterAll(async () => {
  await server?.stop();
  if (pg) {
    await pg.query(`DROP OWNED BY "${LOGIN}"; DROP ROLE "${LOGIN}"`);
  }
  await teardown?.();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
  await pg.afterEach();
});

it('serves with a login that is not a member of administrator', async () => {
  const { rows } = await pg.query(
    `SELECT pg_has_role($1, 'administrator', 'MEMBER') AS member`,
    [LOGIN]
  );
  expect(rows[0].member).toBe(false);
});

it('keeps the verifier procedures off the request roles', async () => {
  for (const fn of VERIFIER_PROCEDURES) {
    const { rows } = await pg.query(
      `SELECT has_function_privilege('anonymous', $1, 'EXECUTE') AS anonymous,
              has_function_privilege('authenticated', $1, 'EXECUTE') AS authenticated,
              has_function_privilege($2, $1, 'EXECUTE') AS login`,
      [fn, LOGIN]
    );
    expect(rows[0]).toEqual({ anonymous: false, authenticated: false, login: true });
  }
});

it('registers a passkey and signs in through the verifier lane as the login', async () => {
  const authenticator = await createSoftwareAuthenticator();
  const begin = await post(REGISTER_BEGIN, {}, SESSION);
  expect(begin.body.errors).toBeUndefined();
  const { options, webauthnUserId } = begin.body.data.webauthnRegisterBegin;
  const registration = await authenticator.registration(options, ORIGIN);
  const registered = await post(REGISTER_FINISH, { response: registration, webauthnUserId }, SESSION);
  expect(registered.body.errors).toBeUndefined();

  const signInBegin = await post(SIGN_IN_BEGIN);
  expect(signInBegin.body.errors).toBeUndefined();
  const { options: signInOptions, challengeId } = signInBegin.body.data.webauthnSignInBegin;
  const assertion = await authenticator.assertion(signInOptions, ORIGIN, 1);
  const finish = await post(SIGN_IN_FINISH, { response: assertion, challengeId });
  expect(finish.body.errors).toBeUndefined();
  expect(finish.body.data.webauthnSignInFinish).toMatchObject({
    accessToken: 'session-token',
    userId: 'bbbbbbbb-0000-4000-8000-000000000002'
  });
});
