import {
  getJobSchema,
  getJobPgConfig,
  getJobPool,
  getJobSupportAny,
  getJobSupported,
  getWorkerHostname,
  getSchedulerHostname,
  getOpenFaasGatewayConfig,
  getOpenFaasDevMap,
} from './runtime';
import type { Pool, PoolClient } from 'pg';
import type { JobRow, ScheduledJobRow } from '@launchql/jobs-core';
import {
  getJob as coreGetJob,
  completeJob as coreCompleteJob,
  failJob as coreFailJob,
  getScheduledJob as coreGetScheduledJob,
  runScheduledJob as coreRunScheduledJob,
  releaseJobs as coreReleaseJobs,
  releaseScheduledJobs as coreReleaseScheduledJobs,
} from '@launchql/jobs-core';

const JOBS_SCHEMA = getJobSchema();

export const failJob = async (
  client: Pool | PoolClient,
  { workerId, jobId, message }: { workerId: string; jobId: number | string; message: string }
) => {
  console.log(`utils:failJob worker[${workerId}] job[${jobId}] ${message}`);
  // Delegate to typed core, forcing schema resolution here
  await coreFailJob((client as any), { workerId, jobId, message, schema: JOBS_SCHEMA });
};

export const completeJob = async (
  client: Pool | PoolClient,
  { workerId, jobId }: { workerId: string; jobId: number | string }
) => {
  console.log(`utils:completeJob worker[${workerId}] job[${jobId}]`);
  await coreCompleteJob((client as any), { workerId, jobId, schema: JOBS_SCHEMA });
};

export const getJob = async (
  client: Pool | PoolClient,
  { workerId, supportedTaskNames }: { workerId: string; supportedTaskNames: string[] | null }
): Promise<JobRow | null> => {
  console.log(`utils:getJob ${workerId}`);
  return coreGetJob((client as any), { workerId, supportedTaskNames, schema: JOBS_SCHEMA });
};

export const getScheduledJob = async (
  client: Pool | PoolClient,
  { workerId, supportedTaskNames }: { workerId: string; supportedTaskNames: string[] | null }
): Promise<ScheduledJobRow | null> => {
  console.log(`utils:getScheduledJob worker[${workerId}]`);
  return coreGetScheduledJob((client as any), { workerId, supportedTaskNames, schema: JOBS_SCHEMA });
};

export const runScheduledJob = async (
  client: Pool | PoolClient,
  { jobId }: { jobId: number | string }
): Promise<JobRow | null> => {
  console.log(`utils:runScheduledJob job[${jobId}]`);
  try {
    return await coreRunScheduledJob((client as any), { jobId, schema: JOBS_SCHEMA });
  } catch (e: any) {
    if (e?.message === 'ALREADY_SCHEDULED') return null;
    throw e;
  }
};

export const releaseScheduledJobs = async (
  client: Pool | PoolClient,
  { workerId, ids }: { workerId: string; ids: Array<number | string> }
) => {
  console.log(`utils:releaseScheduledJobs worker[${workerId}]`);
  return coreReleaseScheduledJobs((client as any), { workerId, ids, schema: JOBS_SCHEMA });
};

export const releaseJobs = async (
  client: Pool | PoolClient,
  { workerId }: { workerId: string }
) => {
  console.log(`utils:releaseJobs worker[${workerId}]`);
  return coreReleaseJobs((client as any), { workerId, schema: JOBS_SCHEMA });
};

export {
  getJobSchema,
  getJobPgConfig,
  getJobPool,
  getJobSupportAny,
  getJobSupported,
  getWorkerHostname,
  getSchedulerHostname,
  getOpenFaasGatewayConfig,
  getOpenFaasDevMap,
};
