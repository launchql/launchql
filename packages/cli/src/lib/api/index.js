import { exec } from 'child_process';
import { prompt } from 'inquirerer';
import { DatabasesQuery, SchemataQuery, TablesQuery } from './queries/index';

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
    if (v.name === database) return v;
    return m;
  });
};

const getSchema = async (client, schemata, args) => {
  const result2 = await prompt(
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
    if (v.name === result2.schema) return v;
    return m;
  });
};

// later make this generated from folders/files nested
export const functions = {
  schema: {
    list: {
      args: async (client, args) => {
        return [];
      },
      func: async (client, args) => {
        const db = await getDatabase(client, args);
        const final = await client.request(SchemataQuery, {
          databaseId: db.id
        });

        console.log(JSON.stringify({ final }, null, 2));
      }
    }
  },
  table: {
    list: {
      args: async (client, args) => {},
      func: async (client, args) => {
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
    }
  },
  database: {
    list: {
      args: async (client, args) => {
        const result = await client.request(DatabasesQuery);

        return args;
      },
      func: async (client, args) => {
        console.log({ args });
        const result = await client.request(DatabasesQuery);
        console.log(JSON.stringify(result, null, 2));
      }
    },
    info: {
      args: async (client, args) => {
        return args;
      },
      func: async (client, args) => {
        console.log({ args });
        const result = await client.request(DatabasesQuery);
        console.log(JSON.stringify(result, null, 2));
      }
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
