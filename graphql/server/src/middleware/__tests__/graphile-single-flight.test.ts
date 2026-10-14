const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCreateGraphileInstance = jest.fn();
const mockGetPgPool = jest.fn();
const mockMakeIntrospectionWiring = jest.fn();
const mockCreateGrafastCacheLimitsPreset = jest.fn();

jest.mock('graphile-cache', () => ({
  createGraphileInstance: mockCreateGraphileInstance,
  graphileCache: {
    get: mockCacheGet,
    set: mockCacheSet
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
    mockCacheSet.mockReset();
    mockGetPgPool.mockReset().mockReturnValue({});
    mockCreateGraphileInstance.mockReset().mockResolvedValue({
      handler: jest.fn()
    });
    mockMakeIntrospectionWiring.mockReset();
    mockCreateGrafastCacheLimitsPreset.mockReset().mockReturnValue({
      plugins: [{ name: 'GrafastCacheLimitsPlugin', version: '1.0.0' }]
    });
  });

  it('coalesces requests while asynchronous preset wiring is pending', async () => {
    let releaseWiring!: () => void;
    const wiringReady = new Promise<void>((resolve) => {
      releaseWiring = resolve;
    });
    mockMakeIntrospectionWiring.mockImplementation(async () => {
      await wiringReady;
      return { presets: [], pgService: {} };
    });

    const middleware = graphile({
      graphile: {
        grafastCache: { queryCacheMaxLength: 16 },
        extends: [
          {
            gather: {
              pgScopedIntrospection: { main: true }
            }
          }
        ],
        preset: {
          gather: {
            pgScopedIntrospection: { main: false }
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
    expect(mockMakeIntrospectionWiring).toHaveBeenCalledTimes(1);

    releaseWiring();
    await Promise.all([first, second]);

    expect(mockCreateGraphileInstance).toHaveBeenCalledTimes(1);
    expect(mockCreateGrafastCacheLimitsPreset).toHaveBeenCalledWith({
      queryCacheMaxLength: 16
    });
    expect(mockCreateGraphileInstance.mock.calls[0][0].preset.extends).toContainEqual({
      plugins: [{ name: 'GrafastCacheLimitsPlugin', version: '1.0.0' }]
    });
    expect(mockCacheSet).toHaveBeenCalledTimes(1);
    expect(getInFlightCount()).toBe(0);
    expect(mockCreateGraphileInstance.mock.calls[0][0].preset.gather).toEqual({
      pgScopedIntrospection: { main: false }
    });
  });
});
