import { prompt } from 'inquirerer';
import { deleteTableMutation, getTablesQuery } from '../../graphql';
import { getDatabase, getTable, getField, getAny } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const tables = await client.request(getTablesQuery, {
    databaseId: db.id
  });

  // const table1 = await getTable(client, tables.tables, args);
  const table1 = await getAny(
    client,
    {
      key: 'table',
      message: `table:`,
      nodes: tables.tables.nodes
    },
    args
  );
  console.log(table1.id);
  const result = await client.request(deleteTableMutation, {
    id: table1.id
  });
  console.log(JSON.stringify(result, null, 2));
};
