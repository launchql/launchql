import { Pool, PoolClient } from 'pg';

import env from './env';
export class Database {
  private static instance: Database;
  private pool: Pool;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    // Lazy load `env` to prevent early crashes
    // const env = require('./env'); // Use `require` instead of `import`

    console.log('DATABASE_URL:', env.DATABASE_URL); // Debug
    const pgPoolConfig = {
      connectionString: env.DATABASE_URL,
    };
  
    this.pool = new Pool(pgPoolConfig);
  
    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err); // Debug
      process.exit(-1);
    });
  
    // Ensure the pool is closed on process termination
    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
  
    Database.instance = this;
    return this;
  }

  /**
   * Executes a callback function within a database transaction.
   * @param fn - A callback function that receives a PoolClient to perform database operations.
   */
  async withTransaction(fn: (client: PoolClient) => Promise<void>): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      try {
        await fn(client);
        await client.query('COMMIT');
      } catch (e) {
        console.error('Error during transaction:', e);
        await client.query('ROLLBACK');
        throw e; // Re-throw the error to propagate it
      }
    } finally {
      client.release();
    }
  }

  /**
   * Shuts down the connection pool.
   */
  async shutdown(): Promise<void> {
    await this.pool.end();
  }
}
