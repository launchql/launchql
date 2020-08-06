#!/usr/bin/env node

import env from './env';
import Scheduler from '@launchql/job-scheduler';
import Worker from '@launchql/openfaas-job-worker';
import server from '@launchql/openfaas-job-server';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();

server(pgPool).listen(env.PORT, () => {
  console.log(`listening ON ${env.PORT}`);

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
