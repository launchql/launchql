import {
  classifyBackendErrors,
  type GraphQLError,
  postGraphQL,
  statusAdapter,
} from '../src/graphql-http';

const ENDPOINT = 'http://api-myapp.example.test/graphql';

const respond = (status: number, body?: unknown, statusText = '') =>
  jest.fn(async () =>
    body === undefined
      ? new Response('', { status, statusText })
      : new Response(JSON.stringify(body), { status, statusText, headers: { 'Content-Type': 'application/json' } }),
  ) as unknown as typeof fetch;

const SUSPENDED_BODY = {
  errors: [{ message: 'Access to this database is suspended.', extensions: { code: 'ACCESS_SUSPENDED' } }],
};

describe('postGraphQL', () => {
  it('keeps the code of a 403 body and adds the status', async () => {
    const result = await postGraphQL({ endpoint: ENDPOINT, query: '{ __typename }', fetchFn: respond(403, SUSPENDED_BODY, 'Forbidden') });

    expect(result.httpStatus).toBe(403);
    expect(result.errors).toEqual([
      {
        message: 'Access to this database is suspended.',
        extensions: { code: 'ACCESS_SUSPENDED', httpStatus: 403 },
      },
    ]);
    expect(classifyBackendErrors(result.errors)).toBe('suspended');
  });

  it('turns a 403 without a body into an HTTP_ERROR that still reads as a refusal', async () => {
    const result = await postGraphQL({ endpoint: ENDPOINT, query: '{ __typename }', fetchFn: respond(403, undefined, 'Forbidden') });

    expect(result).toEqual({
      httpStatus: 403,
      data: null,
      errors: [{ message: 'HTTP 403: Forbidden', extensions: { code: 'HTTP_ERROR', httpStatus: 403 } }],
    });
    expect(classifyBackendErrors(result.errors)).toBe('forbidden');
  });

  it('reports a fetch that threw as NETWORK, with no status', async () => {
    const fetchFn = jest.fn(async () => {
      throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } });
    }) as unknown as typeof fetch;

    const result = await postGraphQL({ endpoint: ENDPOINT, query: '{ __typename }', fetchFn });

    expect(result.httpStatus).toBeNull();
    expect(result.errors).toEqual([{ message: 'fetch failed (ECONNREFUSED)', extensions: { code: 'NETWORK' } }]);
    expect(classifyBackendErrors(result.errors)).toBe('network');
  });

  it('gives the SDK clients the same errors through statusAdapter', async () => {
    const adapter = statusAdapter(ENDPOINT, { Authorization: 'Bearer t' }, respond(403, SUSPENDED_BODY));

    const failed = await adapter.execute('{ __typename }');
    const ok = await statusAdapter(ENDPOINT, {}, respond(200, { data: { __typename: 'Query' } })).execute(
      '{ __typename }',
    );

    expect(failed).toMatchObject({ ok: false, data: null, errors: [{ extensions: { code: 'ACCESS_SUSPENDED' } }] });
    expect(ok).toEqual({ ok: true, data: { __typename: 'Query' }, errors: undefined });
  });
});

describe('classifyBackendErrors', () => {
  const error = (message: string, extensions?: Record<string, unknown>): GraphQLError => ({ message, extensions });

  it.each<[string, GraphQLError[], ReturnType<typeof classifyBackendErrors>]>([
    ['ACCESS_SUSPENDED beats the 403 it came with', [error('x', { code: 'ACCESS_SUSPENDED', httpStatus: 403 })], 'suspended'],
    ['no response', [error('fetch failed', { code: 'NETWORK' })], 'network'],
    ['a 5xx', [error('Bad Gateway', { httpStatus: 502 })], 'server'],
    ['a 429', [error('Too Many Requests', { httpStatus: 429 })], 'server'],
    ["the SDK adapter's HTTP 503 text", [error('HTTP 503: Service Unavailable')], 'server'],
    ['a 401', [error('Unauthorized', { httpStatus: 401 })], 'auth'],
    ['UNAUTHENTICATED', [error('x', { code: 'UNAUTHENTICATED' })], 'auth'],
    ['an expired jwt', [error('jwt expired')], 'auth'],
    ['FORBIDDEN', [error('x', { code: 'FORBIDDEN' })], 'forbidden'],
    ['permission denied', [error('permission denied for table database')], 'forbidden'],
    ['anything else', [error('Cannot query field "hash" on type "Database".')], 'graphql'],
  ])('%s', (_case, errors, kind) => {
    expect(classifyBackendErrors(errors)).toBe(kind);
  });
});
