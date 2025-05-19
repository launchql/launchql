// process.env.LOG_LEVEL='success';
process.env.LOG_SCOPE='graphile-test';
// process.env FIRST!

import { getConnections } from '../src/connect';
import { IntrospectionQuery } from '../test-utils/queries';
import { snapshot } from '../src';
import { seed } from 'pgsql-test';
import { join } from 'path';

const schemas = ['app_public'];
const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let graphQL: any;

beforeAll(async () => {
  ({ graphQL, teardown } = await getConnections({
    schemas,
    authRole: 'postgres'
  }, [
    seed.sqlfile([
      sql('test.sql')
    ])
  ]));
});

afterAll(async () => {
  await teardown();
});

it('introspection works', async () => {
  await graphQL(async (query: any) => {
    const data = await query(IntrospectionQuery);
    // console.log(JSON.stringify(data));
    expect(snapshot(data)).toMatchSnapshot();
  });
});
