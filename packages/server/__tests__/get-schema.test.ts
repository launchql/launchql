import { join } from 'path';
import express from 'express';
import http from 'http';
import { seed } from 'pgsql-test';
import type { GetConnectionResult } from 'pgsql-test';
import { getConnections as getPgConnections } from 'pgsql-test';
import { middleware as parseDomains } from '@launchql/url-domains';

import { createApiMiddleware } from '../src/middleware/api';
import { graphile } from '../src/middleware/graphile';
import type { LaunchQLOptions } from '@launchql/types';

// Helper to perform a GET request against a started server and return text
const httpGetText = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      if (!res) return reject(new Error('No response'));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
};

// Seed SQL files for a minimal schema
const sql = (f: string) => join(__dirname, '../../graphile-test/sql', f);

let teardownDb: () => Promise<void>;
let server: http.Server;
let conn: GetConnectionResult;

beforeAll(async () => {
  // Create a temporary test database and seed it with our schema
  conn = await getPgConnections(
    {},
    [
      seed.sqlfile([
        // Roles and permissions
        sql('roles.sql'),
        // Core test table
        sql('test.sql'),
        // Grants to allow introspection/use under authenticated role
        sql('grants.sql')
      ])
    ]
  );

  const app = express();

  // Minimal LaunchQL options pointing to the freshly created database
  const opts: LaunchQLOptions = {
    pg: {
      host: conn.pg.config.host,
      port: conn.pg.config.port,
      user: conn.pg.config.user,
      password: conn.pg.config.password,
      database: conn.pg.config.database
    } as any,
    graphile: {
      schema: ['app_public'],
      appendPlugins: [],
      overrideSettings: {},
      graphileBuildOptions: {}
    } as any,
    api: {
      enableMetaApi: false,
      exposedSchemas: ['app_public'],
      anonRole: 'anonymous',
      roleName: 'administrator',
      defaultDatabaseId: conn.pg.config.database,
      isPublic: false
    } as any,
    server: {
      host: '127.0.0.1',
      port: 0,
      trustProxy: false,
      origin: '*'
    } as any
  };

  // Match the real server middleware order for domain parsing and API setup
  app.use(parseDomains() as any);
  app.use(createApiMiddleware(opts));
  app.use(graphile(opts));

  // Start listening on an ephemeral port
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });

  teardownDb = conn.teardown;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  if (teardownDb) {
    await teardownDb();
  }
});

it('GET /get-schema returns SDL including type definitions', async () => {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Server not listening');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const sdl = await httpGetText(`${baseUrl}/get-schema`);
  expect(typeof sdl).toBe('string');
  expect(sdl.length).toBeGreaterThan(100);

  // Basic sanity checks for SDL content
  expect(sdl).toMatch(/type Query/);
  expect(sdl).toMatch(/type User/);
});