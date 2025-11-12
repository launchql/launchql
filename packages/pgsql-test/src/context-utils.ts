import type { PgTextClientContext } from '@launchql/types';

/**
 * Generate SQL statements to set PostgreSQL session context variables
 * @param context - Context settings to apply
 * @returns SQL string with set_config() statements
 */
export function generateContextStatements(context: PgTextClientContext): string {
  return Object.entries(context)
    .map(([key, val]) =>
      val === null || val === undefined
        ? `SELECT set_config('${key}', NULL, true);`
        : `SELECT set_config('${key}', '${val}', true);`
    )
    .join('\n');
}
