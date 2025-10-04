import { PgTestConnectionOptions, RoleMapping } from '@launchql/types';

/**
 * Default role mapping configuration
 */
export const DEFAULT_ROLE_MAPPING: Required<RoleMapping> = {
  anonymous: 'anonymous',
  authenticated: 'authenticated',
  administrator: 'administrator',
  default: 'anonymous'
};

/**
 * Get resolved role mapping with defaults
 */
export const getRoleMapping = (options?: PgTestConnectionOptions): Required<RoleMapping> => {
  return {
    ...DEFAULT_ROLE_MAPPING,
    ...(options?.roles || {})
  };
};

/**
 * Get role name by key with fallback to default mapping
 */
export const getRoleName = (
  roleKey: keyof Omit<RoleMapping, 'default'>, 
  options?: PgTestConnectionOptions
): string => {
  const mapping = getRoleMapping(options);
  return mapping[roleKey];
};

/**
 * Get default role name
 */
export const getDefaultRole = (options?: PgTestConnectionOptions): string => {
  const mapping = getRoleMapping(options);
  return mapping.default;
};

/**
 * Replace role names in SQL using the current mapping
 */
export const substituteRolesInSql = (sql: string, options?: PgTestConnectionOptions): string => {
  const mapping = getRoleMapping(options);
  
  // Replace role names in SQL - handle various patterns
  let result = sql;
  
  // Replace exact role names (word boundaries)
  result = result.replace(/\banonymous\b/g, mapping.anonymous);
  result = result.replace(/\bauthenticated\b/g, mapping.authenticated);
  result = result.replace(/\badministrator\b/g, mapping.administrator);
  
  return result;
};
