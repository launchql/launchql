import type { GraphileConfig } from 'graphile-config';
import { ScopedIntrospectionPreset } from 'graphile-scoped-introspection';
import type { Pool } from 'pg';

jest.mock('graphile-settings', () => {
  const { makePgService } = jest.requireActual('postgraphile/adaptors/pg');
  return { makePgService };
});

import { makeIntrospectionWiring } from '../graphile-introspection';

const pool = {} as Pool;

describe('Graphile introspection wiring', () => {
  it('scopes introspection to the API schemas by default', () => {
    const wiring = makeIntrospectionWiring(pool, ['tenant_a'], undefined);

    expect(wiring.presets).toEqual([ScopedIntrospectionPreset]);
    expect(wiring.pgScopedIntrospection).toEqual({ main: true });
    expect(wiring.pgService).toMatchObject({
      name: 'main',
      schemas: ['tenant_a']
    });
    expect(wiring.pgService.pgSettingsForIntrospection).toBeUndefined();
  });

  it('keeps configured scoped options for main and other services', () => {
    const main = {
      catalogTypes: 'dependency-closure' as const,
      capabilityExtensions: ['pg_trgm']
    };
    const wiring = makeIntrospectionWiring(pool, ['tenant_a'], {
      preset: {
        gather: {
          pgScopedIntrospection: { main, secondary: false }
        }
      }
    });

    expect(wiring.presets).toEqual([ScopedIntrospectionPreset]);
    expect(wiring.pgScopedIntrospection).toEqual({ main, secondary: false });
  });

  it('uses nested preset precedence for the configured options', () => {
    const nestedPreset: GraphileConfig.Preset = {
      extends: [
        {
          gather: {
            pgScopedIntrospection: { main: { catalogTypes: 'all' } }
          }
        }
      ],
      gather: {
        pgScopedIntrospection: { main: { catalogTypes: 'dependency-closure' } }
      }
    };

    const wiring = makeIntrospectionWiring(pool, ['tenant_a'], {
      extends: [nestedPreset]
    });

    expect(wiring.pgScopedIntrospection).toEqual({
      main: { catalogTypes: 'dependency-closure' }
    });
  });

  it('rejects disabling scoped introspection for main', () => {
    expect(() =>
      makeIntrospectionWiring(pool, ['tenant_a'], {
        preset: {
          gather: {
            pgScopedIntrospection: { main: false }
          }
        }
      })
    ).toThrow("Schema-scoped introspection cannot be disabled for the server's 'main' service");
  });

  it.each([[[]], [null]])('rejects a malformed gather map %p', (value: unknown) => {
    expect(() =>
      makeIntrospectionWiring(pool, ['tenant_a'], {
        preset: {
          gather: {
            pgScopedIntrospection: value as never
          }
        }
      })
    ).toThrow('pgScopedIntrospection must be an object keyed by PostgreSQL service name');
  });

  it('preserves the configured introspection role', () => {
    const wiring = makeIntrospectionWiring(
      pool,
      ['tenant_a'],
      undefined,
      'tenant_introspector'
    );
    expect(wiring.pgService.pgSettingsForIntrospection).toEqual({
      role: 'tenant_introspector'
    });
  });
});
