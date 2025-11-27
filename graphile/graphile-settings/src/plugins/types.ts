import { Plugin } from 'graphile-build';

// formerly lql-types.js

const CustomPgTypeMappingsPlugin: Plugin = builder => {
  builder.hook('build', (build, _context) => {
    const customMappings = [
      { name: 'geolocation', namespaceName: 'public', type: 'GeoJSON' },
      { name: 'geopolygon', namespaceName: 'public', type: 'GeoJSON' },
      { name: 'email', namespaceName: 'public', type: 'String' },
      { name: 'hostname', namespaceName: 'public', type: 'String' },
      { name: 'multiple_select', namespaceName: 'public', type: 'JSON' },
      { name: 'single_select', namespaceName: 'public', type: 'JSON' },
      { name: 'origin', namespaceName: 'public', type: 'String' },
      { name: 'url', namespaceName: 'public', type: 'String' },
    ];

    for (const { name, namespaceName, type } of customMappings) {
      const pgType = build.pgIntrospectionResultsByKind.type.find(
        // @ts-ignore
        t => t.name === name && t.namespaceName === namespaceName
      );

      if (pgType) {
        build.pgRegisterGqlTypeByTypeId(pgType.id, () => {
          const gqlType = build.getTypeByName(type);
          if (!gqlType) {
            throw new Error(`Unknown GraphQL type: ${type}`);
          }
          return gqlType;
        });
      }
    }

    return build;
  });
};

export default CustomPgTypeMappingsPlugin;
