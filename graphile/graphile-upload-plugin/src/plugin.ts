import type { ReadStream } from 'fs';
import type { Plugin } from 'graphile-build';
import type { GraphQLResolveInfo } from 'graphql';

// Types for Upload handling
export interface FileUpload {
  filename: string;
  mimetype?: string; // graphql-upload v16+ uses 'mimetype'
  encoding?: string;
  createReadStream: () => ReadStream;
}

export interface UploadPluginInfo {
  tags: Record<string, any>;
  type?: string;
}

export type UploadResolver = (
  upload: FileUpload,
  args: any,
  context: any,
  info: GraphQLResolveInfo & { uploadPlugin: UploadPluginInfo }
) => Promise<any>;

export type UploadFieldDefinition =
  | {
      name: string;
      namespaceName: string;
      type: string; // GraphQL type name to map to
      resolve: UploadResolver;
      tag?: never;
    }
  | {
      // Tag-based mapping (e.g. via smart comments)
      tag: string;
      resolve: UploadResolver;
      name?: never;
      namespaceName?: never;
      type?: string;
    };

// PostGraphile plugin
const UploadPostGraphilePlugin: Plugin = (
  builder,
  opts: { uploadFieldDefinitions?: UploadFieldDefinition[] } = {}
) => {
  const { uploadFieldDefinitions = [] } = opts;

  // Determine whether a table attribute should be treated as an Upload according to configuration
  const relevantUploadType = (attr: any): UploadFieldDefinition | undefined => {
    const types = uploadFieldDefinitions.filter(
      ({ name, namespaceName, tag }) =>
        (name &&
          namespaceName &&
          attr.type?.name === name &&
          attr.type?.namespaceName === namespaceName) ||
        (tag && attr.tags?.[tag])
    );
    if (types.length === 1) {
      return types[0];
    } else if (types.length > 1) {
      throw new Error('Upload field definitions are ambiguous');
    }
    return undefined;
  };

  builder.hook('build', (input: any, build: any) => {
    const {
      addType,
      graphql: { GraphQLScalarType, GraphQLError },
    } = build;

    const GraphQLUpload = new GraphQLScalarType({
      name: 'Upload',
      description: 'The `Upload` scalar type represents a file upload.',
      parseValue(value: unknown) {
        // The value should be an object with a `.promise` that resolves to the file upload
        const maybe = value as any;
        if (
          maybe &&
          maybe.promise &&
          typeof maybe.promise.then === 'function'
        ) {
          return maybe.promise;
        }
        throw new GraphQLError('Upload value invalid.');
      },
      parseLiteral(ast: any) {
        throw new GraphQLError('Upload literal unsupported.', ast as any);
      },
      serialize() {
        throw new GraphQLError('Upload serialization unsupported.');
      },
    });

    addType(GraphQLUpload);

    // Override the internal types for configured upload-backed columns
    uploadFieldDefinitions.forEach(({ name, namespaceName, type }) => {
      if (!name || !type || !namespaceName) return; // tag-based or incomplete definitions
      const theType = build.pgIntrospectionResultsByKind.type.find(
        (typ: any) => typ.name === name && typ.namespaceName === namespaceName
      );
      if (theType) {
        build.pgRegisterGqlTypeByTypeId(theType.id, () =>
          build.getTypeByName(type)
        );
      }
    });

    return input;
  });

  builder.hook('inflection', (inflection: any, build: any) => {
    return build.extend(inflection, {
      // NO ARROW FUNCTIONS HERE (this)
      uploadColumn(this: any, attr: any) {
        return this.column(attr) + 'Upload';
      },
    });
  });

  // Add Upload input fields alongside matching columns
  builder.hook(
    'GraphQLInputObjectType:fields',
    (fields: any, build: any, context: any) => {
      const {
        scope: { isPgRowType, pgIntrospection: table },
      } = context;

      if (!isPgRowType || !table || table.kind !== 'class') {
        return fields;
      }

      return build.extend(
        fields,
        table.attributes.reduce((memo: any, attr: any) => {
          if (!build.pgColumnFilter(attr, build, context)) return memo;
          const action = context.scope.isPgBaseInput
            ? 'base'
            : context.scope.isPgPatch
              ? 'update'
              : 'create';
          if (build.pgOmit(attr, action)) return memo;
          if (attr.identity === 'a') return memo;

          if (!relevantUploadType(attr)) {
            return memo;
          }

          const fieldName = build.inflection.uploadColumn(attr);

          if (memo[fieldName]) {
            throw new Error(
              `Two columns produce the same GraphQL field name '${fieldName}' on class '${table.namespaceName}.${table.name}'; one of them is '${attr.name}'`
            );
          }
          memo = build.extend(
            memo,
            {
              [fieldName]: context.fieldWithHooks(
                fieldName,
                {
                  description: attr.description,
                  type: build.getTypeByName('Upload'),
                },
                { pgFieldIntrospection: attr, isPgUploadField: true }
              ),
            },
            `Adding field for ${build.describePgEntity(
              attr
            )}. You can rename this field with a 'Smart Comment':\n\n  ${build.sqlCommentByAddingTags(
              attr,
              {
                name: 'newNameHere',
              }
            )}`
          );
          return memo;
        }, {}),
        `Adding columns to '${build.describePgEntity(table)}'`
      );
    }
  );

  builder.hook(
    'GraphQLObjectType:fields:field',
    (field: any, build: any, context: any) => {
      const {
        pgIntrospectionResultsByKind: introspectionResultsByKind,
        inflection,
      } = build;
      const {
        scope: { isRootMutation, fieldName, pgFieldIntrospection: table },
      } = context;

      if (!isRootMutation || !table) {
        return field;
      }

      // It's possible that `resolve` isn't specified on a field, so in that case
      // we fall back to a default resolver.
      const defaultResolver = (obj: Record<string, any>) => obj[fieldName];

      // Extract the old resolver from `field`
      const { resolve: oldResolve = defaultResolver, ...rest } = field; // GraphQLFieldConfig

      const tags: Record<string, any> = {};
      const types: Record<string, any> = {};
      const originals: Record<string, string> = {};

      const uploadResolversByFieldName: Record<string, UploadResolver> =
        introspectionResultsByKind.attribute
          .filter((attr: any) => attr.classId === table.id)
          .reduce(
            (memo: Record<string, UploadResolver>, attr: any) => {
              // first, try to directly match the types here
              const typeMatched = relevantUploadType(attr);
              if (typeMatched) {
                const fieldName = inflection.column(attr);
                const uploadFieldName = inflection.uploadColumn(attr);
                memo[uploadFieldName] = typeMatched.resolve;
                tags[uploadFieldName] = attr.tags;
                types[uploadFieldName] = attr.type.name;
                originals[uploadFieldName] = fieldName;
              }
              return memo;
            },
            {} as Record<string, UploadResolver>
          );

      return {
        // Copy over everything except 'resolve'
        ...rest,

        // Add our new resolver which wraps the old resolver
        async resolve(
          source: any,
          args: any,
          context: any,
          info: GraphQLResolveInfo
        ) {
          // Recursively check for Upload promises to resolve
          async function resolvePromises(
            obj: Record<string, any>
          ): Promise<void> {
            for (const key of Object.keys(obj)) {
              if (obj[key] instanceof Promise) {
                if (uploadResolversByFieldName[key]) {
                  const upload = await obj[key];
                  // eslint-disable-next-line require-atomic-updates
                  obj[originals[key]] = await uploadResolversByFieldName[key](
                    upload,
                    args,
                    context,
                    {
                      ...(info as any),
                      uploadPlugin: { tags: tags[key], type: types[key] },
                    } as GraphQLResolveInfo & { uploadPlugin: UploadPluginInfo }
                  );
                }
              } else if (obj[key] !== null && typeof obj[key] === 'object') {
                await resolvePromises(obj[key]);
              }
            }
          }
          await resolvePromises(args);
          // Call the old resolver
          const oldResolveResult = await oldResolve(
            source,
            args,
            context,
            info
          );
          // Finally return the result.
          return oldResolveResult;
        },
      };
    }
  );
};

export default UploadPostGraphilePlugin;
