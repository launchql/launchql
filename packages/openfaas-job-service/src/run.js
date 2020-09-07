#!/usr/bin/env node

import env from './env';
import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/openfaas-job-worker';
import server from '@launchql/openfaas-job-server';
import api from '@launchql/job-api-server';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();
api(pgPool).listen(env.INTERNAL_JOBS_API_PORT, () => {
  console.log(`[api] listening ON ${env.INTERNAL_JOBS_API_PORT}`);
  server(pgPool).listen(env.INTERNAL_JOBS_CALLBACK_PORT, () => {
    console.log(`[cb] listening ON ${env.INTERNAL_JOBS_CALLBACK_PORT}`);

    const worker = new Worker({
      pgPool,
      workerId: env.HOSTNAME,
      tasks: env.JOBS_SUPPORTED
    });

    const scheduler = new Scheduler({
      pgPool,
      workerId: env.HOSTNAME,
      tasks: env.JOBS_SUPPORTED
    });

    worker.listen();
    scheduler.listen();
  });
});
