import type { PgTestClientContext } from '@pgpmjs/types';

/**
 * Generate SQL statements to set PostgreSQL session context variables
 * Uses SET LOCAL ROLE for the 'role' key and set_config() for other variables
 * @param context - Context settings to apply
 * @returns SQL string with SET LOCAL ROLE and set_config() statements
 */
export function generateContextStatements(context: PgTestClientContext): string {
  return Object.entries(context)
    .map(([key, val]) => {
      if (key === 'role') {
        if (val === null || val === undefined) {
          return 'SET LOCAL ROLE NONE;';
        }
        const escapedRole = val.replace(/"/g, '""');
        return `SET LOCAL ROLE "${escapedRole}";`;
      }
      // Use set_config for other context variables
      if (val === null || val === undefined) {
        return `SELECT set_config('${key}', NULL, true);`;
      }
      const escapedVal = val.replace(/'/g, "''");
      return `SELECT set_config('${key}', '${escapedVal}', true);`;
    })
    .join('\n');
}
