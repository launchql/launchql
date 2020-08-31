import { prompt } from 'inquirerer';
import { deleteFieldMutation, getTablesQuery } from '../../graphql';
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
  const field1 = await getAny(
    client,
    {
      key: 'field',
      message: `${table1.name} field to remove:`,
      nodes: table1.fields.nodes
    },
    args
  );
  const result = await client.request(deleteFieldMutation, {
    id: field1.id
  });
  console.log(JSON.stringify(result, null, 2));
};
