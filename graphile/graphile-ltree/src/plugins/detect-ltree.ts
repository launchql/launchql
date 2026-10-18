import 'graphile-build';
import 'graphile-build-pg';

import type { PgCodec } from '@dataplan/pg';
import type { GraphileConfig } from 'graphile-config';

export interface LtreeExtensionInfo {
  serviceName: string;
  schemaName: string;
  ltreeCodec: PgCodec;
  lqueryCodec: PgCodec | null;
  /** Exact schema containing both validated helper functions, when present. */
  helperSchemaName: string | null;
}

function isLtreeCodec(codec: any): boolean {
  return (
    codec?.name === 'ltree' ||
    codec?.extensions?.pg?.name === 'ltree'
  );
}

function isLqueryCodec(codec: any): boolean {
  return (
    codec?.name === 'lquery' ||
    codec?.extensions?.pg?.name === 'lquery'
  );
}

function codecIdentity(codec: any, typeName: string): {
  serviceName: string;
  schemaName: string;
} {
  const pg = codec?.extensions?.pg;
  if (!pg?.serviceName || !pg?.schemaName) {
    throw new Error(
      `[graphile-ltree] ${typeName} codec is missing exact service/schema metadata`
    );
  }
  return { serviceName: pg.serviceName, schemaName: pg.schemaName };
}

function helperSchemaName(pgRegistry: any, serviceName: string): string | null {
  const matches: Record<'to_path' | 'to_query', any[]> = {
    to_path: [],
    to_query: [],
  };

  for (const resource of Object.values(pgRegistry.pgResources ?? {}) as any[]) {
    if (!Array.isArray(resource?.parameters)) continue;
    const pg = resource?.extensions?.pg;
    const rawFunctionName = pg?.name ?? resource?.name;
    if (rawFunctionName !== 'to_path' && rawFunctionName !== 'to_query') continue;
    const functionName: 'to_path' | 'to_query' = rawFunctionName;

    const returnMatches = functionName === 'to_path'
      ? isLtreeCodec(resource.codec)
      : isLqueryCodec(resource.codec);
    const parameter = resource.parameters[0];
    const parameterName = parameter?.codec?.extensions?.pg?.name ?? parameter?.codec?.name;
    const signatureMatches =
      returnMatches &&
      resource.parameters.length === 1 &&
      (parameterName === 'text' || parameterName === 'varchar' || parameterName === 'bpchar');
    if (!signatureMatches) continue;

    if (!pg?.serviceName || !pg?.schemaName) {
      throw new Error(
        `[graphile-ltree] ${functionName} helper is missing exact service/schema metadata`
      );
    }
    if (pg.serviceName !== serviceName) continue;
    matches[functionName].push(resource);
  }

  const pathMatches = matches.to_path;
  const queryMatches = matches.to_query;
  if (pathMatches.length === 0 && queryMatches.length === 0) return null;
  if (pathMatches.length !== 1 || queryMatches.length !== 1) {
    throw new Error(
      `[graphile-ltree] Helper functions for service '${serviceName}' are incomplete ` +
      `or ambiguous (to_path=${pathMatches.length}, to_query=${queryMatches.length})`
    );
  }

  const pathSchema = pathMatches[0].extensions.pg.schemaName;
  const querySchema = queryMatches[0].extensions.pg.schemaName;
  if (pathSchema !== querySchema) {
    throw new Error(
      `[graphile-ltree] Helper functions for service '${serviceName}' resolve to ` +
      `different schemas ('${pathSchema}', '${querySchema}')`
    );
  }
  return pathSchema;
}

/** Resolve one unambiguous ltree identity from this exact build registry. */
export function resolveLtreeExtensionInfo(build: any): LtreeExtensionInfo | undefined {
  const pgRegistry = build.input?.pgRegistry;
  if (!pgRegistry) return undefined;

  const ltreeCodecs = Object.values(pgRegistry.pgCodecs).filter(isLtreeCodec) as PgCodec[];
  const lqueryCodecs = Object.values(pgRegistry.pgCodecs).filter(isLqueryCodec) as PgCodec[];
  if (ltreeCodecs.length === 0) return undefined;
  if (ltreeCodecs.length !== 1) {
    throw new Error(
      `[graphile-ltree] Expected one ltree codec per build, found ${ltreeCodecs.length}`
    );
  }

  const ltreeCodec = ltreeCodecs[0];
  const identity = codecIdentity(ltreeCodec, 'ltree');
  const matchingLquery = lqueryCodecs.filter((codec) => {
    const candidate = codecIdentity(codec, 'lquery');
    return candidate.serviceName === identity.serviceName &&
      candidate.schemaName === identity.schemaName;
  });
  if (lqueryCodecs.length > 0 && matchingLquery.length !== lqueryCodecs.length) {
    throw new Error(
      '[graphile-ltree] lquery codec service/schema does not match the ltree codec'
    );
  }
  if (matchingLquery.length > 1) {
    throw new Error(
      `[graphile-ltree] Expected at most one matching lquery codec, found ` +
      `${matchingLquery.length}`
    );
  }

  return {
    ...identity,
    ltreeCodec,
    lqueryCodec: matchingLquery[0] ?? null,
    helperSchemaName: helperSchemaName(pgRegistry, identity.serviceName),
  };
}

/**
 * LtreeExtensionDetectionPlugin
 *
 * Detects ltree presence in the database by searching for ltree/lquery
 * codecs in the pgRegistry. Stores detected info on the build object
 * for downstream plugins.
 *
 * Gracefully degrades if ltree is not installed.
 */
export const LtreeExtensionDetectionPlugin: GraphileConfig.Plugin = {
  name: 'LtreeExtensionDetectionPlugin',
  version: '1.0.0',
  description: 'Detects ltree extension in the database',

  schema: {
    hooks: {
      build(build) {
        const ltreeInfo = resolveLtreeExtensionInfo(build);
        if (!ltreeInfo) return build;

        return build.extend(
          build,
          { pgLtreeExtensionInfo: ltreeInfo },
          'LtreeExtensionDetectionPlugin adding ltree build state'
        );
      }
    }
  }
};
