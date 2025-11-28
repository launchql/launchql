import { Plugin } from 'graphile-build';

// formerly lql-types.js

export interface TypeMapping {
  name: string;
  namespaceName: string;
  type: string;
}

export interface CustomPgTypeMappingsPluginOptions {
  /**
   * Additional type mappings to add or override default mappings.
   * Mappings are processed in order, so later mappings override earlier ones.
   */
  customTypeMappings?: TypeMapping[];
}

const DEFAULT_MAPPINGS: TypeMapping[] = [
  { name: 'email', namespaceName: 'public', type: 'String' },
  { name: 'hostname', namespaceName: 'public', type: 'String' },
  { name: 'multiple_select', namespaceName: 'public', type: 'JSON' },
  { name: 'single_select', namespaceName: 'public', type: 'JSON' },
  { name: 'origin', namespaceName: 'public', type: 'String' },
  { name: 'url', namespaceName: 'public', type: 'String' },
];

const CustomPgTypeMappingsPlugin: Plugin = (builder, options) => {
  const opts = (options || {}) as CustomPgTypeMappingsPluginOptions;
  const customMappings = opts.customTypeMappings || [];

  // Merge default mappings with custom mappings
  // Custom mappings override defaults if they have the same name and namespaceName
  const allMappings: TypeMapping[] = [];
  const seen = new Set<string>();

  // First add defaults
  for (const mapping of DEFAULT_MAPPINGS) {
    const key = `${mapping.namespaceName}.${mapping.name}`;
    if (!seen.has(key)) {
      allMappings.push(mapping);
      seen.add(key);
    }
  }

  // Then add/override with custom mappings
  for (const mapping of customMappings) {
    const key = `${mapping.namespaceName}.${mapping.name}`;
    if (seen.has(key)) {
      // Override existing mapping
      const index = allMappings.findIndex(
        m => m.name === mapping.name && m.namespaceName === mapping.namespaceName
      );
      if (index !== -1) {
        allMappings[index] = mapping;
      }
    } else {
      // Add new mapping
      allMappings.push(mapping);
      seen.add(key);
    }
  }

  // Store mappings for use in field resolver
  const typeMappingsByTypeId = new Map<number, { gqlType: any; pgType: any }>();

  builder.hook('build', (build, _context) => {
    for (const { name, namespaceName, type } of allMappings) {
      const pgType = build.pgIntrospectionResultsByKind.type.find(
        // @ts-ignore
        t => t.name === name && t.namespaceName === namespaceName
      );

      if (pgType) {
        // Check if the GraphQL type exists before registering
        // This allows the plugin to work even when optional dependencies are missing
        // (e.g., GeoJSON requires PostGIS plugin)
        const gqlType = build.getTypeByName(type);
        if (gqlType) {
          build.pgRegisterGqlTypeByTypeId(pgType.id, () => gqlType);
          // Store mapping for field resolver
          typeMappingsByTypeId.set(pgType.id, { gqlType, pgType });
        }
        // If the type doesn't exist, silently skip this mapping
      }
    }

    return build;
  });

  // Add field resolver to convert composite types to scalar values
  builder.hook('GraphQLObjectType:fields:field', (field: any, build: any, context: any) => {
    const {
      scope: { pgFieldIntrospection: attr, fieldName }
    } = context;

    // Only process PostgreSQL table fields
    if (!attr || !attr.type) {
      return field;
    }

    // Check if this field's type is in our mappings
    const mapping = typeMappingsByTypeId.get(attr.type.id);
    if (!mapping) {
      return field;
    }

    // Only process composite types (type === 'c')
    // @ts-ignore
    if (attr.type.type !== 'c') {
      return field;
    }

    // Get the composite type's attributes
    // @ts-ignore
    const compositeType = attr.type.class;
    if (!compositeType || !compositeType.attributes) {
      return field;
    }

    // Extract the old resolver
    const { resolve: oldResolve, ...rest } = field;
    const defaultResolver = (obj: Record<string, any>) => {
      const value = oldResolve ? oldResolve(obj) : (fieldName ? obj[fieldName] : undefined);
      if (value == null) {
        return null;
      }

      // If value is already a scalar, return it
      if (typeof value !== 'object' || Array.isArray(value)) {
        return value;
      }

      // For composite types mapped to scalars, extract the first field's value
      // This handles types like email(value text) -> extract value
      const attributes = compositeType.attributes;
      if (attributes && attributes.length > 0) {
        // Try to extract the first attribute's value
        // PostgreSQL composite types are returned as objects with attribute names as keys
        const firstAttr = attributes[0];
        // @ts-ignore
        const attrFieldName = firstAttr.name;
        
        // Try the PostgreSQL attribute name directly
        if (value[attrFieldName] !== undefined) {
          return value[attrFieldName];
        }
        
        // Try camelCase version (PostGraphile might convert field names)
        const camelCaseName = attrFieldName.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
        if (value[camelCaseName] !== undefined) {
          return value[camelCaseName];
        }
        
        // Fallback: return the first property value
        const firstKey = Object.keys(value)[0];
        if (firstKey) {
          return value[firstKey];
        }
      }

      // If we can't extract, return the value as-is (might be JSON)
      return value;
    };

    return {
      ...rest,
      resolve: defaultResolver
    };
  });
};

export default CustomPgTypeMappingsPlugin;
