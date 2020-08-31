import { prompt } from 'inquirerer';
import { getDatabase, getTable } from '../../prompts';
import { getTablesQuery, createFieldMutation } from '../../graphql';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const tables = await client.request(getTablesQuery, {
    databaseId: db.id
  });
  const table = await getTable(client, tables.tables, args);
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
  const payload = {
    tableId: table.id,
    name,
    type
  };
  if (name === 'id' && type === 'uuid') {
    payload.defaultValue = 'uuid_generate_v4()';
  }
  const final = await client.request(createFieldMutation, payload);
  console.log(JSON.stringify(final, null, 2));
};
