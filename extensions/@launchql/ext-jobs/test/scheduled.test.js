import { getConnections } from './utils';

let db, teardown, app;
const database_id = '5b720132-17d5-424d-9bcb-ee7b17c13d43';
const objs = {};
describe('scheduled jobs', () => {
  beforeAll(async () => {
    ({ db, teardown } = await getConnections());
    app = db.helper('app_jobs');
  });
  afterAll(async () => {
    await teardown();
  });
  it('schedule jobs by cron', async () => {
    objs.scheduled1 = await app.insertOne(
      'scheduled_jobs',
      {
        database_id,
        task_identifier: 'my_job',
        schedule_info: {
          hour: Array.from({ length: 23 }, Number.call, (i) => i),
          minute: [0, 15, 30, 45],
          dayOfWeek: Array.from({ length: 6 }, Number.call, (i) => i)
        }
      },
      {
        schedule_info: 'json'
      }
    );
  });
  it('schedule jobs by rule', async () => {
    // every minute starting in 10 seconds for 3 minutes
    const start = new Date(Date.now() + 10000); // 10 seconds
    const end = new Date(start.getTime() + 180000); // 3 minutes
    objs.scheduled2 = await app.insertOne(
      'scheduled_jobs',
      {
        database_id,
        task_identifier: 'my_job',
        payload: {
          just: 'run it'
        },
        schedule_info: {
          start,
          end,
          rule: '*/1 * * * *'
        }
      },
      {
        schedule_info: 'json'
      }
    );
  });
  it('schedule jobs', async () => {
    const [result] = await app.callAny('run_scheduled_job', {
      id: objs.scheduled2.id
    });
    const { queue_name, run_at, created_at, updated_at, ...obj } = result;
    expect(obj).toMatchSnapshot();
  });
  it('schedule jobs with keys', async () => {
    // every minute starting in 10 seconds for 3 minutes
    const start = new Date(Date.now() + 10000); // 10 seconds
    const end = new Date(start.getTime() + 180000); // 3 minutes

    const [result] = await app.callAny(
      'add_scheduled_job',
      {
        database_id,
        identifier: 'my_job',
        payload: {
          just: 'run it'
        },
        schedule_info: {
          start,
          end,
          rule: '*/1 * * * *'
        },
        job_key: 'new_key',
        queue_name: null,
        max_attempts: 25,
        priority: 0
      },
      {
        database_id: 'uuid',
        identifier: 'text',
        payload: 'json',
        schedule_info: 'json',
        job_key: 'text',
        queue_name: 'text',
        max_attempts: 'integer',
        priority: 'integer'
      }
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

    const [result2] = await app.callAny(
      'add_scheduled_job',
      {
        database_id,
        identifier: 'my_job',
        payload: {
          just: 'run it'
        },
        schedule_info: {
          start,
          end,
          rule: '*/1 * * * *'
        },
        job_key: 'new_key',
        queue_name: null,
        max_attempts: 25,
        priority: 0
      },
      {
        database_id: 'uuid',
        identifier: 'text',
        payload: 'json',
        schedule_info: 'json',
        job_key: 'text',
        queue_name: 'text',
        max_attempts: 'integer',
        priority: 'integer'
      }
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
    console.log(obj);
    console.log(obj2);
  });
});
