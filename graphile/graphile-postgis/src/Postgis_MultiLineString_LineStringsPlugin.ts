import type { Build, Plugin } from 'graphile-build';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { LineString, MultiLineString } from 'geojson';

import { GisSubtype } from './constants';
import { getGISTypeName } from './utils';
import type { GisFieldValue, GisGraphQLType, GisScope, PostgisBuild } from './types';

const PostgisMultiLineStringLineStringsPlugin: Plugin = (builder) => {
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
        pgGISTypeDetails.subtype !== GisSubtype.MultiLineString
      ) {
        return fields;
      }
      const {
        extend,
        getPostgisTypeByGeometryType,
        graphql: { GraphQLList }
      } = build as PostgisBuild;
      const { hasZ, hasM, srid } = pgGISTypeDetails;
      const LineString = getPostgisTypeByGeometryType(
        pgGISType,
        GisSubtype.LineString,
        hasZ,
        hasM,
        srid
      ) as GisGraphQLType | null | undefined;

      if (!LineString) {
        return fields;
      }

      return extend(fields, {
        lines: {
          type: new GraphQLList(LineString),
          resolve(data: GisFieldValue) {
            const multiLineString = data.__geojson as MultiLineString;
            return multiLineString.coordinates.map((coord) => ({
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
export default PostgisMultiLineStringLineStringsPlugin;
