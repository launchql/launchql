import 'graphile-build';
import 'graphile-build-pg';

import type { GraphileConfig } from 'graphile-config';
import { gatherConfig } from 'graphile-build';

type Introspection = Parameters<
  GraphileConfig.GatherHooks['pgIntrospection_introspection']
>[0]['introspection'];

/** Extension namespaces discovered for one exact Graphile PostgreSQL service. */
export interface SearchExtensionSchemas {
  serviceName: string;
  pgTrgmSchema: string | null;
  pgvectorSchema: string | null;
}

declare global {
  namespace GraphileConfig {
    interface GatherHelpers {
      unifiedSearchExtensionMetadata: Record<string, never>;
    }
  }

  namespace DataplanPg {
    interface PgCodecExtensions {
      /** Exact extension schemas for the service that owns this record codec. */
      searchExtensionSchemas?: SearchExtensionSchemas;
    }

    interface PgCodecAttributeExtensions {
      /** Exact extension schemas bound from this service's introspection generation. */
      searchExtensionSchemas?: SearchExtensionSchemas;
    }
  }

  namespace GraphileBuild {
    interface Build {
      /** Per-service extension schemas for this build only. */
      pgSearchExtensionSchemasByService?: ReadonlyMap<
        string,
        SearchExtensionSchemas
      >;
    }
  }
}

function extensionSchema(
  introspection: Introspection,
  extensionName: string,
  serviceName: string
): string | null {
  const matches = introspection.extensions.filter(
    (extension) => extension.extname === extensionName
  );
  if (matches.length > 1) {
    throw new Error(
      `[graphile-search] Service '${serviceName}' has ambiguous ${extensionName} ` +
        `extension metadata (${matches.length} entries)`
    );
  }
  if (matches.length === 0) return null;

  const extension = matches[0];
  if (extension.extnamespace == null) {
    throw new Error(
      `[graphile-search] Service '${serviceName}' has ${extensionName} without an ` +
        'introspected extension namespace'
    );
  }
  const namespace = introspection.getNamespace({ id: extension.extnamespace });
  if (!namespace?.nspname) {
    throw new Error(
      `[graphile-search] Service '${serviceName}' cannot resolve the namespace for ` +
        `${extensionName}`
    );
  }
  return namespace.nspname;
}

/** Resolve extension schemas exclusively from the current service introspection. */
export function collectSearchExtensionSchemas(
  introspection: Introspection,
  serviceName: string
): SearchExtensionSchemas {
  return Object.freeze({
    serviceName,
    pgTrgmSchema: extensionSchema(introspection, 'pg_trgm', serviceName),
    pgvectorSchema: extensionSchema(introspection, 'vector', serviceName),
  });
}

/** Gather exact optional-extension schemas while service identity is explicit. */
export const SearchExtensionMetadataGather = gatherConfig({
  namespace: 'unifiedSearchExtensionMetadata',
  initialState: () => ({
    schemasByService: new Map<string, SearchExtensionSchemas>(),
  }),
  helpers: {},
  hooks: {
    pgIntrospection_introspection(info, event) {
      const { introspection, serviceName } = event;
      info.state.schemasByService.set(
        serviceName,
        collectSearchExtensionSchemas(introspection, serviceName)
      );
    },

    pgCodecs_PgCodec(info, event) {
      if (!event.pgClass) return;
      const binding = info.state.schemasByService.get(event.serviceName);
      if (!binding) {
        throw new Error(
          `[graphile-search] No extension metadata was gathered for service ` +
            `'${event.serviceName}'`
        );
      }
      event.pgCodec.extensions ??= Object.create(null);
      event.pgCodec.extensions.searchExtensionSchemas = binding;
    },

    pgCodecs_attribute(info, event) {
      const binding = info.state.schemasByService.get(event.serviceName);
      if (!binding) {
        throw new Error(
          `[graphile-search] No extension metadata was gathered for service ` +
            `'${event.serviceName}'`
        );
      }
      event.attribute.extensions ??= Object.create(null);
      event.attribute.extensions.searchExtensionSchemas = binding;
    },
  },
});

/** Build an immutable, consistency-checked service map from bound attributes. */
export function extensionSchemasByService(
  build: any
): ReadonlyMap<string, SearchExtensionSchemas> {
  const schemasByService = new Map<string, SearchExtensionSchemas>();
  const codecs = build.input?.pgRegistry?.pgCodecs;
  if (!codecs) return schemasByService;

  const addBinding = (binding: SearchExtensionSchemas): void => {
    const existing = schemasByService.get(binding.serviceName);
    if (
      existing &&
      (existing.pgTrgmSchema !== binding.pgTrgmSchema ||
        existing.pgvectorSchema !== binding.pgvectorSchema)
    ) {
      throw new Error(
        `[graphile-search] Conflicting extension metadata for service ` +
          `'${binding.serviceName}' in one build`
      );
    }
    schemasByService.set(binding.serviceName, binding);
  };

  for (const codec of Object.values(codecs) as any[]) {
    const codecBinding: SearchExtensionSchemas | undefined =
      codec?.extensions?.searchExtensionSchemas;
    if (codecBinding) addBinding(codecBinding);
    if (!codec?.attributes) continue;
    for (const attribute of Object.values(codec.attributes) as any[]) {
      const binding: SearchExtensionSchemas | undefined =
        attribute?.extensions?.searchExtensionSchemas;
      if (binding) addBinding(binding);
    }
  }
  return schemasByService;
}

/** Resolve one unambiguous extension namespace for a build-wide operator factory. */
export function resolveBuildExtensionSchema(
  build: any,
  extension: 'pg_trgm' | 'vector'
): string | null {
  const schemasByService: ReadonlyMap<string, SearchExtensionSchemas> =
    build.pgSearchExtensionSchemasByService ?? extensionSchemasByService(build);
  if (schemasByService.size === 0) {
    const codecs = build.input?.pgRegistry?.pgCodecs;
    const hasServiceBoundCodec =
      codecs &&
      Object.values(codecs).some(
        (codec: any) =>
          codec?.attributes != null ||
          codec?.extensions?.pg?.serviceName != null
      );
    if (!hasServiceBoundCodec) return null;
    throw new Error(
      `[graphile-search] ${extension} requires service-bound extension metadata`
    );
  }

  const field = extension === 'pg_trgm' ? 'pgTrgmSchema' : 'pgvectorSchema';
  const schemas = new Set<string>();
  let missingCount = 0;
  for (const binding of schemasByService.values()) {
    const schemaName = binding[field];
    if (!schemaName) {
      missingCount++;
      continue;
    }
    schemas.add(schemaName);
  }
  if (schemas.size === 0) return null;
  if (missingCount > 0) {
    throw new Error(
      `[graphile-search] ${extension} is present for only part of this multi-service build`
    );
  }
  if (schemas.size !== 1) {
    throw new Error(
      `[graphile-search] ${extension} has ambiguous schemas across this build: ` +
        [...schemas].sort().join(', ')
    );
  }
  return schemas.values().next().value!;
}

export function requireBuildExtensionSchema(
  build: any,
  extension: 'pg_trgm' | 'vector'
): string {
  const schemaName = resolveBuildExtensionSchema(build, extension);
  if (!schemaName) {
    throw new Error(
      `[graphile-search] ${extension} is required by this feature but is not installed`
    );
  }
  return schemaName;
}
