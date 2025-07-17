import { Pool, PoolClient } from 'pg';
import { Logger } from '@launchql/logger';

const log = new Logger('migrate:transaction');

export interface TransactionOptions {
  useTransaction: boolean;
}

export interface TransactionContext {
  client: PoolClient | Pool;
  isTransaction: boolean;
}

/**
 * Execute a function within a transaction context
 * If useTransaction is true, wraps the execution in a transaction
 * If false, uses the pool directly without transaction
 */
export async function withTransaction<T>(
  pool: Pool,
  options: TransactionOptions,
  fn: (context: TransactionContext) => Promise<T>
): Promise<T> {
  if (!options.useTransaction) {
    // No transaction - use pool directly
    log.debug('Executing without transaction');
    return fn({ client: pool, isTransaction: false });
  }

  // Use transaction
  const client = await pool.connect();
  log.debug('Starting transaction');

  try {
    await client.query('BEGIN');
    
    const result = await fn({ client, isTransaction: true });
    
    await client.query('COMMIT');
    log.debug('Transaction committed successfully');
    
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    log.error('Transaction rolled back due to error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Helper to execute a query within a transaction context
 */
export async function executeQuery(
  context: TransactionContext,
  query: string,
  params?: any[]
): Promise<any> {
  return context.client.query(query, params);
}
