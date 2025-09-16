import { LaunchQLError } from '@launchql/types';
import { Logger } from '@launchql/logger';
import { teardownPgPools } from 'pg-cache';

const log = new Logger('cli');

/**
 * CLI error utility that logs error information and exits with code 1.
 * Provides consistent error handling and user experience across all CLI commands.
 * 
 * IMPORTANT: This function properly cleans up PostgreSQL connections before exiting.
 */
export const exitWithError = async (
  error: LaunchQLError | Error | string,
  context?: Record<string, any>
): Promise<never> => {
  if (error instanceof LaunchQLError) {
    // For LaunchQLError instances, use structured logging
    log.error(`Error: ${error.message}`);
    
    // Log additional context if available
    if (error.context && Object.keys(error.context).length > 0) {
      log.debug('Error context:', error.context);
    }
    
    // Log any additional context provided
    if (context) {
      log.debug('Additional context:', context);
    }
  } else if (error instanceof Error) {
    // For generic Error instances
    log.error(`Error: ${error.message}`);
    if (context) {
      log.debug('Context:', context);
    }
  } else if (typeof error === 'string') {
    // For simple string messages
    log.error(`Error: ${error}`);
    if (context) {
      log.debug('Context:', context);
    }
  }

  // Perform cleanup before exiting
  try {
    await teardownPgPools();
    log.debug('Database connections cleaned up');
  } catch (cleanupError) {
    log.warn('Failed to cleanup database connections:', cleanupError);
    // Don't let cleanup errors prevent the exit
  }

  process.exit(1);
};

/**
 * Simple CLI error function that logs an error message and exits with code 1.
 * Handles cleanup of database connections before exiting.
 * 
 * @param message - Error message to display
 * @param context - Optional context for debugging
 */
export const cliError = (
  message: string, 
  context?: Record<string, any>
): Promise<never> => exitWithError(message, context);

/**
 * Alternative entry point for LaunchQLError instances
 */
export const cliErrorWithException = (
  error: LaunchQLError | Error,
  context?: Record<string, any>
): Promise<never> => exitWithError(error, context);
