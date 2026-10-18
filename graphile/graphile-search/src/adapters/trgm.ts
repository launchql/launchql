/**
 * pg_trgm Search Adapter
 *
 * Detects text/varchar columns and generates trigram similarity scoring.
 * Wraps the same SQL logic as graphile-trgm but as a SearchAdapter.
 *
 * Supports chunk-aware querying via @hasChunks smart tag: when the parent
 * table has chunks with a trigram index, the adapter includes a lateral
 * subquery to find the best-matching chunk and returns
 * GREATEST(parent_similarity, chunk_similarity).
 */

import type { SQL } from 'pg-sql2';

import type { SearchExtensionSchemas } from '../extension-metadata';
import type { FilterApplyResult,SearchableColumn, SearchAdapter } from '../types';
import { type ChunksInfo,getChunksInfo } from './chunks';

function isTextCodec(codec: any): boolean {
  const name = codec?.name;
  return name === 'text' || name === 'varchar' || name === 'bpchar';
}

export interface TrgmAdapterOptions {
  /**
   * Filter prefix for trgm filter fields.
   * @default 'trgm'
   */
  filterPrefix?: string;

  /**
   * Default similarity threshold (0..1). Higher = stricter matching.
   * @default 0.3
   */
  defaultThreshold?: number;

  /**
   * When true, trgm only activates on tables that have an "intentional"
   * search column detected by another adapter (e.g. a tsvector column or
   * a BM25 index). This prevents trgm similarity fields from being added
   * to every table with text columns.
   *
   * The plugin's `getAdapterColumns` orchestrates this by running
   * non-supplementary adapters first, then only running supplementary
   * adapters on codecs that already have search columns.
   *
   * @default true
   */
  requireIntentionalSearch?: boolean;
}

interface TrgmColumnData {
  serviceName: string;
  extensionSchema: string;
  chunksInfo?: ChunksInfo;
}

export function createTrgmAdapter(
  options: TrgmAdapterOptions = {}
): SearchAdapter {
  const {
    filterPrefix = 'trgm',
    defaultThreshold = 0.3,
    requireIntentionalSearch = true,
  } = options;

  return {
    name: 'trgm',

    /**
     * When true, this adapter is "supplementary" — it only activates on
     * tables that already have columns detected by a non-supplementary adapter.
     */
    isSupplementary: requireIntentionalSearch,

    scoreSemantics: {
      metric: 'similarity',
      lowerIsBetter: false,
      range: [0, 1],
    },

    filterPrefix,

    supportsTextSearch: true,

    buildTextSearchInput(text: string): { value: string } {
      // trgm filter takes { value: string } — threshold uses adapter default
      return { value: text };
    },

    detectColumns(codec: any, _build: any): SearchableColumn[] {
      if (!codec?.attributes) return [];

      const columns: SearchableColumn[] = [];
      for (const [attributeName, attribute] of Object.entries(
        codec.attributes as Record<string, any>
      )) {
        if (isTextCodec(attribute.codec)) {
          const binding: SearchExtensionSchemas | undefined =
            attribute?.extensions?.searchExtensionSchemas;
          if (!binding) {
            const tableName = codec?.extensions?.pg?.name ?? codec?.name ?? '<unknown>';
            throw new Error(
              `[graphile-search] pg_trgm column '${tableName}.${attributeName}' is ` +
              'missing service-bound extension schema metadata'
            );
          }
          if (!binding.pgTrgmSchema) {
            const explicitlyRequired =
              requireIntentionalSearch === false ||
              codec?.extensions?.tags?.trgmSearch === true ||
              attribute?.extensions?.tags?.trgmSearch === true;
            if (explicitlyRequired) {
              const tableName = codec?.extensions?.pg?.name ?? codec?.name ?? '<unknown>';
              throw new Error(
                `[graphile-search] pg_trgm is required for '${tableName}.${attributeName}' ` +
                `but is not installed for service '${binding.serviceName}'`
              );
            }
            continue;
          }
          // Store chunks info if available and chunks have trigram search
          const chunksInfo = getChunksInfo(codec);
          const hasChunkTrgm = chunksInfo?.searchIndexes.includes('trigram');
          columns.push({
            attributeName,
            adapterData: {
              serviceName: binding.serviceName,
              extensionSchema: binding.pgTrgmSchema,
              ...(hasChunkTrgm ? { chunksInfo } : {}),
            } satisfies TrgmColumnData,
          });
        }
      }
      return columns;
    },

    registerTypes(build: any): void {
      const {
        graphql: { GraphQLString, GraphQLFloat, GraphQLNonNull },
      } = build;

      // Register input type for trgm search.
      // Wrapped in try/catch because the standalone graphile-trgm plugin may
      // have already registered 'TrgmSearchInput' in its own init hook.
      // Graphile throws on duplicate registrations, so we catch and ignore.
      try {
        build.registerInputObjectType(
          'TrgmSearchInput',
          {},
          () => ({
            description:
              'Input for pg_trgm fuzzy text matching. Provide a search value and optional similarity threshold.',
            fields: () => ({
              value: {
                type: new GraphQLNonNull(GraphQLString),
                description: 'The text to fuzzy-match against. Typos and misspellings are tolerated.',
              },
              threshold: {
                type: GraphQLFloat,
                description:
                  `Minimum similarity threshold (0.0 to 1.0). Higher = stricter matching. Default is ${defaultThreshold}.`,
              },
            }),
          }),
          'UnifiedSearchPlugin (trgm adapter) registering TrgmSearchInput type'
        );
      } catch {
        // Already registered by standalone graphile-trgm plugin — safe to ignore
      }
    },

    getFilterTypeName(_build: any): string {
      return 'TrgmSearchInput';
    },

    buildFilterApply(
      sql: any,
      alias: SQL,
      column: SearchableColumn,
      filterValue: any,
      _build: any,
    ): FilterApplyResult | null {
      if (filterValue == null) return null;

      const { value, threshold, includeChunks } = filterValue;
      if (!value || typeof value !== 'string' || value.trim().length === 0) return null;

      const columnData = column.adapterData as TrgmColumnData | undefined;
      if (!columnData?.extensionSchema || !columnData.serviceName) {
        throw new Error(
          `[graphile-search] pg_trgm column '${column.attributeName}' has no bound ` +
          'extension schema'
        );
      }
      const th = threshold != null ? threshold : defaultThreshold;
      const columnExpr = sql`${alias}.${sql.identifier(column.attributeName)}`;
      const similarity = sql.identifier(columnData.extensionSchema, 'similarity');
      const similarityExpr = sql`${similarity}(${columnExpr}, ${sql.value(value)})`;

      // Check for chunk-aware querying
      const chunksInfo = columnData.chunksInfo;
      if (chunksInfo && chunksInfo.searchIndexes.includes('trigram') && (includeChunks !== false)) {
        const chunksTableRef = chunksInfo.chunksSchema
          ? sql`${sql.identifier(chunksInfo.chunksSchema)}.${sql.identifier(chunksInfo.chunksTableName)}`
          : sql`${sql.identifier(chunksInfo.chunksTableName)}`;
        const parentFk = sql.identifier(chunksInfo.parentFkField);
        const chunkContentField = sql.identifier(chunksInfo.contentField);
        const parentId = sql`${alias}.${sql.identifier(chunksInfo.parentPkField)}`;
        const chunksAlias = sql.identifier('__trgm_chunks');

        // Subquery: MAX(similarity) across chunks (higher = better for trgm)
        const chunkSimilaritySubquery = sql`(
          SELECT MAX(${similarity}(${chunksAlias}.${chunkContentField}, ${sql.value(value)}))
          FROM ${chunksTableRef} AS ${chunksAlias}
          WHERE ${chunksAlias}.${parentFk} = ${parentId}
            AND ${similarity}(${chunksAlias}.${chunkContentField}, ${sql.value(value)}) > ${sql.value(th)}
        )`;

        // Combined: GREATEST of parent similarity and best chunk similarity
        const combinedSimilarityExpr = sql`GREATEST(
          COALESCE(${similarityExpr}, 0::real),
          COALESCE(${chunkSimilaritySubquery}, 0::real)
        )`;

        // WHERE: parent matches OR any chunk matches
        const whereClause = sql`(${similarityExpr} > ${sql.value(th)} OR ${chunkSimilaritySubquery} IS NOT NULL)`;

        return {
          whereClause,
          scoreExpression: combinedSimilarityExpr,
        };
      }

      // Standard (non-chunk) query
      return {
        whereClause: sql`${similarityExpr} > ${sql.value(th)}`,
        scoreExpression: similarityExpr,
      };
    },
  };
}
