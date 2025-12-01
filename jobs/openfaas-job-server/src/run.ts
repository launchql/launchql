#!/usr/bin/env node

import server from './index';
import poolManager from '@launchql/job-pg';
import { getOpenFaasGatewayConfig } from '@launchql/job-utils';

const pgPool = poolManager.getPool();
const { callbackPort } = getOpenFaasGatewayConfig();
server(pgPool).listen(callbackPort, () => {
  console.log(`listening ON ${callbackPort}`);
});
