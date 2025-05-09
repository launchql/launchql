import { Pool, PoolClient } from 'pg';

export class Database {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl });

    process.on('SIGTERM', async () => {
      await this.shutdown();
    });
  }

  /**
   * Executes a callback function within a database transaction.
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
        throw e;
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
