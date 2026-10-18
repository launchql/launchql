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
 * 3. Stores discovered BM25 index info in a module-level Map for use by
 *    the BM25 adapter during the schema build phase
 */

import 'graphile-build-pg';

import type { GraphileConfig } from 'graphile-config';
import { Pool } from 'pg';
import sql from 'pg-sql2';

/**
 * Represents a discovered BM25 index in the database.
 */
export interface Bm25IndexInfo {
  /** Schema containing pg_textsearch functions and operators. */
  extensionSchema: string;
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
 * Module-level store for discovered BM25 indexes.
 * Populated during the gather phase, read during the schema build phase.
 *
 * Key: "schemaName.tableName.columnName"
 * Value: Bm25IndexInfo
 */
export const bm25IndexStore = new Map<string, Bm25IndexInfo>();

/**
 * Whether pg_textsearch extension was detected in the database.
 */
export let bm25ExtensionDetected = false;

/**
 * The SQL query that discovers BM25 indexes in the database.
 * Joins pg_index -> pg_class -> pg_am to find all indexes using the 'bm25'
 * access method, then resolves the schema, table, column, and index names.
 */
const BM25_DISCOVERY_SQL = `
  SELECT
    en.nspname AS extension_schema,
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
  JOIN pg_extension e ON e.extname = 'pg_textsearch'
  JOIN pg_namespace en ON en.oid = e.extnamespace
  WHERE am.amname = 'bm25'
`;

export const Bm25CodecPlugin: GraphileConfig.Plugin = {
  name: 'Bm25CodecPlugin',
  version: '1.0.0',
  description: 'Registers a codec for the pg_textsearch bm25query type and discovers BM25 indexes',

  gather: {
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

        // Clear previous entries for this introspection run
        bm25IndexStore.clear();

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

            if (result.rows && result.rows.length > 0) {
              bm25ExtensionDetected = true;
              for (const row of result.rows) {
                const key = `${row.schema_name}.${row.table_name}.${row.column_name}`;
                bm25IndexStore.set(key, {
                  extensionSchema: row.extension_schema,
                  schemaName: row.schema_name,
                  tableName: row.table_name,
                  columnName: row.column_name,
                  indexName: row.index_name,
                });
              }
            }
          } finally {
            if (isOwnPool) {
              await pool.end();
            }
          }
        } catch {
          // pg_textsearch not installed or query failed — gracefully skip
          bm25ExtensionDetected = false;
        }
      },
    },
  },

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
