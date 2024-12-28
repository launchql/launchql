import { Client } from 'pg';

import { IntrospectionOptions, makeIntrospectionQuery } from './query';
import { DatabaseObject } from './types';

// Setup PostgreSQL Client
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'password',
  port: 5432,
});

// Define the interface for options
export interface GetIntrospectionRowsOptions {
  introspectionOptions: IntrospectionOptions;
  namespacesToIntrospect: string[];
  includeExtensions?: boolean;
  databaseName?: string; // Optional property if you'd like flexibility for different databases
}

export const getIntrospectionRows = async (
  options: GetIntrospectionRowsOptions
): Promise<DatabaseObject[]> => {
  const {
    introspectionOptions,
    namespacesToIntrospect,
    includeExtensions = false,
    databaseName = 'mydb', // Default database name
  } = options;

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
