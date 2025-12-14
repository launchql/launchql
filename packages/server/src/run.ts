#!/usr/bin/env node

import { getEnvOptions } from '@launchql/env';

import { LaunchQLServer as server } from './server';

server(
  getEnvOptions({
    pg: {
      database: process.env.PGDATABASE,
    },
  })
);
