import { ModuleMap } from '../modules/modules';

/**
 * Get the list of available extensions, including predefined core extensions.
 */
export const getAvailableExtensions = (
  modules: ModuleMap
): string[] => {
  const coreExtensions = [
    'address_standardizer',
    'address_standardizer_data_us',
    'bloom',
    'btree_gin',
    'btree_gist',
    'citext',
    'hstore',
    'intarray',
    'pg_trgm',
    'pgcrypto',
    'plpgsql',
    'plperl',
    'plv8',
    'postgis_tiger_geocoder',
    'postgis_topology',
    'postgis',
    'postgres_fdw',
    'unaccent',
    'uuid-ossp',
  ];

  return Object.keys(modules).reduce<string[]>((acc, module) => {
    if (!acc.includes(module)) acc.push(module);
    return acc;
  }, [...coreExtensions]);
};
