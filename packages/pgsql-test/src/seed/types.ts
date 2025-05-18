import { PgConfig } from "@launchql/types";
import { DbAdmin } from "../admin";
import { PgTestClient } from "../test-client";

export interface SeedContext {
  admin: DbAdmin;
  config: PgConfig;
  pg: PgTestClient;
}

export interface SeedAdapter {
  seed(ctx: SeedContext): Promise<void> | void;
}