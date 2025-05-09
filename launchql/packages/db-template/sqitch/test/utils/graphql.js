jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import {
  getConnections as getC,
  getConnectionsApi as getA
} from '@launchql/graphql-testing';

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

export const getConnections = async (schemas) => {
  return getC(schemas, getService(schemas));
};

export const getConnectionsApi = async ([pub, priv]) => {
  return getA([pub, priv], getService([pub]));
};
