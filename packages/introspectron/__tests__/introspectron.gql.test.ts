process.env.LOG_SCOPE = 'introspectron';

import { getConnections, GraphQLQueryFn, seed } from 'graphile-test';
import { join } from 'path';

import { IntrospectionQuery } from '../src';
import type { IntrospectionField,IntrospectionQueryResult } from '../src/gql-types';

const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;

beforeAll(async () => {
  ({ query, teardown } = await getConnections(
    {
      schemas: ['introspectron']
    },
    [seed.sqlfile([sql('test.sql')])]
  ));
});

afterAll(() => teardown());

let introspection: IntrospectionQueryResult;

beforeEach(async () => {
  const res = await query<IntrospectionQueryResult>(IntrospectionQuery);

  if (res.errors) {
    console.error(res.errors);
    throw new Error('GraphQL introspection query failed');
  }

  introspection = res.data as IntrospectionQueryResult;
});

it('includes basic root types', () => {
  const typeNames = introspection.__schema.types.map((t) => t.name);
  expect(typeNames).toContain('Query');
  expect(typeNames).toContain('String');
});

it('includes standard GraphQL directives', () => {
  const directiveNames = introspection.__schema.directives.map((d) => d.name);
  expect(directiveNames).toContain('skip');
  expect(directiveNames).toContain('include');
  expect(directiveNames).toContain('deprecated');
});

it('includes fields with arguments', () => {
  const testType = introspection.__schema.types.find((t) => t.name === 'Query');
  expect(testType?.fields?.length).toBeGreaterThan(0);

  const fieldWithArgs = testType?.fields?.find(
    (f: IntrospectionField) => f.args && f.args.length > 0
  );
  expect(fieldWithArgs).toBeDefined();
});

it('has stable structure', () => {
  const schema = introspection.__schema;
  expect(schema.queryType?.name).toBe('Query');
  expect(Array.isArray(schema.types)).toBe(true);
  expect(schema.types.length).toBeGreaterThan(5);
});
