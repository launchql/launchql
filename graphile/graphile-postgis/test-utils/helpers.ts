import {
  buildASTSchema,
  buildClientSchema,
  getIntrospectionQuery,
  parse,
  printSchema,
  type IntrospectionQuery
} from 'graphql';
import { join } from 'path';
import type { GraphQLSchema } from 'graphql';
import type { GraphQLQueryFn } from 'graphile-test';
import { getConnections, seed } from 'graphile-test';

import PostgisPlugin from '../src';

export const sql = (file: string): string => join(__dirname, '../sql', file);

export const printSchemaOrdered = (originalSchema: GraphQLSchema): string => {
  // Clone schema so we don't mutate it
  const schema = buildASTSchema(parse(printSchema(originalSchema)));

  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach((name) => {
    const gqlType = typeMap[name];

    // Object?
    if ('getFields' in gqlType && typeof gqlType.getFields === 'function') {
      const fields = gqlType.getFields();
      const keys = Object.keys(fields).sort();
      keys.forEach((key) => {
        const value = fields[key] as { args?: Array<{ name: string }> };

        // Move the key to the end of the object
        delete fields[key];
        fields[key] = value as never;

        // Sort args
        if (Array.isArray(value.args)) {
          value.args.sort((a: { name: string }, b: { name: string }) =>
            a.name.localeCompare(b.name)
          );
        }
      });
    }

    // Enum?
    if ('getValues' in gqlType && typeof gqlType.getValues === 'function') {
      gqlType.getValues().sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  return printSchema(schema);
};

export const getSchemaSnapshot = async (
  query: GraphQLQueryFn
): Promise<string> => {
  const result = await query<IntrospectionQuery>(getIntrospectionQuery());
  if (!result.data) {
    throw new Error('No data returned from introspection query');
  }
  const schema = buildClientSchema(result.data);
  return printSchemaOrdered(schema);
};

export const createConnectionsForSchema = (schemaName: string) =>
  getConnections(
    {
      schemas: [schemaName],
      authRole: 'authenticated',
      graphile: {
        overrideSettings: {
          appendPlugins: [PostgisPlugin]
        }
      }
    },
    [seed.sqlfile([sql('schema.sql')])]
  );
