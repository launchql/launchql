process.env.LOG_SCOPE = 'introspectron';

import { join } from 'path';
import { getConnections, seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { introspect } from '../src';
import type { PgIntrospectionResultByKind } from '../src/pg-types';

const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let pg: PgTestClient;
let result: PgIntrospectionResultByKind;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections({}, [seed.sqlfile([sql('test.sql')])]));
  result = await introspect(pg.client, {
    schemas: ['introspectron'],
    includeExtensions: false,
    pgEnableTags: true,
    pgThrowOnMissingSchema: true
  });
});

afterAll(() => teardown());

describe('introspect() SQL-based introspection', () => {
  it('returns a valid PostgreSQL version number', () => {
    expect(typeof result.__pgVersion).toBe('number');
    expect(result.__pgVersion).toBeGreaterThan(90000);
  });

  it('contains expected core kinds', () => {
    expect(Array.isArray(result.namespace)).toBe(true);
    expect(Array.isArray(result.class)).toBe(true);
    expect(Array.isArray(result.attribute)).toBe(true);
    expect(Array.isArray(result.type)).toBe(true);
    expect(Array.isArray(result.constraint)).toBe(true);
    expect(Array.isArray(result.procedure)).toBe(true);
    expect(Array.isArray(result.index)).toBe(true);
  });

  it('includes the introspectron schema', () => {
    const schemaNames = result.namespace.map((n) => n.name);
    expect(schemaNames).toContain('introspectron');
  });

  it('freezes all introspected objects', () => {
    const anyClass = result.class[0];
    expect(Object.isFrozen(anyClass)).toBe(true);
  });

  it('detects primary key constraints', () => {
    const primaryKeys = result.constraint.filter((c) => c.type === 'p');
    expect(primaryKeys.length).toBeGreaterThan(0);
    expect(primaryKeys[0]?.keyAttributeNums.length).toBeGreaterThan(0);
  });

  it('links extension configuration tables (if any)', () => {
    for (const klass of result.class) {
      if (klass.isExtensionConfigurationTable !== undefined) {
        expect(typeof klass.isExtensionConfigurationTable).toBe('boolean');
      }
    }
  });

  it('throws when schema is missing (if enabled)', async () => {
    await expect(
      introspect(pg.client, {
        schemas: ['nonexistent_schema'],
        pgThrowOnMissingSchema: true
      })
    ).rejects.toThrow(/couldn't find some of those/);
  });

  it('warns but does not throw if `pgThrowOnMissingSchema` is false', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await introspect(pg.client, {
      schemas: ['nonexistent_schema'],
      pgThrowOnMissingSchema: false
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
