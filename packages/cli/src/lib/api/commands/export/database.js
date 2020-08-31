import {
  getSchemataQuery,
  getSqlActionsQuery,
  getServicesQuery
} from '../../graphql';
import { getDatabase, getTable } from '../../prompts';
import { lqlEnv } from '../../env';
import { GraphQLClient } from 'graphql-request';

export default async (client, args) => {
  const db = await getDatabase(client, args);

  const env = await lqlEnv();
  const migrationClient = new GraphQLClient(env.MIGRATE_GRAPHQL_URL);
  const serviceClient = new GraphQLClient(env.SERVICE_GRAPHQL_URL);

  console.log(db);

  const schemata = await client.request(getSchemataQuery, {
    databaseId: db.id
  });

  console.log(schemata.schemata.nodes);

  console.log(getSqlActionsQuery);

  const actions = await migrationClient.request(getSqlActionsQuery, {
    databaseId: db.id
  });

  console.log(actions.sqlActions.nodes);

  const services = await serviceClient.request(getServicesQuery, {
    databaseId: db.id
  });

  console.log(services.services.nodes);

  // TODO migrate db-migrate to here
};
