const mockCacheGet = jest.fn();
const mockCacheGraphileInstance = jest.fn();
const mockCreateGraphileInstance = jest.fn();
const mockGetPgPool = jest.fn();
const mockMakeIntrospectionWiring = jest.fn();
const mockCreateGrafastCacheLimitsPreset = jest.fn();

jest.mock('graphile-cache', () => ({
  cacheGraphileInstance: mockCacheGraphileInstance,
  createGraphileInstance: mockCreateGraphileInstance,
  graphileCache: {
    get: mockCacheGet
  }
}));

jest.mock('graphile-settings', () => ({
  createConstructivePreset: jest.fn(() => ({})),
  createGrafastCacheLimitsPreset: mockCreateGrafastCacheLimitsPreset
}));

jest.mock('pg-cache', () => ({
  getPgPool: mockGetPgPool
}));

jest.mock('../graphile-introspection', () => ({
  makeIntrospectionWiring: mockMakeIntrospectionWiring
}));

import type { Request, Response } from 'express';

import {
  clearInFlightMap,
  getInFlightCount,
  graphile
} from '../graphile';

const makeRequest = (): Request =>
  ({
    requestId: 'request-id',
    svc_key: 'service-key',
    api: {
      dbname: 'database',
      anonRole: 'anonymous',
      roleName: 'authenticated',
      schema: ['app_public'],
      databaseId: 'database-id'
    },
    get: jest.fn((): undefined => undefined)
  }) as unknown as Request;

describe('graphile single-flight handler creation', () => {
  beforeEach(() => {
    clearInFlightMap();
    mockCacheGet.mockReset().mockReturnValue(undefined);
    mockCacheGraphileInstance.mockReset().mockResolvedValue(undefined);
    mockGetPgPool.mockReset().mockReturnValue({});
    mockCreateGraphileInstance.mockReset().mockResolvedValue({
      handler: jest.fn()
    });
    mockMakeIntrospectionWiring.mockReset();
    mockCreateGrafastCacheLimitsPreset.mockReset().mockReturnValue({
      plugins: [{ name: 'GrafastCacheLimitsPlugin', version: '1.0.0' }]
    });
  });

  it('coalesces requests while the handler build is pending', async () => {
    let releaseBuild!: () => void;
    const buildReady = new Promise<void>((resolve) => {
      releaseBuild = resolve;
    });
    mockCreateGraphileInstance.mockImplementation(async () => {
      await buildReady;
      return { handler: jest.fn() };
    });
    const pgScopedIntrospection = {
      main: { catalogTypes: 'dependency-closure' }
    };
    mockMakeIntrospectionWiring.mockReturnValue({
      presets: [],
      pgService: {},
      pgScopedIntrospection
    });

    const middleware = graphile({
      graphile: {
        grafastCache: { queryCacheMaxLength: 16 },
        preset: {
          gather: {
            pgIdentifiers: 'unqualified',
            pgScopedIntrospection: { main: true }
          }
        }
      }
    } as any);
    const response = { headersSent: false } as unknown as Response;
    const next = jest.fn();
    const first = middleware(makeRequest(), response, next);

    // Let the first request enter the registered creation promise before the
    // second request checks the in-flight map.
    await Promise.resolve();
    expect(getInFlightCount()).toBe(1);

    const second = middleware(makeRequest(), response, next);
    expect(getInFlightCount()).toBe(1);

    releaseBuild();
    await Promise.all([first, second]);

    expect(mockMakeIntrospectionWiring).toHaveBeenCalledTimes(1);
    expect(mockCreateGraphileInstance).toHaveBeenCalledTimes(1);
    expect(mockCreateGrafastCacheLimitsPreset).toHaveBeenCalledWith({
      queryCacheMaxLength: 16
    });
    expect(mockCreateGraphileInstance.mock.calls[0][0].preset.extends).toContainEqual({
      plugins: [{ name: 'GrafastCacheLimitsPlugin', version: '1.0.0' }]
    });
    expect(mockCacheGraphileInstance).toHaveBeenCalledTimes(1);
    expect(getInFlightCount()).toBe(0);
    expect(mockCreateGraphileInstance.mock.calls[0][0].preset.gather).toEqual({
      pgIdentifiers: 'unqualified',
      pgScopedIntrospection
    });
  });

  it('never hands coalesced waiters a handler the cache rejected', async () => {
    let releaseBuild!: () => void;
    const buildReady = new Promise<void>((resolve) => {
      releaseBuild = resolve;
    });
    const handler = jest.fn();
    mockCreateGraphileInstance.mockImplementation(async () => {
      await buildReady;
      return { handler };
    });
    const budgetError = new Error('over the graphile cache budget');
    mockCacheGraphileInstance.mockRejectedValue(budgetError);
    mockMakeIntrospectionWiring.mockReturnValue({
      presets: [],
      pgService: {},
      pgScopedIntrospection: { main: true }
    });

    const middleware = graphile({ graphile: {} } as any);
    const response = { headersSent: true } as unknown as Response;
    const next = jest.fn();
    const first = middleware(makeRequest(), response, next);
    await Promise.resolve();
    const second = middleware(makeRequest(), response, next);
    expect(getInFlightCount()).toBe(1);

    releaseBuild();
    await Promise.all([first, second]);

    expect(handler).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
    for (const [error] of next.mock.calls) {
      expect(error.message).toContain(budgetError.message);
    }
    expect(getInFlightCount()).toBe(0);
  });
});
