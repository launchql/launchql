process.env.LOG_SCOPE = 'pgsql-test';
import path from 'path';

import { getConnections } from '../src/connect';
import { seed } from '../src/seed';
import { PgTestClient } from '../src/test-client';

const sql = (file: string) => path.resolve(__dirname, '../sql', file);

let pg: PgTestClient;
let teardown: () => Promise<void>;

const usedDbNames: string[] = [];
const testResults: { name: string; time: number }[] = [];

let start: number;
let totalStart: number;


beforeAll(async () => {
  totalStart = Date.now();

  ({ pg, teardown } = await getConnections({}, [
    seed.sqlfile([
      sql('test.sql')
    ])
  ]));

  usedDbNames.push(pg.config.database);
});

beforeEach(async () => {
  await pg.beforeEach();
  start = Date.now();
});

afterEach(async () => {
  const elapsed = Date.now() - start;
  const name = expect.getState().currentTestName ?? 'unknown';
  testResults.push({ name, time: elapsed });

  await pg.afterEach();
});

afterAll(async () => {
  await teardown();

  const totalTime = Date.now() - totalStart;
  const avg =
    testResults.reduce((sum, r) => sum + r.time, 0) / testResults.length;

  const summaryLines = [
    `🧪 Rollback DB Benchmark`,
    `📂 DB Used: ${usedDbNames[0]}`,
    `⏱️ Test Timings:`,
    ...testResults.map(({ name, time }) => `  • ${name}: ${time}ms`),
    `🏁 Average Test Time: ${avg.toFixed(2)}ms`,
    `🕒 Total Test Time: ${totalTime}ms`
  ];

  console.log('\n' + summaryLines.join('\n') + '\n');
});

describe('Rollback DB Benchmark', () => {
  it('inserts Alice', async () => {
    await pg.query(`INSERT INTO app_public.users (username) VALUES ('alice')`);
    const res = await pg.query(`SELECT COUNT(*) FROM app_public.users`);
    expect(res.rows[0].count).toBe('1');
  });

  it('starts clean without Alice', async () => {
    const res = await pg.query(`SELECT * FROM app_public.users WHERE username = 'alice'`);
    expect(res.rows).toHaveLength(0);
  });

  it('inserts Bob, settings should be empty', async () => {
    await pg.query(`INSERT INTO app_public.users (username) VALUES ('bob')`);
    const settings = await pg.query(`SELECT * FROM app_public.user_settings`);
    expect(settings.rows).toHaveLength(0);
  });
});
