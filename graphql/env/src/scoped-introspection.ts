import type { SchemaScopedIntrospectionOptions } from '@constructive-io/graphql-types';
import { cleanEnv, enumerated, EnvError, makeValidator, parseEnvList } from '12factor-env';

// Unlike the generic list validator, this configuration permits an explicit
// empty list (clear the configured extensions), but rejects empty CSV items.
const capabilityExtensions = makeValidator<string[]>((value) => {
  if (value.trim() === '') return [];
  if (value.split(',').some((item) => item.trim() === '')) {
    throw new EnvError('Expected comma-separated extension names without empty items');
  }
  return [...new Set(parseEnvList(value))];
});

/** Partial override for the server-owned `main` service's scoped introspection options. */
export const getScopedIntrospectionEnv = (
  environment: NodeJS.ProcessEnv
): SchemaScopedIntrospectionOptions | undefined => {
  const options = cleanEnv(environment, {
    GRAPHILE_SCOPED_INTROSPECTION_CATALOG_TYPES: enumerated(
      ['all', 'dependency-closure'] as const,
      { default: undefined }
    ),
    GRAPHILE_SCOPED_INTROSPECTION_CAPABILITY_EXTENSIONS: capabilityExtensions({
      default: undefined
    })
  });
  const catalogTypes = options.GRAPHILE_SCOPED_INTROSPECTION_CATALOG_TYPES;
  const extensions = options.GRAPHILE_SCOPED_INTROSPECTION_CAPABILITY_EXTENSIONS;
  if (catalogTypes === undefined && extensions === undefined) {
    return undefined;
  }

  // deepmerge keeps the other option fields configured in pgpm.json.
  return {
    ...(catalogTypes !== undefined && { catalogTypes }),
    ...(extensions !== undefined && { capabilityExtensions: extensions })
  };
};
