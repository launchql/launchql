import { ConstructiveOptions } from '@constructive-io/graphql-types';
import { svcCache } from '@pgpmjs/server-utils';
import { EventEmitter } from 'events';
import { NextFunction, Request, Response } from 'express';
import { graphileCache } from 'graphile-cache';
import {
  clearStorageModuleCache,
  loadAllStorageModules,
  resolveStorageConfigFromCodec,
} from 'graphile-presigned-url-plugin';
import type { PoolClient } from 'pg';

import { Server } from '../../server';
import { createFlushMiddleware } from '../flush';

const mockRoutingQuery = jest.fn();
jest.mock('pg-cache', () => ({
  ...jest.requireActual('pg-cache'),
  getPgPool: () => ({ query: mockRoutingQuery }),
}));

const TOKEN = 'flush-secret-token';
const DATABASE_ID = '00000000-0000-0000-0000-000000000001';

const makeReq = (url: string, authorization?: string): Request => {
  const req: any = {
    url,
    svc_key: 'tenant.example.com',
    databaseId: DATABASE_ID,
    get: (name: string) =>
      name.toLowerCase() === 'authorization' ? authorization : undefined,
  };
  return req as Request;
};

const makeRes = (): Response & { statusCode?: number; body?: string } => {
  const res: any = {
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    send(body: string) {
      res.body = body;
      return res;
    },
  };
  return res;
};

const opts = (flushToken?: string): ConstructiveOptions =>
  ({ api: { ...(flushToken && { flushToken }) } }) as ConstructiveOptions;

describe('createFlushMiddleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    graphileCache.set('tenant.example.com', { cached: true } as any);
    svcCache.set('tenant.example.com', { cached: true } as any);
    next = jest.fn();
    clearStorageModuleCache();
    mockRoutingQuery.mockReset();
    mockRoutingQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    graphileCache.delete('tenant.example.com');
    svcCache.delete('tenant.example.com');
    clearStorageModuleCache();
  });

  it('passes non-flush requests through', async () => {
    const res = makeRes();
    await createFlushMiddleware(opts(TOKEN))(makeReq('/graphql'), res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeUndefined();
  });

  it('flushes the caches for a request carrying the token', async () => {
    const res = makeRes();
    await createFlushMiddleware(opts(TOKEN))(
      makeReq('/flush', `Bearer ${TOKEN}`),
      res,
      next
    );
    expect(res.statusCode).toBe(200);
    expect(graphileCache.get('tenant.example.com')).toBeUndefined();
    expect(svcCache.get('tenant.example.com')).toBeUndefined();
  });

  it.each([
    ['no authorization header', undefined],
    ['a wrong token', 'Bearer nope'],
    ['a token of the same length', `Bearer ${'x'.repeat(TOKEN.length)}`],
    ['the token without the bearer scheme', TOKEN],
    ['a basic credential', `Basic ${TOKEN}`],
  ])('rejects a flush request with %s', async (_label, authorization) => {
    const res = makeRes();
    await createFlushMiddleware(opts(TOKEN))(
      makeReq('/flush', authorization),
      res,
      next
    );
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
    expect(graphileCache.get('tenant.example.com')).toBeDefined();
    expect(svcCache.get('tenant.example.com')).toBeDefined();
  });

  it('keeps the route closed when no token is configured', async () => {
    const res = makeRes();
    await createFlushMiddleware(opts())(
      makeReq('/flush', `Bearer ${TOKEN}`),
      res,
      next
    );
    expect(res.statusCode).toBe(404);
    expect(graphileCache.get('tenant.example.com')).toBeDefined();
    expect(svcCache.get('tenant.example.com')).toBeDefined();
  });

  it.each(['notification', 'authenticated HTTP'])(
    'refreshes warm storage discovery through the %s flush path',
    async (path) => {
      const row = (scope: string) => ({
        id: `${scope}-module`,
        scope,
        buckets_schema: 'tenant_storage',
        buckets_table: `${scope}_buckets`,
        files_schema: 'tenant_storage',
        files_table: `${scope}_files`,
      });
      let rows = [row('app')];
      const client = { query: jest.fn(async () => ({ rows })) };
      const other = { query: jest.fn(async () => ({ rows: [row('other')] })) };
      await loadAllStorageModules(client, DATABASE_ID);
      const otherModules = await loadAllStorageModules(other, 'other-database');
      rows = [...rows, row('data_room')];

      if (path === 'notification') {
        // Exercise the real listener and Server.flush without opening sockets.
        // Empty routing rows must not prevent storage discovery invalidation.
        const server = Object.create(Server.prototype) as Server;
        Object.assign(server, { opts: { api: { isPublic: true } } });
        const listener = Object.assign(new EventEmitter(), {
          query: jest.fn().mockResolvedValue({ rows: [] }),
        });
        const flush = jest.spyOn(server, 'flush');
        server.listenForChanges(
          null,
          listener as unknown as PoolClient,
          jest.fn()
        );
        expect(listener.query).toHaveBeenCalledWith('LISTEN "schema:update"');
        listener.emit('notification', {
          channel: 'schema:update',
          payload: DATABASE_ID,
        });
        expect(flush).toHaveBeenCalledWith(DATABASE_ID);
        await flush.mock.results[0].value;
        listener.removeAllListeners();
        expect(mockRoutingQuery).toHaveBeenCalledWith(expect.any(String), [
          DATABASE_ID,
        ]);
      } else {
        await createFlushMiddleware(opts(TOKEN))(
          makeReq('/flush', `Bearer ${TOKEN}`),
          makeRes(),
          next
        );
      }

      const modules = await loadAllStorageModules(client, DATABASE_ID);
      expect(
        resolveStorageConfigFromCodec(
          {
            name: 'data_room_files',
            extensions: { pg: { schemaName: 'tenant_storage' } },
          },
          modules
        )?.id
      ).toBe('data_room-module');
      expect(await loadAllStorageModules(other, 'other-database')).toBe(
        otherModules
      );
      expect(other.query).toHaveBeenCalledTimes(1);
    }
  );

  it('does not let an unauthenticated flush invalidate storage discovery', async () => {
    const client = {
      query: jest.fn(async () => ({
        rows: [
          {
            id: 'app-module',
            scope: 'app',
            buckets_schema: 'storage',
            buckets_table: 'buckets',
            files_schema: 'storage',
            files_table: 'files',
          },
        ],
      })),
    };
    const modules = await loadAllStorageModules(client, DATABASE_ID);
    await createFlushMiddleware(opts(TOKEN))(
      makeReq('/flush', 'Bearer wrong'),
      makeRes(),
      next
    );
    expect(await loadAllStorageModules(client, DATABASE_ID)).toBe(modules);
    expect(client.query).toHaveBeenCalledTimes(1);
  });
});
