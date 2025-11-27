import type { Build, Plugin } from 'graphile-build';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { GeometryCollection } from 'geojson';

import { GisSubtype } from './constants';
import { getGISTypeName } from './utils';
import type { GisFieldValue, GisScope, PostgisBuild } from './types';

const PostgisGeometryCollectionGeometriesPlugin: Plugin = (builder) => {
  builder.hook(
    'GraphQLObjectType:fields',
    function AddGeometriesToGeometryCollection(
      fields: GraphQLFieldConfigMap<GisFieldValue, unknown>,
      build: Build,
      context
    ) {
      const {
        scope: { isPgGISType, pgGISType, pgGISTypeDetails }
      } = context as typeof context & { scope: GisScope };
      if (
        !isPgGISType ||
        !pgGISType ||
        !pgGISTypeDetails ||
        pgGISTypeDetails.subtype !== GisSubtype.GeometryCollection
      ) {
        return fields;
      }
      const {
        extend,
        pgGISGraphQLInterfaceTypesByType,
        graphql: { GraphQLList }
      } = build as PostgisBuild;
      const { hasZ, hasM } = pgGISTypeDetails;
      const zmflag = (hasZ ? 2 : 0) + (hasM ? 1 : 0); // Equivalent to ST_Zmflag: https://postgis.net/docs/ST_Zmflag.html
      const Interface = pgGISGraphQLInterfaceTypesByType[pgGISType.id][zmflag];
      if (!Interface) {
        console.warn("Unexpectedly couldn't find the interface");
        return fields;
      }

      return extend(fields, {
        geometries: {
          type: new GraphQLList(Interface),
          resolve(data: GisFieldValue) {
            const geometryCollection = data.__geojson as GeometryCollection;
            return geometryCollection.geometries.map((geom) => {
              const subtype = GisSubtype[geom.type as keyof typeof GisSubtype];
              if (subtype === undefined) {
                throw new Error(`Unsupported geometry subtype ${geom.type}`);
              }
              return {
                __gisType: getGISTypeName(subtype, hasZ, hasM),
                __srid: data.__srid,
                __geojson: geom
              };
            });
          }
        }
      });
    }
  );
};
export default PostgisGeometryCollectionGeometriesPlugin;
