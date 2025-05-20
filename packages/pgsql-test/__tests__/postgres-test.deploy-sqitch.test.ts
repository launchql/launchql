process.env.LOG_SCOPE = 'pgsql-test';
import { resolve } from 'path';
import { PgTestClient } from '../src/test-client';
import { getConnections } from '../src/connect';
import { getRootPgPool } from '@launchql/server-utils';
import { seed } from '../src';

let pg: PgTestClient;
let teardown: () => Promise<void>;

const usedDbNames: string[] = [];
const testResults: { name: string; time: number }[] = [];

let start: number;
let totalStart: number;

beforeAll(async () => {
    totalStart = Date.now();
    const cwd = resolve(__dirname + '/../../../__fixtures__/sqitch/simple/packages/my-third');
    ({ pg, teardown } = await getConnections({}, [
        seed.sqitch(cwd)
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

    // clear this DB first! so teardown() doesn't choke...a
    const pgPool = getRootPgPool({ ...pg.config, database: pg.config.database });
    await pgPool.end();

    await teardown();

    const avg =
        testResults.reduce((sum, r) => sum + r.time, 0) / testResults.length;

    const totalTime = Date.now() - totalStart;

    const summaryLines = [
        `🧪 LaunchQL Deploy (sqtich) DB Benchmark`,
        `📂 DB Used: ${usedDbNames[0]}`,
        `⏱️ Test Timings:`,
        ...testResults.map(({ name, time }) => `  • ${name}: ${time}ms`),
        `🏁 Average Test Time: ${avg.toFixed(2)}ms`,
        `🕒 Total Test Time: ${totalTime}ms`
    ];

    console.log('\n' + summaryLines.join('\n') + '\n');
});

describe('Sqitch DB Benchmark', () => {
    it('inserts Alice', async () => {
      await pg.query(`INSERT INTO myapp.users (username, email) VALUES ('alice', 'alice@example.com')`);
      const res = await pg.query(`SELECT COUNT(*) FROM myapp.users`);
      expect(res.rows[0].count).toBe('1');
    });
  
    it('starts clean without Alice', async () => {
      const res = await pg.query(`SELECT * FROM myapp.users WHERE username = 'alice'`);
      expect(res.rows).toHaveLength(0);
    });
  
    it('inserts Bob with email', async () => {
      await pg.query(`INSERT INTO myapp.users (username, email) VALUES ('bob', 'bob@example.com')`);
      const res = await pg.query(`SELECT * FROM myapp.users WHERE username = 'bob'`);
      expect(res.rows[0].email).toBe('bob@example.com');
    });
  });
  