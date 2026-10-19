// Type augmentation: adds the 'schema' property to GraphileConfig.Plugin
import 'graphile-build';

import type {} from 'graphile-build-pg';
import type { GraphileConfig } from 'graphile-config';
import type { GraphQLSchema } from 'graphql';

import { allowedValuesForAttribute } from './check-constraint-values';
import { extendQueryWithMetaField } from './graphql-meta-field';
import { collectTablesMeta } from './table-meta-builder';
import type { MetaBuild, TableMeta } from './types';

declare global {
  namespace DataplanPg {
    interface PgCodecAttributeExtensions {
      /** Values permitted by the column's simple CHECK constraints. */
      allowedValues?: string[];
    }
  }
}

const runtimeTablesBySchema = new WeakMap<GraphQLSchema, TableMeta[]>();

function getRuntimeTablesMeta(
  build: MetaBuild,
  schema: GraphQLSchema
): TableMeta[] {
  let tables = runtimeTablesBySchema.get(schema);
  if (!tables) {
    tables = collectTablesMeta(build, schema);
    runtimeTablesBySchema.set(schema, tables);
  }
  return tables;
}

/**
 * Returns the table metadata memoized for the given executable schema, or
 * `undefined` if `_meta` has not been resolved against that schema (e.g. the
 * meta plugin is disabled or `_meta` was never executed).
 */
export function getTablesMetaForSchema(
  schema: GraphQLSchema
): TableMeta[] | undefined {
  return runtimeTablesBySchema.get(schema);
}

export const MetaSchemaPlugin: GraphileConfig.Plugin = {
  name: 'MetaSchemaPlugin',
  version: '1.0.0',
  description: 'Exposes _meta query for database schema introspection',
  gather: {
    hooks: {
      // Record each column's CHECK-constraint values on the codec attribute, from
      // the introspection the gather phase already holds (conbin), so _meta can
      // report them without querying the database.
      pgCodecs_attribute(_info, event) {
        const { pgClass, pgAttribute, attribute } = event;
        const allowedValues = allowedValuesForAttribute(
          pgClass.getConstraints(),
          pgAttribute.attnum
        );
        if (!allowedValues) return;
        attribute.extensions = { ...attribute.extensions, allowedValues };
      },
    },
  },
  schema: {
    hooks: {
      GraphQLObjectType_fields(rawFields, rawBuild, rawContext) {
        if (!rawContext.scope.isRootQuery) return rawFields;
        const build = rawBuild as unknown as MetaBuild;
        return extendQueryWithMetaField(
          rawFields as unknown as Record<string, unknown>,
          (schema) => getRuntimeTablesMeta(build, schema),
        ) as typeof rawFields;
      },
    },
  },
};
