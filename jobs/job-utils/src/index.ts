import type {
  FailJobParams,
  CompleteJobParams,
  GetJobParams,
  GetScheduledJobParams,
  RunScheduledJobParams,
  ReleaseScheduledJobsParams,
  ReleaseJobsParams
} from '@pgpmjs/types';
import env from './env';
const { JOBS_SCHEMA } = env;

export type PgClientLike = {
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>;
};

export const failJob = async (
  client: PgClientLike,
  { workerId, jobId, message }: FailJobParams
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
  { workerId, jobId }: CompleteJobParams
) => {
  console.log(`utils:completeJob worker[${workerId}] job[${jobId}]`);
  await client.query(`SELECT * FROM "${JOBS_SCHEMA}".complete_job($1, $2);`, [
    workerId,
    jobId
  ]);
};

export const getJob = async <T = any>(
  client: PgClientLike,
  { workerId, supportedTaskNames }: GetJobParams
): Promise<T | undefined> => {
  console.log(`utils:getJob ${workerId}`);
  const {
    rows: [job]
  } = await client.query(
    `SELECT * FROM "${JOBS_SCHEMA}".get_job($1, $2::text[]);`,
    [workerId, supportedTaskNames]
  );
  return job;
};

export const getScheduledJob = async <T = any>(
  client: PgClientLike,
  { workerId, supportedTaskNames }: GetScheduledJobParams
): Promise<T | undefined> => {
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
  { jobId }: RunScheduledJobParams
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
  } catch (e) {
    if (e instanceof Error && e.message === 'ALREADY_SCHEDULED') {
      return null;
    }
    throw e;
  }
};

export const releaseScheduledJobs = async (
  client: PgClientLike,
  { workerId, ids }: ReleaseScheduledJobsParams
) => {
  console.log(`utils:releaseScheduledJobs worker[${workerId}]`);
  return await client.query(
    `SELECT "${JOBS_SCHEMA}".release_scheduled_jobs($1, $2::bigint[])`,
    [workerId, ids]
  );
};

export const releaseJobs = async (
  client: PgClientLike,
  { workerId }: ReleaseJobsParams
) => {
  console.log(`utils:releaseJobs worker[${workerId}]`);
  return await client.query(`SELECT "${JOBS_SCHEMA}".release_jobs($1)`, [
    workerId
  ]);
};
