import { Logger } from '@pgpmjs/logger';
import { Client } from 'pg';

import { IntrospectionOptions, makeIntrospectionQuery } from './query';
import { DatabaseObject } from './types';
const log = new Logger('pg-codegen');

export interface GetIntrospectionRowsOptions {
  client: Client; // Database connection
  introspectionOptions: IntrospectionOptions; // Options for introspection
  namespacesToIntrospect: string[]; // Namespaces to include
  includeExtensions?: boolean; // Whether to include extensions, defaults to false
}

export const getIntrospectionRows = async (
  options: GetIntrospectionRowsOptions
): Promise<DatabaseObject[]> => {
  const {
    client,
    introspectionOptions,
    namespacesToIntrospect,
    includeExtensions = false,
  } = options;

  try {
    // Query for server version in integer format
    const res = await client.query('SHOW server_version_num');
    const serverVersionNum = parseInt(res.rows[0].server_version_num, 10);

    // Generate the introspection query
    const introspectionQuery = makeIntrospectionQuery(serverVersionNum, introspectionOptions);

    // Execute the introspection query
    const queryResult = await client.query(introspectionQuery, [
      namespacesToIntrospect,
      includeExtensions,
    ]);

    // Map the result rows to the `DatabaseObject` type
    const rows: DatabaseObject[] = queryResult.rows.map((result) => result.object);

    return rows;
  } catch (error) {
    log.error('Error during introspection:', error);
    throw error;
  }
};

export default getIntrospectionRows;
