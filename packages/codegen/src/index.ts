import getIntrospectionRows, { GetIntrospectionRowsOptions } from './introspect';

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
    const rows = await getIntrospectionRows(options);
    console.log('Introspection Rows:', rows);
  } catch (error) {
    console.error('Failed to fetch introspection rows:', error);
  }
})();
