import env from './env';
const { JOBS_SCHEMA } = env;

type PgClientLike = {
  query: (text: string, params?: any[]) => Promise<any>;
};

type WorkerJobArgs = {
  workerId: string;
  jobId: number | string;
};

export const failJob = async (
  client: PgClientLike,
  { workerId, jobId, message }: WorkerJobArgs & { message: string }
) => {
  console.log(`utils:failJob worker[${workerId}] job[${jobId}] ${message}`);
  await client.query(`SELECT * FROM "${JOBS_SCHEMA}".fail_job($1, $2, $3);`, [
    workerId,
    jobId,
    message
  ]);
};

export const completeJob = async (
  client: PgClientLike,
  { workerId, jobId }: WorkerJobArgs
) => {
  console.log(`utils:completeJob worker[${workerId}] job[${jobId}]`);
  await client.query(`SELECT * FROM "${JOBS_SCHEMA}".complete_job($1, $2);`, [
    workerId,
    jobId
  ]);
};

export const getJob = async (
  client: PgClientLike,
  {
    workerId,
    supportedTaskNames
  }: { workerId: string; supportedTaskNames: string[] | null }
) => {
  console.log(`utils:getJob ${workerId}`);
  const {
    rows: [job]
  } = await client.query(
    `SELECT * FROM "${JOBS_SCHEMA}".get_job($1, $2::text[]);`,
    [workerId, supportedTaskNames]
  );
  return job;
};

export const getScheduledJob = async (
  client: PgClientLike,
  {
    workerId,
    supportedTaskNames
  }: { workerId: string; supportedTaskNames: string[] | null }
) => {
  console.log(`utils:getScheduledJob worker[${workerId}]`);
  const {
    rows: [job]
  } = await client.query(
    `SELECT * FROM "${JOBS_SCHEMA}".get_scheduled_job($1, $2::text[]);`,
    [workerId, supportedTaskNames]
  );
  return job;
};

export const runScheduledJob = async (
  client: PgClientLike,
  { jobId }: { jobId: number | string }
) => {
  console.log(`utils:runScheduledJob job[${jobId}]`);
  try {
    const {
      rows: [job]
    } = await client.query(
      `SELECT * FROM "${JOBS_SCHEMA}".run_scheduled_job($1);`,
      [jobId]
    );
    return job;
  } catch (e: any) {
    if (e?.message === 'ALREADY_SCHEDULED') {
      return null;
    }
    throw e;
  }
};

export const releaseScheduledJobs = async (
  client: PgClientLike,
  { workerId, ids }: { workerId: string; ids?: (number | string)[] }
) => {
  console.log(`utils:releaseScheduledJobs worker[${workerId}]`);
  return await client.query(
    `SELECT "${JOBS_SCHEMA}".release_scheduled_jobs($1, $2::bigint[])`,
    [workerId, ids as any]
  );
};

export const releaseJobs = async (
  client: PgClientLike,
  { workerId }: { workerId: string }
) => {
  console.log(`utils:releaseJobs worker[${workerId}]`);
  return await client.query(`SELECT "${JOBS_SCHEMA}".release_jobs($1)`, [
    workerId
  ]);
};
