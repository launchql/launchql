import { Client } from 'pg';

import { IntrospectionOptions, makeIntrospectionQuery } from './query';
import { IntrospectionResult, IntrospectionResultObject, IntrospectionResultQuery } from './types';

// Setup PostgreSQL Client
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'password',
  port: 5432,
});

// Function to Get Server Version and Generate Introspection Query
const getServerVersionAndIntrospect = async () => {
  try {
    await client.connect();

    // Query for server version in integer format
    const res = await client.query('SHOW server_version_num');
    const serverVersionNum: number = parseInt(res.rows[0].server_version_num, 10);

    console.log('PostgreSQL Server Version (Numeric):', serverVersionNum);

    // Define introspection options
    const introspectionOptions: IntrospectionOptions = {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true,
    };

    // Generate the introspection query
    const introspectionQuery = makeIntrospectionQuery(serverVersionNum, introspectionOptions);

    console.log('Generated Introspection Query:', introspectionQuery);

    // Define the parameters
    const namespacesToIntrospect = ['collections_public'];
    const includeExtensions = false;

    // Execute the introspection query
    const introspectionResult: IntrospectionResultQuery = await client.query(introspectionQuery, [
      namespacesToIntrospect,
      includeExtensions,
    ]);

    console.log('Introspection Result:', introspectionResult.rows.map(o=>o.object.kind));
    console.log('Introspection Result:', introspectionResult.rows.map(o=>o.object.name));
    console.log('Introspection Result:', introspectionResult.rows[0]);

  } catch (error) {
    console.error('Error during version introspection:', error);
  } finally {
    await client.end();
  }
};

// Run the function
getServerVersionAndIntrospect();
