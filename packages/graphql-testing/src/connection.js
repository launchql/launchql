import { GraphQLTest } from './tester';
import { getConnections as getC, closeConnections } from '../conn';

export const getConnections = async ([pub, priv], getService) => {
  const { api, admin, db, conn, auth } = await getC([pub, priv]);
  const { setup, teardown, graphQL } = GraphQLTest(
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
    graphQL
  };
};
