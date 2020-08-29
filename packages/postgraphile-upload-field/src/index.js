import { Upload } from 'graphql-upload';

export default function UploadFieldPlugin(builder, { uploadFieldDefinitions }) {
  const findMatchingDefinitions = (def, table, attr) =>
    def.match({
      schema: table.namespaceName,
      table: table.name,
      column: attr.name,
      type: attr.type,
      tags: attr.tags
    });

  builder.hook('build', (_, build) => {
    const {
      addType,
      graphql: { GraphQLScalarType, GraphQLError }
    } = build;

    const GraphQLUpload = new GraphQLScalarType({
      name: 'Upload',
      description: 'The `Upload` scalar type represents a file upload.',
      parseValue(value) {
        if (value instanceof Upload) return value.promise;
        throw new GraphQLError('Upload value invalid.');
      },
      parseLiteral(ast) {
        throw new GraphQLError('Upload literal unsupported.', ast);
      },
      serialize() {
        throw new GraphQLError('Upload serialization unsupported.');
      }
    });

    addType(GraphQLUpload);

    return _;
  });

  builder.hook(
    'GraphQLInputObjectType:fields:field',
    (field, build, context) => {
      const { getTypeByName } = build;
      const {
        scope: { pgIntrospection: table, pgFieldIntrospection: attr }
      } = context;

      if (!table || !attr) {
        return field;
      }

      const foundUploadFieldDefinition =
        uploadFieldDefinitions.filter((def) =>
          findMatchingDefinitions(def, table, attr)
        ).length === 1;

      if (!foundUploadFieldDefinition) {
        return field;
      }

      // Replace existing GraphQL type with `Upload` type
      return Object.assign({}, field, {
        type: getTypeByName('Upload')
      });
    }
  );

  builder.hook('GraphQLObjectType:fields:field', (field, build, context) => {
    const {
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      inflection
    } = build;
    const {
      scope: { isRootMutation, fieldName, pgFieldIntrospection: table }
    } = context;
    if (!isRootMutation || !table) {
      return field;
    }

    // It's possible that `resolve` isn't specified on a field, so in that case
    // we fall back to a default resolver.
    const defaultResolver = (obj) => obj[fieldName];

    // Extract the old resolver from `field`
    const { resolve: oldResolve = defaultResolver, ...rest } = field;

    const tags = {};

    const uploadResolversByFieldName = introspectionResultsByKind.attribute
      .filter((attr) => attr.classId === table.id)
      .reduce((memo, attr) => {
        const defs = uploadFieldDefinitions.filter((def) =>
          findMatchingDefinitions(def, table, attr)
        );
        if (defs.length > 1) {
          throw new Error('Upload field definitions are ambiguous');
        }
        if (defs.length === 1) {
          const fieldName = inflection.column(attr);
          memo[fieldName] = defs[0].resolve;
          tags[fieldName] = attr.tags;
        }
        return memo;
      }, {});

    return {
      // Copy over everything except 'resolve'
      ...rest,

      // Add our new resolver which wraps the old resolver
      async resolve(source, args, context, info) {
        // Recursively check for Upload promises to resolve
        async function resolvePromises(obj) {
          for (const key of Object.keys(obj)) {
            if (obj[key] instanceof Promise) {
              if (uploadResolversByFieldName[key]) {
                const upload = await obj[key];
                // eslint-disable-next-line require-atomic-updates
                obj[key] = await uploadResolversByFieldName[key](
                  upload,
                  args,
                  context,
                  { ...info, uploadPlugin: { tags: tags[key] } }
                );
              }
            } else if (obj[key] !== null && typeof obj[key] === 'object') {
              await resolvePromises(obj[key]);
            }
          }
        }
        await resolvePromises(args);
        // Call the old resolver
        const oldResolveResult = await oldResolve(source, args, context, info);
        // Finally return the result.
        return oldResolveResult;
      }
    };
  });
}
