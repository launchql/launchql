// @ts-nocheck

import csv from 'csv-parser';
import { createReadStream, readFileSync } from 'fs';
import { safeLoad as parseYAML } from 'js-yaml';
import * as ast from 'pg-ast';
import {
  makeBoundingBox,
  makeLocation,
  getRelatedField,
  wrapValue
} from './utils';
function isNumeric(str) {
  if (typeof str === 'number') return true;
  if (typeof str !== 'string') return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

const parseJson = (value) => {
  if (typeof value === 'string') return value;
  return value && JSON.stringify(value);
};

const psqlArray = (value) => {
  if (value && value.length) {
    return `{${value.map((v) => v)}}`;
  }
};

export const parse = (path, opts) =>
  new Promise((resolve, reject) => {
    const results = [];
    createReadStream(path)
      .pipe(csv(opts))
      // TODO check if 'data' is guaranteed to have a full row,
      // if so, make a hook to use the stream properly
      .on('data', (data) => results.push(data))
      .on('error', (er) => {
        reject(er);
      })
      .on('end', () => {
        resolve(results);
      });
  });

export const readConfig = (config) => {
  let configValue;
  if (config.endsWith('.js')) {
    configValue = require(config);
  } else if (config.endsWith('json')) {
    configValue = JSON.parse(readFileSync(config, 'utf-8'));
  } else if (config.endsWith('yaml') || config.endsWith('yml')) {
    configValue = parseYAML(readFileSync(config, 'utf-8'));
  } else {
    throw new Error('unsupported config!');
  }
  return configValue;
};

const getFromValue = (from) => {
  if (Array.isArray(from)) return from;
  return [from];
};

// looks like the CSV library gives us empty strings?
const cleanseEmptyStrings = (str) => {
  if (typeof str === 'string') {
    if (str.trim() === '') return null;
    return str;
  } else {
    return str;
  }
};

const parseBoolean = (str) => {
  if (typeof str === 'boolean') {
    return str;
  } else if (typeof str === 'string') {
    const s = str.toLowerCase();
    if (s === 'true') {
      return true;
    } else if (s === 't') {
      return true;
    } else if (s === 'f') {
      return false;
    } else if (s === 'false') {
      return false;
    }
    return null;
  } else {
    return null;
  }
};

const getValuesFromKeys = (object, keys) => keys.map((key) => object[key]);

const identity = (a) => a;

const isEmpty = (value) => value === null || typeof value === 'undefined';

// type (int, text, etc)
// from Array of keys that map to records found (e.g., ['lon', 'lat'])
const getCoercionFunc = (type, from, opts) => {
  const parse = (opts.parse = opts.parse || identity);

  switch (type) {
    case 'int':
      return (record) => {
        const value = parse(record[from[0]]);
        if (isEmpty(value)) {
          return ast.Null({});
        }
        if (!isNumeric(value)) {
          return ast.Null({});
        }
        const val = ast.A_Const({
          val: ast.Integer({ ival: value })
        });
        return wrapValue(val, opts);
      };
    case 'float':
      return (record) => {
        const value = parse(record[from[0]]);
        if (isEmpty(value)) {
          return ast.Null({});
        }
        if (!isNumeric(value)) {
          return ast.Null({});
        }

        const val = ast.A_Const({
          val: ast.Float({ str: value })
        });
        return wrapValue(val, opts);
      };
    case 'boolean':
    case 'bool':
      return (record) => {
        const value = parse(parseBoolean(record[from[0]]));

        if (isEmpty(value)) {
          return ast.Null({});
        }

        const val = ast.String({
          str: value ? 'TRUE' : 'FALSE'
        });
        return wrapValue(val, opts);
      };
    case 'bbox':
      // do bbox magic with args from the fields
      return (record) => {
        const val = makeBoundingBox(parse(record[from[0]]));
        return wrapValue(val, opts);
      };
    case 'location':
      return (record) => {
        const [lon, lat] = getValuesFromKeys(record, from);
        if (typeof lon === 'undefined') {
          return ast.Null({});
        }
        if (typeof lat === 'undefined') {
          return ast.Null({});
        }
        if (!isNumeric(lon) || !isNumeric(lat)) {
          return ast.Null({});
        }

        // NO parse here...
        const val = makeLocation(lon, lat);
        return wrapValue(val, opts);
      };
    case 'related':
      return (record) => {
        return getRelatedField({
          ...opts,
          record,
          from
        });
      };
    case 'uuid':
      return (record) => {
        const value = parse(record[from[0]]);
        if (
          isEmpty(value) ||
          !/^([0-9a-fA-F]{8})-(([0-9a-fA-F]{4}-){3})([0-9a-fA-F]{12})$/i.test(
            value
          )
        ) {
          return ast.Null({});
        }
        const val = ast.A_Const({
          val: ast.String({ str: value })
        });
        return wrapValue(val, opts);
      };
    case 'text':
      return (record) => {
        const value = parse(cleanseEmptyStrings(record[from[0]]));
        if (isEmpty(value)) {
          return ast.Null({});
        }
        const val = ast.A_Const({
          val: ast.String({ str: value })
        });
        return wrapValue(val, opts);
      };

    case 'text[]':
      return (record) => {
        const value = parse(psqlArray(cleanseEmptyStrings(record[from[0]])));
        if (isEmpty(value)) {
          return ast.Null({});
        }
        const val = ast.A_Const({
          val: ast.String({ str: value })
        });
        return wrapValue(val, opts);
      };
    case 'image':
    case 'attachment':
    case 'json':
    case 'jsonb':
      return (record) => {
        const value = parse(parseJson(cleanseEmptyStrings(record[from[0]])));
        if (isEmpty(value)) {
          return ast.Null({});
        }
        const val = ast.A_Const({
          val: ast.String({ str: value })
        });
        return wrapValue(val, opts);
      };
    default:
      return (record) => {
        const value = parse(cleanseEmptyStrings(record[from[0]]));
        if (isEmpty(value)) {
          return ast.Null({});
        }
        const val = ast.A_Const({
          val: ast.String({ str: value })
        });
        return wrapValue(val, opts);
      };
  }
};

export const parseTypes = (config) => {
  return Object.entries(config.fields).reduce((m, v) => {
    let [key, value] = v;
    let type;
    let from;
    if (typeof value === 'string') {
      type = value;
      from = [key];
      if (['related', 'location'].includes(type)) {
        throw new Error('must use object for ' + type + ' type');
      }
      value = {
        type,
        from
      };
    } else {
      type = value.type;
      from = getFromValue(value.from || key);
    }
    m[key] = getCoercionFunc(type, from, value);
    return m;
  }, {});
};
