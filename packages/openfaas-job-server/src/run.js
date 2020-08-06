#!/usr/bin/env node

import server from './index';
import env from './env';
import poolManager from '@launchql/job-pg';

const pgPool = poolManager.getPool();

server(pgPool).listen(env.PORT, () => {
  console.log(`listening ON ${env.PORT}`);
});
