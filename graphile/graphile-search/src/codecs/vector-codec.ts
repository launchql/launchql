/**
 * VectorCodecPlugin
 *
 * Teaches PostGraphile v5 how to handle the pgvector `vector` type.
 *
 * Without this:
 * - `vector(n)` columns are silently invisible in the schema
 * - SQL functions with `vector` args are skipped entirely
 *
 * Wire format: PostgreSQL sends vector as text `[0.1,0.2,...,0.768]`
 * JavaScript: number[]
 * GraphQL: `Vector` scalar (serialized as [Float])
 */

import 'graphile-build-pg';
import 'graphile-build';

import type { GraphileConfig } from 'graphile-config';
import sql from 'pg-sql2';

export const VectorCodecPlugin: GraphileConfig.Plugin = {
  name: 'VectorCodecPlugin',
  version: '1.0.0',
  description: 'Registers a codec for the pgvector `vector` type',

  gather: {
    hooks: {
      async pgCodecs_findPgCodec(info, event) {
        const { pgType: type, serviceName } = event;
        if (type.typname !== 'vector') return;

        const typeNamespace = await info.helpers.pgIntrospection.getNamespace(
          serviceName,
          type.typnamespace
        );
        if (!typeNamespace?.nspname) {
          throw new Error(
            `[graphile-search] Cannot resolve the vector type namespace for ` +
            `service '${serviceName}'`
          );
        }

        const schemaName = typeNamespace.nspname;

        if (event.pgCodec) {
          const existingPg = event.pgCodec.extensions?.pg;
          if (
            (existingPg?.serviceName && existingPg.serviceName !== serviceName) ||
            (existingPg?.schemaName && existingPg.schemaName !== schemaName)
          ) {
            throw new Error(
              `[graphile-search] Existing vector codec identity conflicts with ` +
              `introspection for service '${serviceName}'`
            );
          }
          const existingCodec = event.pgCodec as any;
          existingCodec.sqlType = sql.identifier(schemaName, 'vector');
          existingCodec.extensions = {
            ...existingCodec.extensions,
            oid: type._id,
            pg: {
              ...existingPg,
              serviceName,
              schemaName,
              name: 'vector',
            },
          };
          return;
        }

        event.pgCodec = {
          name: 'vector',
          sqlType: sql.identifier(schemaName, 'vector'),

          // PG sends: [0.1,-0.2,...,0.768]  ->  number[]
          fromPg(value: string): number[] {
            return value
              .replace(/^\[|\]$/g, '')
              .split(',')
              .map((v) => parseFloat(v.trim()));
          },

          // number[]  ->  [0.1,-0.2,...,0.768]
          toPg(value: number[]): string {
            if (!Array.isArray(value)) throw new Error('vector input must be an array of numbers');
            return `[${value.join(',')}]`;
          },

          attributes: undefined,
          executor: undefined,
          extensions: {
            oid: type._id,
            pg: { serviceName, schemaName, name: 'vector' },
          },
        };
      },
    },
  },

  schema: {
    hooks: {
      init: {
        before: ['PgCodecs'],
        callback(_, build) {
          const { setGraphQLTypeForPgCodec } = build;

          build.registerScalarType(
            'Vector',
            {},
            () => ({
              description:
                'A pgvector embedding — array of floats. ' +
                'Dimensions must match the column (e.g. 768 for nomic-embed-text).',
              serialize(value: unknown): number[] {
                if (Array.isArray(value)) return value as number[];
                if (typeof value === 'string')
                  return value.replace(/^\[|\]$/g, '').split(',').map((v) => parseFloat(v.trim()));
                throw new Error('Vector must be an array of numbers');
              },
              parseValue(value: unknown): number[] {
                if (Array.isArray(value)) return value as number[];
                throw new Error('Vector must be an array of numbers');
              },
              parseLiteral(ast: any): number[] | null {
                if (ast.kind === 'NullValue') return null;
                if (ast.kind === 'ListValue')
                  return ast.values.map((v: any) => {
                    if (v.kind === 'FloatValue' || v.kind === 'IntValue') return parseFloat(v.value);
                    throw new Error('Vector elements must be Float values');
                  });
                if (ast.kind === 'StringValue')
                  return ast.value.replace(/^\[|\]$/g, '').split(',').map((v: string) => parseFloat(v.trim()));
                throw new Error('Vector must be a list of floats or a string "[f1,f2,...]"');
              },
            }),
            'VectorCodecPlugin registering Vector scalar'
          );

          // Wire codec -> scalar for both input (mutations) and output (queries).
          // Without BOTH, PgAttributesPlugin silently drops the column.
          for (const codec of Object.values(build.input.pgRegistry.pgCodecs)) {
            if ((codec as any).name === 'vector') {
              setGraphQLTypeForPgCodec(codec as any, 'input', 'Vector');
              setGraphQLTypeForPgCodec(codec as any, 'output', 'Vector');
            }
          }

          return _;
        },
      },
    },
  },
};

export const VectorCodecPreset: GraphileConfig.Preset = {
  plugins: [VectorCodecPlugin],
};
