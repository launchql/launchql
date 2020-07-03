import { GraphQLTest } from './tester';
import {
  getApi,
  getConnections as getC,
  closeConnections
} from '@launchql/db-testing';

export const getConnectionsApi = async ([pub, priv], getService) => {
  const { api, admin, db, conn, teardown: t1 } = await getApi([pub, priv]);
  const { setup, teardown: t2, graphQL, graphQLQuery } = GraphQLTest(
    getService({ dbname: db.client.database })
  );
  await setup();

  const td = async () => {
    await t2();
    // do last
    await t1();
  };

  return {
    api,
    admin,
    db,
    conn,
    teardown: td,
    graphQL,
    graphQLQuery
  };
};

export const getConnections = async (getService) => {
  const { db, conn, teardown: t1 } = await getC();
  const { setup, teardown: t2, graphQL, graphQLQuery } = GraphQLTest(
    getService({ dbname: db.client.database })
  );
  await setup();

  const td = async () => {
    await t2();
    // do last
    await t1();
  };

  return {
    db,
    conn,
    teardown: td,
    graphQL,
    graphQLQuery
  };
};

export const getQuery = async (dbname, getService) => {
  const { setup, teardown, graphQL, graphQLQuery } = GraphQLTest(
    getService({ dbname })
  );
  await setup();

  return {
    teardown,
    graphQL,
    graphQLQuery
  };
};
