/**
 * BM25 Search Adapter
 *
 * Detects text columns with BM25 indexes (via pg_textsearch) and generates
 * BM25 relevance scoring. Wraps the same SQL logic as graphile-bm25.
 *
 * Requires the Bm25CodecPlugin to be loaded first (for index discovery).
 * The adapter reads metadata attached to this gather's codec attributes.
 *
 * Supports chunk-aware querying via @hasChunks smart tag: when the parent
 * table has chunks with a BM25 index, the adapter includes a lateral
 * subquery to find the best-matching chunk and returns
 * LEAST(parent_score, chunk_score) (lower = better for BM25).
 */

import type { SQL } from 'pg-sql2';

import type { Bm25IndexInfo } from '../codecs/bm25-codec';
import type { FilterApplyResult,SearchableColumn, SearchAdapter } from '../types';
import { type ChunksInfo,getChunksInfo } from './chunks';

export type { Bm25IndexInfo } from '../codecs/bm25-codec';

/** Combined adapter data for a BM25-searchable column */
interface Bm25ColumnData {
  bm25Index: Bm25IndexInfo;
  chunksInfo?: ChunksInfo;
}

function isTextCodec(codec: any): boolean {
  const name = codec?.name;
  return name === 'text' || name === 'varchar' || name === 'bpchar';
}

export interface Bm25AdapterOptions {
  /**
   * Filter prefix for BM25 filter fields.
   * @default 'bm25'
   */
  filterPrefix?: string;

  /**
   * Explicit BM25 index metadata for this adapter's owner. Automatic discovery
   * uses only metadata attached to the current gather's codec attributes.
   */
  bm25IndexStore?: Map<string, Bm25IndexInfo>;
}

export function createBm25Adapter(
  options: Bm25AdapterOptions = {}
): SearchAdapter {
  const { filterPrefix = 'bm25', bm25IndexStore } = options;

  function getBm25IndexForAttribute(
    codec: any,
    attributeName: string,
  ): Bm25IndexInfo | undefined {
    const bound = codec.attributes?.[attributeName]?.extensions?.bm25Index;
    if (bound) return bound as Bm25IndexInfo;

    const store = bm25IndexStore;
    if (!store) return undefined;

    const pg = codec?.extensions?.pg;
    if (!pg) return undefined;

    const key = `${pg.schemaName}.${pg.name}.${attributeName}`;
    return store.get(key);
  }

  return {
    name: 'bm25',

    scoreSemantics: {
      metric: 'score',
      lowerIsBetter: true,
      range: null, // unbounded negative
    },

    filterPrefix,

    supportsTextSearch: true,

    buildTextSearchInput(text: string): { query: string } {
      // BM25 filter takes { query: string }
      return { query: text };
    },

    detectColumns(codec: any, build: any): SearchableColumn[] {
      if (!codec?.attributes) return [];

      const columns: SearchableColumn[] = [];
      for (const [attributeName, attribute] of Object.entries(
        codec.attributes as Record<string, any>
      )) {
        if (!isTextCodec(attribute.codec)) continue;
        const bm25Index = getBm25IndexForAttribute(codec, attributeName);
        if (!bm25Index) continue;

        // Check for chunk-aware BM25
        const chunksInfo = getChunksInfo(codec);
        const hasChunkBm25 = chunksInfo?.searchIndexes.includes('bm25');

        const columnData: Bm25ColumnData = {
          bm25Index,
          chunksInfo: hasChunkBm25 ? chunksInfo : undefined,
        };
        columns.push({ attributeName, adapterData: columnData });
      }
      return columns;
    },

    registerTypes(build: any): void {
      const {
        graphql: { GraphQLString, GraphQLFloat, GraphQLNonNull },
      } = build;

      // Register input type for BM25 search.
      // Wrapped in try/catch because another plugin may have already
      // registered 'Bm25SearchInput'. Graphile throws on duplicate
      // registrations, so we catch and ignore.
      try {
        build.registerInputObjectType(
          'Bm25SearchInput',
          {},
          () => ({
            description:
              'Input for BM25 ranked text search. Provide a search query string and optional score threshold.',
            fields: () => ({
              query: {
                type: new GraphQLNonNull(GraphQLString),
                description: 'The search query text. Uses pg_textsearch BM25 ranking.',
              },
              threshold: {
                type: GraphQLFloat,
                description:
                  'Maximum BM25 score threshold (negative values). Only rows with score <= threshold are returned.',
              },
            }),
          }),
          'UnifiedSearchPlugin (bm25 adapter) registering Bm25SearchInput type'
        );
      } catch {
        // Already registered — safe to ignore
      }
    },

    getFilterTypeName(_build: any): string {
      return 'Bm25SearchInput';
    },

    buildFilterApply(
      sql: any,
      alias: SQL,
      column: SearchableColumn,
      filterValue: any,
      _build: any,
    ): FilterApplyResult | null {
      if (filterValue == null) return null;

      const { query, threshold, includeChunks } = filterValue;
      if (!query || typeof query !== 'string' || query.trim().length === 0) return null;

      const columnData = column.adapterData as Bm25ColumnData;
      const bm25Index = columnData.bm25Index;
      const columnExpr = sql`${alias}.${sql.identifier(column.attributeName)}`;

      // Use quoteQualifiedIdentifier to produce the qualified index name
      const qualifiedIndexName = `"${bm25Index.schemaName}"."${bm25Index.indexName}"`;
      const bm25queryExpr = sql`to_bm25query(${sql.value(query)}, ${sql.value(qualifiedIndexName)})`;
      const scoreExpr = sql`(${columnExpr} <@> ${bm25queryExpr})`;

      // Check for chunk-aware querying
      const chunksInfo = columnData.chunksInfo;
      if (chunksInfo && chunksInfo.searchIndexes.includes('bm25') && (includeChunks !== false)) {
        const chunksTableRef = chunksInfo.chunksSchema
          ? sql`${sql.identifier(chunksInfo.chunksSchema)}.${sql.identifier(chunksInfo.chunksTableName)}`
          : sql`${sql.identifier(chunksInfo.chunksTableName)}`;
        const parentFk = sql.identifier(chunksInfo.parentFkField);
        const chunkContentField = sql.identifier(chunksInfo.contentField);
        const parentId = sql`${alias}.${sql.identifier(chunksInfo.parentPkField)}`;
        const chunksAlias = sql.identifier('__bm25_chunks');

        // BM25 on chunks requires an index name on the chunks table.
        // We construct it from the chunks table schema + a conventional index name.
        // The BM25 index on chunks is named: {chunks_table}_{content_field}_bm25_idx
        const chunksIndexName = `"${chunksInfo.chunksSchema || bm25Index.schemaName}"."${chunksInfo.chunksTableName}_${chunksInfo.contentField}_bm25_idx"`;
        const chunkBm25queryExpr = sql`to_bm25query(${sql.value(query)}, ${sql.value(chunksIndexName)})`;
        const chunkScoreExpr = sql`(${chunksAlias}.${chunkContentField} <@> ${chunkBm25queryExpr})`;

        // Subquery: MIN(bm25_score) across chunks (lower = better for BM25)
        const chunkScoreSubquery = sql`(
          SELECT MIN(${chunkScoreExpr})
          FROM ${chunksTableRef} AS ${chunksAlias}
          WHERE ${chunksAlias}.${parentFk} = ${parentId}
        )`;

        // Combined: LEAST of parent score and best chunk score (lower = better)
        const combinedScoreExpr = sql`LEAST(
          COALESCE(${scoreExpr}, 0::real),
          COALESCE(${chunkScoreSubquery}, 0::real)
        )`;

        let whereClause: SQL | null = null;
        if (threshold !== undefined && threshold !== null) {
          whereClause = sql`${combinedScoreExpr} < ${sql.value(threshold)}`;
        }

        return {
          whereClause,
          scoreExpression: combinedScoreExpr,
        };
      }

      // Standard (non-chunk) query
      let whereClause: SQL | null = null;
      if (threshold !== undefined && threshold !== null) {
        whereClause = sql`${scoreExpr} < ${sql.value(threshold)}`;
      }

      return {
        whereClause,
        scoreExpression: scoreExpr,
      };
    },
  };
}
