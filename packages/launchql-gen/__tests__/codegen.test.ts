process.env.LOG_SCOPE = 'launchql-codegen';

import { getConnections, GraphQLQueryFn, seed } from 'launchql-test';
import { print } from 'graphql';
import { IntrospectionQuery, IntrospectionQueryResult, parseGraphQuery } from 'introspectron';
import { join } from 'path';

import { generate, GqlMap } from '../src';
import { generateKeyedObjFromIntrospection } from '../test-utils/generate-from-introspection';

const sql = (f: string) => join(__dirname, '../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let introspection: IntrospectionQueryResult;

beforeAll(async () => {
  ({ query, teardown } = await getConnections(
    {
      schemas: ['launchql_gen']
    },
    [seed.sqlfile([sql('test.sql')])]
  ));
});

afterAll(() => teardown());

beforeAll(async () => {
  const res = await query(IntrospectionQuery);

  if (res.errors) {
    console.error(res.errors);
    throw new Error('GraphQL introspection query failed');
  }

  introspection = res.data as IntrospectionQueryResult;
});

it('generates output', () => {

  const { queries, mutations } = parseGraphQuery(introspection);
  const gqlMap: GqlMap = { ...queries, ...mutations };
  const gen = generate(gqlMap);
  const output = Object.keys(gen).reduce<Record<string, string>>((acc, key) => {
    const entry = gen[key];
    if (entry?.ast) {
      // @ts-ignore
      acc[key] = print(entry.ast);
    }
    return acc;
  }, {});

  expect(output).toMatchSnapshot();

});

it('helper method', () => {
  expect(introspection).toBeDefined();
  const output = generateKeyedObjFromIntrospection(introspection);
  expect(output).toMatchSnapshot();
});