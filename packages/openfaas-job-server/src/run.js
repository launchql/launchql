#!/usr/bin/env node

import server from './index';
import env from './env';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();

server(pgPool).listen(env.INTERNAL_JOBS_CALLBACK_PORT, () => {
  console.log(`listening ON ${env.INTERNAL_JOBS_CALLBACK_PORT}`);
});
