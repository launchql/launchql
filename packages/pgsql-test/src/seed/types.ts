import { PgTestConnectionOptions } from '@pgpmjs/types';
import { PgConfig } from 'pg-env';

import { DbAdmin } from '../admin';
import { PgTestClient } from '../test-client';

export interface SeedContext {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
}

export interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}