import { getTablesQuery } from '../../graphql';
import { getDatabase, getTable } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const tables = await client.request(getTablesQuery, {
    databaseId: db.id
  });

  const table = await getTable(client, tables.tables, args);

  tables.tables.nodes.forEach((el) => {
    if (el.id !== table.id) return;
    console.log(`\n${el.name}:`);
    el.fields.nodes.forEach((field) => {
      console.log(`   ${field.name}: ${field.type}`);
    });
  });
};
