#!/usr/bin/env node

import { getEnvOptions } from '@pgpmjs/env';

import { LaunchQLServer as server } from './server';

server(
  getEnvOptions({
    pg: {
      database: process.env.PGDATABASE,
    },
  })
);