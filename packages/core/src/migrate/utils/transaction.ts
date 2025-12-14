import { Logger } from '@pgpmjs/logger';
import { Pool, PoolClient } from 'pg';

const log = new Logger('migrate:transaction');

export interface TransactionOptions {
  useTransaction: boolean;
}

export interface TransactionContext {
  client: PoolClient | Pool;
  isTransaction: boolean;
  // Add query tracking for debugging
  queryHistory: QueryHistoryEntry[];
  addQuery: (query: string, params?: any[], startTime?: number) => void;
}

export interface QueryHistoryEntry {
  query: string;
  params?: any[];
  timestamp: number;
  duration?: number;
  error?: any;
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
  const queryHistory: QueryHistoryEntry[] = [];
  
  const addQuery = (query: string, params?: any[], startTime?: number) => {
    queryHistory.push({
      query,
      params,
      timestamp: Date.now(),
      duration: startTime ? Date.now() - startTime : undefined
    });
  };

  if (!options.useTransaction) {
    // No transaction - use pool directly
    log.debug('Executing without transaction');
    return fn({ client: pool, isTransaction: false, queryHistory, addQuery });
  }

  // Use transaction
  const client = await pool.connect();
  const transactionStartTime = Date.now();
  log.debug('Starting transaction');

  try {
    const beginTime = Date.now();
    await client.query('BEGIN');
    addQuery('BEGIN', [], beginTime);
    
    const result = await fn({ client, isTransaction: true, queryHistory, addQuery });
    
    const commitTime = Date.now();
    await client.query('COMMIT');
    addQuery('COMMIT', [], commitTime);
    
    const transactionDuration = Date.now() - transactionStartTime;
    log.debug(`Transaction committed successfully in ${transactionDuration}ms`);
    
    return result;
  } catch (error: any) {
    const rollbackTime = Date.now();
    
    try {
      await client.query('ROLLBACK');
      addQuery('ROLLBACK', [], rollbackTime);
    } catch (rollbackError) {
      log.error('Failed to rollback transaction:', rollbackError);
    }
    
    const transactionDuration = Date.now() - transactionStartTime;
    
    // Enhanced error logging with context
    const errorLines = [];
    errorLines.push(`Transaction rolled back due to error after ${transactionDuration}ms:`);
    errorLines.push(`Error Code: ${error.code || 'N/A'}`);
    errorLines.push(`Error Message: ${error.message || 'N/A'}`);
    
    // Log query history for debugging
    if (queryHistory.length > 0) {
      errorLines.push('Query history for this transaction:');
      queryHistory.forEach((entry, index) => {
        const duration = entry.duration ? ` (${entry.duration}ms)` : '';
        const params = entry.params && entry.params.length > 0 
          ? ` with params: ${JSON.stringify(entry.params.slice(0, 2))}${entry.params.length > 2 ? '...' : ''}`
          : '';
        errorLines.push(`  ${index + 1}. ${entry.query.split('\n')[0].trim()}${params}${duration}`);
      });
    }
    
    // For transaction aborted errors, provide additional context
    if (error.code === '25P02') {
      errorLines.push('🔍 Debug Info: Transaction was aborted due to a previous error.');
      errorLines.push('   This usually means a previous command in the transaction failed.');
      errorLines.push('   Check the query history above to identify the failing command.');
    }
    
    // Log the consolidated error message
    log.error(errorLines.join('\n'));
    
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Helper to execute a query within a transaction context with enhanced logging
 */
export async function executeQuery(
  context: TransactionContext,
  query: string,
  params?: any[]
): Promise<any> {
  const startTime = Date.now();
  
  try {
    const result = await context.client.query(query, params);
    const duration = Date.now() - startTime;
    
    // Add to query history
    context.addQuery(query, params, startTime);
    
    // Log slow queries for debugging
    if (duration > 1000) {
      log.warn(`Slow query detected (${duration}ms): ${query.split('\n')[0].trim()}`);
    }
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Add failed query to history
    context.addQuery(query, params, startTime);
    
    // Enhanced error logging
    const errorLines = [];
    errorLines.push(`Query failed after ${duration}ms:`);
    errorLines.push(`  Query: ${query.split('\n')[0].trim()}`);
    if (params && params.length > 0) {
      errorLines.push(`  Params: ${JSON.stringify(params.slice(0, 3))}${params.length > 3 ? '...' : ''}`);
    }
    errorLines.push(`  Error Code: ${error.code || 'N/A'}`);
    errorLines.push(`  Error Message: ${error.message || 'N/A'}`);
    
    // Provide debugging hints for common errors
    if (error.code === '42P01') {
      errorLines.push('💡 Hint: Relation (table/view) does not exist. Check if migrations are applied in correct order.');
    } else if (error.code === '42883') {
      errorLines.push('💡 Hint: Function does not exist. Check if required extensions or functions are installed.');
    } else if (error.code === '23505') {
      errorLines.push('💡 Hint: Unique constraint violation. Check for duplicate data.');
    } else if (error.code === '23503') {
      errorLines.push('💡 Hint: Foreign key constraint violation. Check referential integrity.');
    }
    
    // Log the consolidated error message
    log.error(errorLines.join('\n'));
    
    throw error;
  }
}
