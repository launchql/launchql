import { GraphQLTest } from './tester';
import {
  getApi,
  getConnections as getC,
  closeConnections
} from '@launchql/db-testing';

export const getConnectionsApi = async ([pub, priv], getService) => {
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

export const getConnections = async (schemas, getService) => {
  const { db, conn, teardown: t1 } = await getC();
  const { setup, teardown: t2, graphQL, graphQLQuery } = GraphQLTest(
    getService({ dbname: db.client.database })
  );
  await setup();

  const td = async () => {
    await t1();
    await t2();
  };

  return {
    db,
    conn,
    setup,
    teardown: td,
    graphQL,
    graphQLQuery
  };
};

export const getQuery = async (dbname, schemas, getService) => {
  const { setup, teardown, graphQL, graphQLQuery } = GraphQLTest(
    getService({ dbname })
  );
  await setup();

  return {
    setup,
    teardown,
    graphQL,
    graphQLQuery
  };
};
