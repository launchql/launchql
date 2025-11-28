import type { Build, Plugin } from 'graphile-build';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { MultiPoint, Point as GeoPoint } from 'geojson';

import { GisSubtype } from './constants';
import { getGISTypeName } from './utils';
import type { GisFieldValue, GisGraphQLType, GisScope, PostgisBuild } from './types';

const PostgisMultiPointPointsPlugin: Plugin = (builder) => {
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
        pgGISTypeDetails.subtype !== GisSubtype.MultiPoint
      ) {
        return fields;
      }
      const {
        extend,
        getPostgisTypeByGeometryType,
        graphql: { GraphQLList }
      } = build as PostgisBuild;
      const { hasZ, hasM, srid } = pgGISTypeDetails;
      const Point = getPostgisTypeByGeometryType(
        pgGISType,
        GisSubtype.Point,
        hasZ,
        hasM,
        srid
      ) as GisGraphQLType | null | undefined;

      if (!Point) {
        return fields;
      }

      return extend(fields, {
        points: {
          type: new GraphQLList(Point),
          resolve(data: GisFieldValue) {
            const multiPoint = data.__geojson as MultiPoint;
            return multiPoint.coordinates.map((coord) => ({
              __gisType: getGISTypeName(GisSubtype.Point, hasZ, hasM),
              __srid: data.__srid,
              __geojson: {
                type: 'Point',
                coordinates: coord
              } as GeoPoint
            }));
          }
        }
      });
    }
  );
};
export default PostgisMultiPointPointsPlugin;
