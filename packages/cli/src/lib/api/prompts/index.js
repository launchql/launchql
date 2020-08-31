import { prompt } from 'inquirerer';
import {
  getDatabasesQuery,
  getSchemataQuery,
  getTablesQuery,
  createDatabaseMutation,
  createTableMutation,
  createFieldMutation
} from '../graphql';

import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

export const getDatabase = async (client, args) => {
  const result = await client.request(getDatabasesQuery);
  const database = await prompt(
    [
      {
        type: 'autocomplete',
        name: 'database',
        message: 'enter a database name',
        source: makeSearch(result.databases.nodes.map((n) => n.name)),
        required: true
      }
    ],
    args
  );
  return result.databases.nodes.reduce((m, v) => {
    if (v.name === database.database) return v;
    return m;
  });
};

export const getSchema = async (client, schemata, args) => {
  const result = await prompt(
    [
      {
        type: 'autocomplete',
        name: 'schema',
        message: 'enter a schema name',
        source: makeSearch(schemata.nodes.map((n) => n.name)),
        required: true
      }
    ],
    args
  );

  return schemata.nodes.reduce((m, v) => {
    if (v.name === result.schema) return v;
    return m;
  });
};

export const getTable = async (client, tables, args) => {
  const result = await prompt(
    [
      {
        type: 'autocomplete',
        name: 'table',
        message: 'enter a table name',
        source: makeSearch(tables.nodes.map((n) => n.name)),
        required: true
      }
    ],
    args
  );

  return tables.nodes.reduce((m, v) => {
    if (v.name === result.table) return v;
    return m;
  });
};

export const getAny = async (client, ctx, args) => {
  const { key, nodes, nameKey = 'name' } = ctx;
  const message = ctx.message || `enter value for ${key}`;
  const result = await prompt(
    [
      {
        type: 'autocomplete',
        name: key,
        message,
        source: makeSearch(nodes.map((n) => n[nameKey])),
        required: true
      }
    ],
    args
  );

  return nodes.reduce((m, v) => {
    if (v[nameKey] === result[key]) return v;
    return m;
  });
};

export const getField = async (client, fields, args) => {
  const result = await prompt(
    [
      {
        type: 'autocomplete',
        name: 'field',
        message: 'enter a field name',
        source: makeSearch(fields.nodes.map((n) => n.name)),
        required: true
      }
    ],
    args
  );

  return fields.nodes.reduce((m, v) => {
    if (v.name === result.field) return v;
    return m;
  });
};
