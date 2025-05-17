import { Pool } from 'pg';
import chalk from 'chalk';
import { DbAdmin } from './admin';
import { PgConfig } from '@launchql/types';
import { PgTestClient } from './test-client';

const SYS_EVENTS = ['SIGTERM'];

const end = (pool: Pool) => {
  try {
    if ((pool as any).ended || (pool as any).ending) {
      console.warn(chalk.yellow('⚠️ pg pool already ended or ending'));
      return;
    }
    pool.end();
  } catch (err) {
    console.error(chalk.red('❌ pg pool termination error:'), err);
  }
};

export class PgTestConnector {
  private static instance: PgTestConnector;

  private readonly clients = new Set<PgTestClient>();
  private readonly pgPools = new Map<string, Pool>();
  private readonly seenDbConfigs = new Map<string, PgConfig>();

  private verbose = false;

  private constructor(verbose = false) {
    this.verbose = verbose;

    SYS_EVENTS.forEach((event) => {
      process.on(event, () => {
        this.log(chalk.magenta(`⏹ Received ${event}, closing all connections...`));
        this.closeAll();
      });
    });
  }

  static getInstance(verbose = false): PgTestConnector {
    if (!PgTestConnector.instance) {
      PgTestConnector.instance = new PgTestConnector(verbose);
    }
    return PgTestConnector.instance;
  }

  private log(...args: any[]) {
    if (this.verbose) console.log(...args);
  }

  private poolKey(config: PgConfig): string {
    return `${config.user}@${config.host}:${config.port}/${config.database}`;
  }

  private dbKey(config: PgConfig): string {
    return `${config.host}:${config.port}/${config.database}`;
  }

  getAdmin(config: PgConfig): DbAdmin {
    return new DbAdmin(config, this.verbose);
  }

  getPool(config: PgConfig): Pool {
    const key = this.poolKey(config);
    if (!this.pgPools.has(key)) {
      const pool = new Pool(config);
      this.pgPools.set(key, pool);
      this.log(chalk.blue(`📘 Created new pg pool: ${chalk.white(key)}`));
    }
    return this.pgPools.get(key)!;
  }

  getClient(config: PgConfig): PgTestClient {
    const client = new PgTestClient(config);
    this.clients.add(client);

    const key = this.dbKey(config);
    this.seenDbConfigs.set(key, config);

    this.log(chalk.green(`🔌 New PgTestClient connected to ${config.database}`));
    return client;
  }

  async closeAll(): Promise<void> {
    this.log(chalk.cyan('\n🧹 Closing all PgTestClients...'));
    await Promise.all(
      Array.from(this.clients).map(async (client) => {
        try {
          await client.close();
          this.log(chalk.green(`✅ Closed client for ${client.config.database}`));
        } catch (err) {
          console.warn(chalk.red(`❌ Error closing PgTestClient for ${client.config.database}:`), err);
        }
      })
    );
    this.clients.clear();

    this.log(chalk.cyan('\n🧯 Disposing pg pools...'));
    for (const [key, pool] of this.pgPools.entries()) {
      this.log(chalk.gray(`🧯 Disposing pg pool [${key}]`));
      end(pool);
    }
    this.pgPools.clear();

    this.log(chalk.cyan('\n🗑️ Dropping seen databases...'));
    await Promise.all(
      Array.from(this.seenDbConfigs.values()).map(async (config) => {
        try {
          // somehow an "admin" db had app_user creds?
          const admin = new DbAdmin({...config, user: 'postgres', password: 'password'}, this.verbose);
          // console.log(config);
          admin.drop();
          this.log(chalk.yellow(`🧨 Dropped database: ${chalk.white(config.database)}`));
        } catch (err) {
          console.warn(chalk.red(`❌ Failed to drop database ${config.database}:`), err);
        }
      })
    );
    this.seenDbConfigs.clear();

    this.log(chalk.green('\n✅ All PgTestClients closed, pools disposed, databases dropped.'));
  }

  close(): void {
    this.closeAll();
  }

  drop(config: PgConfig): void {
    const key = this.dbKey(config);
    const admin = new DbAdmin(config, this.verbose);
    admin.drop();
    this.log(chalk.red(`🧨 Dropped database: ${chalk.white(config.database)}`));
    this.seenDbConfigs.delete(key);
  }
  
  kill(client: PgTestClient): void {
    client.close();
    this.drop(client.config);
  }
  
}
