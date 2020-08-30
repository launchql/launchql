import { exec } from 'child_process';
import { prompt } from 'inquirerer';
import {
  DatabasesQuery,
  SchemataQuery,
  TablesQuery,
  CreateDatabaseMutation,
  CreateTableMutation,
  CreateFieldMutation
} from './queries/index';

import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

const getDatabase = async (client, args) => {
  const result = await client.request(DatabasesQuery);

  const database = await prompt(
    [
      {
        type: 'autocomplete',
        name: 'database',
        message: 'enter a database name',
        source: makeSearch(
          result.databases.nodes.map((n) => {
            //   return { name: n.name, value: n.id };
            return n.name;
          })
        ),
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

const getSchema = async (client, schemata, args) => {
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

const getTable = async (client, tables, args) => {
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

// later make this generated from folders/files nested
export const functions = {
  create: {
    field: async (client, args) => {
      const db = await getDatabase(client, args);
      const result = await client.request(SchemataQuery, {
        databaseId: db.id
      });
      console.log(db);
      // apparently you dont have schemaId on tables...
      const schema = await getSchema(client, result.schemata, args);
      console.log(schema);
      let pub = false;
      if (schema.name !== 'public') {
        pub = true;
      }

      const tables = await client.request(TablesQuery, {
        databaseId: db.id
      });
      console.log('dbid', db.id);
      const table = await getTable(client, tables.tables, args);
      console.log(schema);

      console.log({ table });
      const { name, type } = await prompt(
        [
          {
            type: 'string',
            name: 'name',
            message: 'enter a field name',
            required: true
          },
          {
            type: 'string',
            name: 'type',
            message: 'enter a field type',
            required: true
          }
        ],
        args
      );

      const final = await client.request(CreateFieldMutation, {
        tableId: table.id,
        name,
        type
      });
      console.log(JSON.stringify(final, null, 2));
    },
    table: async (client, args) => {
      const db = await getDatabase(client, args);
      const result = await client.request(SchemataQuery, {
        databaseId: db.id
      });
      // apparently you dont have schemaId on tables...
      const schema = await getSchema(client, result.schemata, args);
      console.log(schema);
      let pub = false;
      if (schema.name !== 'public') {
        pub = true;
      }

      const { table } = await prompt(
        [
          {
            type: 'string',
            name: 'table',
            message: 'enter a table name',
            required: true
          }
        ],
        args
      );

      const final = await client.request(CreateTableMutation, {
        databaseId: db.id,
        name: table
      });
      console.log(JSON.stringify(final, null, 2));
    },
    database: async (client, args) => {
      const { database } = await prompt(
        [
          {
            type: 'string',
            name: 'database',
            message: 'enter a database name',
            required: true
          }
        ],
        args
      );

      const result = await client.request(CreateDatabaseMutation, {
        name: database
      });
      console.log(JSON.stringify(result, null, 2));
    }
  },
  schema: {
    list: async (client, args) => {
      const db = await getDatabase(client, args);
      const final = await client.request(SchemataQuery, {
        databaseId: db.id
      });

      console.log(JSON.stringify({ final }, null, 2));
    }
  },
  table: {
    list: async (client, args) => {
      const db = await getDatabase(client, args);
      const result = await client.request(SchemataQuery, {
        databaseId: db.id
      });
      // apparently you dont have schemaId on tables...
      const schema = await getSchema(client, result.schemata, args);
      console.log(schema);

      const tables = await client.request(TablesQuery, {
        databaseId: db.id
      });

      console.log(tables.tables.nodes);
    }
  },
  database: {
    list: async (client, args) => {
      console.log({ args });
      const result = await client.request(DatabasesQuery);
      console.log(JSON.stringify(result, null, 2));
    },
    info: async (client, args) => {
      console.log({ args });
      const result = await client.request(DatabasesQuery);
      console.log(JSON.stringify(result, null, 2));
    }
  }
};

export const questions = Object.keys(functions).reduce((m, v) => {
  const srch = Object.keys(functions[v]);
  if (srch.length) {
    m[v] = [
      {
        _: true,
        type: 'autocomplete',
        name: 'action',
        message: 'which action?',
        source: makeSearch(srch)
      }
    ];
  }

  return m;
}, {});

export const objects = Object.keys(questions);
