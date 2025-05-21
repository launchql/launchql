process.env.LOG_SCOPE='launchql-codegen';

import { getConnections, seed } from 'graphile-test';
import { join } from 'path';
import type { PgTestClient } from 'pgsql-test/test-client';

const sql = (f: string) => join(__dirname, '/../sql', f);

let teardown: () => Promise<void>;
let pg: PgTestClient;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections({
    schemas: ['codegen_test']
  },
    [
      seed.sqlfile([sql('test.sql')])
    ]
  ));
});

afterAll(() => teardown());

it('put tests here', async () => {

});