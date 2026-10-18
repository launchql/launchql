/**
 * LtreeCodecPlugin
 *
 * Ensures PostGraphile v5 properly handles ltree, lquery, and ltxtquery types.
 *
 * PostGraphile v5 (rc.8+) natively maps ltree to a GraphQL scalar named "LTree".
 * This plugin:
 * 1. Falls back to registering codecs if PostGraphile's native handling misses them
 * 2. Re-enables ltree columns for select/filterBy (overrides rc.8 HIDE_BY_DEFAULT)
 * 3. Converts between slash-delimited file paths (external API) and dot-delimited
 *    ltree (internal storage) at the GraphQL boundary via the codec's fromPg/toPg.
 *
 * External API: "/projects/alpha/docs" (slash-delimited file paths)
 * Internal DB:  "projects.alpha.docs" (ltree native format)
 *
 * The conversion happens at the codec level (fromPg/toPg) so it works regardless
 * of whether PostGraphile registers its own LTree scalar or we register ours.
 *
 * The native scalar name is "LTree" (capital T). All operators and downstream
 * plugins should reference LTREE_SCALAR_NAME for consistency.
 */

import type { GraphileConfig } from 'graphile-config';
import { GraphQLString } from 'graphql';
import sql from 'pg-sql2';

export const LTREE_SCALAR_NAME = 'LTree';

/**
 * Convert a slash-delimited file path to ltree format.
 * Idempotent on ltree values (no slashes → no change).
 *
 * "/projects/alpha/docs" → "projects.alpha.docs"
 * "projects.alpha.docs"  → "projects.alpha.docs" (no-op)
 */
export function slashToLtree(value: string): string {
  return value.replace(/^\//, '').replace(/\//g, '.');
}

/**
 * Convert an ltree value to a slash-delimited file path.
 *
 * "projects.alpha.docs" → "/projects/alpha/docs"
 * ""                     → "/"
 */
export function ltreeToSlash(value: string): string {
  if (value === '') return '/';
  return '/' + value.replace(/\./g, '/');
}

export const LtreeCodecPlugin: GraphileConfig.Plugin = {
  name: 'LtreeCodecPlugin',
  version: '2.0.0',
  description: 'Ensures ltree/lquery codecs are registered; converts between file paths and ltree at the GraphQL boundary',

  gather: {
    hooks: {
      async pgCodecs_findPgCodec(info, event) {
        const { pgType: type, serviceName } = event;

        const isLtree = type.typname === 'ltree';
        const isLquery = type.typname === 'lquery';
        const isLtxtquery = type.typname === 'ltxtquery';

        if (!isLtree && !isLquery && !isLtxtquery) return;

        const ns = await info.helpers.pgIntrospection.getNamespace(
          serviceName,
          type.typnamespace
        );
        if (!ns?.nspname) {
          throw new Error(
            `[graphile-ltree] Cannot resolve namespace for ${type.typname} ` +
            `codec in service '${serviceName}'`
          );
        }
        const schemaName = ns.nspname;

        if (event.pgCodec) {
          const existingPg = event.pgCodec.extensions?.pg;
          if (
            (existingPg?.serviceName && existingPg.serviceName !== serviceName) ||
            (existingPg?.schemaName && existingPg.schemaName !== schemaName)
          ) {
            throw new Error(
              `[graphile-ltree] Existing ${type.typname} codec identity conflicts with ` +
              `introspection for service '${serviceName}'`
            );
          }
          const existingCodec = event.pgCodec as any;
          existingCodec.sqlType = sql.identifier(schemaName, type.typname);
          existingCodec.extensions = {
            ...existingCodec.extensions,
            oid: type._id,
            pg: {
              ...existingPg,
              serviceName,
              schemaName,
              name: type.typname,
            },
          };
          return;
        }

        event.pgCodec = {
          name: type.typname,
          sqlType: sql.identifier(schemaName, type.typname),
          fromPg: (value: string) => value,
          toPg: (value: string) => value,
          attributes: undefined,
          executor: null,
          extensions: {
            oid: type._id,
            pg: {
              serviceName,
              schemaName,
              name: type.typname
            }
          }
        };
      }
    }
  },

  schema: {
    hooks: {
      /**
       * Patch the ltree codec's fromPg/toPg to convert between file paths
       * and ltree. This runs in the `build` hook (before type registration)
       * so it works regardless of whether PostGraphile registers its own
       * LTree scalar or we register ours.
       *
       * fromPg: "projects.alpha.docs" → "/projects/alpha/docs"
       * toPg:   "/projects/alpha/docs" → "projects.alpha.docs"
       */
      build(build) {
        for (const codec of Object.values(build.input.pgRegistry.pgCodecs)) {
          if (codec.name === 'ltree') {
            const c = codec as any;
            const origFromPg = c.fromPg;
            c.fromPg = (value: string) => {
              const raw = origFromPg ? origFromPg(value) : value;
              if (raw == null) return raw;
              return ltreeToSlash(String(raw));
            };
            const origToPg = c.toPg;
            c.toPg = (value: string) => {
              if (value == null) return origToPg ? origToPg(value) : value;
              const converted = slashToLtree(String(value));
              return origToPg ? origToPg(converted) : converted;
            };
          }
        }
        return build;
      },

      init: {
        before: ['PgCodecs', 'PgConnectionArgFilterPlugin'],
        callback(_, build) {
          const { setGraphQLTypeForPgCodec, hasGraphQLTypeForPgCodec } = build;

          for (const codec of Object.values(build.input.pgRegistry.pgCodecs)) {
            if (codec.name === 'ltree') {
              if (!hasGraphQLTypeForPgCodec(codec, 'input')) {
                build.registerScalarType(
                  LTREE_SCALAR_NAME,
                  {},
                  () => ({
                    description:
                      'A hierarchical file path. Accepts slash-delimited paths (e.g. "/projects/alpha/docs"). ' +
                      'Stored internally as PostgreSQL ltree.',
                    serialize(value: unknown) {
                      if (value == null) return null;
                      return String(value);
                    },
                    parseValue(value: unknown) {
                      if (typeof value !== 'string') {
                        throw new Error(`${LTREE_SCALAR_NAME} must be a string`);
                      }
                      return value;
                    },
                    parseLiteral(lit: any) {
                      if (lit.kind === 'NullValue') return null;
                      if (lit.kind !== 'StringValue') {
                        throw new Error(`${LTREE_SCALAR_NAME} must be a string`);
                      }
                      return lit.value;
                    }
                  }),
                  `LtreeCodecPlugin registering ${LTREE_SCALAR_NAME} scalar`
                );
                setGraphQLTypeForPgCodec(codec, 'input', LTREE_SCALAR_NAME);
                setGraphQLTypeForPgCodec(codec, 'output', LTREE_SCALAR_NAME);
              }
            } else if (codec.name === 'lquery' || codec.name === 'ltxtquery') {
              if (!hasGraphQLTypeForPgCodec(codec, 'input')) {
                setGraphQLTypeForPgCodec(codec, 'input', GraphQLString.name);
              }
              if (!hasGraphQLTypeForPgCodec(codec, 'output')) {
                setGraphQLTypeForPgCodec(codec, 'output', GraphQLString.name);
              }
            }
          }

          return _;
        }
      }
    },

    entityBehavior: {
      pgCodecAttribute: {
        inferred: {
          after: ['default'],
          provides: ['ltreeCodecPlugin'],
          callback(behavior: any, [codec, attributeName]: [any, string]) {
            const attr = codec.attributes?.[attributeName];
            const attrCodec = attr?.codec;
            const isLtree =
              attrCodec?.name === 'ltree' ||
              attrCodec?.extensions?.pg?.name === 'ltree';
            if (!isLtree) return behavior;

            return [
              behavior,
              'attribute:select',
              'attribute:base',
              'condition:attribute:filterBy'
            ] as any;
          }
        }
      }
    }
  }
};
