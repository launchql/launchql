import { Logger } from '@pgpmjs/logger';
import { Pool } from 'pg';
import { getPgEnvOptions, PgConfig } from 'pg-env';

import { DbAdmin } from './admin';
import { PgTestClient, PgTestClientOpts } from './test-client';

const log = new Logger('test-connector');

const SYS_EVENTS = ['SIGTERM'];

const end = (pool: Pool) => {
  try {
    if ((pool as any).ended || (pool as any).ending) {
      log.warn('⚠️ pg pool already ended or ending');
      return;
    }
    pool.end();
  } catch (err) {
    log.error('❌ pg pool termination error:', err);
  }
};

export class PgTestConnector {
  private static instance: PgTestConnector;

  private readonly clients = new Set<PgTestClient>();
  private readonly pgPools = new Map<string, Pool>();
  private readonly seenDbConfigs = new Map<string, PgConfig>();
  private readonly pendingConnects = new Set<Promise<any>>();

  private config: PgConfig;
  private verbose = false;
  private shuttingDown = false;

  private constructor(config: PgConfig, verbose = false) {
    this.verbose = verbose;
    this.config = config;

    SYS_EVENTS.forEach((event) => {
      process.on(event, () => {
        log.info(`⏹ Received ${event}, closing all connections...`);
        this.closeAll();
      });
    });
  }

  static getInstance(config: PgConfig, verbose = false): PgTestConnector {
    if (!PgTestConnector.instance) {
      PgTestConnector.instance = new PgTestConnector(config, verbose);
    }
    return PgTestConnector.instance;
  }

  private poolKey(config: PgConfig): string {
    return `${config.user}@${config.host}:${config.port}/${config.database}`;
  }

  private dbKey(config: PgConfig): string {
    return `${config.host}:${config.port}/${config.database}`;
  }

  beginTeardown(): void {
    this.shuttingDown = true;
  }

  private registerConnect(p: Promise<any>): void {
    this.pendingConnects.add(p);
    p.finally(() => this.pendingConnects.delete(p));
  }

  private async awaitPendingConnects(): Promise<void> {
    const arr = Array.from(this.pendingConnects);
    if (arr.length) {
      await Promise.allSettled(arr);
    }
  }

  getPool(config: PgConfig): Pool {
    const key = this.poolKey(config);
    if (!this.pgPools.has(key)) {
      const pool = new Pool(config);
      this.pgPools.set(key, pool);
      log.info(`📘 Created new pg pool: ${key}`);
    }
    return this.pgPools.get(key)!;
  }

  getClient(config: PgConfig, opts: Partial<PgTestClientOpts> = {}): PgTestClient {
    if (this.shuttingDown) {
      throw new Error('PgTestConnector is shutting down; no new clients allowed');
    }
    const client = new PgTestClient(config, { 
      trackConnect: (p) => this.registerConnect(p),
      ...opts
    });
    this.clients.add(client);

    const key = this.dbKey(config);
    this.seenDbConfigs.set(key, config);

    log.info(`🔌 New PgTestClient connected to ${config.database}`);
    return client;
  }

  async closeAll(): Promise<void> {
    this.beginTeardown();
    await this.awaitPendingConnects();

    log.info('🧹 Closing all PgTestClients...');
    await Promise.all(
      Array.from(this.clients).map(async (client) => {
        try {
          await client.close();
          log.success(`✅ Closed client for ${client.config.database}`);
        } catch (err) {
          log.error(`❌ Error closing PgTestClient for ${client.config.database}:`, err);
        }
      })
    );
    this.clients.clear();

    log.info('🧯 Disposing pg pools...');
    for (const [key, pool] of this.pgPools.entries()) {
      log.debug(`🧯 Disposing pg pool [${key}]`);
      end(pool);
    }
    this.pgPools.clear();

    log.info('🗑️ Dropping seen databases...');
    await Promise.all(
      Array.from(this.seenDbConfigs.values()).map(async (config) => {
        try {
          const rootPg = getPgEnvOptions(this.config);
          const admin = new DbAdmin(
            { ...config, user: rootPg.user, password: rootPg.password },
            this.verbose
          );
          admin.drop();
          log.warn(`🧨 Dropped database: ${config.database}`);
        } catch (err) {
          log.error(`❌ Failed to drop database ${config.database}:`, err);
        }
      })
    );
    this.seenDbConfigs.clear();

    log.success('✅ All PgTestClients closed, pools disposed, databases dropped.');
    this.pendingConnects.clear();
    this.shuttingDown = false;

  }

  close(): void {
    this.closeAll();
  }

  drop(config: PgConfig): void {
    const key = this.dbKey(config);
    const admin = new DbAdmin(config, this.verbose);
    admin.drop();
    log.warn(`🧨 Dropped database: ${config.database}`);
    this.seenDbConfigs.delete(key);
  }

  async kill(client: PgTestClient): Promise<void> {
    await client.close();
    this.drop(client.config);
  }
}
