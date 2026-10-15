import type {
  GraphileOptions,
  PgScopedIntrospectionConfig
} from '@constructive-io/graphql-types';
import { type GraphileConfig, resolvePreset } from 'graphile-config';
import { ScopedIntrospectionPreset } from 'graphile-scoped-introspection';
import { makePgService } from 'graphile-settings';
import type { Pool } from 'pg';

export interface IntrospectionWiring {
  presets: GraphileConfig.Preset[];
  pgService: GraphileConfig.PgServiceConfiguration;
  pgScopedIntrospection: PgScopedIntrospectionConfig;
}

const SERVICE_NAME = 'main';

type ResolvedCallerPreset = GraphileConfig.ResolvedPreset | undefined;

/**
 * Resolve caller-provided Graphile configuration with the same `extends`
 * precedence used by the eventual schema build.
 */
export const resolveCallerPreset = (
  graphileOptions: GraphileOptions | undefined
): ResolvedCallerPreset => {
  const preset = graphileOptions?.preset;
  const presets: GraphileConfig.Preset[] = [
    ...(graphileOptions?.extends ?? []),
    ...(preset ? [preset as GraphileConfig.Preset] : [])
  ];
  return presets.length > 0 ? resolvePreset({ extends: presets }) : undefined;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Every server handler introspects only its API's schemas and their dependency
 * closure. Stock introspection reads the whole database into each cached
 * handler, so it is not an option here: `main: false` is rejected. Caller
 * options for `main` (catalog policy, capability extensions) are kept.
 */
export const makeIntrospectionWiring = (
  pool: Pool,
  schemas: string[],
  graphileOptions: GraphileOptions | undefined,
  introspectionRole?: string
): IntrospectionWiring => {
  const pgSettingsForIntrospection = introspectionRole ? { role: introspectionRole } : undefined;
  const pgService = makePgService({ pool, schemas, pgSettingsForIntrospection });
  const configured = resolveCallerPreset(graphileOptions)?.gather?.pgScopedIntrospection;

  if (configured !== undefined && !isPlainObject(configured)) {
    throw new Error(
      'pgScopedIntrospection must be an object keyed by PostgreSQL service name'
    );
  }
  if (configured?.[SERVICE_NAME] === false) {
    throw new Error(
      `Schema-scoped introspection cannot be disabled for the server's '${SERVICE_NAME}' service: stock introspection retains the whole database in every cached handler`
    );
  }

  return {
    presets: [ScopedIntrospectionPreset],
    pgService,
    pgScopedIntrospection: {
      ...configured,
      [SERVICE_NAME]: configured?.[SERVICE_NAME] ?? true
    }
  };
};
