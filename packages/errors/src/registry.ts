import {defineError } from './define';
import { generatedRegistry } from './generated/registry.generated';
import type { ErrorContext, ErrorDefinition } from './types';

export { type DefinedError,defineError } from './define';

/**
 * The curated Constructive error registry.
 *
 * These entries carry refined, typed context and hand-written copy for the
 * codes that matter most (public auth/limit codes with real dashboard copy,
 * native PostgreSQL constraint codes, and the pgpm CLI codes). They OVERRIDE
 * the generated entries in {@link generatedRegistry} — every constructive-db
 * code is present via generation; these just refine a subset.
 */
export const registry = {
  STORAGE_BUCKET_NOT_RECONCILED: defineError({
    code: 'STORAGE_BUCKET_NOT_RECONCILED',
    class: 'public',
    http: 409,
    message: 'The storage bucket has not yet been reconciled.'
  }),

  // ===========================================================================
  // Auth / account (public) — copy sourced from dashboard auth-errors.ts
  // ===========================================================================
  ACCOUNT_EXISTS: defineError({
    code: 'ACCOUNT_EXISTS',
    class: 'public',
    http: 409,
    message: 'An account with this email already exists. Please sign in or use a different email.'
  }),
  ALREADY_AUTHENTICATED_USE_LINK: defineError({
    code: 'ALREADY_AUTHENTICATED_USE_LINK',
    class: 'public',
    http: 409,
    message:
      'You are already signed in. Add this email or phone number to your current account instead of creating a new one.'
  }),
  IDENTIFIER_CONFLICT: defineError({
    code: 'IDENTIFIER_CONFLICT',
    class: 'public',
    http: 409,
    message: 'The email and phone number belong to different accounts. Provide only one of them.'
  }),
  // Verified-only identifier uniqueness: an email/phone may sit unverified on
  // several accounts, but only one account may hold it verified.
  IDENTIFIER_VERIFIED_ELSEWHERE: defineError({
    code: 'IDENTIFIER_VERIFIED_ELSEWHERE',
    class: 'public',
    http: 409,
    message:
      'This email or phone number is already verified on another account. Sign in to that account or use a different one.'
  }),
  IDENTIFIER_UNVERIFIED_AMBIGUOUS: defineError({
    code: 'IDENTIFIER_UNVERIFIED_AMBIGUOUS',
    class: 'public',
    http: 409,
    message:
      'This email or phone number is pending verification on more than one account. Verify it first to continue.'
  }),
  IDENTIFIER_CLAIM_LIMIT: defineError<{ limit?: number }>({
    code: 'IDENTIFIER_CLAIM_LIMIT',
    class: 'public',
    http: 429,
    message:
      'This account has too many unverified emails or phone numbers. Verify or remove one before adding another.'
  }),
  MFA_IDENTIFIER_UNVERIFIED: defineError({
    code: 'MFA_IDENTIFIER_UNVERIFIED',
    class: 'public',
    http: 403,
    message: 'Verify this email or phone number before using it for multi-factor authentication.'
  }),
  SMS_VERIFICATION_DISABLED: defineError({
    code: 'SMS_VERIFICATION_DISABLED',
    class: 'public',
    http: 403,
    message: 'Phone number verification is not enabled.'
  }),
  ACCOUNT_NOT_FOUND: defineError({
    code: 'ACCOUNT_NOT_FOUND',
    class: 'public',
    http: 404,
    message: 'No account was found.'
  }),
  NO_ACCOUNT_EXISTS: defineError<{ userId?: string }>({
    code: 'NO_ACCOUNT_EXISTS',
    class: 'public',
    http: 404,
    message: 'No account exists for this user.'
  }),
  INVALID_CREDENTIALS: defineError({
    code: 'INVALID_CREDENTIALS',
    class: 'public',
    http: 401,
    message: 'Invalid email or password.'
  }),
  INCORRECT_PASSWORD: defineError({
    code: 'INCORRECT_PASSWORD',
    class: 'public',
    http: 401,
    message: 'The password you entered is incorrect. Please try again.'
  }),
  ACCOUNT_LOCKED_EXCEED_ATTEMPTS: defineError({
    code: 'ACCOUNT_LOCKED_EXCEED_ATTEMPTS',
    class: 'public',
    http: 423,
    message:
      'Your account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password.'
  }),
  ACCOUNT_DISABLED: defineError({
    code: 'ACCOUNT_DISABLED',
    class: 'public',
    http: 403,
    message: 'Your account has been disabled. Please contact support for assistance.'
  }),
  PASSWORD_INSECURE: defineError({
    code: 'PASSWORD_INSECURE',
    class: 'public',
    http: 400,
    message: 'This password is not secure enough. Please choose a stronger password.'
  }),
  PASSWORD_LEN: defineError({
    code: 'PASSWORD_LEN',
    class: 'public',
    http: 400,
    message: 'Password must be between 8 and 63 characters long.'
  }),
  EMAIL_NOT_VERIFIED: defineError({
    code: 'EMAIL_NOT_VERIFIED',
    class: 'public',
    http: 403,
    message: 'Please verify your email address to continue.'
  }),
  SIGN_UP_DISABLED: defineError({
    code: 'SIGN_UP_DISABLED',
    class: 'public',
    http: 403,
    message: 'Sign-up is currently disabled.'
  }),
  SIGN_UP_REQUIRES_INVITE: defineError({
    code: 'SIGN_UP_REQUIRES_INVITE',
    class: 'public',
    http: 403,
    message: 'Sign-up is by invitation only. Please provide a valid invite code.'
  }),

  // ===========================================================================
  // Auth / account (public) — migrated from the server graphile SAFE_ERROR_CODES
  // allowlist so the registry (not a hand-maintained set) is the source of truth
  // for what is user-facing.
  // ===========================================================================
  USER_NOT_AUTHENTICATED: defineError({
    code: 'USER_NOT_AUTHENTICATED',
    class: 'public',
    http: 401,
    message: 'You must be signed in to do that.'
  }),
  WEBAUTHN_VERIFICATION_FAILED: defineError({
    code: 'WEBAUTHN_VERIFICATION_FAILED',
    class: 'public',
    http: 401,
    message: 'The passkey response could not be verified.'
  }),
  ACCOUNT_LOCKED: defineError({
    code: 'ACCOUNT_LOCKED',
    class: 'public',
    http: 423,
    message: 'Your account is locked. Please try again later or reset your password.'
  }),
  USER_NOT_FOUND: defineError({
    code: 'USER_NOT_FOUND',
    class: 'public',
    http: 404,
    message: 'No matching user was found.'
  }),
  NO_PRIMARY_EMAIL: defineError({
    code: 'NO_PRIMARY_EMAIL',
    class: 'public',
    http: 400,
    message: 'No primary email address is set for this account.'
  }),
  NO_CREDENTIALS: defineError({
    code: 'NO_CREDENTIALS',
    class: 'public',
    http: 400,
    message: 'No credentials were provided.'
  }),
  BAD_SIGNIN: defineError({
    code: 'BAD_SIGNIN',
    class: 'public',
    http: 401,
    message: 'Sign in failed. Please check your credentials and try again.'
  }),

  // ===========================================================================
  // Auth method toggles (public) — app-level allow_* settings
  // ===========================================================================
  SSO_SIGN_IN_DISABLED: defineError({
    code: 'SSO_SIGN_IN_DISABLED',
    class: 'public',
    http: 403,
    message: 'Single sign-on is not enabled for sign in.'
  }),
  SSO_SIGN_UP_DISABLED: defineError({
    code: 'SSO_SIGN_UP_DISABLED',
    class: 'public',
    http: 403,
    message: 'Single sign-on is not enabled for sign up.'
  }),
  SSO_ACCOUNT_NOT_FOUND: defineError({
    code: 'SSO_ACCOUNT_NOT_FOUND',
    class: 'public',
    http: 404,
    message: 'No single sign-on account was found.'
  }),
  MAGIC_LINK_SIGN_IN_DISABLED: defineError({
    code: 'MAGIC_LINK_SIGN_IN_DISABLED',
    class: 'public',
    http: 403,
    message: 'Magic link sign in is disabled.'
  }),
  MAGIC_LINK_SIGN_UP_DISABLED: defineError({
    code: 'MAGIC_LINK_SIGN_UP_DISABLED',
    class: 'public',
    http: 403,
    message: 'Magic link sign up is disabled.'
  }),
  EMAIL_OTP_SIGN_IN_DISABLED: defineError({
    code: 'EMAIL_OTP_SIGN_IN_DISABLED',
    class: 'public',
    http: 403,
    message: 'Email one-time-code sign in is disabled.'
  }),

  // ===========================================================================
  // PublicKeySignature / uploads / misc (public) — migrated from the allowlist
  // ===========================================================================
  INVALID_PUBLIC_KEY: defineError({
    code: 'INVALID_PUBLIC_KEY',
    class: 'public',
    http: 400,
    message: 'The public key is invalid.'
  }),
  INVALID_MESSAGE: defineError({
    code: 'INVALID_MESSAGE',
    class: 'public',
    http: 400,
    message: 'The message is invalid.'
  }),
  INVALID_SIGNATURE: defineError({
    code: 'INVALID_SIGNATURE',
    class: 'public',
    http: 401,
    message: 'The signature is invalid.'
  }),
  UPLOAD_MIMETYPE: defineError({
    code: 'UPLOAD_MIMETYPE',
    class: 'public',
    http: 415,
    message: 'This file type is not allowed.'
  }),
  SINGLETON_TABLE: defineError({
    code: 'SINGLETON_TABLE',
    class: 'public',
    http: 409,
    message: 'Only one record is allowed for this resource.'
  }),

  // ===========================================================================
  // Invites (public)
  // ===========================================================================
  INVITE_NOT_FOUND: defineError({
    code: 'INVITE_NOT_FOUND',
    class: 'public',
    http: 404,
    message:
      'The invitation code is invalid or has expired. Please check the code or request a new invitation.'
  }),
  INVITE_LIMIT: defineError({
    code: 'INVITE_LIMIT',
    class: 'public',
    http: 429,
    message: 'This invitation has reached its usage limit. Please request a new invitation.'
  }),
  INVITE_ACCOUNT_EXISTS_UNVERIFIED: defineError({
    code: 'INVITE_ACCOUNT_EXISTS_UNVERIFIED',
    class: 'public',
    http: 409,
    message:
      'An unverified account already exists for this identifier and has no active invitation. Ask the user to verify their account instead.'
  }),
  INVITE_EMAIL_NOT_FOUND: defineError({
    code: 'INVITE_EMAIL_NOT_FOUND',
    class: 'public',
    http: 404,
    message:
      'This email is not associated with the invitation. Please use the email address the invitation was sent to.'
  }),
  INVITE_PHONE_NOT_FOUND: defineError({
    code: 'INVITE_PHONE_NOT_FOUND',
    class: 'public',
    http: 404,
    message:
      'This phone number is not associated with the invitation. Please use the phone number the invitation was sent to.'
  }),
  INVITE_ADDRESS_REQUIRED: defineError({
    code: 'INVITE_ADDRESS_REQUIRED',
    class: 'public',
    http: 400,
    message: 'An email address or phone number is required.'
  }),
  INVITE_USERS_INVALID: defineError({
    code: 'INVITE_USERS_INVALID',
    class: 'public',
    http: 400,
    message: 'The users payload must be a JSON array.'
  }),

  // ===========================================================================
  // Authorization / step-up (public)
  // ===========================================================================
  UNAUTHENTICATED: defineError({
    code: 'UNAUTHENTICATED',
    class: 'public',
    http: 401,
    message: 'You must be signed in to do that.'
  }),
  CAPTCHA_REQUIRED: defineError({
    code: 'CAPTCHA_REQUIRED',
    class: 'public',
    http: 400,
    message: 'Please complete the CAPTCHA challenge.'
  }),
  CAPTCHA_FAILED: defineError({
    code: 'CAPTCHA_FAILED',
    class: 'public',
    http: 403,
    message: 'CAPTCHA verification failed. Please try again.'
  }),
  FORBIDDEN: defineError({
    code: 'FORBIDDEN',
    class: 'public',
    http: 403,
    message: 'You do not have permission to do that.'
  }),
  ACCESS_SUSPENDED: defineError<{ reason?: string }>({
    code: 'ACCESS_SUSPENDED',
    class: 'public',
    http: 403,
    message: 'Access to this database is suspended.'
  }),
  SUSPENSION_FORBIDDEN: defineError<{ database_id?: string }>({
    code: 'SUSPENSION_FORBIDDEN',
    class: 'public',
    http: 403,
    message: 'Only the platform may change database suspension.'
  }),
  SUSPENSION_REASON_INVALID: defineError<{ reason?: string }>({
    code: 'SUSPENSION_REASON_INVALID',
    class: 'public',
    http: 400,
    message: 'Suspension reason must be "billing" or "admin".'
  }),
  STEP_UP_REQUIRED: defineError({
    code: 'STEP_UP_REQUIRED',
    class: 'public',
    http: 403,
    message: 'Additional verification is required to continue.'
  }),
  MFA_REQUIRED: defineError({
    code: 'MFA_REQUIRED',
    class: 'public',
    http: 403,
    message: 'Multi-factor authentication is required to continue.'
  }),
  INVALID_TOKEN: defineError({
    code: 'INVALID_TOKEN',
    class: 'public',
    http: 401,
    message: 'This link or token is invalid or has expired.'
  }),

  // ===========================================================================
  // Limits (public, dynamic)
  // ===========================================================================
  LIMIT_REACHED: defineError<{ resource?: string; limit?: number }>({
    code: 'LIMIT_REACHED',
    class: 'public',
    http: 429,
    message: 'You have reached a plan limit for this resource.',
    positional: ['resource', 'limit']
  }),
  BILLING_QUOTA_EXCEEDED: defineError({
    code: 'BILLING_QUOTA_EXCEEDED',
    class: 'public',
    http: 429,
    message: 'You have used up your usage allowance for this resource.'
  }),
  RATE_LIMITED: defineError({
    code: 'RATE_LIMITED',
    class: 'public',
    http: 429,
    message: 'Too many requests. Please slow down and try again shortly.'
  }),

  // ===========================================================================
  // Billing provider operations (public)
  // ===========================================================================
  BILLING_NOT_READY: defineError<{ database_id?: string; checked_at?: string | null; ready?: boolean | null }>({
    code: 'BILLING_NOT_READY',
    class: 'public',
    http: 409,
    message: 'Billing is not ready for this database yet. Please try again shortly.'
  }),
  BILLING_ENTITY_BUSY: defineError<{ entity_id?: string }>({
    code: 'BILLING_ENTITY_BUSY',
    class: 'public',
    http: 409,
    message: 'Another billing operation is already in progress for this account. Please wait for it to finish.'
  }),
  BILLING_OPERATION_CONFLICT: defineError<{ operation_id?: string }>({
    code: 'BILLING_OPERATION_CONFLICT',
    class: 'public',
    http: 409,
    message: 'This billing operation ID was already used for a different request.'
  }),
  BILLING_OPERATION_INVALID: defineError({
    code: 'BILLING_OPERATION_INVALID',
    class: 'public',
    http: 400,
    message: 'The billing operation request is invalid.'
  }),
  BILLING_SUBSCRIPTION_ACTIVE: defineError<{ entity_id?: string; external_subscription_id?: string }>({
    code: 'BILLING_SUBSCRIPTION_ACTIVE',
    class: 'public',
    http: 409,
    message: 'This account still has an active subscription. Cancel the subscription before deleting the account.'
  }),
  UNKNOWN_METER: defineError<{ meter_slug?: string }>({
    code: 'UNKNOWN_METER',
    class: 'public',
    http: 404,
    message: 'The requested meter does not exist.'
  }),

  // ===========================================================================
  // Request protection (public, dynamic) — raised by the GraphQL runtime when a
  // request exceeds the bounds resolved from database_settings/api_settings.
  // Each carries the limit that was in force so a client can adapt rather than
  // guess.
  // ===========================================================================
  QUERY_TOO_DEEP: defineError<{ depth?: number; limit?: number }>({
    code: 'QUERY_TOO_DEEP',
    class: 'public',
    http: 400,
    message: 'The query is nested too deeply. Please request fewer nested levels.',
    positional: ['depth', 'limit']
  }),
  QUERY_TOO_COSTLY: defineError<{ cost?: number; limit?: number }>({
    code: 'QUERY_TOO_COSTLY',
    class: 'public',
    http: 400,
    message: 'The query is too expensive. Please request fewer records or fewer nested lists.',
    positional: ['cost', 'limit']
  }),
  PAGE_SIZE_TOO_LARGE: defineError<{ requested?: number; limit?: number }>({
    code: 'PAGE_SIZE_TOO_LARGE',
    class: 'public',
    http: 400,
    message: 'The requested page size is too large. Please request fewer records per page.',
    positional: ['requested', 'limit']
  }),
  REQUEST_TOO_LARGE: defineError<{ bytes?: number; limit?: number }>({
    code: 'REQUEST_TOO_LARGE',
    class: 'public',
    http: 413,
    message: 'The request body is too large.',
    positional: ['bytes', 'limit']
  }),
  CONCURRENCY_LIMIT_REACHED: defineError<{ limit?: number; waitedMs?: number }>({
    code: 'CONCURRENCY_LIMIT_REACHED',
    class: 'public',
    http: 429,
    message: 'Too many requests are in flight for this API. Please retry in a moment.',
    positional: ['limit', 'waitedMs']
  }),
  INTROSPECTION_DISABLED: defineError({
    code: 'INTROSPECTION_DISABLED',
    class: 'public',
    http: 403,
    message: 'Schema introspection is disabled for this API.'
  }),

  // ===========================================================================
  // Client / transport (public) — synthesized client-side by the GraphQL client
  // for network, timeout, and HTTP-level failures (no DB/server origin).
  // ===========================================================================
  NETWORK_ERROR: defineError({
    code: 'NETWORK_ERROR',
    class: 'public',
    http: 0,
    message: 'Network error. Please check your connection and try again.'
  }),
  TIMEOUT_ERROR: defineError({
    code: 'TIMEOUT_ERROR',
    class: 'public',
    http: 408,
    message: 'The request timed out. Please try again.'
  }),
  BAD_USER_INPUT: defineError({
    code: 'BAD_USER_INPUT',
    class: 'public',
    http: 400,
    message: 'The request was invalid. Please check your input and try again.'
  }),
  VALIDATION_FAILED: defineError({
    code: 'VALIDATION_FAILED',
    class: 'public',
    http: 400,
    message: 'Validation failed. Please check your input and try again.'
  }),
  UNKNOWN_ERROR: defineError({
    code: 'UNKNOWN_ERROR',
    class: 'internal',
    http: 500,
    message: 'An unexpected error occurred.'
  }),

  // ===========================================================================
  // Native PostgreSQL constraint violations (public) — synthetic codes mapped
  // from SQLSTATE by parse().
  // ===========================================================================
  UNIQUE_VIOLATION: defineError<{ constraint?: string; table?: string }>({
    code: 'UNIQUE_VIOLATION',
    class: 'public',
    http: 409,
    message: 'That value already exists.'
  }),
  FOREIGN_KEY_VIOLATION: defineError<{ constraint?: string; table?: string }>({
    code: 'FOREIGN_KEY_VIOLATION',
    class: 'public',
    http: 409,
    message: 'A related record is required or still referenced.'
  }),
  NOT_NULL_VIOLATION: defineError<{ column?: string; table?: string }>({
    code: 'NOT_NULL_VIOLATION',
    class: 'public',
    http: 400,
    message: 'A required value is missing.'
  }),
  CHECK_VIOLATION: defineError<{ constraint?: string; table?: string }>({
    code: 'CHECK_VIOLATION',
    class: 'public',
    http: 400,
    message: 'A value did not satisfy a constraint.'
  }),
  EXCLUSION_VIOLATION: defineError<{ constraint?: string; table?: string }>({
    code: 'EXCLUSION_VIOLATION',
    class: 'public',
    http: 409,
    message: 'A value conflicts with an existing record.'
  }),

  // ===========================================================================
  // pgpm CLI / engine (mostly internal) — behavior preserved from the former
  // pgpm/types error-factory so existing call sites are unchanged.
  // ===========================================================================
  NOT_FOUND: defineError({
    code: 'NOT_FOUND',
    class: 'public',
    http: 404,
    message: 'Not found.'
  }),
  MODULE_NOT_FOUND: defineError<{ name: string }>({
    code: 'MODULE_NOT_FOUND',
    class: 'internal',
    http: 404,
    message: 'Module "{{name}}" not found in modules list.'
  }),
  INTERNAL_FAILURE: defineError<{ details: string }>({
    code: 'INTERNAL_FAILURE',
    class: 'internal',
    http: 500,
    message: 'Something went wrong: {{details}}'
  }),
  CONTEXT_MISSING: defineError({
    code: 'CONTEXT_MISSING',
    class: 'internal',
    http: 500,
    message: 'Context is not initialized. Did you run setup()?'
  }),
  NOT_IN_WORKSPACE: defineError({
    code: 'NOT_IN_WORKSPACE',
    class: 'internal',
    http: 400,
    message: 'You must be in a PGPM workspace. Initialize with "pgpm init workspace".'
  }),
  NOT_IN_WORKSPACE_MODULE: defineError({
    code: 'NOT_IN_WORKSPACE_MODULE',
    class: 'internal',
    http: 400,
    message: 'Error: You must be inside one of the workspace packages.'
  }),
  DEPLOYMENT_FAILED: defineError<{ type: 'Deployment' | 'Revert' | 'Verify'; module: string }>({
    code: 'DEPLOYMENT_FAILED',
    class: 'internal',
    http: 500,
    message: '{{type}} failed for module: {{module}}'
  }),
  UNSUPPORTED_TYPE_HINT: defineError<{ typeHint: string }>({
    code: 'UNSUPPORTED_TYPE_HINT',
    class: 'internal',
    http: 400,
    message: 'Unsupported type hint: {{typeHint}}'
  }),
  BAD_FILE_NAME: defineError<{ name: string }>({
    code: 'BAD_FILE_NAME',
    class: 'internal',
    http: 400,
    message: 'Invalid file name: {{name}}'
  }),
  UNKNOWN_COMMAND: defineError<{ cmd: string }>({
    code: 'UNKNOWN_COMMAND',
    class: 'internal',
    http: 400,
    message: 'Unknown command: {{cmd}}'
  }),
  CHANGE_NOT_FOUND: defineError<{ change: string; plan?: string }>({
    code: 'CHANGE_NOT_FOUND',
    class: 'internal',
    http: 404,
    message: ({ change, plan }) =>
      `Change '${change}' not found in plan${plan ? ` file: ${plan}` : ''}`
  }),
  TAG_NOT_FOUND: defineError<{ tag: string; project?: string }>({
    code: 'TAG_NOT_FOUND',
    class: 'internal',
    http: 404,
    message: ({ tag, project }) =>
      `Tag '${tag}' not found${project ? ` in project ${project}` : ' in plan'}`
  }),
  PATH_NOT_FOUND: defineError<{ path: string; type: 'module' | 'workspace' | 'file' }>({
    code: 'PATH_NOT_FOUND',
    class: 'internal',
    http: 404,
    message: ({ path, type }) => `${type} path not found: ${path}`
  }),
  OPERATION_FAILED: defineError<{ operation: string; target?: string; reason?: string }>({
    code: 'OPERATION_FAILED',
    class: 'internal',
    http: 500,
    message: ({ operation, target, reason }) =>
      `${operation} failed${target ? ` for ${target}` : ''}${reason ? `: ${reason}` : ''}`
  }),
  PLAN_PARSE_ERROR: defineError<{ planPath: string; errors: string }>({
    code: 'PLAN_PARSE_ERROR',
    class: 'internal',
    http: 400,
    message: ({ planPath, errors }) => `Failed to parse plan file ${planPath}: ${errors}`
  }),
  CIRCULAR_DEPENDENCY: defineError<{ module: string; dependency: string }>({
    code: 'CIRCULAR_DEPENDENCY',
    class: 'internal',
    http: 400,
    message: ({ module, dependency }) => `Circular reference detected: ${module} → ${dependency}`
  }),
  INVALID_NAME: defineError<{ name: string; type: 'tag' | 'change' | 'module'; rules?: string }>({
    code: 'INVALID_NAME',
    class: 'internal',
    http: 400,
    message: ({ name, type, rules }) => `Invalid ${type} name: ${name}${rules ? `. ${rules}` : ''}`
  }),
  WORKSPACE_OPERATION_ERROR: defineError<{ operation: string }>({
    code: 'WORKSPACE_OPERATION_ERROR',
    class: 'internal',
    http: 400,
    message: ({ operation }) =>
      `Cannot perform non-recursive ${operation} on workspace. Use recursive=true or specify a target module.`
  }),
  FILE_NOT_FOUND: defineError<{ filePath: string; type?: string }>({
    code: 'FILE_NOT_FOUND',
    class: 'internal',
    http: 404,
    message: ({ filePath, type }) => `${type ? `${type} file` : 'File'} not found: ${filePath}`
  })
} as const;

export type Registry = typeof registry;
export type RegistryCode = keyof Registry;

/**
 * All known definitions, keyed by code: every constructive-db code (generated)
 * merged with the curated entries, curated winning on conflict.
 */
const allDefinitions: Record<string, ErrorDefinition<ErrorContext>> = {
  ...generatedRegistry,
  ...(registry as unknown as Record<string, ErrorDefinition<ErrorContext>>)
};

/** Look up a definition by code (from anywhere, not just typed keys). */
export function getDefinition(code: string): ErrorDefinition<ErrorContext> | undefined {
  return allDefinitions[code];
}

/** Every registered code (curated + generated). */
export function allCodes(): string[] {
  return Object.keys(allDefinitions);
}
