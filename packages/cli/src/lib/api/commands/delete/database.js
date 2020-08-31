import { prompt } from 'inquirerer';
import { deleteDatabaseMutation } from '../../graphql';
import { getDatabase } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);

  const result = await client.request(deleteDatabaseMutation, {
    id: db.id
  });
  console.log(JSON.stringify(result, null, 2));
};
