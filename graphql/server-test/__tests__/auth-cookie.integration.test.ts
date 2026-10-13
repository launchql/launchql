/**
 * Session-cookie lifecycle through the real server (routing, auth, CSRF,
 * AuthCookiePlugin): browsers keep cookie auth with full CSRF protection;
 * native clients opt out of the session cookie with
 * `X-Constructive-Session-Cookie: omit`, and `signOut` always clears it.
 */

import path from 'path';
import type supertest from 'supertest';

import { getConnections, seed } from '../src';

jest.setTimeout(60000);

const sharedSeedRoot = path.join(__dirname, '..', '..', '..', '__fixtures__', 'seed');
const localSeed = path.join(__dirname, '..', '__fixtures__', 'seed', 'auth-cookie', 'schema.sql');
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
const OPT_OUT_HEADER = 'X-Constructive-Session-Cookie';
const SIGN_IN = `
  mutation SignIn {
    signIn(input: { email: "user@example.com", password: "password" }) { result { accessToken } }
  }
`;
const SIGN_OUT = 'mutation SignOut { signOut(input: {}) { result } }';

const setCookies = (res: supertest.Response): string[] => {
  const header = res.headers['set-cookie'] as unknown as string[] | string | undefined;
  if (!header) return [];
  return Array.isArray(header) ? header : [header];
};

const cookieNamed = (res: supertest.Response, name: string): string | undefined =>
  setCookies(res).find((cookie) => cookie.startsWith(`${name}=`));

describe('session cookie lifecycle', () => {
  let request: supertest.Agent;
  let teardown: () => Promise<void>;

  const post = (query: string, headers: Record<string, string> = {}, operationName?: string) => {
    let req = request.post('/graphql').set('Host', HOST);
    for (const [name, value] of Object.entries(headers)) {
      req = req.set(name, value);
    }
    return req.send({ query, operationName });
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
          localSeed
        ])
      ]
    ));
  });

  afterAll(async () => {
    await teardown();
  });

  it('issues the CSRF cookie for one day', async () => {
    const res = await request.get('/graphql').set('Host', HOST);

    expect(cookieNamed(res, 'csrf_token')).toMatch(/; Max-Age=86400;/);
  });

  it('sets the session cookie on a browser signIn', async () => {
    const res = await post(SIGN_IN);

    expect(res.status).toBe(200);
    expect(res.body.data.signIn.result.accessToken).toBe('session-token');
    expect(cookieNamed(res, 'constructive_session')).toMatch(
      /^constructive_session=session-token; Max-Age=86400; Path=\/; HttpOnly; SameSite=Lax$/
    );
  });

  it('still refuses a cookie-authenticated signIn without a CSRF token', async () => {
    const res = await post(SIGN_IN, { Cookie: 'constructive_session=session-token' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('does not let the opt-out header bypass CSRF for a cookie-carrying request', async () => {
    const res = await post(SIGN_IN, {
      Cookie: 'constructive_session=session-token',
      [OPT_OUT_HEADER]: 'omit'
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('sets no auth cookie on a signIn that opted out', async () => {
    const res = await post(SIGN_IN, { [OPT_OUT_HEADER]: 'omit' });

    expect(res.status).toBe(200);
    expect(res.body.data.signIn.result.accessToken).toBe('session-token');
    expect(cookieNamed(res, 'constructive_session')).toBeUndefined();
    expect(cookieNamed(res, 'constructive_device_token')).toBeUndefined();
  });

  it('rejects an opt-out header with any value but "omit" before signIn runs', async () => {
    const res = await post(SIGN_IN, { [OPT_OUT_HEADER]: 'none', Accept: 'application/json' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_SESSION_COOKIE_HEADER');
    expect(cookieNamed(res, 'constructive_session')).toBeUndefined();
  });

  it('clears the session cookie on a Bearer-authenticated signOut', async () => {
    const res = await post(SIGN_OUT, {
      Authorization: 'Bearer session-token',
      Cookie: 'constructive_session=session-token'
    });

    expect(res.status).toBe(200);
    expect(res.body.data.signOut.result).toBe(true);
    expect(cookieNamed(res, 'constructive_session')).toMatch(/^constructive_session=; Max-Age=0;/);
    expect(cookieNamed(res, 'constructive_device_token')).toMatch(/^constructive_device_token=; Max-Age=0;/);
  });

  it('clears the session cookie on a signOut that fails', async () => {
    const res = await post('mutation SignOut { signOut(input: {}) { result missingField } }', {
      Authorization: 'Bearer session-token'
    });

    expect(res.body.errors).toBeDefined();
    expect(cookieNamed(res, 'constructive_session')).toMatch(/^constructive_session=; Max-Age=0;/);
  });

  it('ignores a signOut operation in the document that does not run', async () => {
    const res = await post(`${SIGN_IN}\n${SIGN_OUT}`, {}, 'SignIn');

    expect(res.status).toBe(200);
    expect(res.body.data.signIn.result.accessToken).toBe('session-token');
    expect(cookieNamed(res, 'constructive_session')).toMatch(/^constructive_session=session-token;/);
  });

  it('lets a native client sign in again after signing out', async () => {
    // A client that signed in before opting out holds the session cookie.
    const first = await post(SIGN_IN);
    const sessionCookie = cookieNamed(first, 'constructive_session')!.split(';')[0];
    const { accessToken } = first.body.data.signIn.result;

    // signOut with its Bearer token tells its cookie store to drop the cookie.
    const signOut = await post(SIGN_OUT, {
      Authorization: `Bearer ${accessToken}`,
      Cookie: sessionCookie
    });
    expect(cookieNamed(signOut, 'constructive_session')).toMatch(/Max-Age=0/);

    // The next signIn carries no cookie and opts out, so it neither trips CSRF
    // nor leaves a cookie behind for the one after it.
    const again = await post(SIGN_IN, { [OPT_OUT_HEADER]: 'omit' });
    expect(again.status).toBe(200);
    expect(again.body.data.signIn.result.accessToken).toBe('session-token');
    expect(cookieNamed(again, 'constructive_session')).toBeUndefined();
  });
});
