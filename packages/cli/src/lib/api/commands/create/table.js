import { prompt } from 'inquirerer';
import { getSchemataQuery, createTableMutation } from '../../graphql';
import { getDatabase, getSchema } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const result = await client.request(getSchemataQuery, {
    databaseId: db.id
  });

  // apparently you dont have schemaId on tables...
  const schema = await getSchema(client, result.schemata, args);
  let isVisible = false;
  if (schema.name !== 'public') {
    isVisible = true;
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

  const final = await client.request(createTableMutation, {
    databaseId: db.id,
    name: table,
    isVisible
  });
  console.log(JSON.stringify(final, null, 2));
};
