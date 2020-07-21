#!/usr/bin/env node

import Worker from './index';
import env from './env';
import server from './server';

server.listen(env.PORT, () => {
  console.log(`listening ON ${env.PORT}`);

  const worker = new Worker({
    tasks: env.SUPPORTED_JOBS
  });

  worker.listen();
});
