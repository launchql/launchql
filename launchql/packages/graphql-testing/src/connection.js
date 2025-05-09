import { GraphQLTest } from './tester';
import { getConnections as getC } from '@launchql/db-testing';

export const getConnections = async ({ schemas, authRole }) => {
  const { db, conn, teardown: t1 } = await getC();
  const { setup, teardown: t2, graphQL, graphQLQuery } = GraphQLTest({
    dbname: db.client.database,
    schemas,
    authRole
  });
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

export const getQuery = async ({ dbname, schemas, authRole }) => {
  const { setup, teardown, graphQL, graphQLQuery } = GraphQLTest({
    dbname,
    schemas,
    authRole
  });
  await setup();

  return {
    teardown,
    graphQL,
    graphQLQuery
  };
};
