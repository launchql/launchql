import { PgConfig, TestConnectionOptions } from "@launchql/types";
import { DbAdmin } from "../admin";
import { PgTestClient } from "../test-client";

export interface SeedContext {
  connect: TestConnectionOptions;
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
}

export interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}