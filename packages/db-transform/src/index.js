import { parse, deparse } from 'pgsql-parser';

export const transformProps = (obj, props) => {
  var copy;
  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = transformProps(obj[i], props);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object || typeof obj === 'object') {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        if (props.hasOwnProperty(attr)) {
          if (typeof props[attr] === 'function') {
            copy[attr] = props[attr](obj[attr]);
          } else {
            if (props[attr].hasOwnProperty(obj[attr])) {
              copy[attr] = props[attr][obj[attr]];
            } else {
              copy[attr] = transformProps(obj[attr], props);
            }
          }
        } else {
          copy[attr] = transformProps(obj[attr], props);
        }
      } else {
        copy[attr] = transformProps(obj[attr], props);
      }
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

export const transform = (statement, props) => {
  let { query } = parse(statement);
  query = transformProps(query, props);
  return deparse(query);
};
