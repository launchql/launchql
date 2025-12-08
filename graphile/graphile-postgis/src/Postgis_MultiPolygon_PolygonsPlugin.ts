import type { Build, Plugin } from 'graphile-build';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { MultiPolygon, Polygon } from 'geojson';

import { GisSubtype } from './constants';
import { getGISTypeName } from './utils';
import type { GisFieldValue, GisGraphQLType, GisScope, PostgisBuild } from './types';

const PostgisMultiPolygonPolygonsPlugin: Plugin = (builder) => {
  builder.hook(
    'GraphQLObjectType:fields',
    (fields: GraphQLFieldConfigMap<GisFieldValue, unknown>, build: Build, context) => {
      const {
        scope: { isPgGISType, pgGISType, pgGISTypeDetails }
      } = context as typeof context & { scope: GisScope };
      if (
        !isPgGISType ||
        !pgGISType ||
        !pgGISTypeDetails ||
        pgGISTypeDetails.subtype !== GisSubtype.MultiPolygon
      ) {
        return fields;
      }
      const {
        extend,
        getPostgisTypeByGeometryType,
        graphql: { GraphQLList }
      } = build as PostgisBuild;
      const { hasZ, hasM, srid } = pgGISTypeDetails;
      const PolygonType = getPostgisTypeByGeometryType(
        pgGISType,
        GisSubtype.Polygon,
        hasZ,
        hasM,
        srid
      ) as GisGraphQLType | null | undefined;

      if (!PolygonType) {
        return fields;
      }

      return extend(fields, {
        polygons: {
          type: new GraphQLList(PolygonType),
          resolve(data: GisFieldValue) {
            const multiPolygon = data.__geojson as MultiPolygon;
            return multiPolygon.coordinates.map((coord) => ({
              __gisType: getGISTypeName(GisSubtype.Polygon, hasZ, hasM),
              __srid: data.__srid,
              __geojson: {
                type: 'Polygon',
                coordinates: coord
              } as Polygon
            }));
          }
        }
      });
    }
  );
};
export default PostgisMultiPolygonPolygonsPlugin;
