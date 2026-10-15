import type { ConstructiveOptions, PgScopedIntrospectionServiceConfig } from '@constructive-io/graphql-types';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { getGraphQLEnvVars } from '../src/env';
import { getEnvOptions } from '../src/merge';

const catalogName = 'GRAPHILE_SCOPED_INTROSPECTION_CATALOG_TYPES';
const extensionsName = 'GRAPHILE_SCOPED_INTROSPECTION_CAPABILITY_EXTENSIONS';
const scoped = (options: Partial<ConstructiveOptions>) =>
  options.graphile?.preset?.gather?.pgScopedIntrospection;
const optionsFor = (main: PgScopedIntrospectionServiceConfig): Partial<ConstructiveOptions> => ({
  graphile: { preset: { gather: { pgScopedIntrospection: { main } } } }
});

describe('scoped introspection environment variables', () => {
  it('leaves the options absent when no variable is set', () => {
    expect(scoped(getGraphQLEnvVars({}))).toBeUndefined();
  });

  it('has no switch for stock introspection', () => {
    expect(scoped(getGraphQLEnvVars({ GRAPHILE_SCOPED_INTROSPECTION: 'false' }))).toBeUndefined();
  });

  it.each([
    [{ [catalogName]: 'all' }, { catalogTypes: 'all' }],
    [{ [catalogName]: 'dependency-closure' }, { catalogTypes: 'dependency-closure' }],
    [{ [extensionsName]: ' pg_trgm, vector,pg_trgm ' }, { capabilityExtensions: ['pg_trgm', 'vector'] }],
    [{ [extensionsName]: '' }, { capabilityExtensions: [] }],
    [{ [extensionsName]: '  ' }, { capabilityExtensions: [] }]
  ])('maps %j to main only', (environment, expected) => {
    expect(scoped(getGraphQLEnvVars(environment as NodeJS.ProcessEnv))).toEqual({ main: expected });
  });

  it.each([
    [catalogName, 'invalid'], [catalogName, ''], [catalogName, ' all '],
    [extensionsName, 'pg_trgm,,vector'], [extensionsName, ',vector'],
    [extensionsName, 'pg_trgm,'], [extensionsName, 'pg_trgm, ,vector']
  ])('rejects malformed %s=%s with its variable name', (name, value) => {
    expect(() => getGraphQLEnvVars({ [name]: value })).toThrow(name);
  });

  it('uses injected environment values without reading the process environment', () => {
    const previous = process.env[catalogName];
    process.env[catalogName] = 'invalid';
    try {
      expect(scoped(getGraphQLEnvVars({}))).toBeUndefined();
    } finally {
      if (previous === undefined) delete process.env[catalogName];
      else process.env[catalogName] = previous;
    }
  });
});

describe('scoped introspection configuration precedence', () => {
  let directory: string;
  const configured = {
    catalogTypes: 'dependency-closure' as const,
    capabilityExtensions: ['pg_trgm', 'vector']
  };

  const configure = (main: PgScopedIntrospectionServiceConfig) => {
    fs.writeFileSync(path.join(directory, 'pgpm.json'), JSON.stringify({
      graphile: {
        schema: ['app'],
        preset: { gather: { pgScopedIntrospection: { main, secondary: false } } }
      }
    }));
  };

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'graphql-env-scoped-'));
    configure(configured);
  });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

  it('preserves configured options without environment overrides', () => {
    const result = getEnvOptions({}, directory, {});
    expect(scoped(result)).toEqual({ main: configured, secondary: false });
    expect(result.graphile?.schema).toEqual(['app']);
  });

  it('overrides only the supplied field', () => {
    expect(scoped(getEnvOptions({}, directory, { [catalogName]: 'all' }))).toEqual({
      main: { ...configured, catalogTypes: 'all' }, secondary: false
    });
  });

  it.each([
    ['hstore,hstore', ['hstore']], ['', []]
  ])('replaces the entire extension list with %j', (value, expected) => {
    expect(scoped(getEnvOptions({}, directory, { [extensionsName]: value as string }))?.main).toEqual({
      ...configured, capabilityExtensions: expected
    });
  });

  it('replaces a configured main=true with the environment options', () => {
    configure(true);
    expect(scoped(getEnvOptions({}, directory, { [catalogName]: 'all' }))?.main).toEqual({ catalogTypes: 'all' });
  });

  it('gives runtime main=true priority over environment options', () => {
    expect(scoped(getEnvOptions(optionsFor(true), directory, {
      [catalogName]: 'all', [extensionsName]: 'vector'
    }))?.main).toBe(true);
  });

  it('merges runtime option fields last and replaces their arrays', () => {
    expect(scoped(getEnvOptions(optionsFor({ capabilityExtensions: ['hstore'] }), directory, {
      [catalogName]: 'all', [extensionsName]: 'vector'
    }))?.main).toEqual({ catalogTypes: 'all', capabilityExtensions: ['hstore'] });
  });

  it('adds no options when neither file nor environment configures them', () => {
    fs.writeFileSync(path.join(directory, 'pgpm.json'), '{}');
    expect(getEnvOptions({}, directory, {}).graphile).toEqual({ schema: [], extends: [], preset: {} });
  });
});
