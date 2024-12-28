import { generateCode } from './codegen';
import getIntrospectionRows, { GetIntrospectionRowsOptions } from './introspect';
import { DatabaseObject } from './types';

(async () => {
  const options: GetIntrospectionRowsOptions = {
    connectionString: 'postgresql://postgres:password@localhost:5432/mydb',
    introspectionOptions: {
      pgLegacyFunctionsOnly: false,
      pgIgnoreRBAC: true,
    },
    namespacesToIntrospect: ['collections_public'],
    includeExtensions: false,
  };

  try {
    // Fetch introspection rows
    const rows: DatabaseObject[] = await getIntrospectionRows(options);
    console.log('Introspection Rows Fetched:', rows);

    // Generate TypeScript code
    const codegenOptions = {
      includeTimestamps: true,
      includeUUID: true,
    };
    const generatedCode = generateCode(rows, codegenOptions);

    console.log('Generated TypeScript Code:');
    console.log(generatedCode);
  } catch (error) {
    console.error('Failed to fetch introspection rows or generate code:', error);
  }
})();
