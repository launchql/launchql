/**
 * Passkey registration and sign-in through the real server: routing resolves
 * the tenant's WebAuthn policy, WebauthnPlugin verifies a software
 * authenticator's responses against it, and the tenant's procedures (fixture
 * stand-ins with the generated grants) hold the ceremony state.
 */

import path from 'path';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';
import { createSoftwareAuthenticator } from './webauthn-authenticator';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const localSeedRoot = path.join(__dirname, '..', '__fixtures__', 'seed');
const pgpmWorkspace = path.join(sharedSeedRoot, '..', '..');
const schemas = ['simple-pets-public', 'simple-pets-pets-public'];
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

const codeOf = (res: { body: { errors?: Array<{ extensions?: { code?: string } }> } }) =>
  res.body.errors?.[0]?.extensions?.code;

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
      accessToken accessTokenExpiresAt userId
    }
  }
`;

describe('WebAuthn over GraphQL', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const post = (query: string, variables: Record<string, unknown> = {}, headers: Record<string, string> = {}) => {
    let req = request.post('/graphql').set('Host', HOST);
    for (const [name, value] of Object.entries(headers)) req = req.set(name, value);
    return req.send({ query, variables });
  };

  beforeAll(async () => {
    ({ request, teardown } = await getConnections(
      {
        schemas,
        authRole: 'anonymous',
        server: { useRouting: true, api: { isPublic: true, metaSchemas } }
      },
      [
        seed.pgpm(pgpmWorkspace),
        seed.sqlfile([
          path.join(sharedSeedRoot, 'app-schemas', 'simple-pets', 'schema.sql'),
          path.join(sharedSeedRoot, 'scoped', 'test-data.sql'),
          path.join(localSeedRoot, 'auth-cookie', 'schema.sql'),
          path.join(localSeedRoot, 'webauthn', 'schema.sql')
        ])
      ]
    ));
  });

  afterAll(async () => {
    await teardown();
  });

  const register = async () => {
    const authenticator = await createSoftwareAuthenticator();
    const begin = await post(REGISTER_BEGIN, {}, SESSION);
    expect(begin.body.errors).toBeUndefined();
    const { options, webauthnUserId } = begin.body.data.webauthnRegisterBegin;
    const response = await authenticator.registration(options, ORIGIN);
    const finish = await post(REGISTER_FINISH, { response, webauthnUserId }, SESSION);
    expect(finish.body.errors).toBeUndefined();
    return { authenticator, credentialId: finish.body.data.webauthnRegisterFinish.credentialId as string };
  };

  const beginSignIn = async () => {
    const begin = await post(SIGN_IN_BEGIN);
    expect(begin.body.errors).toBeUndefined();
    return begin.body.data.webauthnSignInBegin as { options: any; challengeId: string };
  };

  it('exposes the passkey ceremony as GraphQL mutations', async () => {
    const res = await post('{ __type(name: "Mutation") { fields { name } } }');
    const names = res.body.data.__type.fields.map((f: { name: string }) => f.name);
    expect(names).toEqual(expect.arrayContaining([
      'webauthnRegisterBegin',
      'webauthnRegisterFinish',
      'webauthnSignInBegin',
      'webauthnSignInFinish'
    ]));
  });

  it('builds options from the tenant policy, not the client', async () => {
    const begin = await post(REGISTER_BEGIN, {}, SESSION);
    const { options } = begin.body.data.webauthnRegisterBegin;
    expect(options.rp).toEqual({ id: 'example.com', name: 'Example' });
    expect(options.authenticatorSelection).toMatchObject({ residentKey: 'required', userVerification: 'preferred' });
    expect(options.timeout).toBe(300_000);
  });

  it('refuses to begin a registration without a session', async () => {
    const res = await post(REGISTER_BEGIN);
    expect(codeOf(res)).toBe('UNAUTHENTICATED');
  });

  it('registers a passkey, then signs in anonymously and sets the session cookie', async () => {
    const { authenticator, credentialId } = await register();
    expect(credentialId).toEqual(expect.any(String));

    const { options, challengeId } = await beginSignIn();
    expect(options.rpId).toBe('example.com');
    const response = await authenticator.assertion(options, ORIGIN, 1);
    const finish = await post(SIGN_IN_FINISH, { response, challengeId });
    expect(finish.body.errors).toBeUndefined();
    expect(finish.body.data.webauthnSignInFinish).toMatchObject({
      accessToken: 'session-token',
      userId: 'bbbbbbbb-0000-4000-8000-000000000002'
    });
    const cookies = ([] as string[]).concat(finish.headers['set-cookie'] ?? []);
    expect(cookies.some((c) => c.startsWith('constructive_session=session-token'))).toBe(true);
  });

  it('consumes a sign-in challenge once', async () => {
    const { authenticator } = await register();
    const { options, challengeId } = await beginSignIn();
    const response = await authenticator.assertion(options, ORIGIN, 1);
    expect((await post(SIGN_IN_FINISH, { response, challengeId })).body.errors).toBeUndefined();
    const replay = await post(SIGN_IN_FINISH, { response, challengeId });
    expect(codeOf(replay)).toBe('WEBAUTHN_SIGN_IN_CHALLENGE_NOT_FOUND_OR_EXPIRED');
  });

  it('rejects an assertion from an origin outside the policy', async () => {
    const { authenticator } = await register();
    const { options, challengeId } = await beginSignIn();
    const response = await authenticator.assertion(options, 'https://evil.example', 1);
    const res = await post(SIGN_IN_FINISH, { response, challengeId });
    expect(codeOf(res)).toBe('WEBAUTHN_VERIFICATION_FAILED');
    expect(res.body.data?.webauthnSignInFinish ?? null).toBeNull();
  });

  it('rejects an assertion for a different challenge', async () => {
    const { authenticator } = await register();
    const first = await beginSignIn();
    const second = await beginSignIn();
    const response = await authenticator.assertion(first.options, ORIGIN, 1);
    const res = await post(SIGN_IN_FINISH, { response, challengeId: second.challengeId });
    expect(codeOf(res)).toBe('WEBAUTHN_VERIFICATION_FAILED');
  });

  it('rejects a sign-counter regression', async () => {
    const { authenticator } = await register();
    const first = await beginSignIn();
    const ok = await post(SIGN_IN_FINISH, {
      response: await authenticator.assertion(first.options, ORIGIN, 5),
      challengeId: first.challengeId
    });
    expect(ok.body.errors).toBeUndefined();
    const second = await beginSignIn();
    const res = await post(SIGN_IN_FINISH, {
      response: await authenticator.assertion(second.options, ORIGIN, 3),
      challengeId: second.challengeId
    });
    expect(codeOf(res)).toBe('WEBAUTHN_VERIFICATION_FAILED');
  });

  it('refuses an assertion from a passkey the tenant never registered', async () => {
    const stranger = await createSoftwareAuthenticator();
    const { options, challengeId } = await beginSignIn();
    const response = await stranger.assertion(options, ORIGIN, 1);
    const res = await post(SIGN_IN_FINISH, { response, challengeId });
    expect(codeOf(res)).toBe('WEBAUTHN_CREDENTIAL_NOT_FOUND');
  });

  it('rejects a registration response from an origin outside the policy', async () => {
    const authenticator = await createSoftwareAuthenticator();
    const begin = await post(REGISTER_BEGIN, {}, SESSION);
    const { options, webauthnUserId } = begin.body.data.webauthnRegisterBegin;
    const response = await authenticator.registration(options, 'https://evil.example');
    const res = await post(REGISTER_FINISH, { response, webauthnUserId }, SESSION);
    expect(codeOf(res)).toBe('WEBAUTHN_VERIFICATION_FAILED');
  });
});
