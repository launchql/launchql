import { PgConfig, PgTestConnectionOptions } from "@launchql/types";
import { DbAdmin } from "../admin";
import { PgTestClient } from "../test-client";

export interface SeedContext {
  connect: PgTestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
}

export interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}