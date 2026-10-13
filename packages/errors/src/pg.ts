import type { PgErrorFields } from './types';

/**
 * PostgreSQL SQLSTATE codes for the native errors we surface as public
 * Constructive codes: constraint violations, and `42501` (a missing grant or an
 * RLS `WITH CHECK` refusal). Postgres cannot tell an anonymous caller from a
 * signed-in one at that point, so `42501` is `FORBIDDEN`.
 */
export const SQLSTATE_TO_CODE: Record<string, string> = {
  23505: 'UNIQUE_VIOLATION',
  23503: 'FOREIGN_KEY_VIOLATION',
  23502: 'NOT_NULL_VIOLATION',
  23514: 'CHECK_VIOLATION',
  '23P01': 'EXCLUSION_VIOLATION',
  42501: 'FORBIDDEN'
};

/** SQLSTATE for a user-raised `RAISE EXCEPTION` without an explicit ERRCODE. */
export const RAISE_EXCEPTION_SQLSTATE = 'P0001';

/**
 * Extract extended PostgreSQL error fields from an error-like object. Returns
 * `null` when the value does not look like a pg error (no `code`/`detail`/
 * `where`).
 */
export function extractPgErrorFields(err: unknown): PgErrorFields | null {
  if (!err || typeof err !== 'object') return null;

  const e = err as Record<string, unknown>;
  if (!e.code && !e.detail && !e.where) return null;

  const fields: PgErrorFields = {};
  const assign = (key: keyof PgErrorFields) => {
    const value = e[key];
    if (typeof value === 'string') fields[key] = value;
  };

  (
    [
      'code',
      'detail',
      'hint',
      'where',
      'position',
      'internalPosition',
      'internalQuery',
      'schema',
      'table',
      'column',
      'dataType',
      'constraint',
      'file',
      'line',
      'routine'
    ] as (keyof PgErrorFields)[]
  ).forEach(assign);

  return fields;
}
