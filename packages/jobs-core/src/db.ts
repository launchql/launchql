import type { Pool } from 'pg';
import type {
  AddJobOptions,
  AddScheduledJobOptions,
  CompleteJobOptions,
  FailJobOptions,
  GetJobOptions,
  GetScheduledJobOptions,
  JobRow,
  ScheduledJobRow,
  ReleaseScheduledJobsOptions,
  ReleaseJobsOptions,
  RunScheduledJobOptions,
} from './types';

const DEFAULT_SCHEMA = 'app_jobs';

const q = (ident: string) => `"${ident.replace(/"/g, '""')}"`;

export async function getJob(
  pool: Pool,
  opts: GetJobOptions
): Promise<JobRow | null> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('get_job')}`;
  // If supportedTaskNames is null, pass NULL::text[] to function
  const any = opts.supportedTaskNames == null;
  if (opts.jobExpiryInterval) {
    const sql = `SELECT * FROM ${fn}($1, $2::text[], $3::interval);`;
    const params = [opts.workerId, any ? null : opts.supportedTaskNames, opts.jobExpiryInterval];
    const { rows } = await pool.query(sql, params);
    return rows?.[0] ?? null;
  } else {
    const sql = `SELECT * FROM ${fn}($1, $2::text[]);`;
    const params = [opts.workerId, any ? null : opts.supportedTaskNames];
    const { rows } = await pool.query(sql, params);
    return rows?.[0] ?? null;
  }
}

export async function getScheduledJob(
  pool: Pool,
  opts: GetScheduledJobOptions
): Promise<ScheduledJobRow | null> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('get_scheduled_job')}`;
  const any = opts.supportedTaskNames == null;
  const sql = `SELECT * FROM ${fn}($1, $2::text[]);`;
  const params = [opts.workerId, any ? null : opts.supportedTaskNames];
  const { rows } = await pool.query(sql, params);
  return rows?.[0] ?? null;
}

export async function completeJob(
  pool: Pool,
  opts: CompleteJobOptions
): Promise<void> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('complete_job')}`;
  const sql = `SELECT ${fn}($1, $2);`;
  await pool.query(sql, [opts.workerId, opts.jobId]);
}

export async function failJob(
  pool: Pool,
  opts: FailJobOptions
): Promise<void> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('fail_job')}`;
  const sql = `SELECT ${fn}($1, $2, $3);`;
  await pool.query(sql, [opts.workerId, opts.jobId, opts.message]);
}

export async function addJob(
  pool: Pool,
  opts: AddJobOptions
): Promise<JobRow> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('add_job')}`;
  const sql = `SELECT * FROM ${fn}($1, $2, $3::json, $4, $5, $6, $7, $8);`;
  const params = [
    opts.databaseId,
    opts.identifier,
    opts.payload ?? {},
    opts.jobKey ?? null,
    opts.queueName ?? null,
    opts.runAt ?? null,
    opts.maxAttempts ?? null,
    opts.priority ?? null,
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0] as JobRow;
}

export async function addScheduledJob(
  pool: Pool,
  opts: AddScheduledJobOptions
): Promise<ScheduledJobRow> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('add_scheduled_job')}`;
  const sql = `SELECT * FROM ${fn}($1, $2, $3::json, $4::json, $5, $6, $7, $8);`;
  const params = [
    opts.databaseId,
    opts.identifier,
    opts.payload ?? {},
    opts.scheduleInfo ?? {},
    opts.jobKey ?? null,
    opts.queueName ?? null,
    opts.maxAttempts ?? null,
    opts.priority ?? null,
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0] as ScheduledJobRow;
}

export async function runScheduledJob(
  pool: Pool,
  opts: RunScheduledJobOptions
): Promise<JobRow> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('run_scheduled_job')}`;
  if (opts.jobExpiryInterval) {
    const sql = `SELECT * FROM ${fn}($1, $2::interval);`;
    const { rows } = await pool.query(sql, [opts.jobId, opts.jobExpiryInterval]);
    return rows[0] as JobRow;
  } else {
    const sql = `SELECT * FROM ${fn}($1);`;
    const { rows } = await pool.query(sql, [opts.jobId]);
    return rows[0] as JobRow;
  }
}

export async function releaseScheduledJobs(
  pool: Pool,
  opts: ReleaseScheduledJobsOptions
): Promise<void> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('release_scheduled_jobs')}`;
  const sql = `SELECT ${fn}($1, $2::bigint[]);`;
  await pool.query(sql, [opts.workerId, opts.ids ?? null]);
}

export async function releaseJobs(
  pool: Pool,
  opts: ReleaseJobsOptions
): Promise<void> {
  const schema = opts.schema ?? DEFAULT_SCHEMA;
  const fn = `${q(schema)}.${q('release_jobs')}`;
  const sql = `SELECT ${fn}($1);`;
  await pool.query(sql, [opts.workerId]);
}

