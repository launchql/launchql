#!/usr/bin/env node

import Worker from './index';
import env from './env';
import server from './server';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();

server(pgPool).listen(env.PORT, () => {
  console.log(`listening ON ${env.PORT}`);

  const worker = new Worker({
    pgPool,
    workerId: env.HOSTNAME,
    tasks: env.SUPPORTED_JOBS
  });

  worker.listen();
});
