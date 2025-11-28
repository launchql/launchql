import type { Build, Plugin } from 'graphile-build';
import type { PgExtension, PgType } from 'graphile-build-pg';

import type { PostgisBuild } from './types';

const PostgisExtensionDetectionPlugin: Plugin = (builder) => {
  builder.hook('build', (build: Build): PostgisBuild => {
    const postgisBuild = build as PostgisBuild;
    const { pgIntrospectionResultsByKind: introspectionResultsByKind } = postgisBuild;
    const pgGISExtension = introspectionResultsByKind.extension.find(
      (extension: PgExtension) => extension.name === 'postgis'
    );
    // Check we have the postgis extension
    if (!pgGISExtension) {
      console.warn('PostGIS extension not found in database; skipping');
      return postgisBuild;
    }
    // Extract the geography and geometry types
    const pgGISGeometryType = introspectionResultsByKind.type.find(
      (type: PgType) => type.name === 'geometry' && type.namespaceId === pgGISExtension.namespaceId
    );
    const pgGISGeographyType = introspectionResultsByKind.type.find(
      (type: PgType) => type.name === 'geography' && type.namespaceId === pgGISExtension.namespaceId
    );
    if (!pgGISGeographyType || !pgGISGeometryType) {
      throw new Error(
        "PostGIS is installed, but we couldn't find the geometry/geography types!"
      );
    }
    return postgisBuild.extend(postgisBuild, {
      pgGISGraphQLTypesByTypeAndSubtype: {},
      pgGISGraphQLInterfaceTypesByType: {},
      pgGISGeometryType,
      pgGISGeographyType,
      pgGISExtension
    }) as PostgisBuild;
  });
};

export default PostgisExtensionDetectionPlugin;
