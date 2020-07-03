jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import { getConnections as getC } from '@launchql/graphql-testing';

export const getService = (schemas) => ({ dbname }) => ({
  settings: {
    dbname,
    schemas,
    svc: {
      domain: 'localhost',
      subdomain: 'api',
      dbname,
      role_name: 'authenticated',
      anon_role: 'anonymous',
      schemas
    }
  }
});

export const getConnections = async ([PUBLIC_SCHEMA, PRIVATE_SCHEMA]) => {
  return getC([PUBLIC_SCHEMA, PRIVATE_SCHEMA], getService([PUBLIC_SCHEMA]));
};
