import {
  getSchemataQuery,
  getSqlActionsQuery,
  getServicesQuery
} from '../../graphql';
import { getDatabase } from '../../prompts';

export default async (ctx, args) => {
  const db = await getDatabase(ctx.db, args);

  console.log(db);

  const schemata = await ctx.db.request(getSchemataQuery, {
    databaseId: db.id
  });

  console.log(schemata.schemata.nodes);

  console.log(getSqlActionsQuery);

  const actions = await ctx.migrate.request(getSqlActionsQuery, {
    databaseId: db.id
  });

  console.log(actions.sqlActions.nodes);

  const services = await ctx.svc.request(getServicesQuery, {
    databaseId: db.id
  });

  console.log(services.services.nodes);

  // TODO migrate db-migrate to here
};
