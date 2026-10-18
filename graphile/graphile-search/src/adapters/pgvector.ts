/**
 * pgvector Search Adapter
 *
 * Detects vector columns and generates distance-based scoring using
 * pgvector operators (<=> cosine, <-> L2, <#> inner product).
 * Wraps the same SQL logic as graphile-pgvector but as a SearchAdapter.
 */

import type { SQL } from 'pg-sql2';

import type { SearchExtensionSchemas } from '../extension-metadata';
import type { FilterApplyResult,SearchableColumn, SearchAdapter } from '../types';
import { type ChunksInfo,getChunksInfo } from './chunks';

interface PgvectorColumnData {
  serviceName: string;
  extensionSchema: string;
  chunksInfo?: ChunksInfo;
}

/**
 * Build a distance expression for the given metric.
 * Uses explicit SQL template literals for each operator to avoid sql.raw.
 */
function buildDistanceExpr(
  sql: any,
  columnExpr: SQL,
  vectorExpr: SQL,
  metric: string,
  extensionSchema: string,
): SQL {
  switch (metric) {
  case 'L2':
    return sql`(${columnExpr} OPERATOR(${sql.identifier(extensionSchema)}.<->) ${vectorExpr})`;
  case 'IP':
    return sql`(${columnExpr} OPERATOR(${sql.identifier(extensionSchema)}.<#>) ${vectorExpr})`;
  case 'COSINE':
  default:
    return sql`(${columnExpr} OPERATOR(${sql.identifier(extensionSchema)}.<=>) ${vectorExpr})`;
  }
}

function isVectorCodec(codec: any): boolean {
  return codec?.name === 'vector';
}

export interface PgvectorAdapterOptions {
  /**
   * Filter prefix for vector filter fields.
   * @default 'vector'
   */
  filterPrefix?: string;

  /**
   * Default similarity metric.
   * @default 'COSINE'
   */
  defaultMetric?: 'COSINE' | 'L2' | 'IP';

  /**
   * When true, tables with @hasChunks smart tag will transparently
   * query through the chunks table to find the closest chunk.
   * The parent row's vector distance is the minimum distance across
   * all its chunks.
   * @default true
   */
  enableChunkQuerying?: boolean;
}

export function createPgvectorAdapter(
  options: PgvectorAdapterOptions = {}
): SearchAdapter {
  const { filterPrefix = 'vector', defaultMetric = 'COSINE', enableChunkQuerying = true } = options;

  return {
    name: 'vector',

    scoreSemantics: {
      metric: 'distance',
      lowerIsBetter: true,
      range: null, // 0 to infinity
    },

    filterPrefix,

    // pgvector operates on embedding vectors, not text search — its presence
    // alone should NOT trigger supplementary adapters like trgm.
    isIntentionalSearch: false,

    supportsTextSearch: false,
    // pgvector requires a vector array, not plain text — no buildTextSearchInput

    detectColumns(codec: any, _build: any): SearchableColumn[] {
      if (!codec?.attributes) return [];

      const columns: SearchableColumn[] = [];
      const chunksInfo = enableChunkQuerying ? getChunksInfo(codec) : undefined;

      for (const [attributeName, attribute] of Object.entries(
        codec.attributes as Record<string, any>
      )) {
        if (isVectorCodec(attribute.codec)) {
          const binding: SearchExtensionSchemas | undefined =
            attribute?.extensions?.searchExtensionSchemas;
          const codecPg = attribute.codec?.extensions?.pg;
          if (!binding?.pgvectorSchema || !codecPg?.schemaName || !codecPg?.serviceName) {
            const tableName = codec?.extensions?.pg?.name ?? codec?.name ?? '<unknown>';
            throw new Error(
              `[graphile-search] pgvector column '${tableName}.${attributeName}' is ` +
              'missing exact codec/service extension metadata'
            );
          }
          if (
            codecPg.schemaName !== binding.pgvectorSchema ||
            codecPg.serviceName !== binding.serviceName
          ) {
            throw new Error(
              `[graphile-search] pgvector column '${attributeName}' codec identity ` +
              `'${codecPg.serviceName}/${codecPg.schemaName}' does not match extension ` +
              `'${binding.serviceName}/${binding.pgvectorSchema}'`
            );
          }
          columns.push({
            attributeName,
            adapterData: {
              serviceName: binding.serviceName,
              extensionSchema: binding.pgvectorSchema,
              ...(chunksInfo ? { chunksInfo } : {}),
            } satisfies PgvectorColumnData,
          });
        }
      }
      return columns;
    },

    registerTypes(build: any): void {
      const {
        graphql: { GraphQLList, GraphQLNonNull, GraphQLFloat },
      } = build;

      // Register types for vector search.
      // Wrapped in try/catch because the standalone graphile-pgvector plugin may
      // have already registered these types in its own init hook.
      // Graphile throws on duplicate registrations, so we catch and ignore.
      try {
        build.registerEnumType(
          'VectorMetric',
          {},
          () => ({
            description: 'Similarity metric for vector search',
            values: {
              COSINE: {
                value: 'COSINE',
                description: 'Cosine distance (1 - cosine similarity). Range: 0 (identical) to 2 (opposite).',
              },
              L2: {
                value: 'L2',
                description: 'Euclidean (L2) distance. Range: 0 (identical) to infinity.',
              },
              IP: {
                value: 'IP',
                description: 'Negative inner product. Higher (less negative) = more similar.',
              },
            },
          }),
          'UnifiedSearchPlugin (pgvector adapter) registering VectorMetric enum'
        );
      } catch {
        // Already registered by standalone graphile-pgvector plugin — safe to ignore
      }

      try {
        build.registerInputObjectType(
          'VectorNearbyInput',
          {},
          () => ({
            description:
              'Input for vector similarity search. Provide a query vector, optional metric, and optional max distance threshold.',
            fields: () => {
              // getTypeByName is safe inside a thunk (fields callback) — called after init is complete
              const VectorMetricEnum = build.getTypeByName('VectorMetric') as any;
              return {
                vector: {
                  type: new GraphQLNonNull(
                    new GraphQLList(new GraphQLNonNull(GraphQLFloat))
                  ),
                  description: 'Query vector for similarity search.',
                },
                metric: {
                  type: VectorMetricEnum,
                  description: `Similarity metric to use (default: ${defaultMetric}).`,
                },
                distance: {
                  type: GraphQLFloat,
                  description: 'Maximum distance threshold. Only rows within this distance are returned.',
                },
                includeChunks: {
                  type: build.graphql.GraphQLBoolean,
                  description:
                    'When true (default for tables with @hasChunks), transparently queries ' +
                    'the chunks table and returns the minimum distance across parent + all chunks. ' +
                    'Set to false to only search the parent embedding.',
                },
              };
            },
          }),
          'UnifiedSearchPlugin (pgvector adapter) registering VectorNearbyInput type'
        );
      } catch {
        // Already registered by standalone graphile-pgvector plugin — safe to ignore
      }
    },

    getFilterTypeName(_build: any): string {
      return 'VectorNearbyInput';
    },

    buildFilterApply(
      sql: any,
      alias: SQL,
      column: SearchableColumn,
      filterValue: any,
      _build: any,
    ): FilterApplyResult | null {
      if (filterValue == null) return null;

      const { vector, metric, distance, includeChunks } = filterValue;
      if (!vector || !Array.isArray(vector) || vector.length === 0) return null;

      const adapterData = column.adapterData as PgvectorColumnData | undefined;
      if (!adapterData?.extensionSchema || !adapterData.serviceName) {
        throw new Error(
          `[graphile-search] pgvector column '${column.attributeName}' has no bound ` +
          'extension schema'
        );
      }
      const resolvedMetric = metric || defaultMetric;
      const vectorString = `[${vector.join(',')}]`;
      const vectorExpr = sql`${sql.value(vectorString)}::${sql.identifier(
        adapterData.extensionSchema,
        'vector'
      )}`;

      // Check if this column has chunks info and chunk querying is requested
      const chunksInfo = adapterData?.chunksInfo;

      if (chunksInfo && (includeChunks !== false)) {
        // Chunk-aware query: find the closest chunk for each parent row
        // Uses a lateral subquery to get the minimum distance across all chunks
        const chunksTableRef = chunksInfo.chunksSchema
          ? sql`${sql.identifier(chunksInfo.chunksSchema)}.${sql.identifier(chunksInfo.chunksTableName)}`
          : sql`${sql.identifier(chunksInfo.chunksTableName)}`;
        const parentFk = sql.identifier(chunksInfo.parentFkField);
        const chunkEmbedding = sql.identifier(chunksInfo.embeddingField);
        // Use the configured PK field (defaults to 'id', but can be overridden via @hasChunks tag)
        const parentId = sql`${alias}.${sql.identifier(chunksInfo.parentPkField)}`;
        // Alias to avoid ambiguity when the chunks table name might collide
        const chunksAlias = sql.identifier('__chunks');

        // Subquery: SELECT MIN(distance) FROM chunks WHERE chunks.parent_fk = parent.pk
        const chunkDistanceExpr = buildDistanceExpr(
          sql,
          sql`${chunksAlias}.${chunkEmbedding}`,
          vectorExpr,
          resolvedMetric,
          adapterData.extensionSchema
        );
        const chunkDistanceSubquery = sql`(
          SELECT MIN(${chunkDistanceExpr})
          FROM ${chunksTableRef} AS ${chunksAlias}
          WHERE ${chunksAlias}.${parentFk} = ${parentId}
        )`;

        // Also compute direct parent distance if the parent has an embedding
        const parentColumnExpr = sql`${alias}.${sql.identifier(column.attributeName)}`;
        const parentDistanceExpr = buildDistanceExpr(
          sql,
          parentColumnExpr,
          vectorExpr,
          resolvedMetric,
          adapterData.extensionSchema
        );

        // Use LEAST of parent distance and closest chunk distance
        // COALESCE handles cases where parent or chunks may not have embeddings
        const combinedDistanceExpr = sql`LEAST(
          COALESCE(${parentDistanceExpr}, 'Infinity'::float),
          COALESCE(${chunkDistanceSubquery}, 'Infinity'::float)
        )`;

        let whereClause: SQL | null = null;
        if (distance !== undefined && distance !== null) {
          whereClause = sql`${combinedDistanceExpr} <= ${sql.value(distance)}`;
        }

        return {
          whereClause,
          scoreExpression: combinedDistanceExpr,
        };
      }

      // Standard (non-chunk) query
      const columnExpr = sql`${alias}.${sql.identifier(column.attributeName)}`;
      const distanceExpr = buildDistanceExpr(
        sql,
        columnExpr,
        vectorExpr,
        resolvedMetric,
        adapterData.extensionSchema
      );

      let whereClause: SQL | null = null;
      if (distance !== undefined && distance !== null) {
        whereClause = sql`${distanceExpr} <= ${sql.value(distance)}`;
      }

      return {
        whereClause,
        scoreExpression: distanceExpr,
      };
    },
  };
}
