import { GraphQLTest } from './tester';
import { getApi, closeConnections } from '@launchql/db-testing';

export const getConnections = async ([pub, priv], getService) => {
  const { api, admin, db, conn, auth } = await getApi([pub, priv]);
  const { setup, teardown, graphQL, graphQLQuery } = GraphQLTest(
    getService({ dbname: db.client.database })
  );
  await setup();

  const td = async () => {
    await teardown();
    await closeConnections({ db, conn });
  };

  return {
    api,
    admin,
    db,
    conn,
    auth,
    setup,
    teardown: td,
    graphQL,
    graphQLQuery
  };
};
