export enum GisSubtype {
  Geometry = 0,
  Point = 1,
  LineString = 2,
  Polygon = 3,
  MultiPoint = 4,
  MultiLineString = 5,
  MultiPolygon = 6,
  GeometryCollection = 7
}

export const SUBTYPE_STRING_BY_SUBTYPE: Record<GisSubtype, string> = {
  [GisSubtype.Geometry]: 'geometry',
  [GisSubtype.Point]: 'point',
  [GisSubtype.LineString]: 'line-string',
  [GisSubtype.Polygon]: 'polygon',
  [GisSubtype.MultiPoint]: 'multi-point',
  [GisSubtype.MultiLineString]: 'multi-line-string',
  [GisSubtype.MultiPolygon]: 'multi-polygon',
  [GisSubtype.GeometryCollection]: 'geometry-collection'
};

export const GIS_SUBTYPE_NAME: Record<GisSubtype, string> = {
  [GisSubtype.Geometry]: 'Geometry',
  [GisSubtype.Point]: 'Point',
  [GisSubtype.LineString]: 'LineString',
  [GisSubtype.Polygon]: 'Polygon',
  [GisSubtype.MultiPoint]: 'MultiPoint',
  [GisSubtype.MultiLineString]: 'MultiLineString',
  [GisSubtype.MultiPolygon]: 'MultiPolygon',
  [GisSubtype.GeometryCollection]: 'GeometryCollection'
};
