import { getTablesQuery, getSchemataQuery } from '../../graphql';
import { getDatabase, getTable } from '../../prompts';

export default async (client, args) => {
  const db = await getDatabase(client, args);

  console.log(db);

  const schemata = await client.request(getSchemataQuery, {
    databaseId: db.id
  });

  console.log(schemata.schemata.nodes);

  // TODO migrate db-migrate to here
};
