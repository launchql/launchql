/**
 * Bm25CodecPlugin
 *
 * Teaches PostGraphile v5 how to handle the pg_textsearch `bm25query` type
 * and discovers all BM25 indexes in the database.
 *
 * This plugin:
 * 1. Creates a codec for bm25query via gather.hooks.pgCodecs_findPgCodec
 * 2. Discovers all BM25 indexes via gather.hooks.pgIntrospection_introspection
 *    by querying pg_index + pg_am + pg_class + pg_attribute
 * 3. Attaches discovered BM25 index info to codec attributes belonging to
 *    the current gather state
 */

import 'graphile-build-pg';

import { gatherConfig } from 'graphile-build';
import type { GraphileConfig } from 'graphile-config';
import { Pool } from 'pg';
import sql from 'pg-sql2';

/**
 * Represents a discovered BM25 index in the database.
 */
export interface Bm25IndexInfo {
  /** Schema name (e.g. 'public') */
  schemaName: string;
  /** Table name (e.g. 'documents') */
  tableName: string;
  /** Column name (e.g. 'content') */
  columnName: string;
  /** Index name (e.g. 'docs_idx') — needed for to_bm25query() */
  indexName: string;
}

/**
 * @deprecated Pass a store explicitly to createBm25Adapter when needed.
 *
 * This compatibility map is never populated by automatic discovery; gather
 * state is bound to codec attributes instead.
 */
export const bm25IndexStore = new Map<string, Bm25IndexInfo>();

declare global {
  namespace GraphileConfig {
    interface GatherHelpers {
      bm25Codec: Record<string, never>;
    }
  }

  namespace DataplanPg {
    interface PgCodecAttributeExtensions {
      /** BM25 index discovered for this attribute during this gather. */
      bm25Index?: Bm25IndexInfo;
    }
  }
}

interface Bm25IndexRow {
  class_id: string;
  attribute_number: number;
  schema_name: string;
  table_name: string;
  column_name: string;
  index_name: string;
}

const attributeKey = (classId: string, attributeNumber: number): string =>
  `${classId}:${attributeNumber}`;

/** Convert one gather's query result into state owned by that gather only. */
export function collectBm25Indexes(
  rows: readonly Bm25IndexRow[]
): Map<string, Bm25IndexInfo> {
  const indexes = new Map<string, Bm25IndexInfo>();
  for (const row of rows) {
    indexes.set(attributeKey(row.class_id, row.attribute_number), {
      schemaName: row.schema_name,
      tableName: row.table_name,
      columnName: row.column_name,
      indexName: row.index_name
    });
  }
  return indexes;
}

/**
 * The SQL query that discovers BM25 indexes in the database.
 * Joins pg_index -> pg_class -> pg_am to find all indexes using the 'bm25'
 * access method, then resolves the schema, table, column, and index names.
 */
const BM25_DISCOVERY_SQL = `
  SELECT
    c.oid::text AS class_id,
    a.attnum AS attribute_number,
    n.nspname  AS schema_name,
    c.relname  AS table_name,
    a.attname  AS column_name,
    i.relname  AS index_name
  FROM pg_index ix
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_am am ON am.oid = i.relam
  JOIN pg_class c ON c.oid = ix.indrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(ix.indkey)
  WHERE am.amname = 'bm25'
`;

export const Bm25CodecPlugin: GraphileConfig.Plugin = {
  name: 'Bm25CodecPlugin',
  version: '1.0.0',
  description: 'Registers a codec for the pg_textsearch bm25query type and discovers BM25 indexes',

  gather: gatherConfig({
    namespace: 'bm25Codec',
    initialState: () => ({
      indexesByService: new Map<string, Map<string, Bm25IndexInfo>>()
    }),
    helpers: {},
    hooks: {
      /**
       * Register the bm25query codec when detected during type introspection.
       */
      async pgCodecs_findPgCodec(info, event) {
        if (event.pgCodec) return;

        const { pgType: type, serviceName } = event;
        if (type.typname !== 'bm25query') return;

        const typeNamespace = await info.helpers.pgIntrospection.getNamespace(
          serviceName,
          type.typnamespace
        );
        if (!typeNamespace) return;

        const schemaName = typeNamespace.nspname;

        event.pgCodec = {
          name: 'bm25query',
          sqlType: sql.identifier(schemaName, 'bm25query'),

          // PG sends bm25query as text
          fromPg(value: string): string {
            return value;
          },

          // string -> bm25query text
          toPg(value: string): string {
            return value;
          },

          attributes: undefined,
          executor: null,
          extensions: {
            oid: type._id,
            pg: { serviceName, schemaName, name: 'bm25query' },
          },
        };
      },

      /**
       * After introspection completes, query for all BM25 indexes.
       * Uses the pgService's adaptorSettings to create a direct pg.Pool
       * connection and runs the BM25 discovery query.
       */
      async pgIntrospection_introspection(info, event) {
        const { serviceName } = event;

        // Get the pgService from the resolved preset
        const pgService = info.resolvedPreset?.pgServices?.find(
          (s: { name?: string }) => (s.name ?? 'main') === serviceName
        );
        if (!pgService) return;

        try {
          const adaptorSettings = (pgService as any).adaptorSettings;
          if (!adaptorSettings?.connectionString && !adaptorSettings?.pool) {
            return;
          }

          const existingPool = adaptorSettings.pool;
          const pool = existingPool ?? new Pool({
            connectionString: adaptorSettings.connectionString,
            max: 1,
          });
          const isOwnPool = !existingPool;

          try {
            const result = await pool.query(BM25_DISCOVERY_SQL);

            info.state.indexesByService.set(
              serviceName,
              collectBm25Indexes(result.rows as Bm25IndexRow[])
            );
          } finally {
            if (isOwnPool) {
              await pool.end();
            }
          }
        } catch {
          // pg_textsearch not installed or query failed — gracefully skip
          info.state.indexesByService.set(serviceName, new Map());
        }
      },

      pgCodecs_attribute(info, event) {
        const index = info.state.indexesByService
          .get(event.serviceName)
          ?.get(attributeKey(event.pgClass._id, event.pgAttribute.attnum));
        if (!index) return;
        event.attribute.extensions ??= Object.create(null);
        event.attribute.extensions.bm25Index = index;
      },
    },
  }),

  schema: {
    hooks: {
      init: {
        before: ['PgCodecs'],
        callback(_, build) {
          const { setGraphQLTypeForPgCodec } = build;

          // Map bm25query codec to String for both input and output
          for (const codec of Object.values(build.input.pgRegistry.pgCodecs)) {
            if ((codec as any).name === 'bm25query') {
              setGraphQLTypeForPgCodec(
                codec as any,
                'input',
                build.graphql.GraphQLString.name
              );
              setGraphQLTypeForPgCodec(
                codec as any,
                'output',
                build.graphql.GraphQLString.name
              );
            }
          }

          return _;
        },
      },
    },
  },
};

export const Bm25CodecPreset: GraphileConfig.Preset = {
  plugins: [Bm25CodecPlugin],
};
