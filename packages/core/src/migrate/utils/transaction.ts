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
  } catch (error: any) {
    const isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
    
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      log.error('Failed to rollback transaction:', rollbackError);
    }
    
    if (isDebugMode) {
      if (error.code === '25P02') {
        log.error('Transaction aborted - all subsequent commands ignored until rollback. Original error:', error.originalError || error);
        const enhancedError = new Error(`Transaction aborted due to previous error. ${error.message}`);
        (enhancedError as any).code = error.code;
        (enhancedError as any).originalError = error;
        (enhancedError as any).transactionState = 'aborted';
        throw enhancedError;
      }
      
      if (error.originalError || error.sqlQuery) {
        log.error('Transaction rolled back due to enhanced error:', {
          message: error.message,
          code: error.code,
          sqlQuery: error.sqlQuery,
          sqlParams: error.sqlParams
        });
      } else {
        log.error('Transaction rolled back due to error:', error);
      }
    } else {
      log.error('Transaction rolled back due to error:', error);
    }
    
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
  const isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
  
  if (!isDebugMode) {
    return context.client.query(query, params);
  }
  
  try {
    return await context.client.query(query, params);
  } catch (error: any) {
    const enhancedError = new Error(`SQL execution failed: ${error.message}\nQuery: ${query}\nParams: ${JSON.stringify(params)}`);
    enhancedError.stack = error.stack;
    (enhancedError as any).code = error.code;
    (enhancedError as any).originalError = error;
    (enhancedError as any).sqlQuery = query;
    (enhancedError as any).sqlParams = params;
    throw enhancedError;
  }
}
