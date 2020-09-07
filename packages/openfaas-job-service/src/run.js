#!/usr/bin/env node

import env from './env';
import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/openfaas-job-worker';
import server from '@launchql/openfaas-job-server';
import api from '@launchql/job-api-server';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();
api(pgPool).listen(env.API_SERVER_PORT, () => {
  console.log(`[api] listening ON ${env.API_SERVER_PORT}`);
  server(pgPool).listen(env.CALLBACK_SERVER_PORT, () => {
    console.log(`[cb] listening ON ${env.CALLBACK_SERVER_PORT}`);

    const worker = new Worker({
      pgPool,
      workerId: env.HOSTNAME,
      tasks: env.SUPPORTED_JOBS
    });

    const scheduler = new Scheduler({
      pgPool,
      workerId: env.HOSTNAME,
      tasks: env.SUPPORTED_JOBS
    });

    worker.listen();
    scheduler.listen();
  });
});
