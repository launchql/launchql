import type { GraphQLQueryFnObj, GraphQLTestContext } from 'graphile-test';
import { getConnectionsObject, seed } from 'graphile-test';
import { buildClientSchema, getIntrospectionQuery } from 'graphql';
import { join } from 'path';
import type { PgTestClient } from 'pgsql-test/test-client';
import ConnectionFilterPlugin from 'graphile-plugin-connection-filter';

import PostGraphileFulltextFilterPlugin from '../src';

const SCHEMA = 'fulltext_test';
const sql = (f: string) => join(__dirname, '../sql', f);

let db: PgTestClient;
let pg: PgTestClient;
let query: GraphQLQueryFnObj;
let teardown: () => Promise<void>;
let gqlContext: GraphQLTestContext;
let schema: any;

beforeAll(async () => {
  const connections = await getConnectionsObject(
    {
      schemas: [SCHEMA],
      graphile: {
        overrideSettings: {
          appendPlugins: [ConnectionFilterPlugin, PostGraphileFulltextFilterPlugin],
          graphileBuildOptions: {
            connectionFilterRelations: true
          }
        }
      }
    },
    [
      seed.sqlfile([
        sql('schema.sql')
      ])
    ]
  );

  ({ db, pg, query, teardown, gqlContext } = connections);

  // Create all tables needed for tests
  await pg.query(`
    -- Basic job table
    DROP TABLE IF EXISTS ${SCHEMA}.job CASCADE;
    CREATE TABLE ${SCHEMA}.job (
      id serial primary key,
      name text not null,
      full_text tsvector,
      other_full_text tsvector
    );
    GRANT ALL ON TABLE ${SCHEMA}.job TO public;
    GRANT ALL ON SEQUENCE ${SCHEMA}.job_id_seq TO public;

    -- Tables for connectionFilterRelations tests
    DROP TABLE IF EXISTS ${SCHEMA}.orders CASCADE;
    DROP TABLE IF EXISTS ${SCHEMA}.clients CASCADE;
    CREATE TABLE ${SCHEMA}.clients (
      id serial primary key,
      comment text,
      tsv tsvector
    );
    CREATE TABLE ${SCHEMA}.orders (
      id serial primary key,
      client_id integer references ${SCHEMA}.clients (id),
      comment text,
      tsv tsvector
    );
    GRANT ALL ON TABLE ${SCHEMA}.clients TO public;
    GRANT ALL ON TABLE ${SCHEMA}.orders TO public;
    GRANT ALL ON SEQUENCE ${SCHEMA}.clients_id_seq TO public;
    GRANT ALL ON SEQUENCE ${SCHEMA}.orders_id_seq TO public;
  `);

  // Generate GraphQL schema once
  await gqlContext.setup();
  
  // Get schema for snapshot testing via introspection query
  const introspectionResult = await query({
    query: getIntrospectionQuery()
  });
  
  if (introspectionResult.data) {
    schema = buildClientSchema(introspectionResult.data as any);
  }
});

beforeEach(() => db.beforeEach());
afterEach(() => db.afterEach());
afterAll(async () => {
  await teardown();
});

it('table with unfiltered full-text field works', async () => {
    // Insert data
    await db.query(`
      insert into ${SCHEMA}.job (name, full_text) values 
        ('test', to_tsvector('apple fruit')), 
        ('test 2', to_tsvector('banana fruit'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const result = await query({
      query: `
        query {
          allJobs {
            nodes {
              id
              name
            }
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.allJobs.nodes).toHaveLength(2);
  });

  it('fulltext search field is created', async () => {
    await db.query(`
      insert into ${SCHEMA}.job (name, full_text) values 
        ('test', to_tsvector('apple fruit')), 
        ('test 2', to_tsvector('banana fruit'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const result = await query({
      query: `
        query {
          allJobs(
            filter: {
              fullText: {
                matches: "fruit"
              }
            }
            orderBy: [
              FULL_TEXT_RANK_ASC 
            ]
          ) {
            nodes {
              id
              name
              fullTextRank
            }
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    const data = result.data?.allJobs.nodes;
    expect(data).toHaveLength(2);
    data?.forEach((n: any) => expect(n.fullTextRank).not.toBeNull());

    const bananaResult = await query({
      query: `
        query {
          allJobs(
            filter: {
              fullText: {
                matches: "banana"
              }
            }
          ) {
            nodes {
              id
              name
              fullTextRank
            }
          }
        }
      `
    });

    expect(bananaResult.errors).toBeUndefined();
    const bananaData = bananaResult.data?.allJobs.nodes;
    expect(bananaData).toHaveLength(1);
    bananaData?.forEach((n: any) => expect(n.fullTextRank).not.toBeNull());
  });

  it('querying rank without filter works', async () => {
    await db.query(`
      insert into ${SCHEMA}.job (name, full_text) values 
        ('test', to_tsvector('apple fruit')), 
        ('test 2', to_tsvector('banana fruit'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const result = await query({
      query: `
        query {
          allJobs {
            nodes {
              id
              name
              fullTextRank
            }
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    const data = result.data?.allJobs.nodes;
    expect(data).toHaveLength(2);
    data?.forEach((n: any) => expect(n.fullTextRank).toBeNull());
  });

  it('fulltext search with multiple fields works', async () => {
    await db.query(`
      insert into ${SCHEMA}.job (name, full_text, other_full_text) values 
        ('test', to_tsvector('apple fruit'), to_tsvector('vegetable potato')), 
        ('test 2', to_tsvector('banana fruit'), to_tsvector('vegetable pumpkin'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const result = await query({
      query: `
        query {
          allJobs(
            filter: {
              fullText: {
                matches: "fruit"
              }
              otherFullText: {
                matches: "vegetable"
              }
            }
            orderBy: [
              FULL_TEXT_RANK_ASC
              OTHER_FULL_TEXT_DESC
            ]
          ) {
            nodes {
              id
              name
              fullTextRank
              otherFullTextRank
            }
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    const data = result.data?.allJobs.nodes;
    expect(data).toHaveLength(2);
    data?.forEach((n: any) => {
      expect(n.fullTextRank).not.toBeNull();
      expect(n.otherFullTextRank).not.toBeNull();
    });

    const potatoResult = await query({
      query: `
        query {
          allJobs(
            filter: {
              otherFullText: {
                matches: "potato"
              }
            }
          ) {
            nodes {
              id
              name
              fullTextRank
              otherFullTextRank
            }
          }
        }
      `
    });

    expect(potatoResult.errors).toBeUndefined();
    const potatoData = potatoResult.data?.allJobs.nodes;
    expect(potatoData).toHaveLength(1);
    potatoData?.forEach((n: any) => {
      expect(n.fullTextRank).toBeNull();
      expect(n.otherFullTextRank).not.toBeNull();
    });
  });

  it('sort by full text rank field works', async () => {
    await db.query(`
      insert into ${SCHEMA}.job (name, full_text) values 
        ('test', to_tsvector('apple fruit')), 
        ('test 2', to_tsvector('banana fruit'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const ascResult = await query({
      query: `
        query orderByQuery($orderBy: [JobsOrderBy!]!) {
          allJobs(
            filter: {
              fullText: {
                matches: "fruit | banana"
              }
            }
            orderBy: $orderBy
          ) {
            nodes {
              id
              name
              fullTextRank
            }
          }
        }
      `,
      variables: { orderBy: ['FULL_TEXT_ASC'] }
    });

    expect(ascResult.errors).toBeUndefined();

    const descResult = await query({
      query: `
        query orderByQuery($orderBy: [JobsOrderBy!]!) {
          allJobs(
            filter: {
              fullText: {
                matches: "fruit | banana"
              }
            }
            orderBy: $orderBy
          ) {
            nodes {
              id
              name
              fullTextRank
            }
          }
        }
      `,
      variables: { orderBy: ['FULL_TEXT_DESC'] }
    });

    expect(descResult.errors).toBeUndefined();
    expect(ascResult.data).not.toEqual(descResult.data);
  });

  it('works with connectionFilterRelations', async () => {
    // TODO: This test requires connectionFilterRelations to be enabled
    await db.query(`
      insert into ${SCHEMA}.clients (id, comment, tsv) values
        (1, 'Client A', to_tsvector('fruit apple')),
        (2, 'Client Z', to_tsvector('fruit avocado'));
      
      insert into ${SCHEMA}.orders (id, client_id, comment, tsv) values
        (1, 1, 'X', to_tsvector('fruit apple')),
        (2, 1, 'Y', to_tsvector('fruit pear apple')),
        (3, 1, 'Z', to_tsvector('vegetable potato')),
        (4, 2, 'X', to_tsvector('fruit apple')),
        (5, 2, 'Y', to_tsvector('fruit tomato')),
        (6, 2, 'Z', to_tsvector('vegetable'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const result = await query({
      query: `
        query {
          allOrders(filter: {
            or: [
              { comment: { includes: "Z"} },
              { clientByClientId: { tsv: { matches: "apple" } } }
            ]
          }) {
            nodes {
              id
              comment
              clientByClientId {
                id
                comment
              }
            }
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    // OR condition: { comment: { includes: "Z"} } OR { clientByClientId: { tsv: { matches: "apple" } } }
    // Matches: id 3, 6 (comment includes "Z") OR id 1, 2, 3 (client has "apple")
    // Result: id 1, 2, 3, 6 (4 results)
    expect(result.data?.allOrders.nodes).toHaveLength(4);
  });

  it('works with connectionFilterRelations with no local filter', async () => {
    // TODO: This test requires connectionFilterRelations to be enabled
    await db.query(`
      insert into ${SCHEMA}.clients (id, comment, tsv) values
        (1, 'Client A', to_tsvector('fruit apple')),
        (2, 'Client Z', to_tsvector('fruit avocado'));
      
      insert into ${SCHEMA}.orders (id, client_id, comment, tsv) values
        (1, 1, 'X', to_tsvector('fruit apple')),
        (2, 1, 'Y', to_tsvector('fruit pear apple')),
        (3, 1, 'Z', to_tsvector('vegetable potato')),
        (4, 2, 'X', to_tsvector('fruit apple')),
        (5, 2, 'Y', to_tsvector('fruit tomato')),
        (6, 2, 'Z', to_tsvector('vegetable'));
    `);

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const result = await query({
      query: `
        query {
          allOrders(filter: {
            clientByClientId: { tsv: { matches: "avocado" } }
          }) {
            nodes {
              id
              comment
              tsv
              clientByClientId {
                id
                comment
                tsv
              }
            }
          }
        }
      `
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.allOrders.nodes).toHaveLength(3);
  });
