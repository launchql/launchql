// The network boundary is postGraphQL; classification stays real.
jest.mock('../src/graphql-http', () => ({
  ...jest.requireActual('../src/graphql-http'),
  postGraphQL: jest.fn(),
}));

import { probeBoundDatabase, probeDatabase } from '../src/db-probe';
import { type HttpGraphQLResponse, postGraphQL } from '../src/graphql-http';
import { configureHost } from '../src/host';

const mockPost = postGraphQL as jest.MockedFunction<typeof postGraphQL>;

const answer = (nodes: Record<string, unknown>[]): HttpGraphQLResponse<unknown> => ({
  httpStatus: 200,
  data: { databases: { nodes } },
  errors: [],
});
const failed = (
  message: string,
  extensions: Record<string, unknown> = {},
  httpStatus: number | null = 200,
): HttpGraphQLResponse<unknown> => ({ httpStatus, data: null, errors: [{ message, extensions }] });

const probe = () =>
  probeDatabase({
    endpoint: 'http://api.localhost:3000/graphql',
    bearer: 'account-token',
    databaseId: 'db-1',
    signInHint: 'Sign in from Settings.',
  });

beforeEach(() => {
  mockPost.mockReset();
});

describe('probeDatabase', () => {
  it('finds a live database with its hash', async () => {
    mockPost.mockResolvedValue(answer([{ id: 'db-1', name: 'myapp', ownerId: 'u1', hash: 'h1', suspendedAt: null }]));

    await expect(probe()).resolves.toEqual({
      status: 'found',
      databaseId: 'db-1',
      name: 'myapp',
      ownerId: 'u1',
      hash: 'h1',
    });
  });

  it('tells a suspended database apart from a live one', async () => {
    mockPost.mockResolvedValue(
      answer([
        { id: 'db-1', name: 'myapp', ownerId: 'u1', hash: 'h1', suspendedAt: '2026-10-01T00:00:00Z', suspendedReason: 'billing' },
      ]),
    );

    await expect(probe()).resolves.toMatchObject({
      status: 'suspended',
      suspendedAt: '2026-10-01T00:00:00Z',
      suspendedReason: 'billing',
    });
  });

  it('reports missing only when the backend answers with no such database', async () => {
    mockPost.mockResolvedValue(answer([]));

    await expect(probe()).resolves.toEqual({ status: 'missing', databaseId: 'db-1' });
  });

  it('never reads an unknown GraphQL error as missing', async () => {
    mockPost.mockResolvedValue(failed('relation "metaschema_public.database" does not exist'));

    await expect(probe()).resolves.toMatchObject({ status: 'unreachable', cause: 'error' });
  });

  it.each([
    ['a 403 FORBIDDEN', failed('Forbidden', { code: 'FORBIDDEN', httpStatus: 403 }, 403)],
    ['a 401', failed('HTTP 401: Unauthorized', { code: 'HTTP_ERROR', httpStatus: 401 }, 401)],
  ])('reads %s as a rejected account credential, with the sign-in hint', async (_case, response) => {
    mockPost.mockResolvedValue(response);

    const result = await probe();

    expect(result).toMatchObject({ status: 'unreachable', cause: 'auth' });
    expect(result.status === 'unreachable' && result.detail).toMatch(/Sign in from Settings\./);
  });

  it.each([
    ['a 5xx', failed('HTTP 502: Bad Gateway', { code: 'HTTP_ERROR', httpStatus: 502 }, 502), 'server'],
    ['a thrown fetch', failed('fetch failed', { code: 'NETWORK' }, null), 'network'],
  ])('reads %s as unreachable', async (_case, response, cause) => {
    mockPost.mockResolvedValue(response);

    await expect(probe()).resolves.toMatchObject({ status: 'unreachable', cause });
  });

  it('falls back to the older fields on a backend without hash, once', async () => {
    mockPost
      .mockResolvedValueOnce(failed('Cannot query field "hash" on type "Database".'))
      .mockResolvedValueOnce(answer([{ id: 'db-1', name: 'myapp', ownerId: 'u1' }]));

    const result = await probe();

    expect(result).toEqual({ status: 'found', databaseId: 'db-1', name: 'myapp', ownerId: 'u1', hash: undefined });
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[1][0].query).not.toMatch(/hash|suspended/);
  });
});

describe('probeBoundDatabase', () => {
  it("sends the account bearer only to the host's control endpoint", async () => {
    configureHost({
      account: () => ({ userId: 'u1', accessToken: 'account-token' }),
      backendConfig: () => ({ apiEndpoint: 'http://api.host.test/graphql' }),
    });
    mockPost.mockResolvedValue(answer([{ id: 'db-1', ownerId: 'u1' }]));

    await expect(probeBoundDatabase('db-1')).resolves.toMatchObject({ status: 'found' });
    expect(mockPost).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'http://api.host.test/graphql',
        headers: { Authorization: 'Bearer account-token' },
      }),
    );
  });

  it('is unreachable with cause auth when signed out, without asking the backend', async () => {
    configureHost({ account: () => null, backendConfig: () => null, signInHint: 'Sign in from Settings.' });

    await expect(probeBoundDatabase('db-1')).resolves.toMatchObject({
      status: 'unreachable',
      cause: 'auth',
      detail: expect.stringMatching(/Sign in from Settings\./),
    });
    expect(mockPost).not.toHaveBeenCalled();
  });
});
