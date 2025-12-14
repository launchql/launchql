import { Logger } from '@pgpmjs/logger';

const log = new Logger('debug');

export interface DebugOptions {
  enabled: boolean;
  logLevel?: 'info' | 'warn' | 'error' | 'debug';
  showStackTrace?: boolean;
  showQueryParams?: boolean;
  showFullSQL?: boolean;
}

export class DebugHelper {
  private options: DebugOptions;

  constructor(options: DebugOptions = { enabled: false }) {
    this.options = {
      logLevel: 'debug',
      showStackTrace: true,
      showQueryParams: true,
      showFullSQL: true,
      ...options
    };
  }

  isEnabled(): boolean {
    return this.options.enabled;
  }

  logError(message: string, error?: any, context?: Record<string, any>) {
    if (!this.options.enabled) return;
    
    log.error(message);
    
    if (context) {
      log.error('Context:', JSON.stringify(context, null, 2));
    }
    
    if (error) {
      log.error('Error Details:', {
        code: error.code,
        message: error.message,
        severity: error.severity,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        where: error.where,
        schema: error.schema,
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint,
        file: error.file,
        line: error.line,
        routine: error.routine
      });
      
      if (this.options.showStackTrace && error.stack) {
        log.error('Stack Trace:', error.stack);
      }
    }
  }

  logQuery(query: string, params?: any[], duration?: number) {
    if (!this.options.enabled) return;
    
    log.debug(`Query executed in ${duration || 0}ms:`);
    
    if (this.options.showFullSQL) {
      log.debug('Full SQL:', query);
    } else {
      log.debug('SQL Preview:', query.split('\n')[0].trim());
    }
    
    if (this.options.showQueryParams && params && params.length > 0) {
      log.debug('Parameters:', JSON.stringify(params, null, 2));
    }
  }

  logTransactionStart() {
    if (!this.options.enabled) return;
    log.debug('🔄 Transaction started');
  }

  logTransactionCommit(duration?: number) {
    if (!this.options.enabled) return;
    log.debug(`✅ Transaction committed in ${duration || 0}ms`);
  }

  logTransactionRollback(duration?: number) {
    if (!this.options.enabled) return;
    log.debug(`❌ Transaction rolled back after ${duration || 0}ms`);
  }

  static fromEnvironment(): DebugHelper {
    const enabled = process.env.LAUNCHQL_DEBUG === 'true' || process.env.DEBUG === 'launchql*';
    const logLevel = (process.env.LAUNCHQL_DEBUG_LEVEL as any) || 'debug';
    const showStackTrace = process.env.LAUNCHQL_DEBUG_STACK !== 'false';
    const showQueryParams = process.env.LAUNCHQL_DEBUG_PARAMS !== 'false';
    const showFullSQL = process.env.LAUNCHQL_DEBUG_SQL !== 'false';
    
    return new DebugHelper({
      enabled,
      logLevel,
      showStackTrace,
      showQueryParams,
      showFullSQL
    });
  }
}

// Global debug instance
export const debugHelper = DebugHelper.fromEnvironment();

// Utility functions
export function enableDebugMode() {
  process.env.LAUNCHQL_DEBUG = 'true';
  process.env.LOG_LEVEL = 'debug';
  log.info('🔍 Debug mode enabled');
  log.info('   Set LAUNCHQL_DEBUG=false to disable');
  log.info('   Set LAUNCHQL_DEBUG_LEVEL=info|warn|error|debug to change log level');
  log.info('   Set LAUNCHQL_DEBUG_STACK=false to hide stack traces');
  log.info('   Set LAUNCHQL_DEBUG_PARAMS=false to hide query parameters');
  log.info('   Set LAUNCHQL_DEBUG_SQL=false to hide full SQL scripts');
}

export function createDebugSummary(error: any, context?: Record<string, any>): string {
  const summary = [];
  
  summary.push('=== LaunchQL Debug Summary ===');
  summary.push('');
  
  if (error) {
    summary.push('Error Information:');
    summary.push(`  Code: ${error.code || 'N/A'}`);
    summary.push(`  Message: ${error.message || 'N/A'}`);
    summary.push(`  Severity: ${error.severity || 'N/A'}`);
    
    if (error.detail) summary.push(`  Detail: ${error.detail}`);
    if (error.hint) summary.push(`  Hint: ${error.hint}`);
    if (error.position) summary.push(`  Position: ${error.position}`);
    if (error.where) summary.push(`  Where: ${error.where}`);
    if (error.schema) summary.push(`  Schema: ${error.schema}`);
    if (error.table) summary.push(`  Table: ${error.table}`);
    if (error.column) summary.push(`  Column: ${error.column}`);
    if (error.constraint) summary.push(`  Constraint: ${error.constraint}`);
    summary.push('');
  }
  
  if (context) {
    summary.push('Context:');
    Object.entries(context).forEach(([key, value]) => {
      summary.push(`  ${key}: ${JSON.stringify(value)}`);
    });
    summary.push('');
  }
  
  summary.push('Debugging Tips:');
  summary.push('  1. Run with LAUNCHQL_DEBUG=true for more details');
  summary.push('  2. Check the transaction query history above');
  summary.push('  3. Verify your SQL scripts for syntax errors');
  summary.push('  4. Ensure dependencies are applied in correct order');
  summary.push('  5. Check database permissions and schema existence');
  summary.push('');
  summary.push('=== End Debug Summary ===');
  
  return summary.join('\n');
} 