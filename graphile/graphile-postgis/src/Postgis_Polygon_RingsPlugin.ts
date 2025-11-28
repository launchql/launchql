import type { Build, Plugin } from 'graphile-build';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { LineString, Polygon } from 'geojson';

import { GisSubtype } from './constants';
import { getGISTypeName } from './utils';
import type { GisFieldValue, GisGraphQLType, GisScope, PostgisBuild } from './types';

const PostgisPolygonRingsPlugin: Plugin = (builder) => {
  builder.hook(
    'GraphQLObjectType:fields',
    (fields: GraphQLFieldConfigMap<GisFieldValue, unknown>, build: Build, context) => {
      const {
        scope: { isPgGISType, pgGISType, pgGISTypeDetails }
      } = context as typeof context & { scope: GisScope };
      if (!isPgGISType || !pgGISType || !pgGISTypeDetails || pgGISTypeDetails.subtype !== GisSubtype.Polygon) {
        return fields;
      }
      const {
        extend,
        getPostgisTypeByGeometryType,
        graphql: { GraphQLList }
      } = build as PostgisBuild;
      const { hasZ, hasM, srid } = pgGISTypeDetails;
      const LineStringType = getPostgisTypeByGeometryType(
        pgGISType,
        GisSubtype.LineString,
        hasZ,
        hasM,
        srid
      ) as GisGraphQLType | null | undefined;

      if (!LineStringType) {
        return fields;
      }

      return extend(fields, {
        exterior: {
          type: LineStringType,
          resolve(data: GisFieldValue) {
            const polygon = data.__geojson as Polygon;
            return {
              __gisType: getGISTypeName(GisSubtype.LineString, hasZ, hasM),
              __srid: data.__srid,
              __geojson: {
                type: 'LineString',
                coordinates: polygon.coordinates[0]
              } as LineString
            };
          }
        },
        interiors: {
          type: new GraphQLList(LineStringType),
          resolve(data: GisFieldValue) {
            const polygon = data.__geojson as Polygon;
            return polygon.coordinates.slice(1).map((coord) => ({
              __gisType: getGISTypeName(GisSubtype.LineString, hasZ, hasM),
              __srid: data.__srid,
              __geojson: {
                type: 'LineString',
                coordinates: coord
              } as LineString
            }));
          }
        }
      });
    }
  );
};
export default PostgisPolygonRingsPlugin;
