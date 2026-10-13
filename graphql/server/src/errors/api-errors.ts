/**
 * Typed API Error System
 *
 * Provides strongly-typed error hierarchy for the GraphQL server with:
 * - Consistent error classification
 * - HTTP status mapping
 * - Serialization for API responses and logging
 *
 * @module errors/api-errors
 */

// =============================================================================
// Error Codes Constant
// =============================================================================

/**
 * Centralized error code definitions for external use and type safety.
 * Use these constants instead of string literals for error code comparisons.
 */
export const ErrorCodes = {
  DOMAIN_NOT_FOUND: 'DOMAIN_NOT_FOUND',
  API_NOT_FOUND: 'API_NOT_FOUND',
  NO_VALID_SCHEMAS: 'NO_VALID_SCHEMAS',
  SCHEMA_INVALID: 'SCHEMA_INVALID',
  SCHEMA_ACCESS_DENIED: 'SCHEMA_ACCESS_DENIED',
  HANDLER_ERROR: 'HANDLER_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  AMBIGUOUS_TENANT: 'AMBIGUOUS_TENANT',
  ADMIN_AUTH_REQUIRED: 'ADMIN_AUTH_REQUIRED',
  INVALID_SESSION_COOKIE_HEADER: 'INVALID_SESSION_COOKIE_HEADER',
} as const;

/**
 * Type alias for valid error codes.
 * Derived from the ErrorCodes constant for type safety.
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// =============================================================================
// Base Error Class
// =============================================================================

/**
 * Base class for all API errors.
 *
 * Provides consistent structure for error handling including:
 * - Machine-readable error codes
 * - HTTP status code mapping
 * - Optional debugging context
 * - JSON serialization for API responses
 *
 * @example
 * ```typescript
 * throw new ApiError('CUSTOM_ERROR', 400, 'Something went wrong', { detail: 'info' });
 * ```
 */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;

  constructor(
    code: string,
    statusCode: number,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.name = 'ApiError';

    // Ensure instanceof checks work correctly with ES5 transpilation
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace for V8 engines (Node.js)
    // Points to error origin rather than base class constructor
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error for API responses and structured logging.
   *
   * @returns Object with error details suitable for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.context && { context: this.context }),
    };
  }
}

// =============================================================================
// Error Subclasses
// =============================================================================

/**
 * Thrown when a domain lookup fails to find a matching API.
 *
 * @example
 * ```typescript
 * throw new DomainNotFoundError('example.com', 'api');
 * // Results in: "No API configured for domain: api.example.com"
 * ```
 */
export class DomainNotFoundError extends ApiError {
  constructor(domain: string, subdomain: string | null) {
    const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;
    super(
      ErrorCodes.DOMAIN_NOT_FOUND,
      404,
      `No API configured for domain: ${fullDomain}`,
      { domain, subdomain, fullDomain }
    );
    this.name = 'DomainNotFoundError';
  }
}

/**
 * Thrown when a specific API cannot be found by its ID.
 *
 * @example
 * ```typescript
 * throw new ApiNotFoundError('api-123');
 * ```
 */
export class ApiNotFoundError extends ApiError {
  constructor(apiId: string) {
    super(ErrorCodes.API_NOT_FOUND, 404, `API not found: ${apiId}`, { apiId });
    this.name = 'ApiNotFoundError';
  }
}

/**
 * Thrown when no valid schemas are found for an API.
 *
 * @example
 * ```typescript
 * throw new NoValidSchemasError('api-123');
 * ```
 */
export class NoValidSchemasError extends ApiError {
  constructor(apiId: string) {
    super(
      ErrorCodes.NO_VALID_SCHEMAS,
      404,
      `No valid schemas found for API: ${apiId}`,
      { apiId }
    );
    this.name = 'NoValidSchemasError';
  }
}

/**
 * Thrown when schema validation fails.
 *
 * @example
 * ```typescript
 * throw new SchemaValidationError('Invalid schema structure', { field: 'name' });
 * ```
 */
export class SchemaValidationError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCodes.SCHEMA_INVALID, 400, message, context);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Thrown when a request handler cannot be created.
 *
 * @example
 * ```typescript
 * throw new HandlerCreationError('Failed to create PostGraphile handler', { reason: 'timeout' });
 * ```
 */
export class HandlerCreationError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCodes.HANDLER_ERROR, 500, message, context);
    this.name = 'HandlerCreationError';
  }
}

/**
 * Thrown when the database connection fails.
 *
 * @example
 * ```typescript
 * throw new DatabaseConnectionError('Connection timeout', { host: 'db.example.com' });
 * ```
 */
export class DatabaseConnectionError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCodes.DATABASE_CONNECTION_ERROR, 503, message, context);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Thrown when a tenant attempts to access schemas they do not own.
 * Returns 403 Forbidden to indicate the schemas exist but access is denied.
 *
 * Security Note: This error intentionally does not reveal which specific
 * schemas exist to prevent information disclosure.
 *
 * @example
 * ```typescript
 * throw new SchemaAccessDeniedError(['schema1', 'schema2'], 'db-123');
 * ```
 */
export class SchemaAccessDeniedError extends ApiError {
  constructor(schemas: string[], databaseId: string) {
    super(
      ErrorCodes.SCHEMA_ACCESS_DENIED,
      403,
      `Access denied: requested schemas are not associated with tenant`,
      { schemas, databaseId }
    );
    this.name = 'SchemaAccessDeniedError';
  }
}

/**
 * Thrown when domain resolution is ambiguous (multiple APIs match).
 * This is a security concern as it indicates potential misconfiguration
 * that could lead to unpredictable tenant routing.
 *
 * @example
 * ```typescript
 * throw new AmbiguousTenantError('example.com', 'api', 2);
 * ```
 */
export class AmbiguousTenantError extends ApiError {
  constructor(domain: string, subdomain: string | null, matchCount: number) {
    const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;
    super(
      ErrorCodes.AMBIGUOUS_TENANT,
      500,
      `Ambiguous tenant resolution: multiple APIs (${matchCount}) match domain ${fullDomain}`,
      { domain, subdomain, fullDomain, matchCount }
    );
    this.name = 'AmbiguousTenantError';
  }
}

/**
 * Thrown when admin authentication is required but not provided or invalid.
 * Used for private API endpoints that require explicit admin credentials.
 *
 * @example
 * ```typescript
 * throw new AdminAuthRequiredError('Missing authorization header');
 * ```
 */
export class AdminAuthRequiredError extends ApiError {
  constructor(reason: string) {
    super(
      ErrorCodes.ADMIN_AUTH_REQUIRED,
      401,
      `Admin authentication required: ${reason}`,
      { reason }
    );
    this.name = 'AdminAuthRequiredError';
  }
}

/**
 * Thrown when the session-cookie opt-out header carries a value other than
 * the one the server accepts, so a typo never silently falls back to cookies.
 */
export class InvalidSessionCookieHeaderError extends ApiError {
  constructor(header: string, value: string, accepted: string) {
    super(
      ErrorCodes.INVALID_SESSION_COOKIE_HEADER,
      400,
      `${header} accepts only "${accepted}"`,
      { header, value, accepted }
    );
    this.name = 'InvalidSessionCookieHeaderError';
  }
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if an error is an instance of ApiError or any of its subclasses.
 *
 * @param error - The value to check
 * @returns True if error is an ApiError instance
 *
 * @example
 * ```typescript
 * try {
 *   await resolveApi(req);
 * } catch (error) {
 *   if (isApiError(error)) {
 *     // TypeScript knows error has code, statusCode, context
 *     console.log(error.code);
 *     res.status(error.statusCode).json(error.toJSON());
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Check if an error has a specific error code.
 * Returns false for non-ApiError values.
 *
 * @param error - The value to check
 * @param code - The error code to match against
 * @returns True if error is an ApiError with the specified code
 *
 * @example
 * ```typescript
 * if (hasErrorCode(error, ErrorCodes.DOMAIN_NOT_FOUND)) {
 *   // Handle domain not found specifically
 *   logDomainMisconfiguration(error.context?.fullDomain);
 * }
 * ```
 */
export function hasErrorCode(error: unknown, code: string): error is ApiError {
  return isApiError(error) && error.code === code;
}
