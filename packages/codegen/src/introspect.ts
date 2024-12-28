import { Client } from 'pg';

import { IntrospectionOptions, makeIntrospectionQuery } from './query';
import { DatabaseObject } from './types';

// Define the interface for options
export interface GetIntrospectionRowsOptions {
  connectionString: string; // Database connection string
  introspectionOptions: IntrospectionOptions;
  namespacesToIntrospect: string[];
  includeExtensions?: boolean;
}

export const getIntrospectionRows = async (
  options: GetIntrospectionRowsOptions
): Promise<DatabaseObject[]> => {
  const {
    connectionString,
    introspectionOptions,
    namespacesToIntrospect,
    includeExtensions = false,
  } = options;

  const client = new Client({ connectionString });

  try {
    await client.connect();

    // Query for server version in integer format
    const res = await client.query('SHOW server_version_num');
    const serverVersionNum = parseInt(res.rows[0].server_version_num, 10);

    // Generate the introspection query
    const introspectionQuery = makeIntrospectionQuery(serverVersionNum, introspectionOptions);

    // Execute the introspection query and return rows
    const { rows } = await client.query(introspectionQuery, [
      namespacesToIntrospect,
      includeExtensions,
    ]);

    return rows;
  } catch (error) {
    console.error('Error during introspection:', error);
    throw error; // Re-throw the error to the caller
  } finally {
    await client.end();
  }
};

export default getIntrospectionRows;
