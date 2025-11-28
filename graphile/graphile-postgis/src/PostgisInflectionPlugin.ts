import type { Inflection, Plugin } from 'graphile-build';
import type { PgType } from 'graphile-build-pg';

import { GisSubtype, SUBTYPE_STRING_BY_SUBTYPE } from './constants';
import type { PostgisInflection } from './types';

const PostgisInflectionPlugin: Plugin = (builder) => {
  builder.hook('inflection', (inflection: Inflection): PostgisInflection => {
    return {
      ...inflection,
      gisType(
        this: PostgisInflection,
        type: PgType,
        subtype: GisSubtype,
        hasZ: boolean,
        hasM: boolean,
        _srid?: number
      ) {
        return this.upperCamelCase(
          [type.name, SUBTYPE_STRING_BY_SUBTYPE[subtype], hasZ ? 'z' : null, hasM ? 'm' : null]
            .filter(Boolean)
            .join('-')
        );
      },
      gisInterfaceName(this: PostgisInflection, type: PgType) {
        return this.upperCamelCase(`${type.name}-interface`);
      },
      gisDimensionInterfaceName(this: PostgisInflection, type: PgType, hasZ: boolean, hasM: boolean) {
        return this.upperCamelCase(
          [type.name, SUBTYPE_STRING_BY_SUBTYPE[GisSubtype.Geometry], hasZ ? 'z' : null, hasM ? 'm' : null]
            .filter(Boolean)
            .join('-')
        );
      },
      geojsonFieldName() {
        return 'geojson';
      },
      gisXFieldName(_type: PgType) {
        return _type.name === 'geography' ? 'longitude' : 'x';
      },
      gisYFieldName(_type: PgType) {
        return _type.name === 'geography' ? 'latitude' : 'y';
      },
      gisZFieldName(_type: PgType) {
        return _type.name === 'geography' ? 'height' : 'z';
      }
    };
  });
};

export default PostgisInflectionPlugin;
