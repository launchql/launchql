import type { Build, Plugin } from 'graphile-build';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { Point } from 'geojson';

import { GisSubtype } from './constants';
import type { GisFieldValue, GisScope, PostgisBuild } from './types';

const PostgisPointLatitudeLongitudePlugin: Plugin = (builder) => {
  builder.hook(
    'GraphQLObjectType:fields',
    (fields: GraphQLFieldConfigMap<GisFieldValue, unknown>, build: Build, context) => {
      const {
        scope: { isPgGISType, pgGISType, pgGISTypeDetails }
      } = context as typeof context & { scope: GisScope };
      if (!isPgGISType || !pgGISType || !pgGISTypeDetails || pgGISTypeDetails.subtype !== GisSubtype.Point) {
        return fields;
      }
      const {
        extend,
        graphql: { GraphQLNonNull, GraphQLFloat },
        inflection
      } = build as PostgisBuild;
      const xFieldName = inflection.gisXFieldName(pgGISType);
      const yFieldName = inflection.gisYFieldName(pgGISType);
      const zFieldName = inflection.gisZFieldName(pgGISType);
      return extend(fields, {
        [xFieldName]: {
          type: new GraphQLNonNull(GraphQLFloat),
          resolve(data: GisFieldValue) {
            const point = data.__geojson as Point;
            return point.coordinates[0];
          }
        },
        [yFieldName]: {
          type: new GraphQLNonNull(GraphQLFloat),
          resolve(data: GisFieldValue) {
            const point = data.__geojson as Point;
            return point.coordinates[1];
          }
        },
        ...(pgGISTypeDetails.hasZ
          ? {
              [zFieldName]: {
                type: new GraphQLNonNull(GraphQLFloat),
                resolve(data: GisFieldValue) {
                  const point = data.__geojson as Point;
                  return point.coordinates[2];
                }
              }
            }
          : {})
      });
    }
  );
};
export default PostgisPointLatitudeLongitudePlugin;
