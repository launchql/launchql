import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

const database_id = '5b720132-17d5-424d-9bcb-ee7b17c13d43';
const objs: Record<string, any> = {};

describe('scheduled jobs', () => {
  beforeAll(async () => {
    ({ pg, teardown } = await getConnections());
  });

  afterAll(async () => {
    await teardown();
  });

  it('schedule jobs by cron', async () => {
    const result = await pg.one(
      `INSERT INTO app_jobs.scheduled_jobs (database_id, task_identifier, schedule_info)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        database_id,
        'my_job',
        {
          hour: Array.from({ length: 23 }, (_, i) => i),
          minute: [0, 15, 30, 45],
          dayOfWeek: Array.from({ length: 6 }, (_, i) => i)
        }
      ]
    );
    objs.scheduled1 = result;
  });

  it('schedule jobs by rule', async () => {
    const start = new Date(Date.now() + 10000); // 10s from now
    const end = new Date(start.getTime() + 180000); // +3min

    const result = await pg.one(
      `INSERT INTO app_jobs.scheduled_jobs (database_id, task_identifier, payload, schedule_info)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        database_id,
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
    const start = new Date(Date.now() + 10000); // 10s
    const end = new Date(start.getTime() + 180000); // +3min

    const [result] = await pg.any(
      `SELECT * FROM app_jobs.add_scheduled_job(
        db_id := $1::uuid,
        identifier := $2::text,
        payload := $3::json,
        schedule_info := $4::json,
        job_key := $5::text,
        queue_name := $6::text,
        max_attempts := $7::integer,
        priority := $8::integer
      )`,
      [
        database_id,
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
        db_id := $1,
        identifier := $2,
        payload := $3,
        schedule_info := $4,
        job_key := $5,
        queue_name := $6,
        max_attempts := $7,
        priority := $8
      )`,
      [
        database_id,
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