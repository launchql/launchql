import { getSchemataQuery } from '../../graphql';
import { getDatabase } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);
  const final = await client.request(getSchemataQuery, {
    databaseId: db.id
  });

  final.schemata.nodes.forEach((el) => {
    console.log(`\n${el.name}:\n`);
    console.log(JSON.stringify(el, null, 2));
  });
};
