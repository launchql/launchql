import type { Plugin } from 'graphile-build';

import PostgisExtensionDetectionPlugin from './PostgisExtensionDetectionPlugin';
import PostgisInflectionPlugin from './PostgisInflectionPlugin';
import PostgisRegisterTypesPlugin from './PostgisRegisterTypesPlugin';
import PostgisVersionPlugin from './PostgisVersionPlugin';
import Postgis_GeometryCollection_GeometriesPlugin from './Postgis_GeometryCollection_GeometriesPlugin';
import Postgis_LineString_PointsPlugin from './Postgis_LineString_PointsPlugin';
import Postgis_MultiLineString_LineStringsPlugin from './Postgis_MultiLineString_LineStringsPlugin';
import Postgis_MultiPoint_PointsPlugin from './Postgis_MultiPoint_PointsPlugin';
import Postgis_MultiPolygon_PolygonsPlugin from './Postgis_MultiPolygon_PolygonsPlugin';
import Postgis_Point_LatitudeLongitudePlugin from './Postgis_Point_LatitudeLongitudePlugin';
import Postgis_Polygon_RingsPlugin from './Postgis_Polygon_RingsPlugin';

const PostgisPlugin: Plugin = async (builder, options) => {
  await PostgisVersionPlugin(builder, options);
  await PostgisInflectionPlugin(builder, options);
  await PostgisExtensionDetectionPlugin(builder, options);
  await PostgisRegisterTypesPlugin(builder, options);

  // Enhancing the `Point` type:
  await Postgis_Point_LatitudeLongitudePlugin(builder, options);

  // Enhancing the `LineString` type:
  await Postgis_LineString_PointsPlugin(builder, options);

  // Enhancing the `Polygon` type:
  await Postgis_Polygon_RingsPlugin(builder, options);

  // Enhancing the `MultiPoint` type:
  await Postgis_MultiPoint_PointsPlugin(builder, options);

  // Enhancing the `MultiLineString` type:
  await Postgis_MultiLineString_LineStringsPlugin(builder, options);

  // Enhancing the `MultiPolygon` type:
  await Postgis_MultiPolygon_PolygonsPlugin(builder, options);

  // Enhancing the `GeometryCollection` type:
  await Postgis_GeometryCollection_GeometriesPlugin(builder, options);
};

export {
  PostgisExtensionDetectionPlugin,
  PostgisInflectionPlugin,
  PostgisRegisterTypesPlugin,
  PostgisVersionPlugin,
  Postgis_GeometryCollection_GeometriesPlugin,
  Postgis_LineString_PointsPlugin,
  Postgis_MultiLineString_LineStringsPlugin,
  Postgis_MultiPoint_PointsPlugin,
  Postgis_MultiPolygon_PolygonsPlugin,
  Postgis_Point_LatitudeLongitudePlugin,
  Postgis_Polygon_RingsPlugin
};

export default PostgisPlugin;
