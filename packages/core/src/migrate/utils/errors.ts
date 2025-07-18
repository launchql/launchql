/**
 * Centralized error handling utilities for the migration system
 * Enhanced error context and logging are only active in debug mode
 */

export interface MigrationErrorContext {
  changeName?: string;
  projectName?: string;
  modulePath?: string;
  sqlQuery?: string;
  sqlParams?: any[];
  errorCode?: string;
  changeKey?: string;
  scriptHash?: string;
}

export class MigrationError extends Error {
  public readonly code?: string;
  public readonly originalError?: Error;
  public readonly context: MigrationErrorContext;
  public readonly isDebugMode: boolean;

  constructor(message: string, context: MigrationErrorContext = {}, originalError?: Error) {
    super(message);
    this.name = 'MigrationError';
    this.context = context;
    this.originalError = originalError;
    this.code = (originalError as any)?.code || context.errorCode;
    this.isDebugMode = process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
    
    if (originalError?.stack) {
      this.stack = originalError.stack;
    }
  }

  public getDetailedMessage(): string {
    if (!this.isDebugMode) {
      return this.message;
    }

    const parts = [this.message];
    
    if (this.context.changeName) {
      parts.push(`Change: ${this.context.changeName}`);
    }
    if (this.context.projectName) {
      parts.push(`Project: ${this.context.projectName}`);
    }
    if (this.context.modulePath) {
      parts.push(`Module: ${this.context.modulePath}`);
    }
    if (this.context.changeKey) {
      parts.push(`Change Key: ${this.context.changeKey}`);
    }
    if (this.context.scriptHash) {
      parts.push(`Script Hash: ${this.context.scriptHash}`);
    }
    if (this.context.sqlQuery) {
      parts.push(`SQL: ${this.context.sqlQuery}`);
    }
    if (this.context.sqlParams) {
      parts.push(`Params: ${JSON.stringify(this.context.sqlParams)}`);
    }
    if (this.code) {
      parts.push(`Error Code: ${this.code}`);
    }
    
    return parts.join('\n  ');
  }

  public getContextualProperties(): Record<string, any> {
    if (!this.isDebugMode) {
      return {};
    }

    return {
      ...this.context,
      code: this.code,
      originalError: this.originalError
    };
  }

  public static createDeploymentError(
    changeName: string,
    projectName: string,
    originalError: Error,
    additionalContext: Partial<MigrationErrorContext> = {}
  ): MigrationError {
    const context: MigrationErrorContext = {
      changeName,
      projectName,
      ...additionalContext
    };

    return new MigrationError(
      `Failed to deploy change '${changeName}' in project '${projectName}': ${originalError.message}`,
      context,
      originalError
    );
  }

  public static createRevertError(
    changeName: string,
    projectName: string,
    originalError: Error,
    additionalContext: Partial<MigrationErrorContext> = {}
  ): MigrationError {
    const context: MigrationErrorContext = {
      changeName,
      projectName,
      ...additionalContext
    };

    return new MigrationError(
      `Failed to revert change '${changeName}' in project '${projectName}': ${originalError.message}`,
      context,
      originalError
    );
  }

  public static createTransactionError(
    originalError: Error,
    additionalContext: Partial<MigrationErrorContext> = {}
  ): MigrationError {
    const context: MigrationErrorContext = {
      ...additionalContext
    };

    let message = `Transaction failed: ${originalError.message}`;
    if ((originalError as any).code === '25P02') {
      message = `Transaction aborted due to previous error: ${originalError.message}`;
    }

    return new MigrationError(message, context, originalError);
  }
}

export function isDebugMode(): boolean {
  return process.env.LAUNCHQL_DEBUG === 'true' || process.env.NODE_ENV === 'development';
}

export function enhanceErrorWithContext(
  error: Error,
  context: MigrationErrorContext
): MigrationError {
  if (error instanceof MigrationError) {
    return error;
  }

  return new MigrationError(error.message, context, error);
}
