import 'graphile-build';
import 'graphile-build-pg';

import type { PgCodec } from '@dataplan/pg';
import type { GraphileConfig } from 'graphile-config';

import type { PostgisExtensionInfo } from '../types';

export type { PostgisExtensionInfo } from '../types';

function codecIdentity(codec: any, typeName: string): {
  serviceName: string;
  schemaName: string;
} {
  const pg = codec?.extensions?.pg;
  if (!pg?.serviceName || !pg?.schemaName) {
    throw new Error(
      `[graphile-postgis] ${typeName} codec is missing exact service/schema metadata`
    );
  }
  return { serviceName: pg.serviceName, schemaName: pg.schemaName };
}

/** Resolve one unambiguous PostGIS installation identity for this build. */
export function resolvePostgisExtensionInfo(build: any): PostgisExtensionInfo | undefined {
  const pgRegistry = build.input?.pgRegistry;
  if (!pgRegistry) return undefined;

  const geometryCodecs: PgCodec[] = [];
  const geographyCodecs: PgCodec[] = [];
  for (const codec of Object.values(pgRegistry.pgCodecs) as PgCodec[]) {
    const name = codec?.extensions?.pg?.name;
    if (name === 'geometry') geometryCodecs.push(codec);
    if (name === 'geography') geographyCodecs.push(codec);
  }
  if (geometryCodecs.length === 0 && geographyCodecs.length === 0) return undefined;
  if (geometryCodecs.length > 1 || geographyCodecs.length > 1) {
    throw new Error(
      `[graphile-postgis] Ambiguous codecs in one build ` +
      `(geometry=${geometryCodecs.length}, geography=${geographyCodecs.length})`
    );
  }

  const geometryCodec = geometryCodecs[0] ?? null;
  const geographyCodec = geographyCodecs[0] ?? null;
  const primary = geometryCodec ?? geographyCodec!;
  const identity = codecIdentity(primary, geometryCodec ? 'geometry' : 'geography');
  if (geometryCodec && geographyCodec) {
    const geographyIdentity = codecIdentity(geographyCodec, 'geography');
    if (
      geographyIdentity.serviceName !== identity.serviceName ||
      geographyIdentity.schemaName !== identity.schemaName
    ) {
      throw new Error(
        '[graphile-postgis] geometry/geography codecs resolve to different service/schema identities'
      );
    }
  }

  return {
    ...identity,
    geometryCodec,
    geographyCodec,
  };
}

/**
 * PostgisExtensionDetectionPlugin
 *
 * Detects PostGIS presence in the database by searching for geometry/geography
 * codecs in the pgRegistry. Stores detected info on the build object for
 * downstream plugins.
 *
 * Gracefully degrades if PostGIS is not installed.
 */
export const PostgisExtensionDetectionPlugin: GraphileConfig.Plugin = {
  name: 'PostgisExtensionDetectionPlugin',
  version: '2.0.0',
  description: 'Detects PostGIS extension in the database',

  schema: {
    hooks: {
      build(build) {
        const postgisInfo = resolvePostgisExtensionInfo(build);
        if (!postgisInfo) return build;

        return build.extend(build, {
          pgGISExtensionInfo: postgisInfo,
          pgGISGraphQLTypesByCodecAndSubtype: {} as Record<string, Record<string | number, string>>
        }, 'PostgisExtensionDetectionPlugin adding PostGIS build state');
      }
    }
  }
};
