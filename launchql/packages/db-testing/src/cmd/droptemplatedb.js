#!/usr/bin/env node

import { dropdb } from '../lib/db';
import { getOpts } from '../lib/testing';
import env from '../env';

if (!env.PGTEMPLATE_DATABASE) {
  throw new Error('no PGTEMPLATE_DATABASE defined in env!');
}

const run = async () => {
  const config = await getOpts({});
  try {
    await dropdb({ ...config, database: env.PGTEMPLATE_DATABASE });
  } catch (e) {
    console.error(e);
  }
};

run();
