process.env.LOG_SCOPE = 'pgsql-test';
import { randomUUID } from 'crypto';
import path from 'path';
import { getPgEnvOptions } from 'pg-env';

import { DbAdmin } from '../src/admin';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

const sql = (file: string) => path.resolve(__dirname, '../sql', file);

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

const TEMPLATE_NAME = 'test_template';
const SEED_DB_TO_CREATE_TEMPLATE = `postgres_test_${randomUUID()}`;

const usedDbNames: string[] = [];
const testResults: { name: string; time: number }[] = [];

let start: number;
let totalStart: number;

function setupTemplateDatabase(): void {
  const templateConfig = getPgEnvOptions({
    database: SEED_DB_TO_CREATE_TEMPLATE
  });

  const admin = new DbAdmin(templateConfig);
  admin.cleanupTemplate(TEMPLATE_NAME);
  admin.createSeededTemplate(TEMPLATE_NAME, {
    seed: (ctx) => {
      ctx.admin.loadSql(sql('test.sql'), ctx.config.database);
    }
  });
}

beforeAll(() => {
  totalStart = Date.now();
  setupTemplateDatabase();
});

beforeEach(async () => {
  ({ db, pg, teardown } = await getConnections({
    db: {
      template: TEMPLATE_NAME
    }
  }));
  usedDbNames.push(db?.config?.database ?? '(unknown)');
  start = Date.now();
});

afterEach(async () => {
  await teardown();
  const elapsed = Date.now() - start;
  const name = expect.getState().currentTestName ?? 'unknown';
  testResults.push({ name, time: elapsed });
});

afterAll(() => {
  const totalTime = Date.now() - totalStart;
  const uniqueNames = new Set(usedDbNames);
  const avg = testResults.reduce((sum, r) => sum + r.time, 0) / testResults.length;

  const summaryLines = [
    `🧪 Template DB Benchmark`,
    `📦 Total DBs Created: ${usedDbNames.length}`,
    `📂 Template Used: ${TEMPLATE_NAME}`,
    `✅ Unique DBs: ${uniqueNames.size === usedDbNames.length}`,
    `⏱️ Test Timings:`,
    ...testResults.map(({ name, time }) => `  • ${name}: ${time}ms`),
    `🏁 Average Test Time: ${avg.toFixed(2)}ms`,
    `🕒 Total Test Time: ${totalTime}ms`
  ];

  console.log('\n' + summaryLines.join('\n') + '\n');
});

describe('Template DB Benchmark', () => {
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
