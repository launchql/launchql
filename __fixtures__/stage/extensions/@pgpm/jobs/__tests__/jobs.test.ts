import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown:  () => Promise<void>;

const objs: Record<string, any> = {};

describe('scheduled jobs', () => {
  beforeAll(async () => {
    ({ pg, teardown } = await getConnections());
  });

  beforeEach(async () => {
    await pg.beforeEach();
  });

  afterEach(async () => {
    await pg.afterEach();
  });

  afterAll(async () => {
    await teardown();
  });

  it('schedule jobs by cron', async () => {
    const result = await pg.one(
      `INSERT INTO app_jobs.scheduled_jobs (task_identifier, schedule_info)
       VALUES ($1, $2)
       RETURNING *`,
      [
        'my_job',
        {
          hour: Array.from({ length: 23 }, (_: unknown, i: number) => i),
          minute: [0, 15, 30, 45],
          dayOfWeek: Array.from({ length: 6 }, (_: unknown, i: number) => i),
        },
      ]
    );
    objs.scheduled1 = result;
  });

  it('schedule jobs by rule', async () => {
    const start = new Date(Date.now() + 10000);
    const end = new Date(start.getTime() + 180000);

    const result = await pg.one(
      `INSERT INTO app_jobs.scheduled_jobs (task_identifier, payload, schedule_info)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        'my_job',
        { just: 'run it' },
        { start, end, rule: '*/1 * * * *' }
      ]
    );
    objs.scheduled2 = result;
  });

  it('schedule jobs', async () => {
    const [result] = await pg.any(
      `SELECT * FROM app_jobs.run_scheduled_job($1)`,
      [objs.scheduled2.id]
    );

    const { queue_name, run_at, created_at, updated_at, ...obj } = result;
    expect(obj).toMatchSnapshot();
  });

  it('schedule jobs with keys', async () => {
    const start = new Date(Date.now() + 10000);
    const end = new Date(start.getTime() + 180000);

    const [result] = await pg.any(
      `SELECT * FROM app_jobs.add_scheduled_job(
        identifier := $1::text,
        payload := $2::json,
        schedule_info := $3::json,
        job_key := $4::text,
        queue_name := $5::text,
        max_attempts := $6::integer,
        priority := $7::integer
      )`,
      [
        'my_job',
        { just: 'run it' },
        { start, end, rule: '*/1 * * * *' },
        'new_key',
        null,
        25,
        0
      ]
    );

    const {
      queue_name,
      run_at,
      created_at,
      updated_at,
      schedule_info: sch,
      start: s1,
      end: d1,
      ...obj
    } = result;

    const [result2] = await pg.any(
      `SELECT * FROM app_jobs.add_scheduled_job(
        identifier := $1,
        payload := $2,
        schedule_info := $3,
        job_key := $4,
        queue_name := $5,
        max_attempts := $6,
        priority := $7
      )`,
      [
        'my_job',
        { just: 'run it' },
        { start, end, rule: '*/1 * * * *' },
        'new_key',
        null,
        25,
        0
      ]
    );

    const {
      queue_name: qn,
      created_at: ca,
      updated_at: ua,
      schedule_info: sch2,
      start: s,
      end: e,
      ...obj2
    } = result2;

    console.log('First insert:', obj);
    console.log('Duplicate insert (job_key conflict):', obj2);
  });
});
